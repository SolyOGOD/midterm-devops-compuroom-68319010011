# midterm-devops-compuroom-68319010011

# 💻 CompuRoom — ระบบบันทึกข้อมูลเครื่องคอมพิวเตอร์ประจำห้อง

[![CI](https://github.com/SolyOGOD/midterm-devops-compuroom-68319010011/actions/workflows/ci.yml/badge.svg)](https://github.com/SolyOGOD/midterm-devops-compuroom-68319010011/actions/workflows/ci.yml)

ระบบบันทึกข้อมูลเครื่องคอมพิวเตอร์ประจำห้อง (CRUD) ในห้องปฏิบัติการของแผนกวิชา สามารถบันทึกรหัสครุภัณฑ์, ยี่ห้อรุ่น, สเปก CPU, RAM, ห้องที่ติดตั้ง และสถานะการใช้งานของเครื่องคอมพิวเตอร์ได้

---

## 👤 ข้อมูลผู้จัดทำ
- **ชื่อ-นามสกุล:** นายไพสิทธิ์ พิมาทัย
- **รหัสนักศึกษา:** 68319010011
- **โจทย์ที่ได้รับ:** โจทย์ที่ 1 ระบบบันทึกข้อมูลเครื่องคอมพิวเตอร์ประจำห้อง (compuroom)

---

## 🛠️ Tech Stack
- **Backend:** Node.js + Express.js + PostgreSQL
- **Frontend:** Vue 3 + Vite
- **Container:** Docker + Docker Compose
- **CI/CD:** GitHub Actions

---

## 📦 ลิงก์ไปยัง Docker Hub Repository
- **Backend Image:** [solyogod/compuroom-api](https://hub.docker.com/r/solyogod/compuroom-api)
- **Frontend Image:** [solyogod/compuroom-web](https://hub.docker.com/r/solyogod/compuroom-web)

---

## 🚀 วิธีการรันระบบ (How to Run)

ก่อนเริ่มรันกรุณาคัดลอกไฟล์ตั้งค่าสภาพแวดล้อมดังนี้:
```bash
cp backend/.env.example backend/.env
```

### 1. แบบที่ 1: รันเพื่อพัฒนา (Development - Local Build)
ใช้คำสั่งนี้เพื่อทำการ Build โค้ดจากโฟลเดอร์ภายในเครื่องและเริ่มรันระบบ:
```bash
docker compose up --build
```
ระบบจะเปิดให้เข้าใช้งานได้ทาง:
- **Frontend:** http://localhost (Port 80)
- **Backend API:** http://localhost:3001

### 2. แบบที่ 2: รันเวอร์ชันใช้งานจริง (Production - Pull from Docker Hub)
ใช้คำสั่งนี้เพื่อดึง Image สำเร็จรูปจาก Docker Hub มารันโดยไม่ทำการ Build ใหม่:
```bash
docker compose -f docker-compose.prod.yml up -d
```

---

## 🛣️ API Endpoints

| Method | Path | คำอธิบาย |
|--------|------|----------|
| GET | `/health` | ตรวจสอบสถานะการเชื่อมต่อระบบ (Health check) |
| GET | `/api/computers` | ดึงข้อมูลเครื่องคอมพิวเตอร์ทั้งหมด (สามารถกรองตามห้องหรือสถานะได้) |
| GET | `/api/computers/:id` | ดึงข้อมูลเครื่องคอมพิวเตอร์ตาม ID |
| POST | `/api/computers` | สร้างรายการเครื่องคอมพิวเตอร์ใหม่ |
| PUT | `/api/computers/:id` | แก้ไขข้อมูลเครื่องคอมพิวเตอร์ตาม ID |
| DELETE | `/api/computers/:id` | ลบข้อมูลเครื่องคอมพิวเตอร์ตาม ID |