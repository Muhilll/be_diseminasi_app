# Attendance Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the legacy `absensis` feature into a full **Attendance Management** system (`Settings`, `Schedule`, `Attendance`) with GPS radius validation, overnight shift support, weekly user schedules, and non-destructive migration of 691 production records.

**Architecture:** Backend (`api_diseminasi`) adds `attendance_settings`, `attendance_schedules`, and `attendances` tables in MySQL/Drizzle, preserves `absensis` as a backup while migrating rows to `attendances`, and computes `missed_checkout` dynamically on read using `APP_TIMEZONE` (`Asia/Makassar`). Frontend (`app_diseminasi`) replaces `src/app/absensi` with `src/app/attendance` (Settings, Schedule, Attendance) using existing `DataTable`, `Modal`, `Toast`, `PageHeader`, browser Geolocation, and signed Cloudinary uploads.

**Tech Stack:** Bun 1.3, Hono 4, `@hono/zod-openapi`, Zod 4, Drizzle ORM (`mysql2`), `bun:test`, SolidJS 1.9, Vite 7, TypeScript.

**Spec:** `api_diseminasi/docs/superpowers/specs/2026-11-26-attendance-management-design.md`

## Global Constraints

- **Production DB safety:** `.env` points to production MySQL (`absensis` has 691 rows). **NEVER run `bun run db:seed`**. All DB updates must be idempotent and non-destructive.
- **Overnight & same-day shifts:** If `check_out_deadline <= check_in_deadline`, treat as overnight (`attendance_date + 1 day`); otherwise same-day (`attendance_date`).
- **Timezone:** All `attendance_date` (`YYYY-MM-DD`), `day_of_week` (`0..6`), and `HH:mm` comparisons must use `process.env.APP_TIMEZONE || "Asia/Makassar"`.
- **RBAC & scoping:** Protect all routes with `jwtMiddleware`, `appTokenMiddleware`, and `requirePermission()`. Derive `user_id` from JWT on `check-in`/`check-out`; only `ADMIN` role (`code === "ADMIN"`) sees all users in `GET /api/attendances`.
- **Cloudinary:** Keep existing signed direct-upload flow (`POST /api/uploads/signature`) and safely delete old assets on `DELETE`.

## Review Focus

1. **Overnight check-out past midnight:** User checks in Sunday `20:30` (`check_in_deadline: 21:00`, `check_out_deadline: 17:00`), checks out Monday `16:00` -> must match Sunday's open row and be `on_time`, NOT rejected as "not checked in today".
2. **Legacy `absensis` rows with `check_out_time = null`:** Migrated rows have `check_in_status: "legacy"` -> must NOT be flagged as `missed_checkout`.
3. **Outside radius or inactive schedule day:** Check-In/Check-Out outside `radius_meters` or Check-In on an inactive day must return `400` before writing to DB.
4. **Duplicate check-in on same `attendance_date`:** Second `POST /check-in` on the same `attendance_date` must return `400`, even without a DB unique constraint (omitted so legacy multi-entry days migrate cleanly).
5. **Check-in with `HH:mm > check_in_deadline`:** Must succeed with `201` and `check_in_status: "late"`.

---

### Task 1: Core Attendance Domain Utilities & Unit Tests (`api_diseminasi`)

**Files:**
- Create: `api_diseminasi/src/utils/attendance.ts`
- Test: `api_diseminasi/src/utils/attendance.test.ts`

**Interfaces:**
- Produces:
  - `calculateDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number`
  - `getLocalDateParts(date?: Date, timeZone?: string): { date: string; time: string; dayOfWeek: number }`
  - `shiftDateString(dateStr: string, deltaDays: number): string`
  - `isOvernightShift(checkInDeadline: string, checkOutDeadline: string): boolean`
  - `computeCheckInStatus(localTime: string, checkInDeadline: string): "on_time" | "late"`
  - `computeEffectiveCheckOutStatus(params: { checkOutTime: Date | null; persistedCheckOutStatus: string | null; attendanceDate: string; checkInStatus: string; checkInDeadline: string; checkOutDeadline: string; now?: Date; timeZone?: string }): string | null`
  - `computeCheckOutSubmissionStatus(params: { attendanceDate: string; checkInDeadline: string; checkOutDeadline: string; now?: Date; timeZone?: string }): "on_time" | "late_checkout"`

- [ ] **Step 1: Write failing unit tests in `api_diseminasi/src/utils/attendance.test.ts`**
  Cover:
  - Haversine distance (`0m` for identical coords, `~111m` for `0.001` deg latitude).
  - `getLocalDateParts` in `Asia/Makassar` (UTC+8).
  - `computeCheckInStatus` (`"20:59"` vs `"21:00"` -> `"on_time"`, `"21:01"` -> `"late"`).
  - Overnight check-out (`21:00` / `17:00`): Sunday `2026-11-29` check-in -> Monday `2026-11-30 16:00` local -> `computeCheckOutSubmissionStatus` = `"on_time"`; Monday `17:05` local -> `"late_checkout"`.
  - `computeEffectiveCheckOutStatus`:
    - `check_in_status: "legacy"`, `check_out_time: null` -> `null` (not `missed_checkout`).
    - Overnight shift `2026-11-29` with `check_out_time: null` at `2026-11-30 16:59` -> `null`; at `2026-11-30 17:01` -> `"missed_checkout"`.
    - Same-day shift (`08:00` / `17:00`) `2026-11-30` with `check_out_time: null` at `2026-11-30 17:01` -> `"missed_checkout"`.

- [ ] **Step 2: Run test to verify it fails**
  Run: `cd api_diseminasi && bun test src/utils/attendance.test.ts`
  Expected: FAIL (module not found).

- [ ] **Step 3: Implement `api_diseminasi/src/utils/attendance.ts`**
  Implement all exported functions listed in Interfaces using Haversine (Earth radius `6371000` m) and `Intl.DateTimeFormat("en-CA", { timeZone, ... })`.

- [ ] **Step 4: Run tests to verify they pass**
  Run: `cd api_diseminasi && bun test src/utils/attendance.test.ts`
  Expected: All assertions PASS.

- [ ] **Step 5: Commit**
  `git add src/utils/attendance.ts src/utils/attendance.test.ts && git commit -m "feat(attendance): add geolocation and shift status utilities"`

---

### Task 2: Database Schema, Production Migration Script & User Default Schedule (`api_diseminasi`)

**Files:**
- Modify: `api_diseminasi/src/db/schema.ts`
- Modify: `api_diseminasi/src/db/seed.ts` (keep dev seed updated without running it on prod)
- Modify: `api_diseminasi/src/app/user/service/user.service.ts`
- Create: `api_diseminasi/src/db/migrate-attendance.ts`

**Interfaces:**
- Consumes: `getLocalDateParts` from `../utils/attendance`
- Produces:
  - Drizzle tables `attendance_settings`, `attendance_schedules`, `attendances` exported from `src/db/schema.ts`.
  - Idempotent `src/db/migrate-attendance.ts` script.

- [ ] **Step 1: Add `attendance_settings`, `attendance_schedules`, and `attendances` to `src/db/schema.ts`**
  Keep `absensis` table definition in `schema.ts` untouched so Drizzle `db:push` does not drop the 691-row backup table. Add non-unique index on `attendances(user_id, attendance_date)` and unique index on `attendance_schedules(user_id, day_of_week)`.

- [ ] **Step 2: Push schema changes safely**
  Run: `cd api_diseminasi && bun run db:push`
  Verify `drizzle-kit push:mysql` only creates the 3 new tables and drops nothing.

- [ ] **Step 3: Create idempotent `api_diseminasi/src/db/migrate-attendance.ts`**
  - Copy `absensis` -> `attendances` only if `attendances` count is `0` (`check_in_status = "legacy"`, `check_in_lat = null`, `check_in_lng = null`, `attendance_date` formatted in `APP_TIMEZONE` from `created_at`).
  - Insert default `attendance_settings` row if table is empty (`location_name: "Basecamp"`, `latitude: -5.147665`, `longitude: 119.432732`, `radius_meters: 100`, `check_in_deadline: "21:00"`, `check_out_deadline: "17:00"`).
  - Backfill `attendance_schedules` for all users in `users` using the exact *Jadwal Membersihkan* roster (Malam Senin=`0`, Malam Selasa=`1`, Malam Rabu=`2`, Malam Kamis=`3`, Malam Jumat=`4`, Malam Sabtu=`5`, plus Saturday=`6` active for all 27 members; `Said` id `42` and system accounts all `false`), skipping users that already have schedule rows.
  - Upsert `Attendance Management` parent menu (`/attendance-management`), `Settings` (`/attendance/settings`, `/api/attendance-settings`), `Schedule` (`/attendance/schedules`, `/api/attendance-schedules`), `Attendance` (`/attendance`, `/api/attendances`), and grant `ADMIN` full permissions + `OPERATOR`/`USER` read/create/update on `Attendance` and read on `Attendance Management`.

- [ ] **Step 4: Run `migrate-attendance.ts` and verify DB counts**
  Run: `cd api_diseminasi && bun src/db/migrate-attendance.ts`
  Verify: `attendances` has 691 rows, `attendance_settings` has 1 row, `attendance_schedules` has `33 * 7 = 231` rows, and all 4 menus exist.

- [ ] **Step 5: Update `UserService.createUser()` in `src/app/user/service/user.service.ts` and `src/db/seed.ts`**
  When a new user is created via API, insert 7 default `attendance_schedules` rows (`day_of_week: 0..6`, `is_active: day === 6`). Update `src/db/seed.ts` menu list for future fresh dev setups.

- [ ] **Step 6: Commit**
  `git add src/db/schema.ts src/db/migrate-attendance.ts src/db/seed.ts src/app/user/service/user.service.ts && git commit -m "feat(db): add attendance tables and non-destructive prod migration"`

---

### Task 3: Backend `attendance_setting`, `attendance_schedule` & `upload` Modules (`api_diseminasi`)

**Files:**
- Create: `api_diseminasi/src/app/attendance_setting/{contract,controller,dto,repository,route,service}/*`
- Create: `api_diseminasi/src/app/attendance_schedule/{contract,controller,dto,repository,route,service}/*`
- Modify: `api_diseminasi/src/app/upload/controller/upload.controller.ts`
- Modify: `api_diseminasi/src/app/upload/route/upload.openapi.ts`
- Modify: `api_diseminasi/src/utils/cloudinary.ts`
- Modify: `api_diseminasi/src/docs/openapi-schemas.ts`
- Modify: `api_diseminasi/src/docs/openapi.ts`
- Modify: `api_diseminasi/src/index.ts`

**Interfaces:**
- Produces:
  - `AttendanceSettingReadRepository.getSetting()`, `AttendanceSettingService.getSetting()`, `updateSetting(payload)`
  - `AttendanceScheduleReadRepository.getScheduleByUserAndDay(userId, dayOfWeek)`, `getAllWithUsers()`, `getByUserId(userId)`, `AttendanceScheduleService.upsertUserSchedule(userId, items)`
  - Routes mounted at `/api/attendance-settings` and `/api/attendance-schedules`
  - `POST /api/uploads/signature` accepts `target: "attendance" | "absensi" | "dissemination_details"`

- [ ] **Step 1: Update `cloudinary.ts` and `upload` controller/openapi to support `"attendance"` target**
  Map `"attendance"` to `CLOUDINARY_URL_ABSENSI` (folder `"absensi"` or `"attendance"` — use `"attendance"` for new uploads while `deleteImageFromCloudinarySafely` works with any `public_id` on that Cloudinary account).

- [ ] **Step 2: Implement `attendance_setting` module (`GET /`, `PUT /`)**
  Follow standard module layout (`contract`, `dto`, `repository`, `service`, `controller`, `route/*.openapi.ts`, `route/*.route.ts`), validating `HH:mm` regex `/^([01]\d|2[0-3]):([0-5]\d)$/`, `latitude` `[-90, 90]`, `longitude` `[-180, 180]`, `radius_meters` `>= 10`.

- [ ] **Step 3: Implement `attendance_schedule` module (`GET /`, `GET /user/:userId`, `PUT /user/:userId`)**
  `GET /` returns each user with their 7-day schedule array ordered `0..6`. `PUT /user/:userId` accepts `{ schedules: Array<{ day_of_week: 0..6, is_active: boolean }> }` and upserts all 7 days in a transaction.

- [ ] **Step 4: Register schemas and routes in `openapi-schemas.ts`, `openapi.ts`, and `src/index.ts`**

- [ ] **Step 5: Verify OpenAPI spec & server boot**
  Run: `cd api_diseminasi && bun -e "import app from './src/index'; const res = await app.request('/openapi.json'); console.log(res.status, Object.keys((await res.json()).paths).filter((p) => p.includes('attendance'))); process.exit(0);"`
  Expected: `200` and paths include `/api/attendance-settings` and `/api/attendance-schedules`.

- [ ] **Step 6: Commit**
  `git add src/ && git commit -m "feat(api): add attendance settings, schedules, and upload target"`

---

### Task 4: Backend `attendance` Module (`api_diseminasi`)

**Files:**
- Create: `api_diseminasi/src/app/attendance/{contract,controller,dto,repository,route,service}/*`
- Modify: `api_diseminasi/src/docs/openapi-schemas.ts`
- Modify: `api_diseminasi/src/docs/openapi.ts`
- Modify: `api_diseminasi/src/index.ts`

**Interfaces:**
- Consumes: `calculateDistanceMeters`, `getLocalDateParts`, `shiftDateString`, `isOvernightShift`, `computeCheckInStatus`, `computeCheckOutSubmissionStatus`, `computeEffectiveCheckOutStatus`, `AttendanceSettingReadRepository`, `AttendanceScheduleReadRepository`, `deleteImageFromCloudinarySafely`.
- Produces:
  - `GET /api/attendances` (Admin: all; Non-Admin: own records; computes `check_out_status: "missed_checkout"` on read)
  - `GET /api/attendances/today` (returns `{ server_time, today_date, settings, schedule, open_attendance, today_attendance }`)
  - `POST /api/attendances/check-in`
  - `POST /api/attendances/check-out`
  - `DELETE /api/attendances/:id` (cleans up both `check_in_image_public_id` and `check_out_image_public_id`)

- [ ] **Step 1: Implement `attendance` repository (read/write) & contract**
  Read repository joins `users` (including `role_id` and `roles.code` for Admin check). Provide `findByUserAndDate(userId, date)` and `findOpenByUserAndDates(userId, dates[])`.

- [ ] **Step 2: Implement `attendance` service with full validation**
  - `checkIn(userId, payload)`: check schedule active for today -> check no existing row for `today` -> check radius -> compute `check_in_status` -> insert.
  - `checkOut(userId, payload)`: find open row (`today`, or `yesterday` if `isOvernightShift`) -> check radius -> compute `check_out_status` -> update.
  - `getTodayStatus(userId)`: return `{ server_time, today_date, settings, schedule, attendance }` where `attendance` is today's row or yesterday's open overnight row.

- [ ] **Step 3: Implement controller, OpenAPI routes, and mount `/api/attendances` in `src/index.ts` & `src/docs/openapi.ts`**

- [ ] **Step 4: Write integration tests for `AttendanceService` / routes in `api_diseminasi/src/app/attendance/attendance.test.ts`**
  Test the 5 Review Focus cases (mocking repositories or using `app.request` with unit-tested service helpers) and verify `bun test` passes.

- [ ] **Step 5: Run all backend tests & OpenAPI check**
  Run: `cd api_diseminasi && bun test && bun -e "import app from './src/index'; const res = await app.request('/openapi.json'); console.log(res.status); process.exit(0);"`
  Expected: All tests PASS and `/openapi.json` returns `200`.

- [ ] **Step 6: Commit**
  `git add src/ && git commit -m "feat(api): add attendance check-in, check-out, and today endpoints"`

---

### Task 5: Frontend Attendance Management (`app_diseminasi`)

**Files:**
- Remove: `app_diseminasi/src/app/absensi/` (replaced by `src/app/attendance/`)
- Create: `app_diseminasi/src/app/attendance/route.tsx`
- Create: `app_diseminasi/src/app/attendance/service/attendance.api.ts`
- Create: `app_diseminasi/src/app/attendance/type/attendance.ts`
- Create: `app_diseminasi/src/app/attendance/pages/SettingsPage.tsx`
- Create: `app_diseminasi/src/app/attendance/pages/SchedulePage.tsx`
- Create: `app_diseminasi/src/app/attendance/pages/AttendancePage.tsx`
- Create: `app_diseminasi/src/app/attendance/pages/attendance.columns.tsx`
- Modify: `app_diseminasi/src/router/index.tsx`
- Modify: `app_diseminasi/src/services/uploads.ts` (add `"attendance"` to `UploadTarget`)
- Modify: `app_diseminasi/src/services/api.ts` (parse backend JSON `{ message }` error when `!response.ok` so radius/schedule rejection messages show cleanly in UI!)

**Interfaces:**
- Routes registered in `src/router/index.tsx`:
  - `/attendance/settings` -> `SettingsPage`
  - `/attendance/schedules` -> `SchedulePage`
  - `/attendance` -> `AttendancePage`

- [ ] **Step 1: Update `src/services/uploads.ts` (`UploadTarget`) and `src/services/api.ts` (parse error JSON `message`)**

- [ ] **Step 2: Create `src/app/attendance/type/attendance.ts` & `src/app/attendance/service/attendance.api.ts`**

- [ ] **Step 3: Create `SettingsPage.tsx`**
  Form for `location_name`, `latitude`, `longitude`, `radius_meters`, `check_in_deadline` (`type="time"`), `check_out_deadline` (`type="time"`), plus **"Gunakan Lokasi Saat Ini"** button via `navigator.geolocation.getCurrentPosition`.

- [ ] **Step 4: Create `SchedulePage.tsx`**
  `DataTable` listing all users with their active day badges (`Min`..`Sab`), plus Edit modal with 7 checkboxes (`Minggu`..`Sabtu`) calling `PUT /api/attendance-schedules/user/:userId`.

- [ ] **Step 5: Create `AttendancePage.tsx` & `attendance.columns.tsx`**
  - Top status card showing today's schedule, target location & radius, current GPS coordinates & live distance (via `navigator.geolocation`), and **Absen Masuk (Check-In)** / **Absen Pulang (Check-Out)** button opening a Modal with photo file input (Cloudinary `"attendance"`) + optional note.
  - History `DataTable` with Date, User, Check-In (time + `On Time`/`Late`/`Legacy` badge + thumbnail), Check-Out (time + `On Time`/`Late Checkout`/`Missed Checkout` badge + thumbnail), and Admin delete action.

- [ ] **Step 6: Create `route.tsx`, update `src/router/index.tsx`, and remove `src/app/absensi/`**

- [ ] **Step 7: Verify TypeScript & Vite build**
  Run: `cd app_diseminasi && bunx tsc --noEmit && bun run build`
  Expected: Exit code 0.

- [ ] **Step 8: Commit**
  `git add -A && git commit -m "feat(attendance): add attendance management pages (settings, schedule, attendance)"`

---

### Task 6: Update `AGENTS.md` Context & Final Verification

**Files:**
- Modify: `AGENTS.md` (document new attendance tables, endpoints, routes, and `APP_TIMEZONE`)

- [ ] **Step 1: Update `AGENTS.md` to reflect Attendance Management**
- [ ] **Step 2: Run backend tests + frontend typecheck & build**
  Run backend `bun test` and frontend `bunx tsc --noEmit` + `bun run build`.
