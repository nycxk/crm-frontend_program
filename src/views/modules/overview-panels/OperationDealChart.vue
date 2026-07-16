<template>
  <el-card shadow="never" class="chart-card">
    <template #header>
      <span>各经营部成交趋势（近 6 个周期，成交笔数）</span>
    </template>
    <el-table v-if="tableRows.length" :data="tableRows" stripe border size="small">
      <el-table-column prop="periodLabel" label="周期" min-width="120" fixed />
      <el-table-column
        v-for="dept in departments"
        :key="dept.id"
        :label="dept.name"
        min-width="120"
        align="right"
      >
        <template #default="{ row }">{{ fmtNum(row.values[dept.id]) }}</template>
      </el-table-column>
    </el-table>
    <div v-else class="empty-chart">暂无数据</div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { OperationDealTrend } from '@/api/dashboard'

const props = defineProps<{
  data: OperationDealTrend | null
}>()

const departments = computed(() =>
  (props.data?.series ?? []).map((item) => ({
    id: item.operationDepartmentId,
    name: item.operationDepartmentName,
  })),
)

const tableRows = computed(() => {
  const series = props.data?.series ?? []
  if (!series.length) return []
  const periodMap = new Map<string, { periodLabel: string; values: Record<number, number> }>()
  for (const item of series) {
    for (const point of item.points) {
      let row = periodMap.get(point.periodValue)
      if (!row) {
        row = { periodLabel: point.periodLabel, values: {} }
        periodMap.set(point.periodValue, row)
      }
      row.values[item.operationDepartmentId] = point.dealCount
    }
  }
  return Array.from(periodMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, row]) => row)
})

function fmtNum(value: number | null | undefined) {
  if (value == null) return '—'
  return value.toLocaleString('zh-CN', { maximumFractionDigits: 1, minimumFractionDigits: 0 })
}
</script>

<style scoped>
.chart-card {
  margin-top: 16px;
}

.empty-chart {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
}
</style>
