<template>
  <div class="channel-page">
    <el-row :gutter="16">
      <el-col :span="8">
        <el-card class="list-card">
          <template #header>
            <div class="card-header">
              <span>渠道类型</span>
              <el-button v-if="userStore.canWrite" type="primary" size="small" @click="openChannelDialog()">新增渠道</el-button>
            </div>
          </template>
          <el-form :inline="true" :model="channelQuery" class="search-form">
            <el-form-item>
              <el-input v-model="channelQuery.keyword" placeholder="类型名称" clearable @keyup.enter="fetchChannelList" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" size="small" @click="fetchChannelList">查询</el-button>
              <el-button size="small" @click="resetChannelQuery">重置</el-button>
            </el-form-item>
          </el-form>
          <el-table
            :data="channelList"
            v-loading="channelLoading"
            stripe
            highlight-current-row
            @row-click="handleChannelClick"
          >
            <el-table-column prop="typeName" label="名称" min-width="120" />
            <el-table-column label="类型" width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="row.instanceType === 'agency' ? 'warning' : 'info'" size="small">
                  {{ row.instanceType === 'agency' ? '中介' : '无二级' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="中介数" width="70" align="center">
              <template #default="{ row }">
                {{ row.hasAgency ? row.agencyCount : '-' }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="16">
        <el-card v-if="selectedChannel" class="list-card">
          <template #header>
            <div class="card-header">
              <span>
                {{ selectedChannel.typeName }}
                <el-tag :type="selectedChannel.instanceType === 'agency' ? 'warning' : 'info'" size="small" style="margin-left:8px">
                  {{ selectedChannel.instanceType === 'agency' ? '可挂中介公司' : '无二级数据' }}
                </el-tag>
              </span>
              <div v-if="userStore.canWrite" class="header-actions">
                <el-button type="primary" size="small" @click="openChannelDialog(selectedChannel.id)">编辑渠道</el-button>
                <el-button type="danger" size="small" plain @click="handleDeleteChannel">删除渠道</el-button>
                <el-button
                  v-if="selectedChannel.instanceType === 'agency'"
                  type="primary"
                  size="small"
                  @click="openAgencyDialog()"
                >
                  新增中介公司
                </el-button>
              </div>
            </div>
          </template>

          <template v-if="selectedChannel.instanceType === 'agency'">
            <el-form :inline="true" :model="agencyQuery" class="search-form">
              <el-form-item>
                <el-input v-model="agencyQuery.keyword" placeholder="公司名称" clearable @keyup.enter="fetchAgencyList" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" size="small" @click="fetchAgencyList">查询</el-button>
                <el-button size="small" @click="resetAgencyQuery">重置</el-button>
              </el-form-item>
            </el-form>
            <el-table :data="agencyList" v-loading="agencyLoading" stripe highlight-current-row @row-click="handleAgencyClick">
              <el-table-column prop="id" label="ID" width="70" />
              <el-table-column prop="companyName" label="公司名称" min-width="200" />
              <el-table-column label="创建时间" width="180">
                <template #default="{ row }">{{ formatTime(row.createTime) }}</template>
              </el-table-column>
              <el-table-column v-if="userStore.canWrite" label="操作" width="140" align="center" fixed="right">
                <template #default="{ row }">
                  <el-button type="primary" link size="small" @click.stop="openAgencyDialog(row.id)">编辑</el-button>
                  <el-button type="danger" link size="small" @click.stop="handleDeleteAgency(row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            <div class="pagination-wrap">
              <el-pagination
                v-model:current-page="agencyQuery.page"
                v-model:page-size="agencyQuery.size"
                :total="agencyTotal"
                :page-sizes="[10, 20, 50]"
                layout="total, sizes, prev, pager, next"
                @size-change="fetchAgencyList"
                @current-change="fetchAgencyList"
                small
              />
            </div>
          </template>
          <el-empty v-else description="该渠道类型无二级数据" :image-size="60" />
        </el-card>
        <el-empty v-else description="请选择左侧渠道类型" :image-size="80" />
      </el-col>
    </el-row>

    <el-dialog
      v-model="channelDialogVisible"
      :title="channelIsEdit ? '编辑渠道' : '新增渠道'"
      width="440px"
      :close-on-click-modal="false"
    >
      <el-form ref="channelFormRef" :model="channelForm" :rules="channelFormRules" label-width="90px">
        <el-form-item label="类型名称" prop="typeName">
          <el-input v-model="channelForm.typeName" placeholder="请输入渠道类型名称" maxlength="32" />
        </el-form-item>
        <el-form-item label="二级数据">
          <el-radio-group v-model="channelForm.instanceType" :disabled="channelIsEdit">
            <el-radio value="agency">可挂中介公司</el-radio>
            <el-radio value="none">无二级数据</el-radio>
          </el-radio-group>
          <div class="form-hint" v-if="channelIsEdit">编辑时不可修改</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="channelDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="channelSubmitLoading" @click="handleChannelSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="agencyDialogVisible"
      :title="agencyIsEdit ? '编辑中介公司' : '新增中介公司'"
      width="440px"
      :close-on-click-modal="false"
    >
      <el-form ref="agencyFormRef" :model="agencyForm" :rules="agencyFormRules" label-width="80px">
        <el-form-item label="公司名称" prop="companyName">
          <el-input v-model="agencyForm.companyName" placeholder="请输入公司名称" maxlength="64" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="agencyDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="agencySubmitLoading" @click="handleAgencySubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  getChannelList,
  getChannelDetail,
  createChannel,
  updateChannel,
  deleteChannel,
  getAgencyList,
  createAgency,
  updateAgency,
  deleteAgency,
  type ChannelRecord,
  type AgencyRecord,
} from '@/api/channel'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const channelLoading = ref(false)
const channelList = ref<ChannelRecord[]>([])
const selectedChannel = ref<ChannelRecord | null>(null)

const channelDialogVisible = ref(false)
const channelIsEdit = ref(false)
const channelEditId = ref(0)
const channelSubmitLoading = ref(false)
const channelFormRef = ref<FormInstance>()

const agencyLoading = ref(false)
const agencyList = ref<AgencyRecord[]>([])
const agencyTotal = ref(0)

const agencyDialogVisible = ref(false)
const agencyIsEdit = ref(false)
const agencyEditId = ref(0)
const agencySubmitLoading = ref(false)
const agencyFormRef = ref<FormInstance>()

const channelQuery = reactive({
  keyword: '',
  page: 1,
  size: 50,
})

const channelForm = reactive({
  typeName: '',
  instanceType: 'none' as string,
})

const channelFormRules: FormRules = {
  typeName: [
    { required: true, message: '请输入类型名称', trigger: 'blur' },
  ],
}

const agencyQuery = reactive({
  keyword: '',
  page: 1,
  size: 10,
})

const agencyForm = reactive({
  companyName: '',
})

const agencyFormRules: FormRules = {
  companyName: [
    { required: true, message: '请输入公司名称', trigger: 'blur' },
  ],
}

function formatTime(dateStr: string) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

async function fetchChannelList() {
  channelLoading.value = true
  try {
    const params: any = { page: channelQuery.page, size: channelQuery.size }
    if (channelQuery.keyword) params.keyword = channelQuery.keyword
    const res = await getChannelList(params)
    channelList.value = res.records
  } finally {
    channelLoading.value = false
  }
}

function resetChannelQuery() {
  channelQuery.keyword = ''
  channelQuery.page = 1
  fetchChannelList()
}

function handleChannelClick(row: ChannelRecord) {
  selectedChannel.value = row
  agencyQuery.page = 1
  agencyQuery.keyword = ''
  if (row.instanceType === 'agency') {
    fetchAgencyList()
  } else {
    agencyList.value = []
    agencyTotal.value = 0
  }
}

async function fetchAgencyList() {
  if (!selectedChannel.value || selectedChannel.value.instanceType !== 'agency') return
  agencyLoading.value = true
  try {
    const params: any = { page: agencyQuery.page, size: agencyQuery.size }
    if (agencyQuery.keyword) params.keyword = agencyQuery.keyword
    const res = await getAgencyList(selectedChannel.value.id, params)
    agencyList.value = res.records
    agencyTotal.value = res.total
  } finally {
    agencyLoading.value = false
  }
}

function resetAgencyQuery() {
  agencyQuery.keyword = ''
  agencyQuery.page = 1
  fetchAgencyList()
}

async function openChannelDialog(id?: number) {
  channelForm.typeName = ''
  channelForm.instanceType = 'none'
  channelFormRef.value?.resetFields()
  if (id) {
    channelIsEdit.value = true
    channelEditId.value = id
    try {
      const detail = await getChannelDetail(id)
      channelForm.typeName = detail.typeName
      channelForm.instanceType = detail.instanceType
    } catch {
      ElMessage.error('获取渠道详情失败')
      return
    }
  } else {
    channelIsEdit.value = false
    channelEditId.value = 0
  }
  channelDialogVisible.value = true
}

async function handleChannelSubmit() {
  const valid = await channelFormRef.value?.validate().catch(() => false)
  if (!valid) return

  channelSubmitLoading.value = true
  try {
    if (channelIsEdit.value) {
      await updateChannel(channelEditId.value, { typeName: channelForm.typeName })
      ElMessage.success('修改成功')
      if (selectedChannel.value?.id === channelEditId.value) {
        selectedChannel.value.typeName = channelForm.typeName
      }
    } else {
      await createChannel(channelForm)
      ElMessage.success('新增成功')
    }
    channelDialogVisible.value = false
    fetchChannelList()
  } finally {
    channelSubmitLoading.value = false
  }
}

function handleAgencyClick(row: AgencyRecord) {
  openAgencyDialog(row.id)
}

async function openAgencyDialog(agencyId?: number) {
  agencyForm.companyName = ''
  agencyFormRef.value?.resetFields()
  if (agencyId) {
    agencyIsEdit.value = true
    agencyEditId.value = agencyId
    const record = agencyList.value.find((a) => a.id === agencyId)
    if (record) {
      agencyForm.companyName = record.companyName
    }
  } else {
    agencyIsEdit.value = false
    agencyEditId.value = 0
  }
  agencyDialogVisible.value = true
}

async function handleAgencySubmit() {
  const valid = await agencyFormRef.value?.validate().catch(() => false)
  if (!valid || !selectedChannel.value) return

  agencySubmitLoading.value = true
  try {
    if (agencyIsEdit.value) {
      await updateAgency(selectedChannel.value.id, agencyEditId.value, { companyName: agencyForm.companyName })
      ElMessage.success('修改成功')
    } else {
      await createAgency(selectedChannel.value.id, { companyName: agencyForm.companyName })
      ElMessage.success('新增成功')
      selectedChannel.value.agencyCount++
    }
    agencyDialogVisible.value = false
    fetchAgencyList()
  } finally {
    agencySubmitLoading.value = false
  }
}

function handleDeleteChannel() {
  if (!selectedChannel.value) return
  const channel = selectedChannel.value
  ElMessageBox.confirm(
    `确认删除渠道「${channel.typeName}」吗？若已被来访或成交引用，或仍有关联中介公司，将无法删除。`,
    '删除确认',
    { confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning' },
  )
    .then(async () => {
      await deleteChannel(channel.id)
      ElMessage.success('删除成功')
      selectedChannel.value = null
      agencyList.value = []
      agencyTotal.value = 0
      fetchChannelList()
    })
    .catch(() => {})
}

function handleDeleteAgency(row: AgencyRecord) {
  if (!selectedChannel.value) return
  const channel = selectedChannel.value
  ElMessageBox.confirm(
    `确认删除中介公司「${row.companyName}」吗？若已被来访记录引用将无法删除。`,
    '删除确认',
    { confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning' },
  )
    .then(async () => {
      await deleteAgency(channel.id, row.id)
      ElMessage.success('删除成功')
      channel.agencyCount = Math.max(0, channel.agencyCount - 1)
      fetchAgencyList()
      fetchChannelList()
    })
    .catch(() => {})
}

onMounted(() => {
  fetchChannelList()
})
</script>

<style scoped>
.channel-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.list-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-form {
  margin-bottom: 12px;
}

.search-form :deep(.el-form-item) {
  margin-bottom: 0;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.form-hint {
  color: #909399;
  font-size: 12px;
  margin-top: 4px;
}
</style>
