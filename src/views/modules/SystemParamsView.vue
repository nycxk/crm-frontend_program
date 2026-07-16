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

      <el-table :data="tableData" v-loading="loading" stripe highlight-current-row @row-click="onRowClick">
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
      :title="dialogTitle"
      :width="isCvrcParam ? '920px' : (isJsonType ? '500px' : '460px')"
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

        <div v-else-if="isCvrcParam" class="cvrc-editor">
          <el-alert
            type="info"
            :closable="false"
            show-icon
            title="已有需求配置项不可修改或删除，仅可新增配置项。"
            style="margin-bottom: 12px"
          />
          <div v-for="(item, index) in cvrcItems" :key="item.rowId" class="cvrc-row">
            <el-input
              v-model="item.key"
              placeholder="配置项名称"
              style="width:140px"
              :disabled="item.locked"
            />
            <el-select v-model="item.type" style="width:120px" :disabled="item.locked" @change="onCvrcTypeChange(item)">
              <el-option value="text" label="文本" />
              <el-option value="int" label="整数" />
              <el-option value="float" label="浮点数" />
              <el-option value="date" label="日期" />
              <el-option value="select" label="单选项" />
              <el-option value="multiSelect" label="多选项" />
            </el-select>
            <el-switch v-model="item.required" active-text="必填" :disabled="item.locked" />
            <el-input
              v-model="item.unit"
              placeholder="单位"
              style="width:100px"
              :disabled="item.locked"
            />
            <el-input-tag
              v-if="item.type === 'select' || item.type === 'multiSelect'"
              v-model="item.options"
              placeholder="输入选项后回车添加"
              style="width:220px"
              :disabled="item.locked"
              @change="onCvrcOptionsChange(item)"
            />
            <el-select
              v-if="item.type === 'select'"
              v-model="item.defaultValue"
              clearable
              placeholder="默认值"
              style="width:120px"
              :disabled="item.locked"
            >
              <el-option v-for="option in item.options" :key="option" :value="option" :label="option" />
            </el-select>
            <el-select
              v-else-if="item.type === 'multiSelect'"
              v-model="item.defaultValues"
              multiple
              clearable
              collapse-tags
              collapse-tags-tooltip
              placeholder="默认值"
              style="width:140px"
              :disabled="item.locked"
            >
              <el-option v-for="option in item.options" :key="option" :value="option" :label="option" />
            </el-select>
            <el-input
              v-else
              v-model="item.defaultValue"
              placeholder="默认值"
              style="width:120px"
              :disabled="item.locked"
            />
            <el-button
              v-if="!item.locked"
              link
              type="danger"
              size="small"
              @click="removeCvrcItem(index)"
            >
              删除
            </el-button>
            <el-tag v-else size="small" type="info">已发布</el-tag>
          </div>
          <el-button size="small" type="primary" @click="addCvrcItem">+ 新增配置项</el-button>
        </div>

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
import { parseVisitRequirementSchema } from '@/utils/visit-requirement'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

interface JsonItem {
  key: string
  type: string
}

interface CvrcSchemaItem {
  rowId: string
  key: string
  type: string
  required: boolean
  unit: string
  options: string[]
  defaultValue: string
  defaultValues: string[]
  locked: boolean
}

let cvrcRowIdSeed = 0

function nextCvrcRowId() {
  cvrcRowIdSeed += 1
  return `cvrc-row-${cvrcRowIdSeed}`
}

const loading = ref(false)
const dialogVisible = ref(false)
const submitLoading = ref(false)
const editRow = ref<SystemParamRecord | null>(null)
const formRef = ref<FormInstance>()
const tableData = ref<SystemParamRecord[]>([])
const total = ref(0)
const jsonItems = ref<JsonItem[]>([])
const cvrcItems = ref<CvrcSchemaItem[]>([])

const isJsonType = computed(() => editRow.value?.paramType === 'json')
const isCvrcParam = computed(() => editRow.value?.paramKey === 'CVRC')
const dialogTitle = computed(() => {
  if (isCvrcParam.value) return '维护客户来访需求清单'
  if (isJsonType.value) return '修改参数值（JSON）'
  return '修改参数值'
})

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

function parseCvrcValue(raw: string): CvrcSchemaItem[] {
  return parseVisitRequirementSchema(raw).map((item) => ({
    rowId: nextCvrcRowId(),
    key: item.key,
    type: item.type || 'text',
    required: !!item.required,
    unit: item.unit || '',
    options: item.options || [],
    defaultValue: item.type === 'multiSelect' ? '' : (item.defaultValue != null ? String(item.defaultValue) : ''),
    defaultValues: item.type === 'multiSelect'
      ? (Array.isArray(item.defaultValue) ? item.defaultValue.map(String) : [])
      : [],
    locked: true,
  }))
}

function onCvrcTypeChange(item: CvrcSchemaItem) {
  item.defaultValue = ''
  item.defaultValues = []
  if (item.type !== 'select' && item.type !== 'multiSelect') {
    item.options = []
  } else if (!Array.isArray(item.options)) {
    item.options = []
  }
}

function onCvrcOptionsChange(item: CvrcSchemaItem) {
  item.options = item.options.map((option) => option.trim()).filter(Boolean)
  if (item.type === 'select') {
    if (item.defaultValue && !item.options.includes(item.defaultValue)) {
      item.defaultValue = ''
    }
  } else if (item.type === 'multiSelect') {
    item.defaultValues = item.defaultValues.filter((value) => item.options.includes(value))
  }
}

function createEmptyCvrcItem(): CvrcSchemaItem {
  return {
    rowId: nextCvrcRowId(),
    key: '',
    type: 'text',
    required: false,
    unit: '',
    options: [],
    defaultValue: '',
    defaultValues: [],
    locked: false,
  }
}

function buildCvrcValue(): string {
  const payload = cvrcItems.value
    .filter((item) => item.key.trim())
    .map((item) => {
      const result: Record<string, unknown> = {
        key: item.key.trim(),
        type: item.type,
        required: !!item.required,
      }
      if (item.unit.trim()) result.unit = item.unit.trim()
      if (item.type === 'select' || item.type === 'multiSelect') {
        result.options = item.options.map((option) => option.trim()).filter(Boolean)
      }
      if (item.type === 'multiSelect') {
        const defaults = item.defaultValues.map((value) => value.trim()).filter(Boolean)
        if (defaults.length) result.defaultValue = defaults
      } else if (item.defaultValue.trim()) {
        result.defaultValue = item.defaultValue.trim()
      }
      return result
    })

  for (const item of payload) {
    if (!item.key) {
      throw new Error('配置项名称不能为空')
    }
    if ((item.type === 'select' || item.type === 'multiSelect') && (!Array.isArray(item.options) || !item.options.length)) {
      throw new Error(`${item.key} 须配置选项`)
    }
  }

  return JSON.stringify(payload)
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

function addCvrcItem() {
  cvrcItems.value.push(createEmptyCvrcItem())
}

function removeCvrcItem(index: number) {
  const item = cvrcItems.value[index]
  if (item?.locked) return
  cvrcItems.value.splice(index, 1)
}

function onRowClick(row: SystemParamRecord) {
  if (!userStore.canWrite) return
  openEditDialog(row)
}

function openEditDialog(row: SystemParamRecord) {
  editRow.value = row
  if (row.paramKey === 'CVRC') {
    cvrcItems.value = parseCvrcValue(row.paramValue)
  } else if (row.paramType === 'json') {
    jsonItems.value = parseJsonValue(row.paramValue)
  } else {
    form.paramValue = row.paramValue
    formRef.value?.resetFields()
  }
  dialogVisible.value = true
}

async function handleSubmit() {
  if (!editRow.value) return

  if (isCvrcParam.value) {
    submitLoading.value = true
    try {
      const jsonStr = buildCvrcValue()
      await updateParamValue(editRow.value.id, jsonStr)
      ElMessage.success('修改成功')
      dialogVisible.value = false
      fetchList()
    } catch (err: any) {
      ElMessage.error(err?.message || '保存失败')
    } finally { submitLoading.value = false }
    return
  }

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

.json-editor,
.cvrc-editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.json-row,
.cvrc-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
