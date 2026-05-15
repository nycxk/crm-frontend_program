<template>
  <div class="login-container">
    <svg class="city-skyline" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#020814"/>
          <stop offset="25%" stop-color="#0a1a3a"/>
          <stop offset="50%" stop-color="#132d5e"/>
          <stop offset="75%" stop-color="#1d4480"/>
          <stop offset="100%" stop-color="#2a5298"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#skyGrad)"/>

      <!-- 左高楼 1 -->
      <polygon points="100,800 180,800 145,220 55,220" fill="#0d1b33" opacity="0.95"/>
      <polygon points="145,220 55,220 45,195 155,195" fill="#152a4a"/>
      <!-- 窗户 -->
      <rect x="70" y="270" width="10" height="18" rx="1" fill="#ffd580" opacity="0.9"/>
      <rect x="85" y="270" width="10" height="18" rx="1" fill="#ffd580" opacity="0.6"/>
      <rect x="100" y="270" width="10" height="18" rx="1" fill="#ffe4a0" opacity="0.8"/>
      <rect x="115" y="270" width="10" height="18" rx="1" fill="#ffd580" opacity="0.7"/>
      <rect x="80" y="310" width="8" height="14" rx="1" fill="#ffe4a0" opacity="0.5"/>
      <rect x="95" y="310" width="8" height="14" rx="1" fill="#ffd580" opacity="0.9"/>
      <rect x="110" y="310" width="8" height="14" rx="1" fill="#ffe4a0" opacity="0.6"/>
      <rect x="90" y="350" width="6" height="10" rx="1" fill="#ffd580" opacity="0.7"/>
      <rect x="102" y="350" width="6" height="10" rx="1" fill="#ffe4a0" opacity="0.5"/>

      <!-- 左高楼 2 -->
      <polygon points="160,800 260,800 230,250 130,250" fill="#0e1f38" opacity="0.9"/>
      <polygon points="230,250 130,250 118,222 242,222" fill="#162d50"/>
      <rect x="145" y="300" width="10" height="16" rx="1" fill="#ffe4a0" opacity="0.7"/>
      <rect x="160" y="300" width="10" height="16" rx="1" fill="#ffd580" opacity="0.9"/>
      <rect x="175" y="300" width="10" height="16" rx="1" fill="#ffe4a0" opacity="0.5"/>
      <rect x="190" y="300" width="10" height="16" rx="1" fill="#ffd580" opacity="0.8"/>
      <rect x="152" y="340" width="8" height="12" rx="1" fill="#ffd580" opacity="0.6"/>
      <rect x="168" y="340" width="8" height="12" rx="1" fill="#ffe4a0" opacity="0.9"/>
      <rect x="184" y="340" width="8" height="12" rx="1" fill="#ffd580" opacity="0.7"/>
      <rect x="160" y="380" width="6" height="10" rx="1" fill="#ffe4a0" opacity="0.5"/>
      <rect x="175" y="380" width="6" height="10" rx="1" fill="#ffd580" opacity="0.8"/>

      <!-- 中左高楼 -->
      <polygon points="280,800 400,800 380,280 300,280" fill="#0a1628"/>
      <polygon points="380,280 300,280 290,245 390,245" fill="#142640" opacity="0.7"/>
      <rect x="315" y="330" width="10" height="16" rx="1" fill="#ffd580" opacity="0.8"/>
      <rect x="330" y="330" width="10" height="16" rx="1" fill="#ffe4a0" opacity="0.6"/>
      <rect x="345" y="330" width="10" height="16" rx="1" fill="#ffd580" opacity="0.9"/>
      <rect x="360" y="330" width="10" height="16" rx="1" fill="#ffe4a0" opacity="0.5"/>
      <rect x="322" y="370" width="8" height="12" rx="1" fill="#ffe4a0" opacity="0.7"/>
      <rect x="340" y="370" width="8" height="12" rx="1" fill="#ffd580" opacity="0.9"/>
      <rect x="358" y="370" width="8" height="12" rx="1" fill="#ffe4a0" opacity="0.6"/>
      <rect x="330" y="410" width="6" height="10" rx="1" fill="#ffd580" opacity="0.7"/>
      <rect x="348" y="410" width="6" height="10" rx="1" fill="#ffe4a0" opacity="0.5"/>

      <!-- 中心最高楼 -->
      <polygon points="420,800 560,800 540,200 440,200" fill="#050d1c"/>
      <polygon points="540,200 440,200 430,160 550,160" fill="#0c1d36" opacity="0.8"/>
      <rect x="460" y="260" width="12" height="20" rx="1" fill="#ffe4a0" opacity="0.7"/>
      <rect x="478" y="260" width="12" height="20" rx="1" fill="#ffd580" opacity="0.9"/>
      <rect x="496" y="260" width="12" height="20" rx="1" fill="#ffe4a0" opacity="0.6"/>
      <rect x="468" y="300" width="10" height="16" rx="1" fill="#ffd580" opacity="0.8"/>
      <rect x="484" y="300" width="10" height="16" rx="1" fill="#ffe4a0" opacity="0.5"/>
      <rect x="500" y="300" width="10" height="16" rx="1" fill="#ffd580" opacity="0.9"/>
      <rect x="476" y="340" width="8" height="12" rx="1" fill="#ffe4a0" opacity="0.7"/>
      <rect x="492" y="340" width="8" height="12" rx="1" fill="#ffd580" opacity="0.6"/>
      <rect x="484" y="380" width="6" height="10" rx="1" fill="#ffe4a0" opacity="0.8"/>
      <rect x="496" y="420" width="4" height="8" rx="1" fill="#ffd580" opacity="0.5"/>

      <!-- 中右高楼 -->
      <polygon points="580,800 700,800 670,300 610,300" fill="#0a1628"/>
      <polygon points="670,300 610,300 600,268 680,268" fill="#152a4a" opacity="0.7"/>
      <rect x="625" y="350" width="10" height="16" rx="1" fill="#ffd580" opacity="0.9"/>
      <rect x="640" y="350" width="10" height="16" rx="1" fill="#ffe4a0" opacity="0.6"/>
      <rect x="655" y="350" width="10" height="16" rx="1" fill="#ffd580" opacity="0.8"/>
      <rect x="632" y="390" width="8" height="12" rx="1" fill="#ffe4a0" opacity="0.7"/>
      <rect x="648" y="390" width="8" height="12" rx="1" fill="#ffd580" opacity="0.9"/>
      <rect x="640" y="430" width="6" height="10" rx="1" fill="#ffe4a0" opacity="0.6"/>

      <!-- 右高楼 1 -->
      <polygon points="720,800 830,800 800,270 750,270" fill="#0e1f38" opacity="0.9"/>
      <polygon points="800,270 750,270 740,240 810,240" fill="#162d50"/>
      <rect x="762" y="320" width="10" height="16" rx="1" fill="#ffe4a0" opacity="0.7"/>
      <rect x="778" y="320" width="10" height="16" rx="1" fill="#ffd580" opacity="0.9"/>
      <rect x="770" y="360" width="8" height="12" rx="1" fill="#ffd580" opacity="0.6"/>
      <rect x="786" y="360" width="8" height="12" rx="1" fill="#ffe4a0" opacity="0.8"/>
      <rect x="778" y="400" width="6" height="10" rx="1" fill="#ffd580" opacity="0.7"/>

      <!-- 右高楼 2 -->
      <polygon points="850,800 960,800 930,260 880,260" fill="#0d1b33" opacity="0.9"/>
      <polygon points="930,260 880,260 868,232 942,232" fill="#152a4a"/>
      <rect x="893" y="310" width="10" height="16" rx="1" fill="#ffd580" opacity="0.8"/>
      <rect x="908" y="310" width="10" height="16" rx="1" fill="#ffe4a0" opacity="0.6"/>
      <rect x="900" y="350" width="8" height="12" rx="1" fill="#ffe4a0" opacity="0.9"/>
      <rect x="914" y="350" width="8" height="12" rx="1" fill="#ffd580" opacity="0.7"/>

      <!-- 右高楼 3 -->
      <polygon points="980,800 1100,800 1060,300 1020,300" fill="#0a1628"/>
      <polygon points="1060,300 1020,300 1010,270 1070,270" fill="#142640" opacity="0.7"/>
      <rect x="1030" y="350" width="8" height="14" rx="1" fill="#ffd580" opacity="0.7"/>
      <rect x="1045" y="350" width="8" height="14" rx="1" fill="#ffe4a0" opacity="0.9"/>
      <rect x="1038" y="390" width="6" height="10" rx="1" fill="#ffe4a0" opacity="0.6"/>
      <rect x="1050" y="390" width="6" height="10" rx="1" fill="#ffd580" opacity="0.8"/>

      <!-- 地面 -->
      <rect x="0" y="750" width="1200" height="50" fill="#030812"/>
      <polygon points="0,750 1200,750 1200,780 0,780" fill="#0a1220" opacity="0.6"/>

      <!-- 星光点 -->
      <circle cx="200" cy="80" r="1.5" fill="#fff" opacity="0.6"/>
      <circle cx="480" cy="60" r="1" fill="#fff" opacity="0.5"/>
      <circle cx="750" cy="90" r="1.5" fill="#fff" opacity="0.4"/>
      <circle cx="350" cy="120" r="1" fill="#fff" opacity="0.5"/>
      <circle cx="650" cy="50" r="1" fill="#fff" opacity="0.6"/>
      <circle cx="900" cy="100" r="1.5" fill="#fff" opacity="0.3"/>
      <circle cx="100" cy="140" r="1" fill="#fff" opacity="0.4"/>
      <circle cx="1050" cy="70" r="1" fill="#fff" opacity="0.5"/>
      <circle cx="550" cy="100" r="1" fill="#fff" opacity="0.3"/>
      <circle cx="820" cy="140" r="1" fill="#fff" opacity="0.4"/>
    </svg>

    <div class="login-card">
      <div class="login-header">
        <div class="logo-icon">
          <el-icon :size="36"><OfficeBuilding /></el-icon>
        </div>
        <h2>房产CRM</h2>
        <p class="sub-title">Property CRM System</p>
      </div>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="rules"
        class="login-form"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="phone">
          <el-input
            v-model="loginForm.phone"
            placeholder="请输入手机号"
            :prefix-icon="Phone"
            maxlength="11"
            clearable
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            show-password
            clearable
          />
        </el-form-item>

        <el-form-item>
          <div class="form-extra">
            <el-checkbox v-model="rememberMe">记住密码</el-checkbox>
            <el-link type="primary" :underline="false">忘记密码？</el-link>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            class="login-btn"
            :loading="loading"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登 录' }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { Phone, Lock } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const loginFormRef = ref<FormInstance>()
const loading = ref(false)

const loginForm = reactive({
  phone: '',
  password: '',
})

const rememberMe = ref(false)

const validatePhone = (_rule: any, value: string, callback: (error?: Error) => void) => {
  if (!value) {
    callback(new Error('请输入手机号'))
  } else if (!/^1[3-9]\d{9}$/.test(value)) {
    callback(new Error('请输入正确的手机号格式'))
  } else {
    callback()
  }
}

const rules: FormRules = {
  phone: [
    { required: true, validator: validatePhone, trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符之间', trigger: 'blur' },
  ],
}

onMounted(() => {
  const savedPhone = localStorage.getItem('savedPhone')
  const savedPassword = localStorage.getItem('savedPassword')
  if (savedPhone) {
    loginForm.phone = savedPhone
    rememberMe.value = true
  }
  if (savedPassword) {
    loginForm.password = atob(savedPassword)
  }
})

watch(rememberMe, (val) => {
  if (!val && loginForm.phone) {
    localStorage.removeItem('savedPhone')
    localStorage.removeItem('savedPassword')
  }
})

async function handleLogin() {
  const valid = await loginFormRef.value?.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    await userStore.login({
      phone: loginForm.phone,
      password: loginForm.password,
    })

    if (rememberMe.value) {
      localStorage.setItem('savedPhone', loginForm.phone)
      localStorage.setItem('savedPassword', btoa(loginForm.password))
    } else {
      localStorage.removeItem('savedPhone')
      localStorage.removeItem('savedPassword')
    }

    ElMessage.success('登录成功')
  } catch (error: any) {
    ElMessage.error(error?.message || '登录失败，请检查账号密码')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #020814;
  position: relative;
  overflow: hidden;
}

.city-skyline {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.login-card {
  width: 420px;
  padding: 48px 40px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  position: relative;
  z-index: 1;
}

.login-header {
  text-align: center;
  margin-bottom: 36px;
}

.logo-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  background: linear-gradient(135deg, #409eff, #2d6a9f);
  border-radius: 18px;
  color: #fff;
  margin-bottom: 20px;
  box-shadow: 0 8px 24px rgba(64, 158, 255, 0.35);
}

.login-header h2 {
  font-size: 26px;
  font-weight: 700;
  color: #1a3a5c;
  margin: 0 0 8px;
  letter-spacing: 1px;
}

.sub-title {
  font-size: 13px;
  color: #909399;
  margin: 0;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.login-form {
  margin-top: 8px;
}

.login-form :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #e4e7ed inset;
  border-radius: 8px;
  height: 46px;
  transition: all 0.3s;
}

.login-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #c0c4cc inset;
}

.login-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px #409eff inset;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 22px;
}

.form-extra {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.login-btn {
  width: 100%;
  height: 46px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 4px;
  border-radius: 8px;
  background: linear-gradient(135deg, #409eff, #2d6a9f);
  border: none;
  transition: all 0.3s;
}

.login-btn:hover {
  background: linear-gradient(135deg, #66b1ff, #409eff);
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.4);
  transform: translateY(-1px);
}

.login-btn:active {
  transform: translateY(0);
}
</style>
