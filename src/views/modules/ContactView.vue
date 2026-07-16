<template>
  <div class="contact-page">
    <el-card class="search-card">
      <el-form :inline="true" :model="query" class="search-form">
        <el-form-item label="关键字">
          <el-input v-model="query.keyword" placeholder="姓名/电话/备注" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="query.phone" placeholder="精确匹配" clearable @keyup.enter="handleSearch" />
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
          <span>联系人列表</span>
          <el-button v-if="userStore.canWrite" type="primary" @click="openCreateDialog">新增联系人</el-button>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" stripe highlight-current-row @row-click="onRowClick">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="contactName" label="姓名" min-width="120" />
        <el-table-column prop="contactPhone" label="联系电话" width="140" />
        <el-table-column label="从属类型" width="100">
          <template #default="{ row }">
            <el-tag :type="modelTagType(row.model)" size="small">{{ row.model }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="关联中介" min-width="140">
          <template #default="{ row }">{{ row.agencyName || '-' }}</template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="160">
          <template #default="{ row }">{{ row.remark || '-' }}</template>
        </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">{{ formatTime(row.createTime) }}</template>
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
      :title="isEdit ? '编辑联系人' : '新增联系人'"
      width="480px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="80px">
        <el-form-item label="姓名" prop="contactName">
          <el-input v-model="form.contactName" placeholder="请输入姓名" maxlength="32" />
        </el-form-item>
        <el-form-item label="手机号" prop="contactPhone">
          <el-input v-model="form.contactPhone" placeholder="请输入手机号" maxlength="11" />
        </el-form-item>
        <el-form-item label="从属类型" prop="model">
          <el-select v-model="form.model" placeholder="请选择从属类型" style="width:100%" @change="onModelChange">
            <el-option v-for="item in modelOptions" :key="item" :value="item" :label="item" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.model === '中介公司'" label="中介公司" prop="agencyId">
          <el-select v-model="form.agencyId" filterable placeholder="选择关联的中介公司" style="width:100%">
            <el-option v-for="a in agencyList" :key="a.id" :value="a.id" :label="a.companyName" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="请输入备注" maxlength="256" />
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
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  getContactList,
  getContactDetail,
  createContact,
  updateContact,
  type ContactRecord,
} from '@/api/contact'
import { getChannelList, getAgencyList } from '@/api/channel'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const loading = ref(false)
const dialogVisible = ref(false)
const submitLoading = ref(false)
const isEdit = ref(false)
const editId = ref(0)
const formRef = ref<FormInstance>()
const tableData = ref<ContactRecord[]>([])
const total = ref(0)

const modelOptions = ['个人', '中介公司', '其他组织']
const agencyList = ref<{ id: number; companyName: string }[]>([])

const query = reactive({
  keyword: '',
  phone: '',
  page: 1,
  size: 10,
})

const form = reactive({
  contactName: '',
  contactPhone: '',
  model: '',
  agencyId: undefined as number | undefined,
  remark: '',
})

const validatePhone = (_rule: any, value: string, callback: (error?: Error) => void) => {
  if (!value) {
    callback(new Error('请输入手机号'))
  } else if (!/^1[3-9]\d{9}$/.test(value)) {
    callback(new Error('请输入正确的手机号格式'))
  } else {
    callback()
  }
}

const validateAgencyId = (_rule: any, value: number | undefined, callback: (error?: Error) => void) => {
  if (form.model === '中介公司' && !value) {
    callback(new Error('请选择关联的中介公司'))
  } else {
    callback()
  }
}

const formRules: FormRules = {
  contactName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  contactPhone: [{ required: true, validator: validatePhone, trigger: 'blur' }],
  model: [{ required: true, message: '请选择从属类型', trigger: 'change' }],
  agencyId: [{ validator: validateAgencyId, trigger: 'change' }],
}

function formatTime(dateStr: string) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

function modelTagType(model: string | null) {
  if (model === '个人') return 'primary'
  if (model === '中介公司') return 'warning'
  if (model === '其他组织') return 'info'
  return ''
}

async function fetchList() {
  loading.value = true
  try {
    const params: any = { page: query.page, size: query.size }
    if (query.keyword) params.keyword = query.keyword
    if (query.phone) params.phone = query.phone
    const res = await getContactList(params)
    tableData.value = res.records
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  query.page = 1
  fetchList()
}

function handleReset() {
  query.keyword = ''
  query.phone = ''
  query.page = 1
  fetchList()
}

function resetForm() {
  form.contactName = ''
  form.contactPhone = ''
  form.model = ''
  form.agencyId = undefined
  form.remark = ''
  agencyList.value = []
  formRef.value?.resetFields()
}

function openCreateDialog() {
  isEdit.value = false
  editId.value = 0
  resetForm()
  dialogVisible.value = true
}

async function onModelChange(val: string) {
  form.agencyId = undefined
  if (val === '中介公司') {
    await fetchAgencyList()
  } else {
    agencyList.value = []
  }
  formRef.value?.validateField('agencyId')
}

async function fetchAgencyList() {
  agencyList.value = []
  try {
    const channelsRes = await getChannelList({ page: 1, size: 50, instanceType: 'agency' })
    for (const ch of channelsRes.records) {
      const res = await getAgencyList(ch.id, { page: 1, size: 200 })
      for (const a of res.records) {
        agencyList.value.push({ id: a.id, companyName: a.companyName })
      }
    }
  } catch { /* ignore */ }
}

async function onRowClick(row: ContactRecord) {
  if (!userStore.canWrite) return
  await openEditDialog(row)
}

async function openEditDialog(row: ContactRecord) {
  isEdit.value = true
  editId.value = row.id
  resetForm()
  try {
    const detail = await getContactDetail(editId.value)
    form.contactName = detail.contactName
    form.contactPhone = detail.contactPhone
    form.model = detail.model || ''
    form.agencyId = detail.agencyId ?? undefined
    form.remark = detail.remark || ''
    if (detail.model === '中介公司') {
      await fetchAgencyList()
    }
    dialogVisible.value = true
  } catch {
    ElMessage.error('获取联系人详情失败')
  }
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitLoading.value = true
  try {
    const payload = {
      contactName: form.contactName,
      contactPhone: form.contactPhone,
      model: form.model,
      agencyId: form.model === '中介公司' ? form.agencyId : undefined,
      remark: form.remark || undefined,
    }

    if (isEdit.value) {
      await updateContact(editId.value, payload)
      ElMessage.success('修改成功')
    } else {
      await createContact(payload)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchList()
  } finally {
    submitLoading.value = false
  }
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.contact-page {
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

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
