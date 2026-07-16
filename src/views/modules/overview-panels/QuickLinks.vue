<template>
  <el-card shadow="never" class="links-card">
    <template #header>快捷入口</template>
    <div class="links">
      <el-button
        v-for="link in links"
        :key="link.path"
        @click="router.push(link.path)"
      >
        {{ link.label }}
      </el-button>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const links = [
  { label: '客户列表', path: '/customers/list' },
  { label: '客户来访', path: '/customers/visits' },
  { label: '公海客户', path: '/sea' },
  { label: '房产列表', path: '/properties/list' },
  { label: '成交管理', path: '/deals' },
  { label: '渠道管理', path: '/channels' },
]
</script>

<style scoped>
.links-card {
  margin-top: 16px;
}

.links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
</style>
