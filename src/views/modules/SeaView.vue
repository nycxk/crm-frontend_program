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

      <el-table :data="tableData" v-loading="loading" stripe highlight-current-row @row-click="openDetailDialog">
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
              <el-tag
                v-for="c in row.contacts"
                :key="c.id"
                size="small"
                class="contact-tag clickable-tag"
                @click.stop="openContactDetailPopup(c.id)"
              >
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
      v-model="detailVisible"
      width="700px"
      :close-on-click-modal="false"
    >
      <template #header>
        <div class="detail-header">
          <span>公海客户详情</span>
          <div class="detail-header-actions">
            <el-button type="primary" size="small" :loading="claimLoading" @click="handleClaimFromDetail">认领</el-button>
          </div>
        </div>
      </template>
      <template v-if="selectedRow">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="客户姓名">{{ selectedRow.clientName }}</el-descriptions-item>
          <el-descriptions-item label="证件信息">
            {{ selectedRow.idType ? `${selectedRow.idType}：${selectedRow.idNumber}` : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="来访次数">{{ selectedRow.visitCount }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatTime(selectedRow.createTime) }}</el-descriptions-item>
        </el-descriptions>

        <h4 class="section-title">关联联系人</h4>
        <el-table v-if="selectedRow.contacts?.length" :data="selectedRow.contacts" size="small" stripe>
          <el-table-column prop="contactName" label="姓名" />
          <el-table-column prop="contactPhone" label="电话" />
        </el-table>
        <el-empty v-else description="暂无联系人" :image-size="60" />
      </template>
    </el-dialog>

    <el-dialog v-model="contactDetailVisible" title="联系人详情" width="480px" :close-on-click-modal="false">
      <template v-if="contactDetail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="姓名">{{ contactDetail.contactName }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ contactDetail.contactPhone }}</el-descriptions-item>
          <el-descriptions-item label="从属类型">{{ contactDetail.model || '-' }}</el-descriptions-item>
          <el-descriptions-item label="关联中介">{{ contactDetail.agencyName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="备注">{{ contactDetail.remark || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatTime(contactDetail.createTime) }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ formatTime(contactDetail.updateTime) }}</el-descriptions-item>
        </el-descriptions>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getPublicPoolList, claimPublicClient, type ClientRecord } from '@/api/client'
import { getContactDetail, type ContactRecord } from '@/api/contact'

const loading = ref(false)
const claimLoading = ref(false)
const detailVisible = ref(false)
const selectedRow = ref<ClientRecord | null>(null)
const contactDetailVisible = ref(false)
const contactDetail = ref<ContactRecord | null>(null)
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

function openDetailDialog(row: ClientRecord) {
  selectedRow.value = row
  detailVisible.value = true
}

function handleClaimFromDetail() {
  if (!selectedRow.value) return
  ElMessageBox.confirm(
    `确认认领客户「${selectedRow.value.clientName}」吗？认领后该客户将变为您的客户。`,
    '认领确认',
    { confirmButtonText: '确认认领', cancelButtonText: '取消', type: 'warning' },
  )
    .then(async () => {
      claimLoading.value = true
      try {
        await claimPublicClient(selectedRow.value!.id)
        ElMessage.success('认领成功')
        detailVisible.value = false
        fetchList()
      } finally { claimLoading.value = false }
    })
    .catch(() => {})
}

async function openContactDetailPopup(id: number) {
  contactDetail.value = null
  contactDetailVisible.value = true
  try {
    contactDetail.value = await getContactDetail(id)
  } catch {
    ElMessage.error('获取联系人详情失败')
    contactDetailVisible.value = false
  }
}

onMounted(() => { fetchList() })
</script>

<style scoped>
.sea-page { display: flex; flex-direction: column; gap: 16px; }
.search-card :deep(.el-card__body) { padding-bottom: 0; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.contact-tag { margin-right: 4px; margin-bottom: 2px; }
.clickable-tag { cursor: pointer; }
.pagination-wrap { display: flex; justify-content: flex-end; margin-top: 16px; }
.detail-header { display: flex; justify-content: space-between; align-items: center; width: 100%; }
.detail-header-actions { display: flex; gap: 8px; }
.section-title { margin: 20px 0 12px; }
.contact-tag { margin-right: 4px; margin-bottom: 2px; }
</style>
