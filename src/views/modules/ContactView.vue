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
          <el-button type="primary" @click="openCreateDialog">新增联系人</el-button>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="contactName" label="姓名" min-width="120" />
        <el-table-column prop="contactPhone" label="联系电话" width="140" />
        <el-table-column prop="model" label="从属类型" width="100">
          <template #default="{ row }">{{ row.model || '-' }}</template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="160">
          <template #default="{ row }">{{ row.remark || '-' }}</template>
        </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">{{ formatTime(row.createTime) }}</template>
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
        <el-form-item label="从属类型">
          <el-input v-model="form.model" placeholder="如：客户、中介公司" maxlength="32" />
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
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  getContactList,
  getContactDetail,
  createContact,
  updateContact,
  deleteContact,
  type ContactRecord,
} from '@/api/contact'

const loading = ref(false)
const dialogVisible = ref(false)
const submitLoading = ref(false)
const isEdit = ref(false)
const editId = ref(0)
const formRef = ref<FormInstance>()
const tableData = ref<ContactRecord[]>([])
const total = ref(0)

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

const formRules: FormRules = {
  contactName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  contactPhone: [{ required: true, validator: validatePhone, trigger: 'blur' }],
}

function formatTime(dateStr: string) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
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
  form.remark = ''
  formRef.value?.resetFields()
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
    const detail = await getContactDetail(id)
    form.contactName = detail.contactName
    form.contactPhone = detail.contactPhone
    form.model = detail.model || ''
    form.remark = detail.remark || ''
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
      model: form.model || undefined,
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

function handleDelete(row: ContactRecord) {
  ElMessageBox.confirm(
    `确认删除联系人「${row.contactName}（${row.contactPhone}）」吗？`,
    '删除确认',
    { confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning' },
  )
    .then(async () => {
      await deleteContact(row.id)
      ElMessage.success('已删除')
      fetchList()
    })
    .catch(() => {})
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
