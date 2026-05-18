<template>
  <div class="deal-page">
    <el-card class="search-card">
      <el-form :inline="true" :model="query" class="search-form">
        <el-form-item label="关键字">
          <el-input v-model="query.keyword" placeholder="备注搜索" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="客户">
          <el-select v-model="query.clientId" clearable filterable placeholder="全部" style="width:140px" @change="handleSearch">
            <el-option v-for="c in clientList" :key="c.id" :value="c.id" :label="c.clientName" />
          </el-select>
        </el-form-item>
        <el-form-item label="房源">
          <el-select v-model="query.houseId" clearable filterable placeholder="全部" style="width:150px" @change="handleSearch">
            <el-option v-for="h in houseList" :key="h.id" :value="h.id" :label="h.houseName" />
          </el-select>
        </el-form-item>
        <el-form-item label="签订日期">
          <el-date-picker v-model="query.contractSignDateFrom" type="date" value-format="YYYY-MM-DD" placeholder="起" style="width:130px" @change="handleSearch" />
          <span style="margin:0 6px">-</span>
          <el-date-picker v-model="query.contractSignDateTo" type="date" value-format="YYYY-MM-DD" placeholder="止" style="width:130px" @change="handleSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>成交列表</span>
          <el-button type="primary" @click="openCreateDialog">新建成交</el-button>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column label="客户" min-width="120">
          <template #default="{ row }">
            <el-tag v-for="c in row.clients" :key="c.id" size="small" class="item-tag">{{ c.clientName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="房源" min-width="140">
          <template #default="{ row }">
            <el-tag v-for="h in row.houses" :key="h.id" size="small" class="item-tag">{{ h.houseName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="合同总额" width="120" align="right">
          <template #default="{ row }">{{ row.contractTotalAmount?.toLocaleString() || '-' }}</template>
        </el-table-column>
        <el-table-column prop="contractSignDate" label="签订日期" width="110" />
        <el-table-column label="租期" min-width="150">
          <template #default="{ row }">
            {{ row.contractStartDate }} ~ {{ row.contractEndDate || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.actualEndDate ? 'info' : 'success'" size="small">
              {{ row.actualEndDate ? '已退' : '在租' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openDetailDialog(row.id)">详情</el-button>
            <el-button link type="primary" size="small" @click="openEditDialog(row.id)" :disabled="!!row.actualEndDate">编辑</el-button>
            <el-button link type="warning" size="small" @click="openCheckoutDialog(row)" :disabled="!!row.actualEndDate">退租</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="query.page"
          v-model:page-size="query.size"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @size-change="fetchList"
          @current-change="fetchList"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑成交' : '新建成交'"
      width="720px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="客户" prop="clientIds">
              <el-select v-model="form.clientIds" multiple filterable placeholder="至少选一个客户" style="width:100%">
                <el-option v-for="c in clientList" :key="c.id" :value="c.id" :label="c.clientName" />
              </el-select>
            </el-form-item>
            <el-form-item label="渠道类型" prop="channelTypeId">
              <el-select v-model="form.channelTypeId" filterable placeholder="选择渠道" style="width:100%" @change="onChannelChange">
                <el-option v-for="ch in channelList" :key="ch.id" :value="ch.id" :label="ch.typeName" />
              </el-select>
            </el-form-item>
            <el-form-item label="租赁面积">
              <el-input v-model="form.rentalArea" placeholder="不填则自动计算">
                <template #suffix>㎡</template>
              </el-input>
            </el-form-item>
            <el-form-item label="合同总额">
              <el-input v-model="form.contractTotalAmount" placeholder="请输入合同总额" />
            </el-form-item>
            <el-form-item label="签订日期" prop="contractSignDate">
              <el-date-picker v-model="form.contractSignDate" type="date" value-format="YYYY-MM-DD" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="房源" prop="houseIds">
              <el-select v-model="form.houseIds" multiple filterable placeholder="至少选一个房源" style="width:100%">
                <el-option v-for="h in houseList" :key="h.id" :value="h.id" :label="h.houseName" />
              </el-select>
            </el-form-item>
            <el-form-item v-if="selectedChannel?.instanceType === 'agency'" label="中介公司">
              <el-select v-model="form.channelInstanceId" clearable filterable placeholder="选择中介公司" style="width:100%">
                <el-option v-for="a in agencyList" :key="a.id" :value="a.id" :label="a.companyName" />
              </el-select>
            </el-form-item>
            <el-form-item v-else-if="form.channelTypeId" label="实例名称">
              <el-input v-model="form.channelInstanceName" placeholder="渠道实例名称" />
            </el-form-item>
            <el-form-item label="起租日期" prop="contractStartDate">
              <el-date-picker v-model="form.contractStartDate" type="date" value-format="YYYY-MM-DD" style="width:100%" />
            </el-form-item>
            <el-form-item label="退租日期">
              <el-date-picker v-model="form.contractEndDate" type="date" value-format="YYYY-MM-DD" style="width:100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注">
          <el-input v-model="form.dealRemark" type="textarea" :rows="2" placeholder="成交备注" maxlength="256" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailVisible" title="成交详情" width="800px" :close-on-click-modal="false">
      <template v-if="detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="客户">
            <el-tag v-for="c in detail.clients" :key="c.id" size="small" class="item-tag">{{ c.clientName }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="房源">
            <el-tag v-for="h in detail.houses" :key="h.id" size="small" class="item-tag">{{ h.houseName }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="渠道">{{ detail.channelTypeName }}
            <template v-if="detail.channelInstanceName"> / {{ detail.channelInstanceName }}</template>
          </el-descriptions-item>
          <el-descriptions-item label="租赁面积">{{ detail.rentalArea }} ㎡</el-descriptions-item>
          <el-descriptions-item label="合同总额">{{ detail.contractTotalAmount?.toLocaleString() }}</el-descriptions-item>
          <el-descriptions-item label="签订日期">{{ detail.contractSignDate }}</el-descriptions-item>
          <el-descriptions-item label="起租日期">{{ detail.contractStartDate }}</el-descriptions-item>
          <el-descriptions-item label="合同退租">{{ detail.contractEndDate || '-' }}</el-descriptions-item>
          <el-descriptions-item label="实际退租">{{ detail.actualEndDate || '未退租' }}</el-descriptions-item>
          <el-descriptions-item label="成交业务员">{{ detail.dealBusinessUser?.username || '-' }}</el-descriptions-item>
          <el-descriptions-item label="对接业务员">{{ detail.contactBusinessUser?.username || '-' }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ detail.dealRemark || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatTime(detail.createTime) }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ formatTime(detail.updateTime) }}</el-descriptions-item>
        </el-descriptions>
      </template>
    </el-dialog>

    <el-dialog v-model="checkoutVisible" title="登记退租" width="400px" :close-on-click-modal="false">
      <el-form ref="checkoutFormRef" :model="checkoutForm" :rules="checkoutFormRules" label-width="100px">
        <el-form-item label="实际退租日期" prop="actualEndDate">
          <el-date-picker v-model="checkoutForm.actualEndDate" type="date" value-format="YYYY-MM-DD" style="width:100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="checkoutVisible = false">取消</el-button>
        <el-button type="primary" :loading="checkoutLoading" @click="handleCheckout">确定退租</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  getDealList, getDealDetail, createDeal, updateDeal, checkoutDeal, deleteDeal,
  type DealRecord,
} from '@/api/deal'
import { getClientList, type ClientRecord } from '@/api/client'
import { getHouseList, type HouseRecord } from '@/api/house'
import { getChannelList, getAgencyList, type ChannelRecord, type AgencyRecord } from '@/api/channel'

const loading = ref(false)
const dialogVisible = ref(false)
const submitLoading = ref(false)
const isEdit = ref(false)
const editId = ref(0)
const formRef = ref<FormInstance>()
const tableData = ref<DealRecord[]>([])
const total = ref(0)
const clientList = ref<ClientRecord[]>([])
const houseList = ref<HouseRecord[]>([])
const channelList = ref<ChannelRecord[]>([])
const agencyList = ref<AgencyRecord[]>([])
const selectedChannel = ref<ChannelRecord | null>(null)

const detailVisible = ref(false)
const detail = ref<DealRecord | null>(null)

const checkoutVisible = ref(false)
const checkoutLoading = ref(false)
const checkoutFormRef = ref<FormInstance>()
const checkoutDealRow = ref<DealRecord | null>(null)

const checkoutForm = reactive({
  actualEndDate: '',
})
const checkoutFormRules: FormRules = {
  actualEndDate: [{ required: true, message: '请选择退租日期', trigger: 'blur' }],
}

const query = reactive({
  keyword: '',
  clientId: undefined as number | undefined,
  houseId: undefined as number | undefined,
  contractSignDateFrom: '' as string,
  contractSignDateTo: '' as string,
  page: 1,
  size: 10,
})

const form = reactive({
  clientIds: [] as number[],
  houseIds: [] as number[],
  channelTypeId: undefined as number | undefined,
  channelInstanceId: undefined as number | undefined,
  channelInstanceName: '',
  rentalArea: '',
  contractTotalAmount: '',
  contractSignDate: '',
  contractStartDate: '',
  contractEndDate: '',
  dealRemark: '',
})

const formRules: FormRules = {
  clientIds: [{ required: true, message: '至少选择一个客户', trigger: 'change' }],
  houseIds: [{ required: true, message: '至少选择一个房源', trigger: 'change' }],
  channelTypeId: [{ required: true, message: '请选择渠道类型', trigger: 'change' }],
  contractSignDate: [{ required: true, message: '请选择签订日期', trigger: 'blur' }],
  contractStartDate: [{ required: true, message: '请选择起租日期', trigger: 'blur' }],
}

function formatTime(s: string) { return s ? new Date(s).toLocaleString('zh-CN') : '-' }

async function fetchList() {
  loading.value = true
  try {
    const params: any = { page: query.page, size: query.size }
    if (query.keyword) params.keyword = query.keyword
    if (query.clientId) params.clientId = query.clientId
    if (query.houseId) params.houseId = query.houseId
    if (query.contractSignDateFrom) params.contractSignDateFrom = query.contractSignDateFrom
    if (query.contractSignDateTo) params.contractSignDateTo = query.contractSignDateTo
    const res = await getDealList(params)
    tableData.value = res.records
    total.value = res.total
  } finally { loading.value = false }
}

async function fetchOptions() {
  const [cl, hl, chl] = await Promise.all([
    getClientList({ page: 1, size: 200, status: 'mine' }),
    getHouseList({ page: 1, size: 200 }),
    getChannelList({ page: 1, size: 50 }),
  ])
  clientList.value = cl.records
  houseList.value = hl.records
  channelList.value = chl.records
}

function handleSearch() { query.page = 1; fetchList() }
function handleReset() {
  query.keyword = ''
  query.clientId = undefined
  query.houseId = undefined
  query.contractSignDateFrom = ''
  query.contractSignDateTo = ''
  query.page = 1
  fetchList()
}

function resetForm() {
  form.clientIds = []
  form.houseIds = []
  form.channelTypeId = undefined
  form.channelInstanceId = undefined
  form.channelInstanceName = ''
  form.rentalArea = ''
  form.contractTotalAmount = ''
  form.contractSignDate = ''
  form.contractStartDate = ''
  form.contractEndDate = ''
  form.dealRemark = ''
  selectedChannel.value = null
  agencyList.value = []
  formRef.value?.resetFields()
}

async function onChannelChange(id: number | undefined) {
  form.channelInstanceId = undefined
  form.channelInstanceName = ''
  agencyList.value = []
  if (id) {
    selectedChannel.value = channelList.value.find((c) => c.id === id) || null
    if (selectedChannel.value?.instanceType === 'agency') {
      const res = await getAgencyList(id, { page: 1, size: 200 })
      agencyList.value = res.records
    }
  } else {
    selectedChannel.value = null
  }
}

function openCreateDialog() {
  isEdit.value = false; editId.value = 0; resetForm(); dialogVisible.value = true
}

async function openEditDialog(id: number) {
  isEdit.value = true; editId.value = id; resetForm()
  try {
    const d = await getDealDetail(id)
    form.clientIds = d.clientIds || []
    form.houseIds = d.houseIds || []
    if (d.channelTypeId) { form.channelTypeId = d.channelTypeId; await onChannelChange(d.channelTypeId) }
    form.channelInstanceId = d.channelInstanceId ?? undefined
    form.channelInstanceName = d.channelInstanceName || ''
    form.rentalArea = d.rentalArea ? String(d.rentalArea) : ''
    form.contractTotalAmount = d.contractTotalAmount ? String(d.contractTotalAmount) : ''
    form.contractSignDate = d.contractSignDate
    form.contractStartDate = d.contractStartDate
    form.contractEndDate = d.contractEndDate || ''
    form.dealRemark = d.dealRemark || ''
    dialogVisible.value = true
  } catch { ElMessage.error('获取成交详情失败') }
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  submitLoading.value = true
  try {
    const payload: any = {
      clientIds: form.clientIds,
      houseIds: form.houseIds,
      channelTypeId: form.channelTypeId,
      rentalArea: form.rentalArea ? Number(form.rentalArea) : undefined,
      contractTotalAmount: form.contractTotalAmount ? Number(form.contractTotalAmount) : undefined,
      contractSignDate: form.contractSignDate,
      contractStartDate: form.contractStartDate,
      contractEndDate: form.contractEndDate || undefined,
      dealRemark: form.dealRemark || undefined,
    }
    if (form.channelTypeId && selectedChannel.value?.instanceType === 'agency') {
      payload.channelInstanceId = form.channelInstanceId
    } else if (form.channelTypeId) {
      payload.channelInstanceName = form.channelInstanceName || undefined
    }
    if (isEdit.value) {
      await updateDeal(editId.value, payload)
      ElMessage.success('修改成功')
    } else {
      await createDeal(payload)
      ElMessage.success('新建成交成功')
    }
    dialogVisible.value = false
    fetchList()
  } finally { submitLoading.value = false }
}

function handleDelete(row: DealRecord) {
  ElMessageBox.confirm('确认删除该成交记录吗？', '删除确认',
    { confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning' })
    .then(async () => { await deleteDeal(row.id); ElMessage.success('已删除'); fetchList() })
    .catch(() => {})
}

async function openDetailDialog(id: number) {
  detail.value = null; detailVisible.value = true
  try { detail.value = await getDealDetail(id) }
  catch { ElMessage.error('获取详情失败'); detailVisible.value = false }
}

function openCheckoutDialog(row: DealRecord) {
  checkoutDealRow.value = row
  checkoutForm.actualEndDate = ''
  checkoutFormRef.value?.resetFields()
  checkoutVisible.value = true
}

async function handleCheckout() {
  const valid = await checkoutFormRef.value?.validate().catch(() => false)
  if (!valid || !checkoutDealRow.value) return
  checkoutLoading.value = true
  try {
    await checkoutDeal(checkoutDealRow.value.id, { actualEndDate: checkoutForm.actualEndDate })
    ElMessage.success('退租登记成功')
    checkoutVisible.value = false
    fetchList()
  } finally { checkoutLoading.value = false }
}

onMounted(() => { fetchList(); fetchOptions() })
</script>

<style scoped>
.deal-page { display: flex; flex-direction: column; gap: 16px; }
.search-card :deep(.el-card__body) { padding-bottom: 0; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.item-tag { margin-right: 4px; margin-bottom: 2px; }
.pagination-wrap { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
