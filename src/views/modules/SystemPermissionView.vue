<template>
  <div class="role-page">
    <el-card class="search-card">
      <el-form :inline="true" :model="query" class="search-form">
        <el-form-item label="关键字">
          <el-input v-model="query.keyword" placeholder="角色名称/编码" clearable @keyup.enter="handleSearch" />
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
          <span>角色列表</span>
          <el-button type="primary" @click="openCreateDialog">新增角色</el-button>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="roleCode" label="角色编码" min-width="160" />
        <el-table-column prop="roleName" label="角色名称" width="140" />
        <el-table-column prop="description" label="描述" min-width="180">
          <template #default="{ row }">{{ row.description || '-' }}</template>
        </el-table-column>
        <el-table-column prop="level" label="层级" width="80" align="center" />
        <el-table-column label="模块数" width="80" align="center">
          <template #default="{ row }">{{ row.moduleCount ?? '-' }}</template>
        </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              size="small"
              :disabled="row.roleCode === 'SYSTEM_ADMIN'"
              @click="openEditDialog(row.id)"
            >
              编辑
            </el-button>
            <el-button
              link
              type="danger"
              size="small"
              :disabled="row.roleCode === 'SYSTEM_ADMIN'"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
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
      :title="isEdit ? '编辑角色' : '新增角色'"
      width="560px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="80px">
        <el-form-item label="角色编码" prop="roleCode">
          <el-input v-model="form.roleCode" placeholder="请输入角色编码" maxlength="32" />
        </el-form-item>
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="form.roleName" placeholder="请输入角色名称" maxlength="32" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="2" placeholder="请输入描述" maxlength="128" />
        </el-form-item>
        <el-form-item label="层级" prop="level">
          <el-input-number v-model="form.level" :min="1" :max="99" placeholder="数字越大权限越高" />
        </el-form-item>
        <el-form-item label="模块权限">
          <div class="module-tree-wrap" v-loading="moduleTreeLoading">
            <el-tree
              ref="treeRef"
              :data="moduleTree"
              show-checkbox
              node-key="id"
              :props="{ label: 'moduleName', children: 'children' }"
              :default-checked-keys="form.moduleIds"
              default-expand-all
            />
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
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type { ElTree } from 'element-plus'
import {
  getRoleList,
  getModuleTree,
  getRoleDetail,
  createRole,
  updateRole,
  deleteRole,
  type RoleRecord,
  type ModuleTreeNode,
} from '@/api/system'

const loading = ref(false)
const dialogVisible = ref(false)
const submitLoading = ref(false)
const isEdit = ref(false)
const editId = ref(0)
const formRef = ref<FormInstance>()
const treeRef = ref<InstanceType<typeof ElTree>>()
const tableData = ref<RoleRecord[]>([])
const total = ref(0)
const moduleTree = ref<ModuleTreeNode[]>([])
const moduleTreeLoading = ref(false)

const query = reactive({
  keyword: '',
  page: 1,
  size: 10,
})

const form = reactive({
  roleCode: '',
  roleName: '',
  description: '',
  level: 1,
  moduleIds: [] as number[],
})

const formRules: FormRules = {
  roleCode: [
    { required: true, message: '请输入角色编码', trigger: 'blur' },
  ],
  roleName: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
  ],
  level: [
    { required: true, message: '请设置层级', trigger: 'blur' },
  ],
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
    const res = await getRoleList(params)
    tableData.value = res.records
    total.value = res.total
  } finally {
    loading.value = false
  }
}

async function fetchModuleTree() {
  moduleTreeLoading.value = true
  try {
    moduleTree.value = await getModuleTree()
  } finally {
    moduleTreeLoading.value = false
  }
}

function handleSearch() {
  query.page = 1
  fetchList()
}

function handleReset() {
  query.keyword = ''
  query.page = 1
  fetchList()
}

function resetForm() {
  form.roleCode = ''
  form.roleName = ''
  form.description = ''
  form.level = 1
  form.moduleIds = []
  formRef.value?.resetFields()
  treeRef.value?.setCheckedKeys([])
}

async function openCreateDialog() {
  if (!moduleTree.value.length) {
    await fetchModuleTree()
  }
  isEdit.value = false
  editId.value = 0
  resetForm()
  dialogVisible.value = true
}

async function openEditDialog(id: number) {
  if (!moduleTree.value.length) {
    await fetchModuleTree()
  }
  isEdit.value = true
  editId.value = id
  resetForm()
  try {
    const detail = await getRoleDetail(id)
    form.roleCode = detail.roleCode
    form.roleName = detail.roleName
    form.description = detail.description || ''
    form.level = detail.level
    form.moduleIds = detail.moduleIds || []
    await nextTick()
    treeRef.value?.setCheckedKeys(detail.moduleIds || [])
    dialogVisible.value = true
  } catch {
    ElMessage.error('获取角色详情失败')
  }
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  const checkedIds = treeRef.value?.getCheckedKeys() as number[] || []
  const halfCheckedIds = treeRef.value?.getHalfCheckedKeys() as number[] || []
  const allIds = [...checkedIds, ...halfCheckedIds]

  submitLoading.value = true
  try {
    const payload: any = {
      roleCode: form.roleCode,
      roleName: form.roleName,
      description: form.description || undefined,
      level: form.level,
      moduleIds: allIds,
    }

    if (isEdit.value) {
      await updateRole(editId.value, payload)
      ElMessage.success('修改成功')
    } else {
      await createRole(payload)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchList()
  } finally {
    submitLoading.value = false
  }
}

function handleDelete(row: RoleRecord) {
  ElMessageBox.confirm(
    `确认删除角色「${row.roleName}（${row.roleCode}）」吗？已分配用户的角色不可删除。`,
    '删除确认',
    { confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning' },
  )
    .then(async () => {
      await deleteRole(row.id)
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
.role-page {
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

.module-tree-wrap {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 8px;
  width: 100%;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
