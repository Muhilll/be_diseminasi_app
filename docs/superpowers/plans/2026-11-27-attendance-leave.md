# Attendance Leave (Izin) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an **Izin (Leave Request)** workflow with **Approve / Reject** review by roles with `can_report` (Admin / Resource), integrated directly into `/api/attendances` and `/attendance`.

**Architecture:** Backend adds `attendance_leaves` in MySQL/Drizzle and mounts `/api/attendances/leaves` routes under the existing `attendance` router so `/api/attendances` RBAC applies automatically. Approving a leave atomically inserts an `"izin"` row into `attendances` inside a transaction. Frontend adds an **Ajukan Izin** modal and **Pengajuan Izin** tab on `AttendancePage.tsx`.

**Tech Stack:** Bun 1.3, Hono 4, `@hono/zod-openapi`, Zod 4, Drizzle ORM (`mysql2`), `bun:test`, SolidJS 1.9, Vite 7, TypeScript.

**Spec:** `api_diseminasi/docs/superpowers/specs/2026-11-27-attendance-leave-design.md`

## Global Constraints

- **Production DB safety:** `.env` points to production MySQL. **NEVER run `bun run db:seed`**. Create `attendance_leaves` idempotently via `CREATE TABLE IF NOT EXISTS`.
- **RBAC:** Mount leave endpoints under `/api/attendances/leaves` so `requirePermission(...)` resolves `/api/attendances` (`can_read`, `can_create`, `can_report`) with zero `menus` / `role_permissions` changes.
- **Timezone:** All `leave_date` (`YYYY-MM-DD`) and `todayDate` comparisons use `getLocalDateParts` (`APP_TIMEZONE` / `Asia/Makassar`).
- **No `missed_checkout` on `izin`:** `computeEffectiveCheckOutStatus` returns `null` when `check_in_status === "izin"`.

## Review Focus

1. **Leave on off-day or past date:** `POST /api/attendances/leaves` with `leave_date < todayDate` or inactive `attendance_schedules` day must return `400`.
2. **Duplicate pending/approved leave or existing attendance:** Submitting leave for a date with an existing `pending`/`approved` leave or non-legacy attendance must return `400`.
3. **Check-In while `pending` leave exists:** `AttendanceService.checkIn` must succeed and auto-reject the `pending` leave (`"Auto-cancelled: user checked in"`).
4. **Delete `"izin"` attendance row:** `AttendanceService.deleteById` must also remove the linked `approved` `attendance_leaves` row in a transaction so no orphaned leave/broken image remains.
5. **Non-`can_report` user calling review:** `PATCH /api/attendances/leaves/:id/review` enforces `requirePermission("can_report")` (`403` for regular users).

---

### Task 1: Schema, Migration & `izin` Status Handling (`api_diseminasi`)

**Files:**
- Modify: `api_diseminasi/src/db/schema.ts`
- Create: `api_diseminasi/src/db/migrate-attendance-leaves.ts`
- Modify: `api_diseminasi/src/utils/attendance.ts`
- Modify: `api_diseminasi/src/utils/attendance.test.ts`

- [ ] **Step 1: Add failing test for `checkInStatus === "izin"` in `src/utils/attendance.test.ts`**
  Assert `computeEffectiveCheckOutStatus` returns `null` for `checkInStatus: "izin"`.
- [ ] **Step 2: Run `bun test src/utils/attendance.test.ts` to verify failure (RED)**
- [ ] **Step 3: Update `computeEffectiveCheckOutStatus` in `src/utils/attendance.ts` and add `attendance_leaves` table to `src/db/schema.ts`**
- [ ] **Step 4: Create and run idempotent `src/db/migrate-attendance-leaves.ts`**
- [ ] **Step 5: Run `bun test src/utils/attendance.test.ts` (PASS) and commit**

---

### Task 2: Backend Leave Repository, Service, Controller & OpenAPI Routes (`api_diseminasi`)

**Files:**
- Create: `api_diseminasi/src/app/attendance/repository/attendance-leave.repository.ts`
- Create: `api_diseminasi/src/app/attendance/service/attendance-leave.service.ts`
- Create: `api_diseminasi/src/app/attendance/controller/attendance-leave.controller.ts`
- Modify: `api_diseminasi/src/app/attendance/service/attendance.service.ts`
- Modify: `api_diseminasi/src/app/attendance/route/attendance.openapi.ts`
- Modify: `api_diseminasi/src/app/attendance/route/attendance.route.ts`
- Modify: `api_diseminasi/src/app/attendance/attendance.test.ts`

- [ ] **Step 1: Write unit tests in `attendance.test.ts` for all 5 Review Focus cases (RED)**
  - Rejects `submitLeave` for past date or inactive schedule day (`400`).
  - Rejects duplicate `pending`/`approved` leave or existing attendance (`400`).
  - `reviewLeave("approve")` updates leave + inserts `"izin"` into `attendances`.
  - `checkIn` auto-rejects `pending` leave for `todayDate`.
  - `deleteById` on `"izin"` attendance removes linked `approved` leave.
- [ ] **Step 2: Run `bun test` to verify new tests fail (RED)**
- [ ] **Step 3: Implement `AttendanceLeaveRepository`, `AttendanceLeaveService`, `AttendanceLeaveController`, update `AttendanceService` (`checkIn`, `deleteById`, `getTodayStatus`), and register `/leaves` & `/leaves/{id}/review` in `attendance.openapi.ts` + `attendance.route.ts`**
- [ ] **Step 4: Run `bun test` (all PASS) and verify `/openapi.json` includes `/api/attendances/leaves`, then commit**

---

### Task 3: Frontend Leave UI in `AttendancePage` (`app_diseminasi`)

**Files:**
- Modify: `app_diseminasi/src/app/attendance/type/attendance.ts`
- Modify: `app_diseminasi/src/app/attendance/service/attendance.api.ts`
- Modify: `app_diseminasi/src/app/attendance/pages/attendance.columns.tsx`
- Modify: `app_diseminasi/src/app/attendance/pages/AttendancePage.tsx`

- [ ] **Step 1: Add `AttendanceLeave` types and `attendanceLeavesAPI` (`getAll`, `submit`, `review`)**
- [ ] **Step 2: Add `izin` badge style to `attendance.columns.tsx`**
- [ ] **Step 3: Update `AttendancePage.tsx`**
  - Add **"Ajukan Izin"** button + modal (date picker `min = today_date`, required `reason`, optional photo upload to Cloudinary `"attendance"`).
  - Show `Izin Disetujui` / `Izin Pending` state in today's status card.
  - Add top-level tabs **Riwayat Absensi** and **Pengajuan Izin** (`DataTable` with Approve/Reject modal/actions for `permissions.canReport()`).
- [ ] **Step 4: Run `bunx tsc --noEmit && bun run build` and commit**
