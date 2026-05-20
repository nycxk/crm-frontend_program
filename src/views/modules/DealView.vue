<template>
  <div class="deal-page">
    <el-card class="search-card">
      <el-form :inline="true" :model="query" class="search-form">
        <el-form-item label="关键字">
          <el-input v-model="query.keyword" placeholder="备注搜索" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="客户">
          <el-select v-model="query.clientId" clearable filterable placeholder="全部" style="width:140px" @change="handleSearch">
            <el-option v-for="c in clientList" :key="c.id" :value="c.id" :label="c.clientName" />
          </el-select>
        </el-form-item>
        <el-form-item label="房源">
          <el-select v-model="query.houseId" clearable filterable placeholder="全部" style="width:150px" @change="handleSearch">
            <el-option v-for="h in houseList" :key="h.id" :value="h.id" :label="h.houseName" />
          </el-select>
        </el-form-item>
        <el-form-item label="签订日期">
          <el-date-picker v-model="query.contractSignDateFrom" type="date" value-format="YYYY-MM-DD" placeholder="起" style="width:130px" @change="handleSearch" />
          <span style="margin:0 6px">-</span>
          <el-date-picker v-model="query.contractSignDateTo" type="date" value-format="YYYY-MM-DD" placeholder="止" style="width:130px" @change="handleSearch" />
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
          <span>成交列表</span>
          <div class="card-header-actions">
            <el-button @click="openDraftDialog">草稿箱</el-button>
            <el-button type="primary" @click="openCreateDialog">新建成交</el-button>
          </div>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column label="客户" min-width="120">
          <template #default="{ row }">
            <el-button
              v-for="c in row.clients"
              :key="c.id"
              link
              type="primary"
              size="small"
              class="item-link"
              @click="openClientDetailPopup(c.id)"
            >{{ c.clientName }}</el-button>
          </template>
        </el-table-column>
        <el-table-column label="房源" min-width="140">
          <template #default="{ row }">
            <el-button
              v-for="h in row.houses"
              :key="h.id"
              link
              type="primary"
              size="small"
              class="item-link"
              @click="openHouseDetailPopup(h.id)"
            >{{ h.houseName }}</el-button>
          </template>
        </el-table-column>
        <el-table-column label="合同总额" width="120" align="right">
          <template #default="{ row }">{{ row.contractTotalAmount?.toLocaleString() || '-' }}</template>
        </el-table-column>
        <el-table-column prop="contractSignDate" label="签订日期" width="110" />
        <el-table-column label="租期" min-width="150">
          <template #default="{ row }">
            {{ row.contractStartDate }} ~ {{ row.contractEndDate || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.actualEndDate ? 'info' : 'success'" size="small">
              {{ row.actualEndDate ? '已退' : '在租' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openDetailDialog(row.id)">详情</el-button>
            <el-button link type="primary" size="small" @click="openEditDialog(row.id)" :disabled="!!row.actualEndDate || row.contactBusinessUserId !== userStore.userId">编辑</el-button>
            <el-button link type="warning" size="small" @click="openCheckoutDialog(row)" :disabled="!!row.actualEndDate || row.contactBusinessUserId !== userStore.userId">退租</el-button>
            <el-button link type="danger" size="small" :disabled="row.contactBusinessUserId !== userStore.userId" @click="handleDelete(row)">删除</el-button>
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
      :title="isDraft ? (draftId ? '修改草稿' : '新增草稿') : (isEdit ? '编辑成交' : '新建成交')"
      width="720px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="isDraft ? {} : formRules" label-width="100px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="客户" prop="clientIds">
              <el-select v-model="form.clientIds" multiple filterable clearable placeholder="至少选一个客户" style="width:100%">
                <el-option v-for="c in clientList" :key="c.id" :value="c.id" :label="c.clientName" />
              </el-select>
            </el-form-item>
            <el-form-item label="渠道类型" prop="channelTypeId">
              <el-select v-model="form.channelTypeId" filterable clearable placeholder="选择渠道" style="width:100%" @change="onChannelChange">
                <el-option v-for="ch in channelList" :key="ch.id" :value="ch.id" :label="ch.typeName" />
              </el-select>
            </el-form-item>
            <el-form-item label="租赁面积">
              <el-input v-model="form.rentalArea" placeholder="不填则自动计算">
                <template #suffix>㎡</template>
              </el-input>
            </el-form-item>
            <el-form-item label="合同总额">
              <el-input v-model="form.contractTotalAmount" placeholder="请输入合同总额" />
            </el-form-item>
            <el-form-item label="签订日期" prop="contractSignDate">
              <el-date-picker v-model="form.contractSignDate" type="date" value-format="YYYY-MM-DD" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="房源" prop="houseIds">
              <el-select v-model="form.houseIds" multiple filterable clearable placeholder="至少选一个房源" style="width:100%" @change="onHouseIdsChange">
                <el-option v-for="h in houseList" :key="h.id" :value="h.id" :label="h.houseName" />
              </el-select>
            </el-form-item>
            <el-form-item v-if="selectedChannel?.instanceType === 'agency'" label="中介公司">
              <el-select v-model="form.channelInstanceId" clearable filterable placeholder="选择中介公司" style="width:100%">
                <el-option v-for="a in agencyList" :key="a.id" :value="a.id" :label="a.companyName" />
              </el-select>
            </el-form-item>
            <el-form-item v-else-if="form.channelTypeId" label="实例名称">
              <el-input v-model="form.channelInstanceName" placeholder="渠道实例名称" />
            </el-form-item>
            <el-form-item label="起租日期" prop="contractStartDate">
              <el-date-picker v-model="form.contractStartDate" type="date" value-format="YYYY-MM-DD" style="width:100%" />
            </el-form-item>
            <el-form-item label="退租日期">
              <el-date-picker v-model="form.contractEndDate" type="date" value-format="YYYY-MM-DD" style="width:100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注">
          <el-input v-model="form.dealRemark" type="textarea" :rows="2" placeholder="成交备注" maxlength="256" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="draftDialogVisible"
      title="草稿箱"
      width="1000px"
      :close-on-click-modal="false"
    >
      <div style="margin-bottom:12px">
        <el-button type="primary" size="small" @click="openDraftCreate">新增草稿</el-button>
      </div>
      <el-table :data="draftList" v-loading="draftLoading" stripe size="small">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column label="客户" min-width="100">
          <template #default="{ row: dr }">
            <el-tag v-for="c in dr.clients" :key="c.id" size="small" class="item-tag">{{ c.clientName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="房源" min-width="120">
          <template #default="{ row: dr }">
            <el-tag v-for="h in dr.houses" :key="h.id" size="small" class="item-tag">{{ h.houseName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="channelTypeName" label="渠道" width="80" />
        <el-table-column label="合同总额" width="110" align="right">
          <template #default="{ row: dr }">{{ dr.contractTotalAmount?.toLocaleString() || '-' }}</template>
        </el-table-column>
        <el-table-column prop="contractSignDate" label="签订日期" width="110" />
        <el-table-column prop="dealRemark" label="备注" min-width="100" show-overflow-tooltip />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row: dr }">
            <el-button link type="primary" size="small" @click="editDraft(dr)">修改</el-button>
            <el-button link type="danger" size="small" @click="deleteDraftItem(dr.id)">删除</el-button>
            <el-button link type="success" size="small" @click="useDraft(dr)">使用</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div v-if="draftTotal > draftQuery.size" class="pagination-wrap">
        <el-pagination
          v-model:current-page="draftQuery.page"
          v-model:page-size="draftQuery.size"
          :total="draftTotal"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @size-change="fetchDraftList"
          @current-change="fetchDraftList"
        />
      </div>
    </el-dialog>

    <el-dialog v-model="detailVisible" title="成交详情" width="800px" :close-on-click-modal="false">
      <template v-if="detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="客户">
            <el-tag v-for="c in detail.clients" :key="c.id" size="small" class="item-tag">{{ c.clientName }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="房源">
            <el-tag v-for="h in detail.houses" :key="h.id" size="small" class="item-tag">{{ h.houseName }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="渠道">{{ detail.channelTypeName }}
            <template v-if="detail.channelInstanceName"> / {{ detail.channelInstanceName }}</template>
          </el-descriptions-item>
          <el-descriptions-item label="租赁面积">{{ detail.rentalArea }} ㎡</el-descriptions-item>
          <el-descriptions-item label="合同总额">{{ detail.contractTotalAmount?.toLocaleString() }}</el-descriptions-item>
          <el-descriptions-item label="签订日期">{{ detail.contractSignDate }}</el-descriptions-item>
          <el-descriptions-item label="起租日期">{{ detail.contractStartDate }}</el-descriptions-item>
          <el-descriptions-item label="合同退租">{{ detail.contractEndDate || '-' }}</el-descriptions-item>
          <el-descriptions-item label="实际退租">{{ detail.actualEndDate || '未退租' }}</el-descriptions-item>
          <el-descriptions-item label="成交业务员">{{ detail.dealBusinessUser?.username || '-' }}</el-descriptions-item>
          <el-descriptions-item label="对接业务员">{{ detail.contactBusinessUser?.username || '-' }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ detail.dealRemark || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatTime(detail.createTime) }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ formatTime(detail.updateTime) }}</el-descriptions-item>
        </el-descriptions>
      </template>
    </el-dialog>

    <el-dialog v-model="checkoutVisible" title="登记退租" width="400px" :close-on-click-modal="false">
      <el-form ref="checkoutFormRef" :model="checkoutForm" :rules="checkoutFormRules" label-width="100px">
        <el-form-item label="实际退租日期" prop="actualEndDate">
          <el-date-picker v-model="checkoutForm.actualEndDate" type="date" value-format="YYYY-MM-DD" style="width:100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="checkoutVisible = false">取消</el-button>
        <el-button type="primary" :loading="checkoutLoading" @click="handleCheckout">确定退租</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="clientDetailVisible"
      title="客户详情"
      width="800px"
      :close-on-click-modal="false"
    >
      <template v-if="clientDetail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="客户姓名">{{ clientDetail.clientName }}</el-descriptions-item>
          <el-descriptions-item label="证件信息">
            {{ clientDetail.idType ? `${clientDetail.idType}：${clientDetail.idNumber}` : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatTime(clientDetail.createTime) }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ formatTime(clientDetail.updateTime) }}</el-descriptions-item>
        </el-descriptions>

        <h4 class="section-title">关联联系人</h4>
        <el-table :data="clientDetail.contacts" size="small" stripe>
          <el-table-column prop="contactName" label="姓名" />
          <el-table-column prop="contactPhone" label="电话" />
          <el-table-column prop="model" label="从属类型" />
          <el-table-column prop="remark" label="备注" />
        </el-table>

        <h4 class="section-title">来访记录</h4>
        <el-table v-if="clientDetail.visits?.length" :data="clientDetail.visits" size="small" stripe>
          <el-table-column prop="visitDate" label="来访日期" width="120" />
          <el-table-column label="带看房源" min-width="140">
            <template #default="{ row: v }">
              <el-button
                v-for="h in v.houses"
                :key="h.id"
                link
                type="primary"
                size="small"
                class="item-link"
                @click="openHouseDetailPopup(h.id)"
              >{{ h.houseName }}</el-button>
            </template>
          </el-table-column>
          <el-table-column label="渠道" min-width="140">
            <template #default="{ row: v }">
              {{ v.channelTypeName || '-' }}
              <template v-if="v.channelInstanceName"> / {{ v.channelInstanceName }}</template>
            </template>
          </el-table-column>
          <el-table-column prop="detailDescription" label="说明" min-width="120" />
        </el-table>
        <el-empty v-else description="暂无来访记录" :image-size="60" />

        <h4 class="section-title">成交房源</h4>
        <el-table v-if="clientDeals.length" :data="clientDeals" size="small" stripe>
          <el-table-column label="房源" min-width="140">
            <template #default="{ row: d }">
              <el-button
                v-for="h in d.houses"
                :key="h.id"
                link
                type="primary"
                size="small"
                class="item-link"
                @click="openHouseDetailPopup(h.id)"
              >{{ h.houseName }}</el-button>
            </template>
          </el-table-column>
          <el-table-column label="合同总额" width="120" align="right">
            <template #default="{ row: d }">{{ d.contractTotalAmount?.toLocaleString() || '-' }}</template>
          </el-table-column>
          <el-table-column prop="contractSignDate" label="签订日期" width="110" />
          <el-table-column label="状态" width="80" align="center">
            <template #default="{ row: d }">
              <el-tag :type="d.actualEndDate ? 'info' : 'success'" size="small">
                {{ d.actualEndDate ? '已退' : '在租' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-else description="暂无成交记录" :image-size="60" />
      </template>
      <template #footer>
        <el-button @click="clientDetailVisible = false">关闭</el-button>
        <el-button type="primary" @click="startDealFromClient(clientDetail)">继续添加成交</el-button>
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
      <template #footer>
        <el-button @click="houseDetailVisible = false">关闭</el-button>
        <el-button
          v-if="houseDetail?.house.houseStatus !== 'rented'"
          type="primary"
          @click="startDealFromHouse"
        >继续添加成交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  getDealList, getDealDetail, createDeal, updateDeal, checkoutDeal, deleteDeal,
  type DealRecord,
} from '@/api/deal'
import {
  getDealDraftList, createDealDraft, updateDealDraft, deleteDealDraft,
  type DealDraftRecord,
} from '@/api/deal-draft'
import { getClientList, getClientDetail, type ClientRecord, type ClientDetail } from '@/api/client'
import { getHouseList, getHouseDetail, type HouseRecord, type HouseDetail } from '@/api/house'
import { getChannelList, getAgencyList, type ChannelRecord, type AgencyRecord } from '@/api/channel'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const loading = ref(false)
const dialogVisible = ref(false)
const submitLoading = ref(false)
const isEdit = ref(false)
const editId = ref(0)
const isDraft = ref(false)
const draftId = ref(0)
const formRef = ref<FormInstance>()
const tableData = ref<DealRecord[]>([])
const total = ref(0)
const clientList = ref<ClientRecord[]>([])
const houseList = ref<HouseRecord[]>([])
const channelList = ref<ChannelRecord[]>([])
const agencyList = ref<AgencyRecord[]>([])
const selectedChannel = ref<ChannelRecord | null>(null)

const detailVisible = ref(false)
const detail = ref<DealRecord | null>(null)

const checkoutVisible = ref(false)
const checkoutLoading = ref(false)
const checkoutFormRef = ref<FormInstance>()
const checkoutDealRow = ref<DealRecord | null>(null)

const clientDetailVisible = ref(false)
const clientDetail = ref<ClientDetail | null>(null)
const clientDeals = ref<DealRecord[]>([])
const houseDetailVisible = ref(false)
const houseDetail = ref<HouseDetail | null>(null)

const draftDialogVisible = ref(false)
const draftLoading = ref(false)
const draftList = ref<DealDraftRecord[]>([])
const draftTotal = ref(0)
const draftQuery = reactive({ page: 1, size: 10 })

const checkoutForm = reactive({
  actualEndDate: '',
})
const checkoutFormRules: FormRules = {
  actualEndDate: [{ required: true, message: '请选择退租日期', trigger: 'blur' }],
}

const query = reactive({
  keyword: '',
  clientId: undefined as number | undefined,
  houseId: undefined as number | undefined,
  contractSignDateFrom: '' as string,
  contractSignDateTo: '' as string,
  page: 1,
  size: 10,
})

const form = reactive({
  clientIds: [] as number[],
  houseIds: [] as number[],
  channelTypeId: undefined as number | undefined,
  channelInstanceId: undefined as number | undefined,
  channelInstanceName: '',
  rentalArea: '',
  contractTotalAmount: '',
  contractSignDate: '',
  contractStartDate: '',
  contractEndDate: '',
  dealRemark: '',
})

const formRules: FormRules = {
  clientIds: [{ required: true, message: '至少选择一个客户', trigger: 'change' }],
  houseIds: [{ required: true, message: '至少选择一个房源', trigger: 'change' }],
  channelTypeId: [{ required: true, message: '请选择渠道类型', trigger: 'change' }],
  contractSignDate: [{ required: true, message: '请选择签订日期', trigger: 'blur' }],
  contractStartDate: [{ required: true, message: '请选择起租日期', trigger: 'blur' }],
}

function formatTime(s: string) { return s ? new Date(s).toLocaleString('zh-CN') : '-' }

function fillFormFromDealDraft(d: DealDraftRecord) {
  form.clientIds = d.clientIds || []
  form.houseIds = d.houseIds || []
  form.channelTypeId = d.channelTypeId ?? undefined
  form.channelInstanceId = d.channelInstanceId ?? undefined
  form.channelInstanceName = d.channelInstanceName || ''
  form.rentalArea = d.rentalArea ? String(d.rentalArea) : ''
  form.contractTotalAmount = d.contractTotalAmount ? String(d.contractTotalAmount) : ''
  form.contractSignDate = d.contractSignDate || ''
  form.contractStartDate = d.contractStartDate || ''
  form.contractEndDate = d.contractEndDate || ''
  form.dealRemark = d.dealRemark || ''
  selectedChannel.value = null
  agencyList.value = []
}

function buildDealPayload() {
  const payload: any = {
    clientIds: form.clientIds,
    houseIds: form.houseIds,
    channelTypeId: form.channelTypeId || undefined,
    rentalArea: form.rentalArea ? Number(form.rentalArea) : undefined,
    contractTotalAmount: form.contractTotalAmount ? Number(form.contractTotalAmount) : undefined,
    contractSignDate: form.contractSignDate || undefined,
    contractStartDate: form.contractStartDate || undefined,
    contractEndDate: form.contractEndDate || undefined,
    dealRemark: form.dealRemark || undefined,
  }
  if (form.channelTypeId && selectedChannel.value?.instanceType === 'agency') {
    payload.channelInstanceId = form.channelInstanceId
  } else if (form.channelTypeId) {
    payload.channelInstanceName = form.channelInstanceName || undefined
  }
  return payload
}

async function fetchList() {
  loading.value = true
  try {
    const params: any = { page: query.page, size: query.size }
    if (query.keyword) params.keyword = query.keyword
    if (query.clientId) params.clientId = query.clientId
    if (query.houseId) params.houseId = query.houseId
    if (query.contractSignDateFrom) params.contractSignDateFrom = query.contractSignDateFrom
    if (query.contractSignDateTo) params.contractSignDateTo = query.contractSignDateTo
    const res = await getDealList(params)
    tableData.value = res.records
    total.value = res.total
  } finally { loading.value = false }
}

async function fetchOptions() {
  const [cl, hl, chl] = await Promise.all([
    getClientList({ page: 1, size: 200 }),
    getHouseList({ page: 1, size: 200, houseStatus: 'idle' }),
    getChannelList({ page: 1, size: 50 }),
  ])
  clientList.value = cl.records
  houseList.value = hl.records
  channelList.value = chl.records
}

function handleSearch() { query.page = 1; fetchList() }
function handleReset() {
  query.keyword = ''
  query.clientId = undefined
  query.houseId = undefined
  query.contractSignDateFrom = ''
  query.contractSignDateTo = ''
  query.page = 1
  fetchList()
}

function resetForm() {
  form.clientIds = []
  form.houseIds = []
  form.channelTypeId = undefined
  form.channelInstanceId = undefined
  form.channelInstanceName = ''
  form.rentalArea = ''
  form.contractTotalAmount = ''
  form.contractSignDate = ''
  form.contractStartDate = ''
  form.contractEndDate = ''
  form.dealRemark = ''
  selectedChannel.value = null
  agencyList.value = []
  formRef.value?.resetFields()
}

async function onChannelChange(id: number | undefined) {
  form.channelInstanceId = undefined
  form.channelInstanceName = ''
  agencyList.value = []
  if (id) {
    selectedChannel.value = channelList.value.find((c) => c.id === id) || null
    if (selectedChannel.value?.instanceType === 'agency') {
      const res = await getAgencyList(id, { page: 1, size: 200 })
      agencyList.value = res.records
    }
  } else {
    selectedChannel.value = null
  }
}

function onHouseIdsChange(ids: number[]) {
  if (!ids.length) return
  const total = ids.reduce((sum, id) => {
    const h = houseList.value.find((item) => item.id === id)
    return sum + (h?.rentableArea || 0)
  }, 0)
  if (total > 0) {
    form.rentalArea = String(total)
  }
}

function openCreateDialog() {
  isEdit.value = false; isDraft.value = false; editId.value = 0; draftId.value = 0
  resetForm(); dialogVisible.value = true
}

async function openEditDialog(id: number) {
  isEdit.value = true; isDraft.value = false; editId.value = id; draftId.value = 0
  resetForm()
  try {
    const d = await getDealDetail(id)
    form.clientIds = d.clientIds || []
    form.houseIds = d.houseIds || []
    if (d.channelTypeId) { form.channelTypeId = d.channelTypeId; await onChannelChange(d.channelTypeId) }
    form.channelInstanceId = d.channelInstanceId ?? undefined
    form.channelInstanceName = d.channelInstanceName || ''
    form.rentalArea = d.rentalArea ? String(d.rentalArea) : ''
    form.contractTotalAmount = d.contractTotalAmount ? String(d.contractTotalAmount) : ''
    form.contractSignDate = d.contractSignDate
    form.contractStartDate = d.contractStartDate
    form.contractEndDate = d.contractEndDate || ''
    form.dealRemark = d.dealRemark || ''
    dialogVisible.value = true
  } catch { ElMessage.error('获取成交详情失败') }
}

async function handleSubmit() {
  if (isDraft.value) {
    submitLoading.value = true
    try {
      const payload = buildDealPayload()
      if (draftId.value) {
        await updateDealDraft(draftId.value, payload)
        ElMessage.success('草稿已保存')
      } else {
        await createDealDraft(payload)
        ElMessage.success('草稿已保存')
      }
      dialogVisible.value = false
      fetchDraftList()
    } finally { submitLoading.value = false }
    return
  }

  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  submitLoading.value = true
  try {
    const payload = buildDealPayload()
    if (isEdit.value) {
      await updateDeal(editId.value, payload)
      ElMessage.success('修改成功')
    } else {
      await createDeal(payload)
      ElMessage.success('新建成交成功')
    }
    dialogVisible.value = false
    fetchList()
  } finally { submitLoading.value = false }
}

function handleDelete(row: DealRecord) {
  ElMessageBox.confirm('确认删除该成交记录吗？', '删除确认',
    { confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning' })
    .then(async () => { await deleteDeal(row.id); ElMessage.success('已删除'); fetchList() })
    .catch(() => {})
}

async function openDetailDialog(id: number) {
  detail.value = null; detailVisible.value = true
  try { detail.value = await getDealDetail(id) }
  catch { ElMessage.error('获取详情失败'); detailVisible.value = false }
}

function openCheckoutDialog(row: DealRecord) {
  checkoutDealRow.value = row
  checkoutForm.actualEndDate = ''
  checkoutVisible.value = true
}

async function handleCheckout() {
  const valid = await checkoutFormRef.value?.validate().catch(() => false)
  if (!valid || !checkoutDealRow.value) return
  checkoutLoading.value = true
  try {
    await checkoutDeal(checkoutDealRow.value.id, { actualEndDate: checkoutForm.actualEndDate })
    ElMessage.success('退租登记成功')
    checkoutVisible.value = false
    fetchList()
  } finally { checkoutLoading.value = false }
}

async function openClientDetailPopup(id: number) {
  clientDetail.value = null
  clientDeals.value = []
  clientDetailVisible.value = true
  try {
    const [d, dealsRes] = await Promise.all([
      getClientDetail(id),
      getDealList({ clientId: id, size: 50 }),
    ])
    clientDetail.value = d
    clientDeals.value = dealsRes.records
  } catch {
    ElMessage.error('获取客户详情失败')
    clientDetailVisible.value = false
  }
}

async function openHouseDetailPopup(id: number) {
  houseDetail.value = null
  houseDetailVisible.value = true
  try {
    houseDetail.value = await getHouseDetail(id)
  } catch {
    ElMessage.error('获取房源详情失败')
    houseDetailVisible.value = false
  }
}

function startDealFromClient(d: ClientDetail | null) {
  if (!d) return
  clientDetailVisible.value = false
  isEdit.value = false; isDraft.value = false; editId.value = 0; draftId.value = 0
  resetForm()
  form.clientIds = [d.id]
  dialogVisible.value = true
}

function startDealFromHouse() {
  if (!houseDetail.value) return
  houseDetailVisible.value = false
  isEdit.value = false; isDraft.value = false; editId.value = 0; draftId.value = 0
  resetForm()
  form.houseIds = [houseDetail.value.house.id]
  dialogVisible.value = true
}

async function fetchDraftList() {
  draftLoading.value = true
  try {
    const res = await getDealDraftList({ page: draftQuery.page, size: draftQuery.size })
    draftList.value = res.records
    draftTotal.value = res.total
  } finally { draftLoading.value = false }
}

function openDraftDialog() {
  draftQuery.page = 1
  draftDialogVisible.value = true
  fetchDraftList()
}

function openDraftCreate() {
  draftDialogVisible.value = false
  isEdit.value = false; isDraft.value = true; editId.value = 0; draftId.value = 0
  resetForm()
  dialogVisible.value = true
}

async function editDraft(row: DealDraftRecord) {
  draftDialogVisible.value = false
  isEdit.value = false; isDraft.value = true; editId.value = 0; draftId.value = row.id
  resetForm()
  fillFormFromDealDraft(row)
  dialogVisible.value = true
}

async function useDraft(row: DealDraftRecord) {
  draftDialogVisible.value = false
  isEdit.value = false; isDraft.value = false; editId.value = 0; draftId.value = 0
  resetForm()
  fillFormFromDealDraft(row)
  dialogVisible.value = true
}

async function deleteDraftItem(id: number) {
  try {
    await deleteDealDraft(id)
    ElMessage.success('草稿已删除')
    fetchDraftList()
  } catch {
    ElMessage.error('删除失败')
  }
}

onMounted(() => { fetchList(); fetchOptions() })
</script>

<style scoped>
.deal-page { display: flex; flex-direction: column; gap: 16px; }
.search-card :deep(.el-card__body) { padding-bottom: 0; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.card-header-actions { display: flex; gap: 8px; }
.item-tag { margin-right: 4px; margin-bottom: 2px; }
.item-link { margin-right: 4px; }
.section-title { margin: 20px 0 12px; }
.pagination-wrap { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
