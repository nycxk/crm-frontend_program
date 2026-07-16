<template>
  <div class="dept-page">
    <el-row :gutter="16">
      <el-col :span="6">
        <el-card class="tree-card">
          <template #header>
            <span>部门树</span>
          </template>
          <div class="tree-wrap" v-loading="treeLoading">
            <el-tree
              v-if="treeData.length"
              :data="treeData"
              node-key="id"
              :props="{ label: 'departmentName', children: 'children' }"
              highlight-current
              :expand-on-click-node="false"
              @node-click="handleNodeClick"
            >
              <template #default="{ data }">
                <div class="tree-node">
                  <span>{{ data.departmentName }}</span>
                  <el-tag :type="deptTypeTag(data.departmentType)" size="small">
                    {{ data.departmentTypeName }}
                  </el-tag>
                </div>
              </template>
            </el-tree>
            <el-empty v-else description="暂无部门数据" :image-size="60" />
          </div>
        </el-card>
      </el-col>

      <el-col :span="18">
        <el-card class="table-card">
          <template #header>
            <div class="card-header">
              <span>部门列表</span>
              <div v-if="userStore.canWrite" class="header-actions">
                <el-button type="primary" size="small" @click="openCreateDialog('operation')">
                  新增经营部
                </el-button>
                <el-button
                  v-if="operationDepts.length"
                  type="success"
                  size="small"
                  @click="openCreateDialog('project')"
                >
                  新增项目部
                </el-button>
              </div>
            </div>
          </template>

          <el-form :inline="true" :model="query" class="search-form">
            <el-form-item label="关键字">
              <el-input v-model="query.keyword" placeholder="部门名称" clearable @keyup.enter="handleSearch" />
            </el-form-item>
            <el-form-item label="类型">
              <el-select v-model="query.departmentType" clearable placeholder="全部" style="width: 110px" @change="handleSearch">
                <el-option value="marketing" label="营销中心" />
                <el-option value="operation" label="经营部" />
                <el-option value="project" label="项目部" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch">查询</el-button>
              <el-button @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>

          <el-table :data="tableData" v-loading="loading" stripe highlight-current-row @row-click="onRowClick">
            <el-table-column prop="id" label="ID" width="70" />
            <el-table-column prop="departmentName" label="部门名称" min-width="160" />
            <el-table-column label="类型" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="deptTypeTag(row.departmentType)" size="small">
                  {{ row.departmentTypeName }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="parentName" label="上级部门" min-width="140">
              <template #default="{ row }">{{ row.parentName || '-' }}</template>
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
      </el-col>
    </el-row>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="480px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
        <el-form-item label="类型">
          <el-tag :type="deptTypeTag(formType)" size="default">
            {{ formTypeName }}
          </el-tag>
          <span class="form-hint" v-if="isEdit">（不可修改）</span>
        </el-form-item>
        <el-form-item label="部门名称" prop="departmentName">
          <el-input v-model="form.departmentName" placeholder="请输入部门名称" maxlength="32" />
        </el-form-item>
        <el-form-item v-if="formType !== 'marketing'" label="上级部门" :prop="formType === 'operation' && !isEdit ? undefined : 'parentId'">
          <el-input v-if="formType === 'operation' && !isEdit" value="营销中心" disabled />
          <el-select v-else v-model="form.parentId" placeholder="请选择上级经营部" style="width: 100%">
            <el-option
              v-for="dept in parentDeptOptions"
              :key="dept.id"
              :value="dept.id"
              :label="dept.departmentName"
            />
          </el-select>
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
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  getDepartmentList,
  getDepartmentTree,
  getDepartmentDetail,
  createDepartment,
  updateDepartment,
  type DepartmentRecord,
} from '@/api/system'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const loading = ref(false)
const treeLoading = ref(false)
const dialogVisible = ref(false)
const submitLoading = ref(false)
const isEdit = ref(false)
const editId = ref(0)
const formRef = ref<FormInstance>()
const tableData = ref<DepartmentRecord[]>([])
const total = ref(0)
const treeData = ref<DepartmentRecord[]>([])
const operationDepts = ref<DepartmentRecord[]>([])
const marketingCenters = ref<DepartmentRecord[]>([])

const parentDeptOptions = computed(() => {
  if (formType.value === 'operation') return marketingCenters.value
  return operationDepts.value
})

const formTypeName = computed(() => {
  if (formType.value === 'operation') return '经营部'
  return '项目部'
})

const query = reactive({
  keyword: '',
  departmentType: '' as string,
  parentId: undefined as number | undefined,
  page: 1,
  size: 10,
})

const form = reactive({
  departmentName: '',
  parentId: undefined as number | undefined,
})

const formType = ref<'operation' | 'project' | 'marketing'>('operation')

const dialogTitle = ref('新增部门')

const formRules: FormRules = {
  departmentName: [
    { required: true, message: '请输入部门名称', trigger: 'blur' },
    { min: 2, max: 32, message: '部门名称 2-32 字符', trigger: 'blur' },
  ],
  parentId: [{ required: true, message: '请选择上级部门', trigger: 'change' }],
}

function formatTime(dateStr: string) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

function deptTypeTag(type: string) {
  if (type === 'marketing') return 'danger'
  if (type === 'operation') return 'primary'
  if (type === 'project') return 'success'
  return ''
}

function flattenTree(nodes: DepartmentRecord[]): DepartmentRecord[] {
  const result: DepartmentRecord[] = []
  nodes.forEach((node) => {
    result.push(node)
    if (node.children?.length) {
      result.push(...flattenTree(node.children))
    }
  })
  return result
}

async function fetchList() {
  loading.value = true
  try {
    const params: any = { page: query.page, size: query.size }
    if (query.keyword) params.keyword = query.keyword
    if (query.departmentType) params.departmentType = query.departmentType
    if (query.parentId !== undefined) params.parentId = query.parentId
    const res = await getDepartmentList(params)
    tableData.value = res.records
    total.value = res.total
  } finally {
    loading.value = false
  }
}

async function fetchTree() {
  treeLoading.value = true
  try {
    treeData.value = await getDepartmentTree()
    const flatDepts = flattenTree(treeData.value)
    marketingCenters.value = flatDepts.filter((d) => d.departmentType === 'marketing')
    operationDepts.value = flatDepts.filter((d) => d.departmentType === 'operation')
  } finally {
    treeLoading.value = false
  }
}

function handleNodeClick(data: DepartmentRecord) {
  query.keyword = ''
  query.departmentType = ''
  query.page = 1
  query.parentId = data.id
  fetchList()
}

function handleSearch() {
  query.parentId = undefined
  query.page = 1
  fetchList()
}

function handleReset() {
  query.keyword = ''
  query.departmentType = ''
  query.parentId = undefined
  query.page = 1
  fetchList()
}

function resetForm() {
  form.departmentName = ''
  form.parentId = undefined
  formRef.value?.resetFields()
}

function openCreateDialog(type: 'operation' | 'project' | 'marketing') {
  isEdit.value = false
  editId.value = 0
  formType.value = type
  resetForm()
  if (type === 'operation') {
    form.parentId = 1 // 营销中心固定 ID
  }
  dialogTitle.value = type === 'operation' ? '新增经营部' : '新增项目部'
  dialogVisible.value = true
}

async function onRowClick(row: DepartmentRecord) {
  if (!userStore.canWrite) return
  await openEditDialog(row)
}

async function openEditDialog(row: DepartmentRecord) {
  if (row.departmentType === 'marketing') { ElMessage.info('营销中心不支持编辑'); return }
  isEdit.value = true
  editId.value = row.id
  resetForm()
  try {
    const detail = await getDepartmentDetail(row.id)
    formType.value = detail.departmentType as 'operation' | 'project' | 'marketing'
    dialogTitle.value = `编辑${detail.departmentTypeName}`
    form.departmentName = detail.departmentName
    form.parentId = detail.parentId || undefined
    dialogVisible.value = true
  } catch {
    ElMessage.error('获取部门详情失败')
  }
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitLoading.value = true
  try {
    const payload: any = {
      departmentName: form.departmentName,
      departmentType: formType.value,
    }
    if (formType.value !== 'marketing') {
      payload.parentId = form.parentId
    }

    if (isEdit.value) {
      await updateDepartment(editId.value, payload)
      ElMessage.success('修改成功')
    } else {
      await createDepartment(payload)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchList()
    fetchTree()
  } finally {
    submitLoading.value = false
  }
}

onMounted(() => {
  fetchList()
  fetchTree()
})
</script>

<style scoped>
.dept-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tree-card,
.table-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.tree-wrap {
  min-height: 200px;
  max-height: 500px;
  overflow-y: auto;
}

.tree-node {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  padding-right: 8px;
}

.search-form {
  margin-bottom: 16px;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.form-hint {
  color: #909399;
  font-size: 12px;
  margin-left: 8px;
}
</style>
