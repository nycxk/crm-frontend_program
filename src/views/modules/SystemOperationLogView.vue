<template>
  <div class="log-page">
    <el-card class="search-card">
      <el-form :inline="true" :model="query" class="search-form">
        <el-form-item label="关键字">
          <el-input v-model="query.keyword" placeholder="摘要/操作人/请求路径" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="日志类型">
          <el-select v-model="query.logType" clearable placeholder="全部" style="width:120px" @change="handleSearch">
            <el-option value="user_operation" label="用户操作" />
            <el-option value="job" label="定时任务" />
          </el-select>
        </el-form-item>
        <el-form-item label="模块">
          <el-select v-model="query.module" clearable filterable placeholder="全部" style="width:140px" @change="handleSearch">
            <el-option v-for="m in moduleOptions" :key="m.value" :value="m.value" :label="m.label" />
          </el-select>
        </el-form-item>
        <el-form-item label="动作">
          <el-select v-model="query.action" clearable placeholder="全部" style="width:100px" @change="handleSearch">
            <el-option value="create" label="新增" />
            <el-option value="update" label="修改" />
            <el-option value="delete" label="删除" />
            <el-option value="execute" label="执行" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" clearable placeholder="全部" style="width:100px" @change="handleSearch">
            <el-option value="success" label="成功" />
            <el-option value="fail" label="失败" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始"
            end-placeholder="结束"
            value-format="YYYY-MM-DD"
            @change="onDateChange"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <template #header>
        <span>操作日志</span>
      </template>

      <el-table :data="tableData" v-loading="loading" stripe highlight-current-row @row-click="openDetailDialog">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column label="类型" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.logType === 'job' ? 'warning' : 'primary'" size="small">
              {{ row.logTypeName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="module" label="模块" width="100" />
        <el-table-column label="动作" width="70" align="center">
          <template #default="{ row }">
            <el-tag :type="actionTagType(row.action)" size="small">{{ row.actionName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operatorName" label="操作人" width="100">
          <template #default="{ row }">{{ row.operatorName || '-' }}</template>
        </el-table-column>
        <el-table-column prop="summary" label="摘要" min-width="220" show-overflow-tooltip />
        <el-table-column label="状态" width="70" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'success' ? 'success' : 'danger'" size="small">
              {{ row.statusName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="记录时间" width="170">
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

    <el-dialog v-model="detailVisible" title="日志详情" width="700px" :close-on-click-modal="false">
      <template v-if="detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="日志类型">
            <el-tag :type="detail.logType === 'job' ? 'warning' : 'primary'" size="small">
              {{ detail.logTypeName }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="模块">{{ detail.module }}</el-descriptions-item>
          <el-descriptions-item label="动作">
            <el-tag :type="actionTagType(detail.action)" size="small">{{ detail.actionName }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="操作人">{{ detail.operatorName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="目标ID">{{ detail.targetId || '-' }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="detail.status === 'success' ? 'success' : 'danger'" size="small">
              {{ detail.statusName }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="摘要" :span="2">{{ detail.summary || '-' }}</el-descriptions-item>
          <el-descriptions-item label="请求方法">{{ detail.requestMethod || '-' }}</el-descriptions-item>
          <el-descriptions-item label="客户端IP">{{ detail.clientIp || '-' }}</el-descriptions-item>
          <el-descriptions-item label="请求路径" :span="2">{{ detail.requestUri || '-' }}</el-descriptions-item>
          <el-descriptions-item v-if="detail.jobName" label="任务名称" :span="2">{{ detail.jobName }}</el-descriptions-item>
          <el-descriptions-item v-if="detail.durationMs != null" label="耗时">{{ detail.durationMs }} ms</el-descriptions-item>
          <el-descriptions-item v-if="detail.affectCount != null" label="影响数">{{ detail.affectCount }}</el-descriptions-item>
          <el-descriptions-item v-if="detail.errorMessage" label="错误信息" :span="2">
            <span style="color:#f56c6c">{{ detail.errorMessage }}</span>
          </el-descriptions-item>
          <el-descriptions-item v-if="detail.detail" label="扩展详情" :span="2">
            <pre class="detail-json">{{ formatDetail(detail.detail) }}</pre>
          </el-descriptions-item>
          <el-descriptions-item label="记录时间" :span="2">{{ formatTime(detail.createTime) }}</el-descriptions-item>
        </el-descriptions>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getOperationLogList, getOperationLogDetail, type OperationLogRecord } from '@/api/operation-log'

const loading = ref(false)
const detailVisible = ref(false)
const detail = ref<OperationLogRecord | null>(null)
const tableData = ref<OperationLogRecord[]>([])
const total = ref(0)
const dateRange = ref<[string, string] | null>(null)

const moduleOptions = [
  { value: 'clients', label: '客户' },
  { value: 'contacts', label: '联系人' },
  { value: 'visits', label: '来访' },
  { value: 'visit-drafts', label: '来访草稿' },
  { value: 'channels', label: '渠道' },
  { value: 'houses', label: '房源' },
  { value: 'price-batches', label: '批量调价' },
  { value: 'internal-rents', label: '内部招租' },
  { value: 'deals', label: '成交' },
  { value: 'deal-drafts', label: '成交草稿' },
  { value: 'system.staff', label: '人员管理' },
  { value: 'system.departments', label: '部门管理' },
  { value: 'system.roles', label: '角色权限' },
  { value: 'system.params', label: '系统参数' },
  { value: 'user', label: '个人中心' },
]

const query = reactive({
  keyword: '',
  logType: '' as string,
  module: '' as string,
  action: '' as string,
  status: '' as string,
  createDateFrom: '' as string,
  createDateTo: '' as string,
  page: 1,
  size: 10,
})

function formatTime(s: string) { return s ? new Date(s).toLocaleString('zh-CN') : '-' }

function formatDetail(raw: string) {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2)
  } catch {
    return raw
  }
}

function actionTagType(action: string) {
  switch (action) {
    case 'create': return 'success'
    case 'update': return 'warning'
    case 'delete': return 'danger'
    case 'execute': return 'info'
    default: return ''
  }
}

async function fetchList() {
  loading.value = true
  try {
    const params: any = { page: query.page, size: query.size }
    if (query.keyword) params.keyword = query.keyword
    if (query.logType) params.logType = query.logType
    if (query.module) params.module = query.module
    if (query.action) params.action = query.action
    if (query.status) params.status = query.status
    if (query.createDateFrom) params.createDateFrom = query.createDateFrom
    if (query.createDateTo) params.createDateTo = query.createDateTo
    const res = await getOperationLogList(params)
    tableData.value = res.records
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function handleSearch() { query.page = 1; fetchList() }

function handleReset() {
  query.keyword = ''
  query.logType = ''
  query.module = ''
  query.action = ''
  query.status = ''
  query.createDateFrom = ''
  query.createDateTo = ''
  dateRange.value = null
  query.page = 1
  fetchList()
}

function onDateChange(val: [string, string] | null) {
  if (val) {
    query.createDateFrom = val[0]
    query.createDateTo = val[1]
  } else {
    query.createDateFrom = ''
    query.createDateTo = ''
  }
  handleSearch()
}

async function openDetailDialog(row: OperationLogRecord) {
  detail.value = null
  detailVisible.value = true
  try {
    detail.value = await getOperationLogDetail(row.id)
  } catch {
    ElMessage.error('获取日志详情失败')
    detailVisible.value = false
  }
}

onMounted(() => { fetchList() })
</script>

<style scoped>
.log-page { display: flex; flex-direction: column; gap: 16px; }
.search-card :deep(.el-card__body) { padding-bottom: 0; }
.pagination-wrap { display: flex; justify-content: flex-end; margin-top: 16px; }
.detail-json {
  margin: 0;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.6;
  max-height: 300px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
