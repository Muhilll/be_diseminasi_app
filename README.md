# API Diseminasi

Backend API untuk aplikasi diseminasi, dibangun dengan:

- Bun
- Hono
- Drizzle ORM
- MySQL
- Cloudinary

Project ini menyediakan API untuk:

- users
- roles
- menus
- grades
- positions
- role permissions
- disseminations
- dissemination details
- absensis

## Prasyarat

Sebelum menjalankan project, pastikan sudah ada:

- Bun
- MySQL
- akun Cloudinary untuk upload gambar

## Clone Project

```bash
git clone <url-repository>
cd api_diseminasi
```

## Install Dependency

```bash
bun install
```

## Setup Environment

Copy file `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Kalau di Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Isi `.env` minimal seperti ini:

```env
DATABASE_URL=mysql://username:password@localhost:3306/database_name
APP_TOKEN=your-app-token
JWT_SECRET=your-jwt-secret
ALLOWED_APP_URL=http://localhost:5000
CLOUDINARY_URL_ABSENSI=cloudinary://api_key:api_secret@cloud_name
CLOUDINARY_URL_DISSEMINATION_DETAILS=cloudinary://api_key:api_secret@cloud_name
```

Penjelasan:

- `DATABASE_URL`: koneksi database MySQL
- `APP_TOKEN`: token tambahan yang wajib dikirim ke endpoint protected melalui header `X-App-Token`
- `JWT_SECRET`: secret untuk generate dan verify JWT
- `ALLOWED_APP_URL`: URL frontend
- `CLOUDINARY_URL_ABSENSI`: akun Cloudinary untuk upload gambar absensi
- `CLOUDINARY_URL_DISSEMINATION_DETAILS`: akun Cloudinary untuk upload gambar dissemination details

## Setup Database

Buat database MySQL terlebih dahulu, misalnya:

```sql
CREATE DATABASE db_diseminasi;
```

Setelah itu jalankan salah satu cara berikut.

### Opsi 1: Generate migration lalu migrate

```bash
bun run db:generate
bun run db:migrate
```

### Opsi 2: Push schema langsung ke database

```bash
bun run db:push
```

Catatan:

- `db:migrate` cocok kalau kamu memakai file migration dari folder `drizzle`
- `db:push` cocok untuk development cepat agar schema langsung sinkron ke database

## Seed Data Awal

Untuk mengisi data awal seperti:

- roles
- grades
- positions
- menus
- users
- role permissions

jalankan:

```bash
bun run db:seed
```

Default user dari seeder:

- Admin
  - email: `admin@diseminasi.com`
  - password: `admin123`
- Operator
  - email: `operator@diseminasi.com`
  - password: `operator123`

## Menjalankan Project

```bash
bun run dev
```

Server akan berjalan di:

```text
http://localhost:4000
```

Endpoint public:

- `GET /`
- `GET /api/health`
- `POST /api/users/login`

## Struktur API

Base path utama:

- `/api/users`
- `/api/roles`
- `/api/menus`
- `/api/grades`
- `/api/positions`
- `/api/role-permissions`
- `/api/disseminations`
- `/api/dissemination-details`
- `/api/absensis`

## Authentication dan Header

Sebagian besar endpoint membutuhkan:

- header `Authorization: Bearer <token>`
- header `X-App-Token: <APP_TOKEN>`

Alurnya:

1. Login lewat `POST /api/users/login`
2. Ambil token dari response login
3. Gunakan token tersebut untuk request ke endpoint protected

Contoh header:

```http
Authorization: Bearer <your-jwt-token>
X-App-Token: <your-app-token>
```

## Upload Gambar

Upload gambar dipakai di:

- `dissemination_details.image`
- `absensis.gambar`

Request dapat dikirim dalam bentuk:

- `multipart/form-data` untuk file gambar asli
- atau JSON/string URL bila dibutuhkan

Saat upload berhasil:

- file akan dikirim ke Cloudinary
- database menyimpan `secure_url`
- database juga menyimpan `public_id` untuk kebutuhan replace/delete file lama

Field file yang dipakai:

- `image` untuk dissemination details
- `gambar` untuk absensis

## Permission

Project ini memakai middleware permission per route.

Permission ditentukan dari:

- role user
- tabel `menus`
- tabel `role_permissions`

Frontend cukup:

- login
- ambil token
- kirim header auth
- ambil navigation dari `GET /api/users/me/navigation`

Backend akan memvalidasi akses endpoint berdasarkan permission role user.

## Script yang Tersedia

```bash
bun run dev
bun run db:generate
bun run db:migrate
bun run db:push
bun run db:studio
bun run db:seed
```

## Catatan Pengembangan

- Jika menambah field baru di schema, jalankan migration atau `db:push`
- Jika mengubah data seed, jalankan ulang `bun run db:seed`
- Jika upload gambar bermasalah, cek env Cloudinary
- Jika endpoint protected selalu `401`, cek token dan `X-App-Token`
- Jika endpoint protected `403`, cek data `menus` dan `role_permissions`

## Health Check

Untuk memastikan API berjalan:

```http
GET /api/health
```

Response:

```json
{
  "success": true,
  "message": "API is running"
}
```
