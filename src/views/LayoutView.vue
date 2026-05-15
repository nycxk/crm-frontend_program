<template>
  <div class="layout">
    <div v-if="userStore.profileLoading" class="layout-loading">
      <el-icon class="loading-icon" :size="36"><Loading /></el-icon>
      <span>正在加载用户信息...</span>
    </div>
    <el-container v-else>
      <el-aside :width="isCollapse ? '64px' : '220px'" class="layout-aside">
        <div class="aside-header">
          <div class="logo-area" @click="isCollapse = !isCollapse">
            <el-icon :size="24"><OfficeBuilding /></el-icon>
            <span v-show="!isCollapse" class="logo-text">房产CRM</span>
          </div>
        </div>
        <el-menu
          :default-active="activeMenu"
          :collapse="isCollapse"
          :collapse-transition="false"
          background-color="#001529"
          text-color="#ffffffb3"
          active-text-color="#fff"
          router
        >
          <template v-for="item in topModules" :key="item.id">
            <el-sub-menu v-if="item.isLast === 2 && item.children.length" :index="getPath(item.moduleCode)">
              <template #title>
                <el-icon><component :is="getIcon(item.moduleName)" /></el-icon>
                <span>{{ item.moduleName }}</span>
              </template>
              <el-menu-item
                v-for="child in item.children"
                :key="child.id"
                :index="getPath(child.moduleCode)"
              >
                {{ child.moduleName }}
              </el-menu-item>
            </el-sub-menu>
            <el-menu-item v-else :index="getPath(item.moduleCode)">
              <el-icon><component :is="getIcon(item.moduleName)" /></el-icon>
              <span>{{ item.moduleName }}</span>
            </el-menu-item>
          </template>
        </el-menu>
      </el-aside>

      <el-container>
        <el-header class="layout-header">
          <div class="header-left">
            <el-icon class="collapse-btn" :size="20" @click="isCollapse = !isCollapse">
              <Fold v-if="!isCollapse" />
              <Expand v-else />
            </el-icon>
          </div>
          <div class="header-right">
            <span class="user-info">
              <el-icon><User /></el-icon>
              {{ userStore.username }}
            </span>
            <el-button type="danger" size="small" plain @click="handleLogout">退出</el-button>
          </div>
        </el-header>
        <el-main class="layout-main">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  OfficeBuilding, User, Fold, Expand, DataAnalysis,
  UserFilled, Coin, House, Connection, Money,
  Phone, Setting, Loading,
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const userStore = useUserStore()
const isCollapse = ref(false)

const topModules = computed(() => userStore.getTopModules())

const activeMenu = computed(() => route.path)

onMounted(() => {
  userStore.fetchUserProfile()
})

const codePathMap: Record<string, string> = {
  '01': '/dashboard',
  '02': '/customers',
  '09': '/customers/list',
  '10': '/customers/visits',
  '03': '/sea',
  '04': '/properties',
  '05': '/channels',
  '06': '/deals',
  '07': '/contacts',
  '08': '/system',
  '12': '/system/personnel',
  '13': '/system/department',
  '14': '/system/permission',
}

function getPath(code: string): string {
  return codePathMap[code] || `/${code}`
}

const iconMap: Record<string, any> = {
  '数据概览': DataAnalysis,
  '客户管理': UserFilled,
  '客户列表': UserFilled,
  '客户来访': Phone,
  '公海客户': Coin,
  '人员管理': UserFilled,
  '部门管理': Setting,
  '权限管理': Setting,
  '房产管理': House,
  '渠道管理': Connection,
  '成交管理': Money,
  '联系人': Phone,
  '系统管理': Setting,
}

function getIcon(name: string) {
  return iconMap[name] || Setting
}

function handleLogout() {
  userStore.handleLogout()
}
</script>

<style scoped>
.layout {
  height: 100vh;
}

.layout-aside {
  background-color: #001529;
  overflow: hidden;
  transition: width 0.3s;
}

.aside-header {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 56px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #fff;
  cursor: pointer;
  padding: 0 16px;
  user-select: none;
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  white-space: nowrap;
  letter-spacing: 1px;
}

.layout-aside :deep(.el-menu) {
  border-right: none;
}

.layout-aside :deep(.el-menu-item.is-active) {
  background-color: #1890ff !important;
}

.layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  height: 56px;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
}

.collapse-btn {
  cursor: pointer;
  color: #595959;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #595959;
  font-size: 14px;
}

.layout-main {
  background-color: #f0f2f5;
  min-height: calc(100vh - 56px);
  padding: 24px;
}

.layout-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 16px;
  color: #909399;
  font-size: 14px;
}

.loading-icon {
  animation: spin 1s linear infinite;
  color: #409eff;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
