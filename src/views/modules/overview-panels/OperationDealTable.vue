<template>
  <el-card shadow="never" class="table-card">
    <template #header>
      <div class="card-header">
        <span>各经营部成交对比</span>
        <span class="period-text">{{ periodLabel }}</span>
      </div>
    </template>
    <el-table v-loading="loading" :data="tableRows" stripe border>
      <el-table-column prop="operationDepartmentName" label="经营部" min-width="160" />
      <el-table-column label="成交笔数" width="110" align="right">
        <template #default="{ row }">{{ fmtNum(row.dealCount, 1) }}</template>
      </el-table-column>
      <el-table-column label="成交面积(㎡)" width="140" align="right">
        <template #default="{ row }">{{ fmtNum(row.dealArea, 2) }}</template>
      </el-table-column>
      <el-table-column label="成交金额(元)" width="160" align="right">
        <template #default="{ row }">{{ fmtMoney(row.dealAmount) }}</template>
      </el-table-column>
      <el-table-column label="出租率" width="100" align="right">
        <template #default="{ row }">
          {{ row.occupancyRate == null ? '—' : `${fmtNum(row.occupancyRate, 2)}%` }}
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { OperationDeals } from '@/api/dashboard'

const props = defineProps<{
  data: OperationDeals | null
  loading: boolean
  periodLabel: string
}>()

const tableRows = computed(() => {
  const rows = props.data?.rows ?? []
  const total = props.data?.total
  if (!total) return rows
  return [
    ...rows,
    {
      operationDepartmentId: 0,
      operationDepartmentName: '合计',
      dealCount: total.dealCount,
      dealArea: total.dealArea,
      dealAmount: total.dealAmount,
      occupancyRate: null,
    },
  ]
})

function fmtNum(value: number | null | undefined, digits = 0) {
  if (value == null) return '—'
  return value.toLocaleString('zh-CN', { maximumFractionDigits: digits, minimumFractionDigits: digits })
}

function fmtMoney(value: number | null | undefined) {
  if (value == null) return '—'
  return value.toLocaleString('zh-CN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })
}
</script>

<style scoped>
.table-card {
  margin-top: 16px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.period-text {
  color: #909399;
  font-size: 13px;
}
</style>
