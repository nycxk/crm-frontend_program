<template>
  <div class="param-page">
    <el-card class="search-card">
      <el-form :inline="true" :model="query" class="search-form">
        <el-form-item label="关键字">
          <el-input v-model="query.keyword" placeholder="模糊匹配 code/key/value" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="代码">
          <el-input v-model="query.code" placeholder="精确匹配" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="键">
          <el-input v-model="query.paramKey" placeholder="精确匹配" clearable @keyup.enter="handleSearch" />
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
          <span>系统参数</span>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="code" label="代码" width="120" />
        <el-table-column prop="paramKey" label="键" min-width="160" />
        <el-table-column prop="paramValue" label="值" min-width="160" show-overflow-tooltip />
        <el-table-column prop="paramType" label="类型" width="80" align="center" />
        <el-table-column label="单位" width="80" align="center">
          <template #default="{ row }">{{ row.unit || '-' }}</template>
        </el-table-column>
        <el-table-column prop="createdByName" label="创建人" width="100" />
        <el-table-column label="更新时间" width="180">
          <template #default="{ row }">{{ formatTime(row.updatedTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="80" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openEditDialog(row)">修改</el-button>
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
      :title="isJsonType ? '修改参数值（JSON）' : '修改参数值'"
      :width="isJsonType ? '500px' : '460px'"
      :close-on-click-modal="false"
    >
      <template v-if="editRow">
        <el-descriptions :column="1" border style="margin-bottom:16px">
          <el-descriptions-item label="代码">{{ editRow.code }}</el-descriptions-item>
          <el-descriptions-item label="键">{{ editRow.paramKey }}</el-descriptions-item>
          <el-descriptions-item label="类型">{{ editRow.paramType || '-' }}</el-descriptions-item>
          <el-descriptions-item label="单位">{{ editRow.unit || '-' }}</el-descriptions-item>
        </el-descriptions>

        <el-form v-if="!isJsonType" ref="formRef" :model="form" :rules="formRules" label-width="60px">
          <el-form-item label="值" prop="paramValue">
            <el-input v-model="form.paramValue" placeholder="请输入参数值" />
          </el-form-item>
        </el-form>

        <div v-else class="json-editor">
          <div v-for="(item, index) in jsonItems" :key="index" class="json-row">
            <el-input v-model="item.key" placeholder="键" style="width:200px" />
            <el-select v-model="item.type" style="width:110px">
              <el-option value="text" label="文本" />
              <el-option value="int" label="整数" />
              <el-option value="float" label="浮点数" />
              <el-option value="date" label="日期" />
            </el-select>
            <el-button link type="danger" size="small" @click="removeJsonItem(index)" :disabled="jsonItems.length <= 1">删除</el-button>
          </div>
          <el-button size="small" type="primary" @click="addJsonItem">+ 添加项</el-button>
        </div>
      </template>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  getParamList,
  updateParamValue,
  type SystemParamRecord,
} from '@/api/system'

interface JsonItem {
  key: string
  type: string
}

const loading = ref(false)
const dialogVisible = ref(false)
const submitLoading = ref(false)
const editRow = ref<SystemParamRecord | null>(null)
const formRef = ref<FormInstance>()
const tableData = ref<SystemParamRecord[]>([])
const total = ref(0)
const jsonItems = ref<JsonItem[]>([])

const isJsonType = computed(() => editRow.value?.paramType === 'json')

const query = reactive({
  keyword: '',
  code: '',
  paramKey: '',
  page: 1,
  size: 10,
})

const form = reactive({
  paramValue: '',
})

const formRules: FormRules = {
  paramValue: [{ required: true, message: '请输入参数值', trigger: 'blur' }],
}

function formatTime(s: string) { return s ? new Date(s).toLocaleString('zh-CN') : '-' }

function parseJsonValue(raw: string): JsonItem[] {
  try {
    const arr = JSON.parse(raw)
    if (Array.isArray(arr)) {
      return arr
        .filter((item: any) => item && typeof item.key === 'string')
        .map((item: any) => ({ key: item.key, type: item.type || 'text' }))
    }
  } catch {}
  return [{ key: '', type: 'text' }]
}

function buildJsonValue(): string {
  return JSON.stringify(
    jsonItems.value
      .filter((item) => item.key)
      .map((item) => ({ key: item.key, type: item.type }))
  )
}

async function fetchList() {
  loading.value = true
  try {
    const params: any = { page: query.page, size: query.size }
    if (query.keyword) params.keyword = query.keyword
    if (query.code) params.code = query.code
    if (query.paramKey) params.paramKey = query.paramKey
    const res = await getParamList(params)
    tableData.value = res.records
    total.value = res.total
  } finally { loading.value = false }
}

function handleSearch() { query.page = 1; fetchList() }
function handleReset() {
  query.keyword = ''
  query.code = ''
  query.paramKey = ''
  query.page = 1
  fetchList()
}

function addJsonItem() {
  jsonItems.value.push({ key: '', type: 'text' })
}

function removeJsonItem(index: number) {
  jsonItems.value.splice(index, 1)
}

function openEditDialog(row: SystemParamRecord) {
  editRow.value = row
  if (row.paramType === 'json') {
    jsonItems.value = parseJsonValue(row.paramValue)
  } else {
    form.paramValue = row.paramValue
    formRef.value?.resetFields()
  }
  dialogVisible.value = true
}

async function handleSubmit() {
  if (!editRow.value) return

  if (isJsonType.value) {
    submitLoading.value = true
    try {
      const jsonStr = buildJsonValue()
      await updateParamValue(editRow.value.id, jsonStr)
      ElMessage.success('修改成功')
      dialogVisible.value = false
      fetchList()
    } finally { submitLoading.value = false }
    return
  }

  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  submitLoading.value = true
  try {
    await updateParamValue(editRow.value.id, form.paramValue)
    ElMessage.success('修改成功')
    dialogVisible.value = false
    fetchList()
  } finally { submitLoading.value = false }
}

onMounted(() => { fetchList() })
</script>

<style scoped>
.param-page { display: flex; flex-direction: column; gap: 16px; }
.search-card :deep(.el-card__body) { padding-bottom: 0; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.pagination-wrap { display: flex; justify-content: flex-end; margin-top: 16px; }

.json-editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.json-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
