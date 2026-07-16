<template>
  <div class="stat-cards">
    <el-card v-for="card in cards" :key="card.key" shadow="hover" class="stat-card">
      <div class="stat-label">{{ card.label }}</div>
      <div class="stat-value">{{ card.primary }}</div>
      <div v-if="card.secondary" class="stat-sub">{{ card.secondary }}</div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { OverviewSummary } from '@/api/dashboard'

const props = defineProps<{
  summary: OverviewSummary | null
  periodLabel: string
}>()

function fmtNum(value: number | null | undefined, digits = 0) {
  if (value == null) return '—'
  return value.toLocaleString('zh-CN', { maximumFractionDigits: digits, minimumFractionDigits: digits })
}

function fmtMoney(value: number | null | undefined) {
  if (value == null) return '—'
  return value.toLocaleString('zh-CN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })
}

const cards = computed(() => {
  const s = props.summary
  return [
    {
      key: 'newClients',
      label: `${props.periodLabel}新客`,
      primary: fmtNum(s?.newClientCount),
      secondary: '',
    },
    {
      key: 'rentable',
      label: '可租房源（当前）',
      primary: `${fmtNum(s?.rentableHouseCount)} 套`,
      secondary: `${fmtNum(s?.rentableHouseArea, 2)} ㎡`,
    },
    {
      key: 'rented',
      label: '已租房源（当前）',
      primary: `${fmtNum(s?.rentedHouseCount)} 套`,
      secondary: `${fmtNum(s?.rentedRentableArea, 2)} ㎡`,
    },
    {
      key: 'occupancy',
      label: '出租率（当前）',
      primary: s?.occupancyRate == null ? '—' : `${fmtNum(s.occupancyRate, 2)}%`,
      secondary: '',
    },
    {
      key: 'deals',
      label: `${props.periodLabel}成交`,
      primary: `${fmtNum(s?.periodDealCount)} 笔`,
      secondary: `${fmtNum(s?.periodDealArea, 2)} ㎡ / ${fmtMoney(s?.periodDealAmount)} 元`,
    },
  ]
})
</script>

<style scoped>
.stat-cards {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 16px;
}

.stat-card {
  min-height: 110px;
}

.stat-label {
  color: #909399;
  font-size: 14px;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  line-height: 1.3;
}

.stat-sub {
  margin-top: 8px;
  font-size: 13px;
  color: #606266;
}

@media (max-width: 1400px) {
  .stat-cards {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .stat-cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
