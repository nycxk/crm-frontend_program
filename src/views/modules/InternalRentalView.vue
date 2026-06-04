<template>
  <div class="ir-page">
    <el-card class="search-card">
      <el-form :inline="true" :model="query" class="search-form">
        <el-form-item label="关键字">
          <el-input v-model="query.keyword" placeholder="用途/时长/说明" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="房源">
          <el-select v-model="query.houseId" clearable filterable placeholder="全部" style="width:180px" @change="handleSearch">
            <el-option v-for="h in houseList" :key="h.id" :value="h.id" :label="h.houseName" />
          </el-select>
        </el-form-item>
        <el-form-item label="发起日期">
          <el-date-picker v-model="query.initiateDateFrom" type="date" value-format="YYYY-MM-DD" placeholder="起" style="width:140px" @change="handleSearch" />
          <span style="margin:0 8px">至</span>
          <el-date-picker v-model="query.initiateDateTo" type="date" value-format="YYYY-MM-DD" placeholder="止" style="width:140px" @change="handleSearch" />
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
          <span>内部招租列表</span>
          <el-button type="primary" @click="openCreateDialog">新增招租</el-button>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" stripe highlight-current-row @row-click="openDetailFromRow">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column label="房源" min-width="150">
          <template #default="{ row }">
            <el-button link type="primary" size="small" class="item-link" @click.stop="openHouseDetail(row.houseId)">
              {{ row.house?.houseName || '-' }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column prop="initiateDate" label="发起日期" width="110" />
        <el-table-column prop="stopDate" label="停止日期" width="110">
          <template #default="{ row }">{{ row.stopDate || '-' }}</template>
        </el-table-column>
        <el-table-column label="租赁面积" width="100" align="right">
          <template #default="{ row }">{{ row.rentalArea }} ㎡</template>
        </el-table-column>
        <el-table-column label="参考价格" width="120" align="right">
          <template #default="{ row }">{{ row.referencePrice?.toLocaleString() }}{{ row.priceUnit ? `/ ${row.priceUnit}` : '' }}</template>
        </el-table-column>
        <el-table-column prop="usageRequirement" label="用途要求" min-width="120" show-overflow-tooltip />
        <el-table-column prop="rentalDurationRequirement" label="租期要求" min-width="120" show-overflow-tooltip />
        <el-table-column label="发起人" width="100">
          <template #default="{ row }">{{ row.initiateUser?.username || '-' }}</template>
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
      :title="isEdit ? '编辑招租' : '新增招租'"
      width="620px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
        <el-form-item label="房源" prop="houseId">
          <el-select v-model="form.houseId" filterable placeholder="选择房源" style="width:100%">
            <el-option v-for="h in houseList" :key="h.id" :value="h.id" :label="h.houseName" />
          </el-select>
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="发起日期" prop="initiateDate">
              <el-date-picker v-model="form.initiateDate" type="date" value-format="YYYY-MM-DD" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="停止日期">
              <el-date-picker v-model="form.stopDate" type="date" value-format="YYYY-MM-DD" style="width:100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="租赁面积" prop="rentalArea">
              <el-input v-model="form.rentalArea" placeholder="㎡">
                <template #suffix>㎡</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="参考价格" prop="referencePrice">
              <el-input v-model="form.referencePrice" placeholder="金额" style="width:100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="价格单位" class="price-unit-row">
          <el-select v-model="form.priceUnit" style="width:160px">
            <el-option value="天" label="/ 天" />
            <el-option value="月" label="/ 月" />
            <el-option value="年" label="/ 年" />
          </el-select>
          <span v-if="form.priceUnit && numRefPrice" class="price-calc">
            <template v-if="form.priceUnit === '天'">
              折合约 / 月：{{ calcMonthly.toLocaleString() }}，/ 年：{{ calcYearly.toLocaleString() }}
            </template>
            <template v-else-if="form.priceUnit === '月'">
              折合约 / 天：{{ calcDaily.toLocaleString() }}，/ 年：{{ calcYearly.toLocaleString() }}
            </template>
            <template v-else>
              折合约 / 天：{{ calcDaily.toLocaleString() }}，/ 月：{{ calcMonthly.toLocaleString() }}
            </template>
          </span>
        </el-form-item>
        <el-form-item label="看房联系人">
          <el-select v-model="form.contactIds" multiple filterable placeholder="选择联系人" style="width:100%">
            <el-option
              v-for="c in contactList"
              :key="c.id"
              :value="c.id"
              :label="`${c.contactName}（${c.contactPhone}）`"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="用途要求">
          <el-input v-model="form.usageRequirement" placeholder="如：零售优先" maxlength="256" />
        </el-form-item>
        <el-form-item label="租期要求">
          <el-input v-model="form.rentalDurationRequirement" placeholder="如：不少于一年" maxlength="256" />
        </el-form-item>
        <el-form-item label="其他说明">
          <el-input v-model="form.otherDescription" type="textarea" :rows="2" placeholder="其他说明" maxlength="512" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="detailVisible"
      width="800px"
      :close-on-click-modal="false"
    >
      <template #header>
        <div class="detail-header">
          <span>招租详情</span>
          <div class="detail-header-actions">
            <el-button type="primary" size="small" @click="detail && openEditDialog(detail.id)">编辑</el-button>
          </div>
        </div>
      </template>
      <template v-if="detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="房源">{{ detail.house?.houseName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="发起人">{{ detail.initiateUser?.username || '-' }}</el-descriptions-item>
          <el-descriptions-item label="发起日期">{{ detail.initiateDate }}</el-descriptions-item>
          <el-descriptions-item label="停止日期">{{ detail.stopDate || '-' }}</el-descriptions-item>
          <el-descriptions-item label="租赁面积">{{ detail.rentalArea }} ㎡</el-descriptions-item>
          <el-descriptions-item label="参考价格">{{ detail.referencePrice?.toLocaleString() }}{{ detail.priceUnit ? ` / ${detail.priceUnit}` : '' }}
            <div v-if="detailPriceCalc" class="price-calc-detail">{{ detailPriceCalc }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="用途要求">{{ detail.usageRequirement || '-' }}</el-descriptions-item>
          <el-descriptions-item label="租期要求">{{ detail.rentalDurationRequirement || '-' }}</el-descriptions-item>
          <el-descriptions-item label="其他说明" :span="2">{{ detail.otherDescription || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatTime(detail.createTime) }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ formatTime(detail.updateTime) }}</el-descriptions-item>
        </el-descriptions>

        <h4 class="section-title">房源图片</h4>
        <div v-if="rentalHouseImages.length" class="images-grid">
          <el-image
            v-for="(url, idx) in rentalHouseImages"
            :key="idx"
            :src="resolveImageUrl(url)"
            :preview-src-list="rentalHouseImages.map(u => resolveImageUrl(u))"
            :initial-index="idx"
            fit="cover"
            style="width:140px; height:140px; border-radius:4px;"
          />
        </div>
        <el-empty v-else description="暂无图片" :image-size="60" />

        <h4 class="section-title">看房联系人</h4>
        <el-table v-if="detail.contacts?.length" :data="detail.contacts" size="small" stripe>
          <el-table-column prop="contactName" label="姓名" />
          <el-table-column prop="contactPhone" label="电话" />
          <el-table-column prop="model" label="从属类型" />
          <el-table-column prop="remark" label="备注" />
        </el-table>
        <el-empty v-else description="暂无联系人" :image-size="60" />
      </template>
    </el-dialog>

    <el-dialog
      v-model="houseDetailVisible"
      title="房源详情"
      width="700px"
      :close-on-click-modal="false"
    >
      <template v-if="houseDetail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="房源名称">{{ houseDetail.house.houseName }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="houseDetail.house.houseStatus === 'idle' ? '' : 'success'" size="small">
              {{ houseDetail.house.houseStatusName }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="项目部">{{ houseDetail.house.departmentName }}</el-descriptions-item>
          <el-descriptions-item label="适租面积">{{ houseDetail.house.rentableArea || '-' }} ㎡</el-descriptions-item>
          <el-descriptions-item label="总面积">{{ houseDetail.house.totalArea || '-' }} ㎡</el-descriptions-item>
          <el-descriptions-item label="有证面积">{{ houseDetail.house.certificatedArea || '-' }} ㎡</el-descriptions-item>
          <el-descriptions-item label="坐落">{{ houseDetail.house.location || '-' }}</el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">{{ houseDetail.house.description || '-' }}</el-descriptions-item>
        </el-descriptions>

        <h4 class="section-title">房源图片</h4>
        <div v-if="houseDetail.house.images?.length" class="images-grid">
          <el-image
            v-for="(url, idx) in houseDetail.house.images"
            :key="idx"
            :src="resolveImageUrl(url)"
            :preview-src-list="houseDetail.house.images.map(u => resolveImageUrl(u))"
            :initial-index="idx"
            fit="cover"
            style="width:140px; height:140px; border-radius:4px;"
          />
        </div>
        <el-empty v-else description="暂无图片" :image-size="60" />

        <h4 class="section-title">指导价历史</h4>
        <el-table v-if="houseDetail.guidePrices?.length" :data="houseDetail.guidePrices" size="small" stripe>
          <el-table-column prop="versionName" label="版本" width="100" />
          <el-table-column prop="priceValue" label="价格(元/㎡)" width="120" />
          <el-table-column prop="effectiveDate" label="生效日期" width="120" />
          <el-table-column label="失效日期" width="120">
            <template #default="{ row }">{{ row.expiryDate || '至今' }}</template>
          </el-table-column>
        </el-table>
        <el-empty v-else description="暂无指导价数据" :image-size="60" />

        <h4 class="section-title">评估价历史</h4>
        <el-table v-if="houseDetail.assessedPrices?.length" :data="houseDetail.assessedPrices" size="small" stripe>
          <el-table-column prop="versionName" label="版本" width="100" />
          <el-table-column prop="priceValue" label="价格(元/㎡)" width="120" />
          <el-table-column prop="effectiveDate" label="生效日期" width="120" />
          <el-table-column label="失效日期" width="120">
            <template #default="{ row }">{{ row.expiryDate || '至今' }}</template>
          </el-table-column>
        </el-table>
        <el-empty v-else description="暂无评估价数据" :image-size="60" />
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  getInternalRentList, getInternalRentDetail, createInternalRent, updateInternalRent,
  type InternalRentRecord,
} from '@/api/internal-rent'
import { getHouseList, getHouseDetail, resolveImageUrl, type HouseDetail } from '@/api/house'
import { getContactList, type ContactRecord } from '@/api/contact'

const loading = ref(false)
const dialogVisible = ref(false)
const submitLoading = ref(false)
const isEdit = ref(false)
const editId = ref(0)
const formRef = ref<FormInstance>()
const tableData = ref<InternalRentRecord[]>([])
const total = ref(0)
const houseList = ref<{ id: number; houseName: string }[]>([])
const contactList = ref<ContactRecord[]>([])

const detailVisible = ref(false)
const detail = ref<InternalRentRecord | null>(null)
const rentalHouseImages = ref<string[]>([])

const houseDetailVisible = ref(false)
const houseDetail = ref<HouseDetail | null>(null)

const query = reactive({
  keyword: '',
  houseId: undefined as number | undefined,
  initiateDateFrom: '' as string,
  initiateDateTo: '' as string,
  page: 1,
  size: 10,
})

const form = reactive({
  houseId: undefined as number | undefined,
  initiateDate: '',
  stopDate: '' as string,
  contactIds: [] as number[],
  rentalArea: '',
  referencePrice: '',
  priceUnit: '',
  usageRequirement: '',
  rentalDurationRequirement: '',
  otherDescription: '',
})

const formRules: FormRules = {
  houseId: [{ required: true, message: '请选择房源', trigger: 'change' }],
  initiateDate: [{ required: true, message: '请选择发起日期', trigger: 'blur' }],
  rentalArea: [{ required: true, message: '请输入租赁面积', trigger: 'blur' }],
  referencePrice: [{ required: true, message: '请输入参考价格', trigger: 'blur' }],
}

function formatTime(s: string) { return s ? new Date(s).toLocaleString('zh-CN') : '-' }

const numRefPrice = computed(() => {
  const n = Number(form.referencePrice)
  return isNaN(n) ? 0 : n
})

const calcDaily = computed(() => {
  if (!numRefPrice.value) return 0
  if (form.priceUnit === '天') return numRefPrice.value
  if (form.priceUnit === '月') return Math.round(numRefPrice.value / 30)
  return Math.round(numRefPrice.value / 365)
})

const calcMonthly = computed(() => {
  if (!numRefPrice.value) return 0
  if (form.priceUnit === '月') return numRefPrice.value
  if (form.priceUnit === '天') return Math.round(numRefPrice.value * 30)
  return Math.round(numRefPrice.value / 12)
})

const calcYearly = computed(() => {
  if (!numRefPrice.value) return 0
  if (form.priceUnit === '年') return numRefPrice.value
  if (form.priceUnit === '月') return Math.round(numRefPrice.value * 12)
  return Math.round(numRefPrice.value * 365)
})

const detailPriceCalc = computed(() => {
  const p = detail.value?.referencePrice
  const u = detail.value?.priceUnit
  if (!p || !u) return ''
  if (u === '天') return `折合约 / 月：${(p * 30).toLocaleString()}，/ 年：${(p * 365).toLocaleString()}`
  if (u === '月') return `折合约 / 天：${Math.round(p / 30).toLocaleString()}，/ 年：${(p * 12).toLocaleString()}`
  return `折合约 / 天：${Math.round(p / 365).toLocaleString()}，/ 月：${Math.round(p / 12).toLocaleString()}`
})

async function fetchList() {
  loading.value = true
  try {
    const params: any = { page: query.page, size: query.size }
    if (query.keyword) params.keyword = query.keyword
    if (query.houseId) params.houseId = query.houseId
    if (query.initiateDateFrom) params.initiateDateFrom = query.initiateDateFrom
    if (query.initiateDateTo) params.initiateDateTo = query.initiateDateTo
    const res = await getInternalRentList(params)
    tableData.value = res.records
    total.value = res.total
  } finally { loading.value = false }
}

async function fetchOptions() {
  const [housesRes, contactsRes] = await Promise.all([
    getHouseList({ page: 1, size: 200 }),
    getContactList({ page: 1, size: 200 }),
  ])
  houseList.value = housesRes.records.map((h) => ({ id: h.id, houseName: h.houseName }))
  contactList.value = contactsRes.records
}

function handleSearch() { query.page = 1; fetchList() }
function handleReset() {
  query.keyword = ''
  query.houseId = undefined
  query.initiateDateFrom = ''
  query.initiateDateTo = ''
  query.page = 1
  fetchList()
}

function resetForm() {
  form.houseId = undefined
  form.initiateDate = ''
  form.stopDate = ''
  form.contactIds = []
  form.rentalArea = ''
  form.referencePrice = ''
  form.priceUnit = ''
  form.usageRequirement = ''
  form.rentalDurationRequirement = ''
  form.otherDescription = ''
  formRef.value?.resetFields()
}

function buildSavePayload() {
  return {
    houseId: form.houseId!,
    initiateDate: form.initiateDate,
    stopDate: form.stopDate || undefined,
    contactIds: form.contactIds.length ? form.contactIds : undefined,
    rentalArea: Number(form.rentalArea),
    referencePrice: Number(form.referencePrice),
    priceUnit: form.priceUnit || undefined,
    usageRequirement: form.usageRequirement || undefined,
    rentalDurationRequirement: form.rentalDurationRequirement || undefined,
    otherDescription: form.otherDescription || undefined,
  }
}

function openCreateDialog() {
  isEdit.value = false; editId.value = 0
  resetForm()
  dialogVisible.value = true
}

async function openEditDialog(id: number) {
  isEdit.value = true; editId.value = id
  resetForm()
  try {
    const d = await getInternalRentDetail(id)
    form.houseId = d.houseId
    form.initiateDate = d.initiateDate
    form.stopDate = d.stopDate || ''
    form.contactIds = d.contactIds || []
    form.rentalArea = String(d.rentalArea)
    form.referencePrice = String(d.referencePrice)
    form.priceUnit = d.priceUnit || ''
    form.usageRequirement = d.usageRequirement || ''
    form.rentalDurationRequirement = d.rentalDurationRequirement || ''
    form.otherDescription = d.otherDescription || ''
    dialogVisible.value = true
  } catch { ElMessage.error('获取招租详情失败') }
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitLoading.value = true
  try {
    const payload = buildSavePayload()
    if (isEdit.value) {
      await updateInternalRent(editId.value, payload)
      ElMessage.success('修改成功')
    } else {
      await createInternalRent(payload)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchList()
  } finally { submitLoading.value = false }
}

function openDetailFromRow(row: InternalRentRecord) {
  openDetailDialog(row.id)
}

async function openDetailDialog(id: number) {
  detail.value = null
  rentalHouseImages.value = []
  detailVisible.value = true
  try {
    const d = await getInternalRentDetail(id)
    detail.value = d
    if (d.houseId) {
      const houseDetail = await getHouseDetail(d.houseId)
      rentalHouseImages.value = houseDetail.house.images || []
    }
  }
  catch { ElMessage.error('获取详情失败'); detailVisible.value = false }
}

async function openHouseDetail(id: number) {
  houseDetail.value = null
  houseDetailVisible.value = true
  try { houseDetail.value = await getHouseDetail(id) }
  catch { ElMessage.error('获取房源详情失败'); houseDetailVisible.value = false }
}

onMounted(() => { fetchList(); fetchOptions() })
</script>

<style scoped>
.ir-page { display: flex; flex-direction: column; gap: 16px; }
.search-card :deep(.el-card__body) { padding-bottom: 0; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.card-header-actions { display: flex; gap: 8px; }
.detail-header { display: flex; justify-content: space-between; align-items: center; width: 100%; }
.detail-header-actions { display: flex; gap: 8px; }
.item-link { margin-right: 4px; }
.section-title { margin: 20px 0 12px; }
.price-unit-row :deep(.el-form-item__content) { flex-wrap: wrap; }
.price-calc { color: #909399; font-size: 12px; margin-left: 8px; line-height: 32px; }

.images-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.pricing-wrap {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
.pricing-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.price-calc-detail {
  color: #909399;
  font-size: 12px;
  margin-top: 2px;
}
.pagination-wrap { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
