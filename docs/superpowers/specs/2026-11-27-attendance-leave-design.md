# Attendance Leave (Izin) Design Spec

**Date:** 2026-11-27  
**Base Branch:** `main` (create new feature branch `feat/attendance-leave` in both `api_diseminasi` and `app_diseminasi` when implementing)

---

## 1. Intent & Why

Allow agricultural extension officers (*Penyuluh Pertanian*) who cannot attend on a scheduled day to submit a leave request (**Izin**) for today or an upcoming scheduled date, with an approval workflow (**Approve / Reject**) handled by **Admin / Resource** roles (`can_report`). Approved leave automatically records `"izin"` in `attendances` without requiring GPS or Check-In/Check-Out.

---

## 2. Goals, Non-Goals, and Anti-Goals

### Goals
- Users can submit an **Izin** request for `today` or an upcoming scheduled date (`leave_date >= today_date`, on a day where the user's `attendance_schedules.is_active === true`), with a required `reason` and optional photo `attachment` (Cloudinary).
- Admin / Resource roles (`can_report` on `/api/attendances`) can view all leave requests and **Approve** or **Reject** `pending` requests (with optional `review_note`).
- Approving a leave request atomically creates an `attendances` record (`check_in_status = "izin"`) for `(user_id, leave_date)`.
- Integrate leave submission and the **Pengajuan Izin** list/approval tab directly into the existing **Attendance** page (`/attendance`) without adding new sidebar menu items or modifying `menus`/`role_permissions`.

### Non-Goals
- Multi-day date-range leave requests (single scheduled date per request only).
- Leave quota/balance tracking.
- Editing an already reviewed (`approved` / `rejected`) leave request.

### Anti-Goals
- Do not add a new `menus` row or require manual DB permission seeding for existing roles; mount leave endpoints under `/api/attendances/leaves` so existing `/api/attendances` RBAC (`can_read`, `can_create`, `can_report`) applies automatically.
- Do not alter existing `attendances` table columns on production MySQL.

---

## 3. Architecture & Design

### 3.1 Database Schema (`api_diseminasi/src/db/schema.ts`)

Add one new table `attendance_leaves` (created via idempotent `CREATE TABLE IF NOT EXISTS` script, non-destructive):
- `id`: `int().primaryKey().autoincrement()`
- `user_id`: `int().notNull()` -> FK `users.id`
- `leave_date`: `varchar({ length: 10 }).notNull()` (`YYYY-MM-DD` in `APP_TIMEZONE`)
- `reason`: `text().notNull()`
- `attachment`: `varchar({ length: 255 })` (nullable)
- `attachment_public_id`: `varchar({ length: 255 })` (nullable)
- `status`: `varchar({ length: 20 }).notNull().default("pending")` (`"pending"` | `"approved"` | `"rejected"`)
- `reviewed_by`: `int()` (nullable -> FK `users.id`)
- `reviewed_at`: `datetime()` (nullable)
- `review_note`: `text()` (nullable)
- `created_at`, `updated_at`: `datetime()`
- Index on `(user_id, leave_date)`.

When an `izin` row is inserted into `attendances` upon approval, `check_in_image` and `check_in_image_public_id` use `attachment ?? ""` and `attachment_public_id ?? ""` (matching the existing `NOT NULL` schema without altering `attendances`).

### 3.2 Backend Endpoints (`/api/attendances/leaves`)

All routes use `jwtMiddleware`, `appTokenMiddleware`, and `requirePermission(...)` (resolving `/api/attendances`):
1. `GET /api/attendances/leaves` (`requirePermission("can_read")`)
   - If `can_report === true`, returns all users' leave requests ordered by `created_at DESC`; otherwise returns only `user_id === jwtUser.id`.
2. `POST /api/attendances/leaves` (`requirePermission("can_create")`)
   - Body: `{ leave_date: "YYYY-MM-DD", reason: string, attachment?: string, attachment_public_id?: string }`.
   - Validates:
     - `leave_date >= todayDate` (in `APP_TIMEZONE`).
     - User's `attendance_schedules` for `dayOfWeek(leave_date)` is `is_active === true`.
     - No existing `pending` or `approved` leave for `(user_id, leave_date)`.
     - No existing non-legacy `attendances` row for `(user_id, leave_date)`.
     - `attachment` and `attachment_public_id` must be provided together if either is set.
3. `PATCH /api/attendances/leaves/:id/review` (`requirePermission("can_report")`)
   - Body: `{ action: "approve" | "reject", review_note?: string }`.
   - Rejects `404` if not found, `400` if `status !== "pending"`.
   - On `"approve"`, runs in `db.transaction`:
     - Verifies no non-legacy `attendances` row already exists for `(user_id, leave_date)`.
     - Updates `attendance_leaves` (`status: "approved"`, `reviewed_by: jwtUser.id`, `reviewed_at: now`, `review_note`).
     - Inserts `attendances` row (`check_in_status: "izin"`, `check_in_time: now`, `check_in_note: reason`, `check_in_image: attachment ?? ""`, `check_in_image_public_id: attachment_public_id ?? ""`).
   - On `"reject"`, updates `attendance_leaves` (`status: "rejected"`, `reviewed_by: jwtUser.id`, `reviewed_at: now`, `review_note`).

### 3.3 Interaction with Existing Attendance Logic

- `computeEffectiveCheckOutStatus`: treat `checkInStatus === "izin"` the same as `"legacy"` (always return `null`, never `"missed_checkout"`).
- `AttendanceService.checkIn`:
  - If an existing non-legacy row on `todayDate` has `check_in_status === "izin"`, reject with `"You have an approved leave for today"`.
  - If the user has a `pending` leave request for `todayDate`, allow Check-In and automatically mark that `pending` leave as `"rejected"` (`review_note: "Auto-cancelled: user checked in"`) so it cannot be approved retroactively.
- `AttendanceService.deleteById`:
  - If the deleted `attendances` row has `check_in_status === "izin"`, also delete any linked `approved` `attendance_leaves` row for `(user_id, attendance_date)` inside the transaction before cleaning up the Cloudinary asset, preventing orphaned leave records or broken images.
- `AttendanceService.getTodayStatus`: also returns `today_leave` (latest leave request for `(userId, todayDate)`) so the frontend can display pending/approved leave status clearly.

### 3.4 Frontend UI (`app_diseminasi/src/app/attendance/pages/AttendancePage.tsx`)

- **Top Action Panel**:
  - Add **"Ajukan Izin"** button (visible when `permissions.canCreate()`) opening a modal with:
    - Date picker (`min = today_date`) + helper note that only active schedule days are allowed.
    - Required `Alasan / Keterangan` textarea.
    - Optional photo attachment (`uploadImageWithSignature("attendance", file)`).
  - If `today_leave?.status === "approved"` or `attendance?.check_in_status === "izin"`, display `Izin Disetujui` in the Check-In/Check-Out status cards and disable Check-In/Check-Out.
- **Main View Tabs**:
  - Add a top-level view switcher or tab on **Attendance**: **Riwayat Absensi** (existing attendance table / `canReport` day tabs) and **Pengajuan Izin** (DataTable showing Date, User, Alasan, Bukti thumbnail, Status badge `Pending`/`Approved`/`Rejected`, Reviewer/Catatan, and **Approve / Reject** buttons for `permissions.canReport()` on `pending` rows).
- **Columns (`attendance.columns.tsx`)**:
  - Add `izin: { label: "Izin", bg: "#dbeafe", color: "#1e40af" }` to `STATUS_STYLE`.
