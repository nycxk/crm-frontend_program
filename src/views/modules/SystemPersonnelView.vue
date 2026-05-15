<template>
  <div class="staff-page">
    <el-card class="search-card">
      <el-form :inline="true" :model="query" class="search-form">
        <el-form-item label="关键字">
          <el-input
            v-model="query.keyword"
            placeholder="用户名/手机号/邮箱"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" clearable placeholder="全部" style="width:100px" @change="handleSearch">
            <el-option :value="1" label="激活" />
            <el-option :value="2" label="未激活" />
            <el-option :value="3" label="封禁" />
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
          <span>人员列表</span>
          <el-button type="primary" @click="openCreateDialog">新增人员</el-button>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="phone" label="手机号" width="140" />
        <el-table-column prop="email" label="邮箱" min-width="180">
          <template #default="{ row }">{{ row.email || '-' }}</template>
        </el-table-column>
        <el-table-column prop="departmentName" label="部门" width="140">
          <template #default="{ row }">{{ row.departmentName || '-' }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.status === 1" type="success" size="small">激活</el-tag>
            <el-tag v-else-if="row.status === 2" type="warning" size="small">未激活</el-tag>
            <el-tag v-else type="danger" size="small">封禁</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="角色" min-width="180">
          <template #default="{ row }">
            <el-tag
              v-for="role in row.roles"
              :key="role.id"
              size="small"
              class="role-tag"
            >
              {{ role.roleName }}
            </el-tag>
            <span v-if="!row.roles?.length">-</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openEditDialog(row.id)">
              编辑
            </el-button>
            <el-button link type="warning" size="small" @click="openPhoneDialog(row)">
              修改手机号
            </el-button>
            <el-button link type="success" size="small" @click="handleResetPwd(row)">
              重置密码
            </el-button>
            <el-button
              link
              type="danger"
              size="small"
              @click="handleDisable(row)"
              :disabled="row.status === 3"
            >
              禁用
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
      :title="isEdit ? '编辑人员' : '新增人员'"
      width="520px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" maxlength="32" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone" v-if="!isEdit">
          <el-input v-model="form.phone" placeholder="请输入手机号" maxlength="11" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="部门">
          <el-select v-model="form.departmentId" clearable placeholder="请选择部门">
            <el-option
              v-for="dept in departmentList"
              :key="dept.id"
              :value="dept.id"
              :label="dept.departmentName"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="角色" prop="roleIds">
          <el-select v-model="form.roleIds" multiple placeholder="至少选择一个角色">
            <el-option
              v-for="role in roleList"
              :key="role.id"
              :value="role.id"
              :label="role.roleName"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
            v-model="form.statusBool"
            active-text="激活"
            :active-value="1"
            inactive-text="封禁"
            :inactive-value="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="phoneDialogVisible"
      title="修改手机号"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form ref="phoneFormRef" :model="phoneForm" :rules="phoneFormRules" label-width="80px">
        <el-form-item label="新手机号" prop="phone">
          <el-input v-model="phoneForm.phone" placeholder="请输入新手机号" maxlength="11" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="phoneDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="phoneLoading" @click="handlePhoneSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  getStaffList,
  getStaffDetail,
  createStaff,
  updateStaff,
  updateStaffPhone,
  resetStaffPassword,
  disableStaff,
  getRoleList,
  getDepartmentList,
  type StaffRecord,
  type RoleRecord,
  type DepartmentRecord,
} from '@/api/system'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref(0)
const formRef = ref<FormInstance>()

const phoneDialogVisible = ref(false)
const phoneLoading = ref(false)
const phoneFormRef = ref<FormInstance>()
const editingStaffRow = ref<StaffRecord | null>(null)
const tableData = ref<StaffRecord[]>([])
const total = ref(0)
const roleList = ref<RoleRecord[]>([])
const departmentList = ref<DepartmentRecord[]>([])

const query = reactive({
  keyword: '',
  status: undefined as number | undefined,
  page: 1,
  size: 10,
})

const form = reactive({
  username: '',
  phone: '',
  email: '',
  departmentId: undefined as number | undefined,
  roleIds: [] as number[],
  statusBool: 1 as number,
})

const phoneForm = reactive({
  phone: '',
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
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 32, message: '用户名长度 2-32 个字符', trigger: 'blur' },
  ],
  phone: [{ required: true, validator: validatePhone, trigger: 'blur' }],
  email: [{ type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }],
  roleIds: [{ required: true, message: '至少选择一个角色', trigger: 'change' }],
}

const phoneFormRules: FormRules = {
  phone: [{ required: true, validator: validatePhone, trigger: 'blur' }],
}

function formatTime(dateStr: string) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

async function fetchList() {
  loading.value = true
  try {
    const res = await getStaffList({
      page: query.page,
      size: query.size,
      keyword: query.keyword || undefined,
      status: query.status,
    })
    tableData.value = res.records
    total.value = res.total
  } finally {
    loading.value = false
  }
}

async function fetchOptions() {
  const [rolesRes, deptsRes] = await Promise.all([
    getRoleList({ page: 1, size: 100 }),
    getDepartmentList({ page: 1, size: 100 }),
  ])
  roleList.value = rolesRes.records
  departmentList.value = deptsRes.records
}

function handleSearch() {
  query.page = 1
  fetchList()
}

function handleReset() {
  query.keyword = ''
  query.status = undefined
  query.page = 1
  fetchList()
}

function resetForm() {
  form.username = ''
  form.phone = ''
  form.email = ''
  form.departmentId = undefined
  form.roleIds = []
  form.statusBool = 1
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
    const detail = await getStaffDetail(id)
    form.username = detail.username
    form.email = detail.email || ''
    form.departmentId = detail.departmentId ?? undefined
    form.roleIds = detail.roles?.map((r) => r.id) || []
    form.statusBool = detail.status
    dialogVisible.value = true
  } catch {
    ElMessage.error('获取人员详情失败')
  }
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitLoading.value = true
  try {
    if (isEdit.value) {
      await updateStaff(editId.value, {
        username: form.username,
        email: form.email || undefined,
        departmentId: form.departmentId,
        roleIds: form.roleIds,
        status: form.statusBool,
      })
      ElMessage.success('修改成功')
    } else {
      await createStaff({
        username: form.username,
        phone: form.phone,
        email: form.email || undefined,
        departmentId: form.departmentId,
        roleIds: form.roleIds,
        status: form.statusBool,
      })
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchList()
  } finally {
    submitLoading.value = false
  }
}

function openPhoneDialog(row: StaffRecord) {
  editingStaffRow.value = row
  phoneForm.phone = ''
  phoneFormRef.value?.resetFields()
  phoneDialogVisible.value = true
}

async function handlePhoneSubmit() {
  const valid = await phoneFormRef.value?.validate().catch(() => false)
  if (!valid || !editingStaffRow.value) return

  phoneLoading.value = true
  try {
    await updateStaffPhone(editingStaffRow.value.id, phoneForm.phone)
    ElMessage.success('手机号修改成功')
    phoneDialogVisible.value = false
    fetchList()
  } finally {
    phoneLoading.value = false
  }
}

function handleResetPwd(row: StaffRecord) {
  ElMessageBox.confirm(
    `确认重置「${row.username}（${row.phone}）」的密码吗？密码将重置为 admin123，该用户需重新登录。`,
    '重置密码确认',
    { confirmButtonText: '确定重置', cancelButtonText: '取消', type: 'warning' },
  )
    .then(async () => {
      const msg = await resetStaffPassword(row.id)
      ElMessage.success(msg || '密码已重置')
    })
    .catch(() => {})
}

function handleDisable(row: StaffRecord) {
  ElMessageBox.confirm(
    `确认禁用人员「${row.username}（${row.phone}）」吗？禁用后将无法登录系统。`,
    '禁用确认',
    { confirmButtonText: '确定禁用', cancelButtonText: '取消', type: 'warning' },
  )
    .then(async () => {
      await disableStaff(row.id)
      ElMessage.success('已禁用')
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
.staff-page {
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

.role-tag {
  margin-right: 6px;
  margin-bottom: 2px;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
