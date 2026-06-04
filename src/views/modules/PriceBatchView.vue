<template>
  <div class="price-batch-page">
    <el-card class="action-card">
      <el-row :gutter="16" align="middle">
        <el-col :span="16">
          <div class="action-btns">
            <el-select v-model="uploadPriceType" style="width:120px">
              <el-option value="guide" label="指导价" />
              <el-option value="assessed" label="评估价" />
            </el-select>
            <el-upload
              :show-file-list="false"
              :http-request="handleUpload"
              accept=".xlsx,.xls"
              class="upload-btn"
            >
              <el-button type="primary" :loading="uploadLoading">上传调价文件</el-button>
            </el-upload>
            <el-dropdown @command="handleDownloadTemplate">
              <el-button>下载模板<el-icon class="el-icon--right"><ArrowDown /></el-icon></el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="guide">指导价模板</el-dropdown-item>
                  <el-dropdown-item command="assessed">评估价模板</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="search-card">
      <el-form :inline="true" :model="query" class="search-form">
        <el-form-item label="关键字">
          <el-input v-model="query.keyword" placeholder="批次名称/编号" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="query.priceType" clearable placeholder="全部" style="width:120px" @change="handleSearch">
            <el-option value="guide" label="指导价" />
            <el-option value="assessed" label="评估价" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" clearable placeholder="全部" style="width:120px" @change="handleSearch">
            <el-option value="applied" label="已应用" />
            <el-option value="rolled_back" label="已回退" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <template #header><span>调价批次记录</span></template>

      <el-table :data="tableData" v-loading="loading" stripe highlight-current-row @row-click="openDetailDialog">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="batchCode" label="批次编号" min-width="180" />
        <el-table-column prop="batchName" label="批次名称" min-width="180" show-overflow-tooltip />
        <el-table-column label="类型" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.priceType === 'guide' ? 'warning' : 'success'" size="small">
              {{ row.priceTypeLabel }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'applied' ? 'success' : 'info'" size="small">
              {{ row.statusLabel }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="涉及房源" width="90" align="center">
          <template #default="{ row }">{{ row.affectedHouseCount }}</template>
        </el-table-column>
        <el-table-column prop="uploadUserName" label="上传人" width="100" />
        <el-table-column label="上传日期" width="120">
          <template #default="{ row }">{{ row.uploadDate }}</template>
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

    <el-dialog v-model="detailVisible" width="700px" :close-on-click-modal="false">
      <template #header>
        <div class="detail-header">
          <span>批次详情</span>
          <div class="detail-header-actions">
            <el-button
              type="danger"
              size="small"
              :disabled="!detail || detail.status !== 'applied'"
              @click="detail && handleRollback(detail)"
            >回退</el-button>
          </div>
        </div>
      </template>
      <template v-if="detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="批次编号">{{ detail.batchCode }}</el-descriptions-item>
          <el-descriptions-item label="批次名称">{{ detail.batchName }}</el-descriptions-item>
          <el-descriptions-item label="类型">
            <el-tag :type="detail.priceType === 'guide' ? 'warning' : 'success'" size="small">{{ detail.priceTypeLabel }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="detail.status === 'applied' ? 'success' : 'info'" size="small">{{ detail.statusLabel }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="涉及房源数">{{ detail.affectedHouseCount }}</el-descriptions-item>
          <el-descriptions-item label="上传人">{{ detail.uploadUserName }}</el-descriptions-item>
          <el-descriptions-item label="上传日期">{{ detail.uploadDate }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ detail.remark || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间" :span="2">{{ formatTime(detail.createTime) }}</el-descriptions-item>
        </el-descriptions>

        <h4 class="section-title">房源调价明细</h4>
        <el-table v-if="detail.houseSnapshot?.length" :data="detail.houseSnapshot" size="small" stripe>
          <el-table-column prop="houseId" label="房源ID" width="100" />
          <el-table-column label="指导价版本" width="120">
            <template #default="{ row: s }">
              <span v-if="detail.priceType === 'guide'">指导价V{{ s.guideVersion }}</span>
              <span v-else>V{{ s.guideVersion || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="评估价版本" width="120">
            <template #default="{ row: s }">
              <span v-if="detail.priceType === 'assessed'">评估价V{{ s.assessedVersion }}</span>
              <span v-else>V{{ s.assessedVersion || '-' }}</span>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-else description="暂无明细数据" :image-size="60" />
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import type { UploadRequestOptions } from 'element-plus'
import {
  getPriceBatchList,
  getPriceBatchDetail,
  downloadPriceTemplate,
  uploadPriceBatch,
  rollbackPriceBatch,
  type PriceBatchRecord,
} from '@/api/price-batch'

const loading = ref(false)
const uploadLoading = ref(false)
const uploadPriceType = ref<'guide' | 'assessed'>('guide')
const detailVisible = ref(false)
const detail = ref<PriceBatchRecord | null>(null)
const tableData = ref<PriceBatchRecord[]>([])
const total = ref(0)

const query = reactive({
  keyword: '',
  priceType: '' as string,
  status: '' as string,
  page: 1,
  size: 10,
})

function formatTime(s: string) { return s ? new Date(s).toLocaleString('zh-CN') : '-' }

async function fetchList() {
  loading.value = true
  try {
    const params: any = { page: query.page, size: query.size }
    if (query.keyword) params.keyword = query.keyword
    if (query.priceType) params.priceType = query.priceType
    if (query.status) params.status = query.status
    const res = await getPriceBatchList(params)
    tableData.value = res.records
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function handleSearch() { query.page = 1; fetchList() }
function handleReset() {
  query.keyword = ''
  query.priceType = ''
  query.status = ''
  query.page = 1
  fetchList()
}

function handleDownloadTemplate(type: 'guide' | 'assessed') {
  downloadPriceTemplate(type).catch(() => ElMessage.error('下载模板失败'))
}

async function handleUpload(options: UploadRequestOptions) {
  uploadLoading.value = true
  try {
    const result = await uploadPriceBatch(options.file, uploadPriceType.value)
    ElMessage.success(`上传成功：${result.batchName}`)
    fetchList()
  } catch (e: any) {
    ElMessage.error(e?.message || '上传失败')
  } finally {
    uploadLoading.value = false
  }
}

async function openDetailDialog(row: PriceBatchRecord) {
  detail.value = null
  detailVisible.value = true
  try {
    detail.value = await getPriceBatchDetail(row.id)
  } catch {
    ElMessage.error('获取批次详情失败')
    detailVisible.value = false
  }
}

function handleRollback(row: PriceBatchRecord) {
  ElMessageBox.confirm(
    `确认回退批次「${row.batchName}」吗？该批次下全部调价将被撤销。`,
    '回退确认',
    { confirmButtonText: '确定回退', cancelButtonText: '取消', type: 'warning' },
  )
    .then(async () => {
      await rollbackPriceBatch(row.id)
      ElMessage.success('批次已回退')
      fetchList()
    })
    .catch(() => {})
}

onMounted(() => { fetchList() })
</script>

<style scoped>
.price-batch-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.action-card :deep(.el-card__body) {
  padding: 16px 20px;
}

.action-btns {
  display: flex;
  gap: 12px;
}

.search-card :deep(.el-card__body) {
  padding-bottom: 0;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.upload-btn {
  display: inline-block;
}

.section-title {
  margin: 20px 0 12px;
}
.detail-header { display: flex; justify-content: space-between; align-items: center; width: 100%; }
.detail-header-actions { display: flex; gap: 8px; }
</style>
