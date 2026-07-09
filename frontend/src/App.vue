<template>
  <div class="app-container">
    <!-- Header -->
    <header class="app-header">
      <div class="header-logo">
        <span class="logo-icon">💻</span>
        <h1>CompuRoom</h1>
      </div>
      <div class="developer-info">
        <span class="dev-badge">Developer</span>
        <span class="dev-name">{{ studentName }}</span>
        <span class="dev-id">ID: {{ studentId }}</span>
      </div>
    </header>

    <main class="app-main">
      <!-- Left Column: Form -->
      <section class="form-section card">
        <h2 class="section-title">
          {{ editingId ? '📝 แก้ไขข้อมูลคอมพิวเตอร์' : '➕ เพิ่มคอมพิวเตอร์ใหม่' }}
        </h2>
        
        <form @submit.prevent="saveComputer" class="computer-form">
          <div class="form-group">
            <label for="asset_code">รหัสครุภัณฑ์ / รหัสเครื่อง <span class="required">*</span></label>
            <input 
              id="asset_code"
              v-model="form.asset_code" 
              placeholder="เช่น COM-01-001" 
              required 
              :disabled="!!editingId"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="brand_model">ยี่ห้อ & รุ่น <span class="required">*</span></label>
              <input 
                id="brand_model"
                v-model="form.brand_model" 
                placeholder="เช่น Acer Veriton M200" 
                required 
              />
            </div>
            <div class="form-group">
              <label for="room">ห้องที่ติดตั้ง <span class="required">*</span></label>
              <input 
                id="room"
                v-model="form.room" 
                placeholder="เช่น Lab 501" 
                required 
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="cpu">สเปก CPU <span class="required">*</span></label>
              <input 
                id="cpu"
                v-model="form.cpu" 
                placeholder="เช่น Intel Core i5-12400" 
                required 
              />
            </div>
            <div class="form-group">
              <label for="ram_gb">RAM (GB) <span class="required">*</span></label>
              <input 
                id="ram_gb"
                type="number" 
                v-model.number="form.ram_gb" 
                placeholder="เช่น 16" 
                min="1" 
                required 
              />
            </div>
          </div>

          <div class="form-group">
            <label for="status">สถานะการใช้งาน <span class="required">*</span></label>
            <select id="status" v-model="form.status" required>
              <option value="ใช้งาน">ใช้งาน</option>
              <option value="ส่งซ่อม">ส่งซ่อม</option>
              <option value="จำหน่าย">จำหน่าย</option>
            </select>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary">
              {{ editingId ? 'บันทึกการแก้ไข' : 'เพิ่มข้อมูลเครื่อง' }}
            </button>
            <button 
              type="button" 
              v-if="editingId" 
              class="btn btn-secondary" 
              @click="cancelEdit"
            >
              ยกเลิก
            </button>
          </div>
        </form>
      </section>

      <!-- Right Column: List & Filters -->
      <section class="list-section">
        <!-- Filter Bar -->
        <div class="filter-bar card">
          <div class="filter-group">
            <label>🔍 ค้นหาห้อง:</label>
            <input 
              v-model="filterRoom" 
              placeholder="พิมพ์ชื่อห้อง..." 
              @input="loadComputers"
            />
          </div>
          <div class="filter-group">
            <label>📊 ตัวกรองสถานะ:</label>
            <select v-model="filterStatus" @change="loadComputers">
              <option value="">ทั้งหมด</option>
              <option value="ใช้งาน">ใช้งาน</option>
              <option value="ส่งซ่อม">ส่งซ่อม</option>
              <option value="จำหน่าย">จำหน่าย</option>
            </select>
          </div>
        </div>

        <!-- Alert messages -->
        <div v-if="alertMsg" :class="['alert', alertType]">
          {{ alertMsg }}
          <button class="alert-close" @click="alertMsg = ''">×</button>
        </div>

        <!-- Computer Grid -->
        <div v-if="loading" class="state-container">
          <div class="spinner"></div>
          <p>กำลังโหลดข้อมูล...</p>
        </div>

        <div v-else-if="computers.length === 0" class="state-container card empty-state">
          <span class="empty-icon">📂</span>
          <h3>ไม่พบข้อมูลเครื่องคอมพิวเตอร์</h3>
          <p>ลองเปลี่ยนตัวกรองค้นหา หรือกดเพิ่มเครื่องคอมพิวเตอร์ใหม่ด้านซ้ายมือ</p>
        </div>

        <div v-else class="computers-grid">
          <div 
            v-for="comp in computers" 
            :key="comp.id" 
            class="computer-card card"
            :class="getStatusClass(comp.status)"
          >
            <div class="card-header">
              <span class="asset-code">{{ comp.asset_code }}</span>
              <span class="status-badge" :class="getStatusClass(comp.status)">
                {{ comp.status }}
              </span>
            </div>

            <div class="card-body">
              <h3 class="brand-model">{{ comp.brand_model }}</h3>
              <div class="specs">
                <div class="spec-item">
                  <span class="spec-label">CPU:</span>
                  <span class="spec-value">{{ comp.cpu }}</span>
                </div>
                <div class="spec-item">
                  <span class="spec-label">RAM:</span>
                  <span class="spec-value">{{ comp.ram_gb }} GB</span>
                </div>
                <div class="spec-item">
                  <span class="spec-label">ห้อง:</span>
                  <span class="spec-value highlight">{{ comp.room }}</span>
                </div>
              </div>
            </div>

            <div class="card-footer">
              <button class="btn-icon btn-edit" @click="startEdit(comp)" title="แก้ไข">
                ✏️ แก้ไข
              </button>
              <button class="btn-icon btn-delete" @click="deleteComputer(comp.id)" title="ลบ">
                🗑️ ลบ
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="app-footer">
      <p>© {{ new Date().getFullYear() }} DevOps Mini Project — ระบบบันทึกข้อมูลเครื่องคอมพิวเตอร์ประจำห้อง (compuroom)</p>
      <p>พัฒนาโดย: {{ studentName }} ({{ studentId }})</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const studentName = 'ไพสิทธิ์ พิมาทัย'
const studentId   = '68319010011'

// API Endpoint (ตรวจสอบ ENV หรือใช้พอร์ต 3001)
const API = import.meta.env.VITE_API_URL || ''

// States
const computers    = ref([])
const loading      = ref(false)
const editingId    = ref(null)
const filterStatus = ref('')
const filterRoom   = ref('')

// Form State
const form = ref({
  asset_code: '',
  brand_model: '',
  cpu: '',
  ram_gb: 16,
  room: '',
  status: 'ใช้งาน'
})

// Notification State
const alertMsg = ref('')
const alertType = ref('success') // success | error

function showAlert(msg, type = 'success') {
  alertMsg.value = msg
  alertType.value = type
  setTimeout(() => {
    if (alertMsg.value === msg) alertMsg.value = ''
  }, 4000)
}

// Actions
async function loadComputers() {
  loading.value = true
  try {
    const params = []
    if (filterStatus.value) params.push(`status=${encodeURIComponent(filterStatus.value)}`)
    if (filterRoom.value) params.push(`room=${encodeURIComponent(filterRoom.value)}`)
    
    const queryString = params.length > 0 ? `?${params.join('&')}` : ''
    const res = await fetch(`${API}/api/computers${queryString}`)
    if (!res.ok) throw new Error('ไม่สามารถดึงข้อมูลจาก API ได้')
    computers.value = await res.json()
  } catch (err) {
    showAlert(err.message, 'error')
  } finally {
    loading.value = false
  }
}

async function saveComputer() {
  try {
    const method = editingId.value ? 'PUT' : 'POST'
    const url = editingId.value 
      ? `${API}/api/computers/${editingId.value}` 
      : `${API}/api/computers`

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    })

    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error || 'บันทึกข้อมูลไม่สำเร็จ')
    }

    showAlert(editingId.value ? 'แก้ไขข้อมูลสำเร็จแล้ว!' : 'เพิ่มข้อมูลสำเร็จแล้ว!', 'success')
    resetForm()
    loadComputers()
  } catch (err) {
    showAlert(err.message, 'error')
  }
}

function startEdit(comp) {
  editingId.value = comp.id
  form.value = {
    asset_code: comp.asset_code,
    brand_model: comp.brand_model,
    cpu: comp.cpu,
    ram_gb: comp.ram_gb,
    room: comp.room,
    status: comp.status
  }
  // เลื่อนหน้าจอไปที่ส่วนของฟอร์ม
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function cancelEdit() {
  resetForm()
}

function resetForm() {
  editingId.value = null
  form.value = {
    asset_code: '',
    brand_model: '',
    cpu: '',
    ram_gb: 16,
    room: '',
    status: 'ใช้งาน'
  }
}

async function deleteComputer(id) {
  if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลเครื่องคอมพิวเตอร์นี้?')) return
  try {
    const res = await fetch(`${API}/api/computers/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error || 'ลบข้อมูลไม่สำเร็จ')
    }
    showAlert('ลบข้อมูลเครื่องคอมพิวเตอร์เรียบร้อยแล้ว!', 'success')
    // หากกำลังแก้ตัวที่ลบอยู่ ให้เคลียร์ฟอร์ม
    if (editingId.value === id) resetForm()
    loadComputers()
  } catch (err) {
    showAlert(err.message, 'error')
  }
}

function getStatusClass(status) {
  switch (status) {
    case 'ใช้งาน': return 'status-active'
    case 'ส่งซ่อม': return 'status-repair'
    case 'จำหน่าย': return 'status-discard'
    default: return ''
  }
}

onMounted(loadComputers)
</script>

<style>
/* Global Resets */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Outfit', 'Inter', 'Noto Sans Thai', sans-serif;
  background-color: #0b0f19;
  color: #f3f4f6;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

/* Container */
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Header */
.app-header {
  background: rgba(17, 24, 39, 0.7);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-icon {
  font-size: 1.75rem;
}

.app-header h1 {
  font-size: 1.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.developer-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.04);
  padding: 0.4rem 1rem;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.dev-badge {
  font-size: 0.65rem;
  text-transform: uppercase;
  font-weight: 800;
  background: #3b82f6;
  color: white;
  padding: 0.1rem 0.5rem;
  border-radius: 9999px;
}

.dev-name {
  font-weight: 600;
  color: #e5e7eb;
}

.dev-id {
  font-size: 0.85rem;
  color: #9ca3af;
}

/* Main Layout */
.app-main {
  flex: 1;
  max-width: 1300px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
  display: grid;
  grid-template-columns: 420px 1fr;
  gap: 2rem;
}

@media (max-width: 900px) {
  .app-main {
    grid-template-columns: 1fr;
  }
}

/* Cards styling (Glassmorphism) */
.card {
  background: rgba(17, 24, 39, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 1.75rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(10px);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #fff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 0.75rem;
}

/* Form Styling */
.computer-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #9ca3af;
}

.required {
  color: #ef4444;
}

input, select {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

input:focus, select:focus {
  outline: none;
  border-color: #3b82f6;
  background: rgba(255, 255, 255, 0.05);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

select option {
  background-color: #111827;
  color: white;
}

/* Buttons */
.btn {
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.95rem;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.08);
  color: #e5e7eb;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.12);
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

/* Filter Bar */
.filter-bar {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  padding: 1rem 1.5rem;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.filter-group input, .filter-group select {
  padding: 0.5rem 0.75rem;
  font-size: 0.88rem;
  flex: 1;
}

@media (max-width: 600px) {
  .filter-bar {
    flex-direction: column;
    gap: 1rem;
  }
}

/* Alerts */
.alert {
  padding: 1rem 1.25rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 0.95rem;
  animation: slideIn 0.3s ease;
}

.alert.success {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.alert.error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.alert-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: inherit;
  cursor: pointer;
  opacity: 0.7;
}

.alert-close:hover {
  opacity: 1;
}

/* Computers Grid & Cards */
.computers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}

.computer-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1.25rem;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border-left-width: 4px;
}

.computer-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.3);
}

.computer-card.status-active { border-left-color: #10b981; }
.computer-card.status-repair { border-left-color: #f59e0b; }
.computer-card.status-discard { border-left-color: #ef4444; }

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.asset-code {
  font-size: 0.75rem;
  font-family: monospace;
  background: rgba(255, 255, 255, 0.06);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  color: #9ca3af;
}

.status-badge {
  font-size: 0.72rem;
  font-weight: 800;
  padding: 0.15rem 0.6rem;
  border-radius: 9999px;
  text-transform: uppercase;
}

.status-badge.status-active { background: rgba(16, 185, 129, 0.15); color: #34d399; }
.status-badge.status-repair { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
.status-badge.status-discard { background: rgba(239, 68, 68, 0.15); color: #f87171; }

.brand-model {
  font-size: 1.15rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.75rem;
}

.specs {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.spec-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.88rem;
}

.spec-label {
  color: #6b7280;
}

.spec-value {
  color: #d1d5db;
  font-weight: 500;
}

.spec-value.highlight {
  color: #38bdf8;
  font-weight: 700;
}

.card-footer {
  margin-top: 1.25rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn-icon {
  background: none;
  border: none;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.btn-edit { color: #60a5fa; }
.btn-edit:hover { background: rgba(96, 165, 250, 0.1); }

.btn-delete { color: #f87171; }
.btn-delete:hover { background: rgba(248, 113, 113, 0.1); }

/* States */
.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-state {
  background: rgba(17, 24, 39, 0.3);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.15rem;
  margin-bottom: 0.5rem;
}

.empty-state p {
  font-size: 0.9rem;
  color: #6b7280;
}

/* Spinner */
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.05);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s infinite linear;
  margin-bottom: 1rem;
}

/* Footer */
.app-footer {
  background: rgba(17, 24, 39, 0.8);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding: 1.5rem;
  text-align: center;
  font-size: 0.85rem;
  color: #6b7280;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-top: auto;
}

/* Animations */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes slideIn {
  from { transform: translateY(-10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>