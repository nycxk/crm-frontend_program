<template>
  <div class="dashboard-page" v-loading="pageLoading">
    <el-card shadow="never" class="toolbar-card">
      <div class="toolbar">
        <div>
          <h2 class="page-title">数据概览</h2>
          <p v-if="meta" class="scope-label">数据范围：{{ meta.scopeLabel }}</p>
        </div>
        <div class="toolbar-actions">
          <el-radio-group v-model="periodType" @change="handlePeriodTypeChange">
            <el-radio-button value="month">月</el-radio-button>
            <el-radio-button value="quarter">季</el-radio-button>
            <el-radio-button value="year">年</el-radio-button>
          </el-radio-group>
          <el-date-picker
            v-if="periodType === 'month'"
            v-model="monthValue"
            type="month"
            value-format="YYYY-MM"
            placeholder="选择月份"
            :clearable="false"
            @change="onMonthChange"
          />
          <template v-else-if="periodType === 'quarter'">
            <el-date-picker
              v-model="quarterYear"
              type="year"
              value-format="YYYY"
              placeholder="年份"
              :clearable="false"
              style="width: 120px"
              @change="onQuarterYearChange"
            />
            <el-select v-model="quarterNo" style="width: 100px" @change="onQuarterNoChange">
              <el-option :value="1" label="Q1" />
              <el-option :value="2" label="Q2" />
              <el-option :value="3" label="Q3" />
              <el-option :value="4" label="Q4" />
            </el-select>
          </template>
          <el-date-picker
            v-else
            v-model="yearValue"
            type="year"
            value-format="YYYY"
            placeholder="选择年份"
            :clearable="false"
            @change="onYearChange"
          />
          <el-button type="primary" :loading="summaryLoading" @click="refreshAll">刷新</el-button>
        </div>
      </div>
    </el-card>

    <SummaryStatCards :summary="displaySummary" :period-label="displayPeriodLabel" />

    <OperationDealTable
      v-if="meta?.canViewOperationComparison"
      :data="operationDeals"
      :period-label="displayPeriodLabel"
      :loading="operationLoading"
    />

    <OperationDealChart
      v-if="meta?.canViewOperationComparison"
      :data="operationTrend"
    />

    <QuickLinks />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getDashboardMeta,
  getDashboardSummary,
  getOperationDeals,
  getOperationDealTrend,
  type DashboardOverviewMeta,
  type DashboardPeriodQuery,
  type OperationDealTrend,
  type OperationDeals,
  type OverviewSummary,
} from '@/api/dashboard'
import SummaryStatCards from './overview-panels/SummaryStatCards.vue'
import OperationDealTable from './overview-panels/OperationDealTable.vue'
import OperationDealChart from './overview-panels/OperationDealChart.vue'
import QuickLinks from './overview-panels/QuickLinks.vue'

const pageLoading = ref(false)
const summaryLoading = ref(false)
const operationLoading = ref(false)

const meta = ref<DashboardOverviewMeta | null>(null)
const periodSummary = ref<OverviewSummary | null>(null)
const inventoryStats = ref({
  rentableHouseCount: 0,
  rentableHouseArea: 0,
  rentedHouseCount: 0,
  rentedRentableArea: 0,
  occupancyRate: null as number | null,
})
const operationDeals = ref<OperationDeals | null>(null)
const operationTrend = ref<OperationDealTrend | null>(null)
let loadSeq = 0

const periodType = ref<'month' | 'quarter' | 'year'>('month')
const monthValue = ref('')
const quarterYear = ref('')
const quarterNo = ref(1)
const yearValue = ref('')

function currentQuarter(date = new Date()) {
  return Math.floor(date.getMonth() / 3) + 1
}

function initPeriodDefaults(data: DashboardOverviewMeta) {
  periodType.value = (data.defaultPeriodType as 'month' | 'quarter' | 'year') || 'month'
  const value = data.defaultPeriodValue || ''
  if (periodType.value === 'month') {
    monthValue.value = value
    return
  }
  if (periodType.value === 'quarter') {
    const [year, q] = value.split('-Q')
    quarterYear.value = year
    quarterNo.value = Number(q) || currentQuarter()
    return
  }
  yearValue.value = value
}

function formatPeriodLabelFromToolbar(): string {
  if (periodType.value === 'month' && monthValue.value) {
    const [year, month] = monthValue.value.split('-')
    return `${year}年${Number(month)}月`
  }
  if (periodType.value === 'quarter' && quarterYear.value) {
    return `${quarterYear.value}年第${quarterNo.value}季度`
  }
  if (periodType.value === 'year' && yearValue.value) {
    return `${yearValue.value}年`
  }
  return ''
}

const displayPeriodLabel = computed(
  () => formatPeriodLabelFromToolbar() || periodSummary.value?.periodLabel || '',
)

const displaySummary = computed<OverviewSummary | null>(() => {
  const period = periodSummary.value
  if (!period) return null
  return {
    ...period,
    ...inventoryStats.value,
  }
})

function buildQuery(): DashboardPeriodQuery {
  if (periodType.value === 'month') {
    return { periodType: 'month', periodValue: monthValue.value }
  }
  if (periodType.value === 'quarter') {
    return { periodType: 'quarter', periodValue: `${quarterYear.value}-Q${quarterNo.value}` }
  }
  return { periodType: 'year', periodValue: yearValue.value }
}

function onMonthChange(value: string) {
  if (value) {
    monthValue.value = value
    loadPeriodData({ periodType: 'month', periodValue: value })
    return
  }
  loadPeriodData()
}

function onQuarterYearChange(value: string) {
  if (value) {
    quarterYear.value = value
  }
  loadPeriodData({
    periodType: 'quarter',
    periodValue: `${quarterYear.value}-Q${quarterNo.value}`,
  })
}

function onQuarterNoChange(value: number) {
  quarterNo.value = value
  loadPeriodData({
    periodType: 'quarter',
    periodValue: `${quarterYear.value}-Q${value}`,
  })
}

function onYearChange(value: string) {
  if (value) {
    yearValue.value = value
    loadPeriodData({ periodType: 'year', periodValue: value })
    return
  }
  loadPeriodData()
}

function handlePeriodTypeChange() {
  const now = new Date()
  if (periodType.value === 'month') {
    monthValue.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  } else if (periodType.value === 'quarter') {
    quarterYear.value = String(now.getFullYear())
    quarterNo.value = currentQuarter(now)
  } else {
    yearValue.value = String(now.getFullYear())
  }
  loadPeriodData()
}

async function loadInventory() {
  const data = await getDashboardSummary()
  inventoryStats.value = {
    rentableHouseCount: data.rentableHouseCount,
    rentableHouseArea: data.rentableHouseArea,
    rentedHouseCount: data.rentedHouseCount,
    rentedRentableArea: data.rentedRentableArea,
    occupancyRate: data.occupancyRate,
  }
}

async function loadPeriodData(explicitQuery?: DashboardPeriodQuery) {
  const query = explicitQuery ?? buildQuery()
  if (!query.periodValue) {
    return
  }
  const seq = ++loadSeq
  summaryLoading.value = true

  try {
    const data = await getDashboardSummary(query)
    if (seq !== loadSeq) return
    periodSummary.value = data
  } catch {
    if (seq !== loadSeq) return
    ElMessage.error('加载概览数据失败')
  } finally {
    if (seq === loadSeq) {
      summaryLoading.value = false
    }
  }

  if (!meta.value?.canViewOperationComparison) {
    return
  }
  if (seq !== loadSeq) {
    return
  }

  operationLoading.value = true
  try {
    const [deals, trend] = await Promise.all([
      getOperationDeals(query),
      getOperationDealTrend(query),
    ])
    if (seq !== loadSeq) return
    operationDeals.value = deals
    operationTrend.value = trend
  } catch {
    if (seq !== loadSeq) return
    ElMessage.error('加载经营部成交数据失败')
  } finally {
    if (seq === loadSeq) {
      operationLoading.value = false
    }
  }
}

async function refreshAll() {
  try {
    await loadInventory()
    await loadPeriodData()
  } catch {
    ElMessage.error('刷新数据概览失败')
  }
}

async function initPage() {
  pageLoading.value = true
  try {
    const metaData = await getDashboardMeta()
    meta.value = metaData
    initPeriodDefaults(metaData)
    await loadInventory()
    await loadPeriodData()
  } catch {
    ElMessage.error('加载数据概览失败')
  } finally {
    pageLoading.value = false
  }
}

onMounted(() => {
  initPage()
})
</script>

<style scoped>
.dashboard-page {
  min-height: 100%;
}

.toolbar-card {
  margin-bottom: 16px;
}

.toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.scope-label {
  margin: 8px 0 0;
  color: #909399;
  font-size: 13px;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
</style>
