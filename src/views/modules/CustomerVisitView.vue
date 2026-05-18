<template>
  <div class="visit-page">
    <el-card class="search-card">
      <el-form :inline="true" :model="query" class="search-form">
        <el-form-item label="来访日期">
          <el-date-picker
            v-model="query.visitDateFrom"
            type="date"
            placeholder="开始日期"
            value-format="YYYY-MM-DD"
            style="width:140px"
          />
          <span style="margin:0 8px">至</span>
          <el-date-picker
            v-model="query.visitDateTo"
            type="date"
            placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width:140px"
          />
        </el-form-item>
        <el-form-item label="客户">
          <el-select v-model="query.clientId" clearable filterable placeholder="全部客户" style="width:180px" @change="handleSearch">
            <el-option
              v-for="c in clientList"
              :key="c.id"
              :value="c.id"
              :label="c.clientName"
            />
          </el-select>
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
          <span>来访记录</span>
          <el-button type="primary" @click="openCreateDialog">新增来访</el-button>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="visitDate" label="来访日期" width="120" />
        <el-table-column prop="clientName" label="客户" min-width="100" />
        <el-table-column label="带看房源" min-width="140">
          <template #default="{ row }">
            <template v-if="row.houses?.length">
              <el-tag v-for="h in row.houses" :key="h.id" size="small" class="item-tag">
                {{ h.houseName }}
              </el-tag>
            </template>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="渠道" min-width="160">
          <template #default="{ row }">
            {{ row.channelTypeName || '-' }}
            <template v-if="row.channelInstanceName"> / {{ row.channelInstanceName }}</template>
          </template>
        </el-table-column>
        <el-table-column prop="detailDescription" label="说明" min-width="140" show-overflow-tooltip />
        <el-table-column label="需求" min-width="140">
          <template #default="{ row }">
            <template v-if="row.requirementsConfig">
              <el-tag
                v-for="(val, key) in row.requirementsConfig"
                :key="key"
                size="small"
                class="item-tag"
              >
                {{ key }}：{{ val }}
              </el-tag>
            </template>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openEditDialog(row.id)">编辑</el-button>
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
      :title="isEdit ? '编辑来访' : '新增来访'"
      width="620px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
        <el-form-item label="来访日期" prop="visitDate">
          <el-date-picker
            v-model="form.visitDate"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            style="width:200px"
          />
        </el-form-item>
        <el-form-item label="客户" prop="clientId">
          <el-select v-model="form.clientId" filterable placeholder="选择客户" style="width:100%">
            <el-option
              v-for="c in clientList"
              :key="c.id"
              :value="c.id"
              :label="c.clientName"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="带看房源">
          <el-select v-model="form.houseIds" multiple filterable allow-create placeholder="选择或输入房源ID" style="width:100%">
            <el-option
              v-for="h in houseList"
              :key="h.id"
              :value="h.id"
              :label="h.houseName"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="渠道类型" prop="channelId">
          <el-select v-model="form.channelId" clearable placeholder="选择渠道类型" style="width:100%" @change="onChannelChange">
            <el-option
              v-for="ch in channelList"
              :key="ch.id"
              :value="ch.id"
              :label="ch.typeName"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="selectedChannel?.instanceType === 'agency'" label="中介公司">
          <el-select v-model="form.channelInstanceId" clearable filterable placeholder="选择中介公司" style="width:100%">
            <el-option
              v-for="a in agencyList"
              :key="a.id"
              :value="a.id"
              :label="a.companyName"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-else-if="form.channelId" label="实例名称">
          <el-input v-model="form.channelInstanceName" placeholder="渠道实例名称（如客户名等）" />
        </el-form-item>
        <el-form-item label="详情说明">
          <el-input v-model="form.detailDescription" type="textarea" :rows="2" placeholder="来访详情描述" />
        </el-form-item>
        <el-form-item label="需求配置">
          <div class="requirements-wrap">
            <div v-for="(item, index) in form.requirements" :key="index" class="req-row">
              <el-input v-model="item.key" placeholder="键" style="width:130px" />
              <el-input v-model="item.value" placeholder="值" style="width:200px" />
              <el-button link type="danger" size="small" @click="removeReqItem(index)">删除</el-button>
            </div>
            <el-button size="small" @click="addReqItem">+ 添加需求项</el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  getVisitList,
  getVisitDetail,
  createVisit,
  updateVisit,
  deleteVisit,
  type VisitRecord,
} from '@/api/visit'
import { getClientList, type ClientRecord } from '@/api/client'
import { getChannelList, getAgencyList, type ChannelRecord, type AgencyRecord } from '@/api/channel'

const loading = ref(false)
const dialogVisible = ref(false)
const submitLoading = ref(false)
const isEdit = ref(false)
const editId = ref(0)
const formRef = ref<FormInstance>()
const tableData = ref<VisitRecord[]>([])
const total = ref(0)
const clientList = ref<ClientRecord[]>([])
const channelList = ref<ChannelRecord[]>([])
const houseList = ref<{ id: number; houseName: string }[]>([])
const agencyList = ref<AgencyRecord[]>([])
const selectedChannel = ref<ChannelRecord | null>(null)

const query = reactive({
  clientId: undefined as number | undefined,
  visitDateFrom: '' as string,
  visitDateTo: '' as string,
  page: 1,
  size: 10,
})

const form = reactive({
  visitDate: '',
  clientId: undefined as number | undefined,
  houseIds: [] as number[],
  channelId: undefined as number | undefined,
  channelInstanceId: undefined as number | undefined,
  channelInstanceName: '',
  detailDescription: '',
  requirements: [] as { key: string; value: string }[],
})

const formRules: FormRules = {
  visitDate: [{ required: true, message: '请选择来访日期', trigger: 'blur' }],
  clientId: [{ required: true, message: '请选择客户', trigger: 'change' }],
}

function formatTime(dateStr: string) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

async function fetchList() {
  loading.value = true
  try {
    const params: any = { page: query.page, size: query.size }
    if (query.clientId) params.clientId = query.clientId
    if (query.visitDateFrom) params.visitDateFrom = query.visitDateFrom
    if (query.visitDateTo) params.visitDateTo = query.visitDateTo
    const res = await getVisitList(params)
    tableData.value = res.records
    total.value = res.total
  } finally {
    loading.value = false
  }
}

async function fetchOptions() {
  const [clientsRes, channelsRes] = await Promise.all([
    getClientList({ page: 1, size: 200 }),
    getChannelList({ page: 1, size: 50 }),
  ])
  clientList.value = clientsRes.records
  channelList.value = channelsRes.records
}

function handleSearch() {
  query.page = 1
  fetchList()
}

function handleReset() {
  query.clientId = undefined
  query.visitDateFrom = ''
  query.visitDateTo = ''
  query.page = 1
  fetchList()
}

function resetForm() {
  form.visitDate = ''
  form.clientId = undefined
  form.houseIds = []
  form.channelId = undefined
  form.channelInstanceId = undefined
  form.channelInstanceName = ''
  form.detailDescription = ''
  form.requirements = []
  selectedChannel.value = null
  formRef.value?.resetFields()
}

function addReqItem() {
  form.requirements.push({ key: '', value: '' })
}

function removeReqItem(index: number) {
  form.requirements.splice(index, 1)
}

async function onChannelChange(channelId: number | undefined) {
  form.channelInstanceId = undefined
  form.channelInstanceName = ''
  agencyList.value = []
  if (channelId) {
    selectedChannel.value = channelList.value.find((c) => c.id === channelId) || null
    if (selectedChannel.value?.instanceType === 'agency') {
      const res = await getAgencyList(channelId, { page: 1, size: 200 })
      agencyList.value = res.records
    }
  } else {
    selectedChannel.value = null
  }
}

function openCreateDialog() {
  isEdit.value = false
  editId.value = 0
  resetForm()
  dialogVisible.value = true
}

async function openEditDialog(id: number) {
  isEdit.value = true
  editId.value = id
  resetForm()
  try {
    const detail = await getVisitDetail(id)
    form.visitDate = detail.visitDate
    form.clientId = detail.clientId
    form.houseIds = detail.houseIds || []
    houseList.value = detail.houses || []
    form.detailDescription = detail.detailDescription || ''

    if (detail.channelId) {
      form.channelId = detail.channelId
      await onChannelChange(detail.channelId)
      form.channelInstanceId = detail.channelInstanceId ?? undefined
      form.channelInstanceName = detail.channelInstanceName || ''
    }

    if (detail.requirementsConfig) {
      form.requirements = Object.entries(detail.requirementsConfig).map(([key, value]) => ({ key, value }))
    }
    dialogVisible.value = true
  } catch {
    ElMessage.error('获取来访详情失败')
  }
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitLoading.value = true
  try {
    const requirementsConfig: Record<string, string> = {}
    form.requirements.forEach((item) => {
      if (item.key) {
        requirementsConfig[item.key] = item.value
      }
    })

    const payload: any = {
      visitDate: form.visitDate,
      clientId: form.clientId,
      houseIds: form.houseIds.length ? form.houseIds : undefined,
      channelId: form.channelId,
      detailDescription: form.detailDescription || undefined,
      requirementsConfig: Object.keys(requirementsConfig).length ? requirementsConfig : undefined,
    }

    if (form.channelId && selectedChannel.value?.instanceType === 'agency') {
      payload.channelInstanceId = form.channelInstanceId
    } else if (form.channelId) {
      payload.channelInstanceName = form.channelInstanceName || undefined
    }

    if (isEdit.value) {
      await updateVisit(editId.value, payload)
      ElMessage.success('修改成功')
    } else {
      await createVisit(payload)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchList()
  } finally {
    submitLoading.value = false
  }
}

function handleDelete(row: VisitRecord) {
  ElMessageBox.confirm(
    `确认删除该来访记录吗？`,
    '删除确认',
    { confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning' },
  )
    .then(async () => {
      await deleteVisit(row.id)
      ElMessage.success('已删除')
      fetchList()
    })
    .catch(() => {})
}

onMounted(() => {
  fetchList()
  fetchOptions()
})
</script>

<style scoped>
.visit-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-card :deep(.el-card__body) {
  padding-bottom: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-tag {
  margin-right: 4px;
  margin-bottom: 2px;
}

.requirements-wrap {
  width: 100%;
}

.req-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
