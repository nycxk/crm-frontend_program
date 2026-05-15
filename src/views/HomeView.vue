<template>
  <div class="home-view">
    <el-card class="welcome-card">
      <h2>欢迎使用 My Vue App</h2>
      <p class="subtitle">基于 Vue 3 + TypeScript + Element Plus 构建</p>
    </el-card>

    <el-card class="action-card">
      <template #header>
        <span>获取用户信息</span>
      </template>
      <div class="action-content">
        <el-button type="primary" :loading="loading" @click="fetchUser">
          获取用户数据
        </el-button>

        <el-card v-if="user" class="user-info-card" shadow="hover">
          <div class="user-header">
            <el-avatar :size="64" class="user-avatar">
              {{ user.name.charAt(0) }}
            </el-avatar>
            <div class="user-title">
              <h3>{{ user.name }}</h3>
              <el-tag type="info" size="small">@{{ user.username }}</el-tag>
            </div>
          </div>
          <el-divider />
          <div class="user-details">
            <div class="detail-item">
              <el-icon><Message /></el-icon>
              <span>{{ user.email }}</span>
            </div>
            <div class="detail-item">
              <el-icon><Phone /></el-icon>
              <span>{{ user.phone }}</span>
            </div>
            <div class="detail-item">
              <el-icon><Link /></el-icon>
              <span>{{ user.website }}</span>
            </div>
            <div class="detail-item">
              <el-icon><OfficeBuilding /></el-icon>
              <span>{{ user.company?.name }}</span>
            </div>
            <div class="detail-item">
              <el-icon><Location /></el-icon>
              <span>{{ user.address?.city }}, {{ user.address?.street }}</span>
            </div>
          </div>
        </el-card>

        <el-alert
          v-if="error"
          :title="error"
          type="error"
          show-icon
          :closable="false"
          style="margin-top: 16px"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { getUserById, type User } from '@/api/user'

const user = ref<User | null>(null)
const loading = ref(false)
const error = ref('')

async function fetchUser() {
  loading.value = true
  error.value = ''
  try {
    const data = await getUserById(1)
    user.value = data
  } catch (e: any) {
    error.value = e.message || '请求失败，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.home-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.welcome-card {
  text-align: center;
}

.welcome-card h2 {
  color: #303133;
  margin-bottom: 8px;
}

.subtitle {
  color: #909399;
  font-size: 14px;
}

.action-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.user-info-card {
  margin-top: 24px;
  width: 100%;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-avatar {
  background-color: #409eff;
  font-size: 28px;
  font-weight: bold;
}

.user-title h3 {
  margin: 0 0 4px;
  font-size: 20px;
  color: #303133;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
  font-size: 14px;
}

.detail-item .el-icon {
  color: #909399;
}
</style>
