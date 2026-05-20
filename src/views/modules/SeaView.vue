<template>
  <div class="sea-page">
    <el-card class="search-card">
      <el-form :inline="true" :model="query" class="search-form">
        <el-form-item label="关键字">
          <el-input v-model="query.keyword" placeholder="姓名/证件类型/证件号" clearable @keyup.enter="handleSearch" />
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
          <span>公海客户</span>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="clientName" label="客户姓名" min-width="120" />
        <el-table-column label="证件信息" min-width="200">
          <template #default="{ row }">
            <template v-if="row.idType">{{ row.idType }}：{{ row.idNumber }}</template>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="联系人" min-width="160">
          <template #default="{ row }">
            <template v-if="row.contacts?.length">
              <el-tag v-for="c in row.contacts" :key="c.id" size="small" class="contact-tag">
                {{ c.contactName }} {{ c.contactPhone }}
              </el-tag>
            </template>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="visitCount" label="来访次数" width="90" align="center" />
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">{{ formatTime(row.createTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="80" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleClaim(row)">认领</el-button>
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getPublicPoolList, claimPublicClient, type ClientRecord } from '@/api/client'

const loading = ref(false)
const tableData = ref<ClientRecord[]>([])
const total = ref(0)

const query = reactive({
  keyword: '',
  page: 1,
  size: 10,
})

function formatTime(s: string) { return s ? new Date(s).toLocaleString('zh-CN') : '-' }

async function fetchList() {
  loading.value = true
  try {
    const params: any = { page: query.page, size: query.size }
    if (query.keyword) params.keyword = query.keyword
    const res = await getPublicPoolList(params)
    tableData.value = res.records
    total.value = res.total
  } finally { loading.value = false }
}

function handleSearch() { query.page = 1; fetchList() }
function handleReset() {
  query.keyword = ''
  query.page = 1
  fetchList()
}

function handleClaim(row: ClientRecord) {
  ElMessageBox.confirm(
    `确认认领客户「${row.clientName}」吗？认领后该客户将变为您的客户。`,
    '认领确认',
    { confirmButtonText: '确认认领', cancelButtonText: '取消', type: 'warning' },
  )
    .then(async () => {
      await claimPublicClient(row.id)
      ElMessage.success('认领成功')
      fetchList()
    })
    .catch(() => {})
}

onMounted(() => { fetchList() })
</script>

<style scoped>
.sea-page { display: flex; flex-direction: column; gap: 16px; }
.search-card :deep(.el-card__body) { padding-bottom: 0; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.contact-tag { margin-right: 4px; margin-bottom: 2px; }
.pagination-wrap { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
