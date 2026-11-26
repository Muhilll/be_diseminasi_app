# Attendance Management Design Spec

**Date:** 2026-11-26  
**Branches:** `feat/attendance` (created from `main` in both `api_diseminasi` and `app_diseminasi`)

---

## 1. Intent & Why

Upgrade the existing `absensis` feature (which only records an uploaded image, description, and timestamp) into a structured **Attendance Management** module. Agricultural extension officers (*Penyuluh Pertanian*) will check in and check out daily with GPS location and photo evidence, validated against admin-configured office coordinates, radius limits, deadlines, and each user's weekly schedule.

---

## 2. Goals, Non-Goals, and Anti-Goals

### Goals
- Refactor `absensis` into **Attendance** under a new **Attendance Management** parent menu with three sub-menus: **Settings**, **Schedule**, and **Attendance**.
- **Settings**: Admin configures a single global attendance location (`location_name`, `latitude`, `longitude`), allowed radius (`radius_meters`), check-in deadline (`check_in_deadline`), and check-out deadline (`check_out_deadline`).
- **Schedule**: Admin manages each user's weekly active working days (Monday–Sunday).
- **Attendance**: Users perform daily Check-In and Check-Out using browser GPS + Cloudinary photo upload + optional note. Regular users see their own attendance history and today's Check-In/Check-Out actions; Admin users see all users' records.
- Automatically flag records where a user checked in but did not check out past `check_out_deadline` as `missed_checkout` without requiring a background worker.

### Non-Goals
- Multiple office/geofence locations per organization (single global setting is sufficient for now).
- Per-day custom shift hours per user in Schedule (Schedule only toggles active days; deadlines come from global Settings).
- Leave/sick/permission (*izin/cuti*) request workflows.
- Attendance export to PDF/DOCX (can be added later).

### Anti-Goals
- Do not rely on client-side-only radius or deadline checks; the backend must enforce all validation.
- Do not require a persistent cron job/daemon (incompatible with Vercel serverless deployment).
- Do not break existing Cloudinary signed upload flow.

---

## 3. Constraints

- **Backend**: Bun 1.3, Hono 4, `@hono/zod-openapi`, Zod 4, Drizzle ORM, MySQL (`mysql2`), deployed serverless on Vercel (`maxDuration: 60`).
- **Frontend**: SolidJS 1.9, Vite 7, `@solidjs/router`, TypeScript, vanilla CSS, existing `DataTable`, `Modal`, `ConfirmModal`, `LookupSelect`, `PageHeader`, `Toast`.
- **RBAC**: Dynamic menu tree via `menus` + `role_permissions` (`GET /api/users/me/navigation`) and route protection via `requirePermission()`.
- **Image Upload**: Signed direct-to-Cloudinary upload via `POST /api/uploads/signature`.
- **Timezone**: Vercel servers run in UTC; business logic for `attendance_date` (`YYYY-MM-DD`) and `HH:mm` deadlines must use a consistent local timezone (`process.env.APP_TIMEZONE || "Asia/Makassar"`).

---

## 4. Approaches Considered

1. **Approach A (Selected): Daily Record (`attendances`, 1 row per user per day) + Computed `missed_checkout` Status**
   - Stores `check_in_*` and `check_out_*` columns in one row keyed by `(user_id, attendance_date)`.
   - `missed_checkout` is computed on read (`GET`) when `check_in_time` exists, `check_out_time` is `null`, and current local date/time is past `attendance_date + check_out_deadline`.
   - **Why selected**: Maps 1:1 to daily Check-In / Check-Out, keeps `DataTable` rows clean, and requires no cron job on Vercel.

2. **Approach B (Rejected): Separate Event Logs (`attendance_logs` with `type: check_in | check_out`)**
   - Better if multiple check-ins per day were needed, but adds grouping/pairing complexity for daily table display and missed-checkout detection.

---

## 5. Architecture & Design

### 5.1 Database Schema (`api_diseminasi/src/db/schema.ts`)

1. **`attendance_settings`** (singleton table, 1 row expected; auto-seeded or created on first `PUT`):
   - `id`: `int().primaryKey().autoincrement()`
   - `location_name`: `varchar({ length: 150 }).notNull()`
   - `latitude`: `double().notNull()`
   - `longitude`: `double().notNull()`
   - `radius_meters`: `int().notNull().default(100)`
   - `check_in_deadline`: `varchar({ length: 5 }).notNull()` (`HH:mm`, e.g. `"08:00"`)
   - `check_out_deadline`: `varchar({ length: 5 }).notNull()` (`HH:mm`, e.g. `"17:00"`)
   - `created_at`, `updated_at`: `datetime()`

2. **`attendance_schedules`**:
   - `id`: `int().primaryKey().autoincrement()`
   - `user_id`: `int().notNull()` -> FK `users.id`
   - `day_of_week`: `int().notNull()` (`0` = Sunday .. `6` = Saturday, matching JS `Date.getDay()`)
   - `is_active`: `boolean().notNull().default(true)`
   - `created_at`, `updated_at`: `datetime()`
   - Unique index on `(user_id, day_of_week)`.

3. **`attendances`** (replaces `absensis` in app; legacy `absensis` rows migrated non-destructively):
   - `id`: `int().primaryKey().autoincrement()`
   - `user_id`: `int().notNull()` -> FK `users.id`
   - `attendance_date`: `varchar({ length: 10 }).notNull()` (`YYYY-MM-DD` in `APP_TIMEZONE`)
   - `check_in_time`: `datetime().notNull()`
   - `check_in_lat`: `double()` (nullable in DB for migrated legacy `absensis` rows; required by `POST /check-in` Zod schema)
   - `check_in_lng`: `double()` (nullable in DB for migrated legacy `absensis` rows; required by `POST /check-in` Zod schema)
   - `check_in_image`: `varchar({ length: 255 }).notNull()`
   - `check_in_image_public_id`: `varchar({ length: 255 }).notNull()`
   - `check_in_note`: `text()`
   - `check_in_status`: `varchar({ length: 30 }).notNull()` (`"on_time"` | `"late"` | `"legacy"`)
   - `check_out_time`: `datetime()` (nullable)
   - `check_out_lat`: `double()` (nullable)
   - `check_out_lng`: `double()` (nullable)
   - `check_out_image`: `varchar({ length: 255 })` (nullable)
   - `check_out_image_public_id`: `varchar({ length: 255 })` (nullable)
   - `check_out_note`: `text()` (nullable)
   - `check_out_status`: `varchar({ length: 30 })` (nullable; persisted as `"on_time"` | `"late_checkout"` on check-out, or computed as `"missed_checkout"` in API response when null and past deadline)
   - `created_at`, `updated_at`: `datetime()`
   - Non-unique index on `(user_id, attendance_date)` (1 check-in per day enforced in service so legacy `absensis` rows with multiple entries on the same date migrate cleanly).

4. **Production Data Migration & Default Schedules (Non-Destructive)**:
   - Because `.env` points to the production MySQL database (with 691 existing `absensis` rows), **never run `db:seed`**.
   - Provide an idempotent migration/backfill script:
     1. Copy all `absensis` rows into `attendances` (`check_in_status = "legacy"`, `check_in_lat/lng = null`), keeping `absensis` table intact as backup.
     2. Seed `attendance_settings` default row if empty (e.g. `check_in_deadline: "21:00"`, `check_out_deadline: "17:00"`).
     3. Backfill `attendance_schedules` for the 27 assigned members per the *Jadwal Membersihkan* roster:
        - `Malam Senin` -> Sunday (`day_of_week = 0`), `Malam Selasa` -> Monday (`1`), `Malam Rabu` -> Tuesday (`2`), `Malam Kamis` -> Wednesday (`3`), `Malam Jumat` -> Thursday (`4`), `Malam Sabtu` -> Friday (`5`).
        - Saturday (`day_of_week = 6`) -> `is_active = true` for all 27 members (*wajib bersama Sabtu sore*).
        - `Said` (`id: 42`) and non-member/system accounts have all days `is_active = false` unless configured later.
     4. Upsert `Attendance Management` (`Settings`, `Schedule`, `Attendance`) menus and `role_permissions` without deleting existing menus/permissions.
   - Update `UserService.createUser()` to automatically create a 7-day schedule for newly created users (Saturday `is_active: true`, or Mon–Fri `false` until configured, or configurable in Schedule).

5. **Menus & RBAC (`src/db/seed.ts` + live migration)**:
   - Replace/remove `/absensis` menu entry and seed:
     - Parent: `Attendance Management` (`path: "/attendance-management"`, `permission_path: null`)
     - Child 1: `Settings` (`path: "/attendance/settings"`, `permission_path: "/api/attendance-settings"`)
     - Child 2: `Schedule` (`path: "/attendance/schedules"`, `permission_path: "/api/attendance-schedules"`)
     - Child 3: `Attendance` (`path: "/attendance"`, `permission_path: "/api/attendances"`)
   - Grant `ADMIN` full permissions on all 4 menu rows; grant `OPERATOR` and `USER` `can_read` + `can_create` + `can_update` on `Attendance` (and `can_read` on `Attendance Management` parent).

### 5.2 Business Rules & Validation

- **Distance Calculation**: Haversine formula in meters between `(userLat, userLng)` and `(settings.latitude, settings.longitude)`.
- **Schedule Check**: On Check-In, look up `attendance_schedules` for `(user.id, currentLocalDayOfWeek)`. If no row exists or `is_active === false`, reject with `400` (`"No active schedule for today"`).
- **Radius Check**: On both Check-In and Check-Out, if `distance > settings.radius_meters`, reject with `400` (`"You are outside the allowed attendance radius"`).
- **Check-In Rules**:
  - One check-in per user per `attendance_date` (reject duplicate with `400`).
  - Requires `latitude`, `longitude`, `image`, `image_public_id`.
  - If current local `HH:mm <= settings.check_in_deadline` -> `check_in_status = "on_time"`, else `"late"`.
- **Check-Out Rules (Supports Same-Day & Overnight Shifts)**:
  - If `settings.check_out_deadline <= settings.check_in_deadline` (e.g. `21:00` check-in -> `17:00` next day check-out), the shift is treated as **overnight**; otherwise **same-day**.
  - `GET /api/attendances/today` and `POST /api/attendances/check-out` look for an open attendance (`check_out_time IS NULL`) for `today` OR (when overnight) `yesterday` whose check-out deadline (`attendance_date + 1 day` at `check_out_deadline`) has not yet been closed by a newer check-in.
  - Rejects if no open check-in is found or already checked out.
  - Requires `latitude`, `longitude`, `image`, `image_public_id` (and validates radius).
  - Effective deadline timestamp: `attendance_date` (same-day) or `attendance_date + 1 day` (overnight) at `settings.check_out_deadline`. If current local time <= effective deadline -> `check_out_status = "on_time"`, else `"late_checkout"`.
- **Computed `missed_checkout` Status**:
  - In `AttendanceService` response mapping: if `row.check_out_time === null` and `row.check_in_status !== "legacy"` and current local time is past the effective check-out deadline (`attendance_date` for same-day, or `attendance_date + 1 day` for overnight, at `settings.check_out_deadline`), return `check_out_status: "missed_checkout"`.
- **Role Scoping**:
  - `GET /api/attendances`: Join `users` + `roles`. If `user.role_id` belongs to `ADMIN` role (`code === "ADMIN"`), return all users' records (with optional `?user_id=` / `?date=` filters); otherwise filter strictly by `attendances.user_id = jwtUser.id`.
  - `POST /api/attendances/check-in` and `POST /api/attendances/check-out`: Always derive `user_id` from the authenticated JWT (`c.get("user").id`), never trusting client `user_id`.
  - `DELETE /api/attendances/:id`: Deletes record and safely cleans up both `check_in_image_public_id` and `check_out_image_public_id` from Cloudinary.

### 5.3 Backend API Endpoints (`api_diseminasi`)

- **Upload Signature** (`POST /api/uploads/signature`):
  - Accept `target: "attendance" | "absensi" | "dissemination_details"` (`"attendance"` and `"absensi"` both map to the `CLOUDINARY_URL_ABSENSI` account / `attendance` or `absensi` folder).
- **Attendance Settings** (`/api/attendance-settings`):
  - `GET /` — Returns the current settings row (or sensible default if not yet configured). Note: Regular users also need to read settings on the Attendance page to see target location/radius/deadlines, OR `GET /api/attendances/today` can bundle `{ settings, todaySchedule, todayAttendance }` so regular users don't need `/api/attendance-settings` menu permission! **Decision**: Bundle `{ settings, schedule, attendance }` inside `GET /api/attendances/today` so `Settings` menu stays Admin-only.
  - `PUT /` — Updates (or inserts if missing) the singleton settings row.
- **Attendance Schedules** (`/api/attendance-schedules`):
  - `GET /` — Returns all users with their 7-day schedule array (or list of schedule rows).
  - `GET /user/:userId` — Returns 7-day schedule for one user.
  - `PUT /user/:userId` — Bulk upserts the 7-day schedule (`[{ day_of_week: 0..6, is_active: boolean }]`) for a user.
- **Attendances** (`/api/attendances`):
  - `GET /` — List attendances (Admin: all; Non-Admin: own records).
  - `GET /today` — Returns `{ server_time, today_date, settings, schedule, attendance }` for the logged-in user.
  - `POST /check-in` — Check-in with location + Cloudinary image + optional note.
  - `POST /check-out` — Check-out with location + Cloudinary image + optional note.
  - `DELETE /:id` — Admin delete (with Cloudinary cleanup).

### 5.4 Frontend Pages (`app_diseminasi`)

Refactor `src/app/absensi/` -> `src/app/attendance/` (and remove `/absensis` route):
1. **Settings** (`/attendance/settings`):
   - Form to edit `location_name`, `latitude`, `longitude`, `radius_meters`, `check_in_deadline`, `check_out_deadline`, plus a **"Use Current Location"** button using `navigator.geolocation`.
2. **Schedule** (`/attendance/schedules`):
   - `DataTable` listing users with badges/summary of active days (Mon–Sun), plus an Edit modal with 7 day checkboxes (`Senin`..`Minggu`) that saves via `PUT /api/attendance-schedules/user/:userId`.
3. **Attendance** (`/attendance`):
   - **Today's Status & Action Card**: Displays today's schedule status, configured location/radius/deadlines, user's current GPS coordinates & live distance check, and **Check-In** / **Check-Out** action button opening a modal with photo upload + optional note.
   - **Attendance History (`DataTable`)**: Uses existing `DataTable` (with debounced search + page size selector) showing Date, User (for Admin), Check-In (time, status badge, thumbnail), Check-Out (time, status badge including `Missed Checkout`, thumbnail), and Admin delete action.

---

## 6. Left to the Builder

- Exact Drizzle migration SQL generation (`bun run db:generate` or `db:push`) and `seed.ts` updates.
- Exact OpenAPI Zod schemas and DTO filenames following the existing `src/app/<module>/` convention.
- CSS styling details in `app_diseminasi` consistent with `global-page.css` and `global-table.css`.
- Unit tests for Haversine distance calculation and `missed_checkout` / `late` status computation.
