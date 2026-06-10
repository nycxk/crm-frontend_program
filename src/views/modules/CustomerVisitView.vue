<template>
  <div class="visit-page">
    <el-card class="search-card">
      <el-form :inline="true" :model="query" class="search-form">
        <el-form-item label="来访日期">
          <el-date-picker
            v-model="query.visitDateFrom"
            type="date"
            placeholder="开始日期"
            value-format="YYYY-MM-DD"
            style="width:140px"
          />
          <span style="margin:0 8px">至</span>
          <el-date-picker
            v-model="query.visitDateTo"
            type="date"
            placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width:140px"
          />
        </el-form-item>
        <el-form-item label="客户">
          <el-select v-model="query.clientId" clearable filterable placeholder="全部客户" style="width:180px" @change="handleSearch">
            <el-option
              v-for="c in clientList"
              :key="c.id"
              :value="c.id"
              :label="c.clientName"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="房源">
          <el-select v-model="query.houseId" clearable filterable placeholder="全部房源" style="width:160px" @change="handleSearch">
            <el-option
              v-for="h in houseList"
              :key="h.id"
              :value="h.id"
              :label="h.houseName"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="渠道">
          <el-select v-model="query.channelId" clearable filterable placeholder="全部渠道" style="width:160px" @change="handleSearch">
            <el-option
              v-for="c in channelList"
              :key="c.id"
              :value="c.id"
              :label="c.typeName"
            />
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
          <span>来访记录</span>
          <div class="card-header-actions">
            <el-button @click="openDraftDialog">草稿箱</el-button>
            <el-button type="primary" @click="openCreateDialog">新增来访</el-button>
          </div>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" stripe highlight-current-row @row-click="openVisitDetail">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="visitDate" label="来访日期" width="120" />
        <el-table-column label="客户" min-width="100">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click.stop="openClientDetail(row.clientId)">
              {{ row.clientName }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="联系人" min-width="110">
          <template #default="{ row }">
            <template v-if="row.contact">
              <el-button link type="primary" size="small" @click.stop="openContactDetailPopup(row.contact.id)">
                {{ row.contact.contactName }}
              </el-button>
            </template>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="带看房源" min-width="140">
          <template #default="{ row }">
            <template v-if="row.houses?.length">
              <el-button
                v-for="h in row.houses"
                :key="h.id"
                link
                type="primary"
                size="small"
                class="item-link"
                @click.stop="openHouseDetail(h.id)"
              >
                {{ h.houseName }}
              </el-button>
            </template>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="渠道" min-width="160">
          <template #default="{ row }">
            {{ row.channelTypeName || '-' }}
            <template v-if="row.channelInstanceName"> / {{ row.channelInstanceName }}</template>
          </template>
        </el-table-column>
        <el-table-column prop="detailDescription" label="说明" min-width="140" show-overflow-tooltip />
        <el-table-column label="需求" min-width="140">
          <template #default="{ row }">
            <template v-if="row.requirementsConfig">
              <el-tag
                v-for="(val, key) in row.requirementsConfig"
                :key="key"
                size="small"
                class="item-tag"
              >
                {{ key }}：{{ val }}
              </el-tag>
            </template>
            <span v-else>-</span>
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
      :title="isDraft ? (draftId ? '修改草稿' : '新增草稿') : (isEdit ? '编辑来访' : '新增来访')"
      width="620px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="isDraft ? {} : formRules" label-width="100px">
        <el-form-item label="来访日期" prop="visitDate">
          <el-date-picker
            v-model="form.visitDate"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            style="width:200px"
          />
        </el-form-item>
        <el-form-item label="客户" prop="clientId">
          <el-select v-model="form.clientId" filterable clearable placeholder="选择客户" style="width:100%" @change="onClientChange">
            <el-option
              v-for="c in clientList"
              :key="c.id"
              :value="c.id"
              :label="c.clientName"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="联系人" v-if="form.clientId">
          <el-select v-model="form.contactId" clearable filterable placeholder="选择客户联系人" style="width:100%">
            <el-option
              v-for="ct in clientContactList"
              :key="ct.id"
              :value="ct.id"
              :label="`${ct.contactName}（${ct.contactPhone}）`"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="带看房源" prop="houseIds">
          <el-select v-model="form.houseIds" multiple filterable placeholder="选择房源" style="width:100%">
            <el-option
              v-for="h in houseList"
              :key="h.id"
              :value="h.id"
              :label="h.houseName"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="渠道类型" prop="channelId">
          <el-select v-model="form.channelId" clearable placeholder="选择渠道类型" style="width:100%" @change="onChannelChange">
            <el-option
              v-for="ch in channelList"
              :key="ch.id"
              :value="ch.id"
              :label="ch.typeName"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="selectedChannel?.instanceType === 'agency'" label="中介公司">
          <el-select v-model="form.channelInstanceId" clearable filterable placeholder="选择中介公司" style="width:100%">
            <el-option
              v-for="a in agencyList"
              :key="a.id"
              :value="a.id"
              :label="a.companyName"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-else-if="form.channelId" label="实例名称">
          <el-input v-model="form.channelInstanceName" placeholder="渠道实例名称（如客户名等）" />
        </el-form-item>
        <el-form-item label="详情说明">
          <el-input v-model="form.detailDescription" type="textarea" :rows="2" placeholder="来访详情描述" />
        </el-form-item>
        <el-form-item v-if="reqSchema.length" label="需求配置">
          <div class="requirements-wrap">
            <div v-for="item in reqSchema" :key="item.key" class="req-row">
              <span class="req-label">{{ item.key }}</span>
              <el-input
                v-if="item.type === 'text'"
                v-model="form.reqValues[item.key]"
                placeholder="请输入"
                style="width:240px"
              />
              <el-input
                v-else-if="item.type === 'int'"
                v-model="form.reqValues[item.key]"
                placeholder="请输入整数"
                style="width:240px"
                type="number"
              />
              <el-input
                v-else-if="item.type === 'float'"
                v-model="form.reqValues[item.key]"
                placeholder="请输入浮点数"
                style="width:240px"
                type="number"
              />
              <el-date-picker
                v-else-if="item.type === 'date'"
                v-model="form.reqValues[item.key]"
                type="date"
                value-format="YYYY-MM-DD"
                style="width:240px"
              />
              <el-input
                v-else
                v-model="form.reqValues[item.key]"
                placeholder="请输入"
                style="width:240px"
              />
            </div>
          </div>
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
      width="900px"
      :close-on-click-modal="false"
    >
      <div style="margin-bottom:12px">
        <el-button type="primary" size="small" @click="openDraftCreate">新增草稿</el-button>
      </div>
      <el-table :data="draftList" v-loading="draftLoading" stripe size="small">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="visitDate" label="来访日期" width="110" />
        <el-table-column prop="clientName" label="客户" min-width="90" />
        <el-table-column label="带看房源" min-width="120">
          <template #default="{ row: dr }">
            <el-tag v-for="h in dr.houses" :key="h.id" size="small" class="item-tag">{{ h.houseName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="channelTypeName" label="渠道" width="80" />
        <el-table-column prop="detailDescription" label="说明" min-width="100" show-overflow-tooltip />
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
          <el-table-column label="关联中介">
            <template #default="{ row: c }">{{ c.agencyName || '-' }}</template>
          </el-table-column>
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
                @click="openHouseDetail(h.id)"
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
                @click="openHouseDetail(h.id)"
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
        <el-button type="primary" @click="startVisitFromClient(clientDetail)">继续添加来访</el-button>
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
          @click="startVisitFromHouse"
        >继续添加来访</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="visitDetailVisible"
      width="700px"
      :close-on-click-modal="false"
    >
      <template #header>
        <div class="detail-header">
          <span>来访详情</span>
          <div class="detail-header-actions">
            <el-button
              type="primary"
              size="small"
              :disabled="!visitDetail || visitDetail.createdBy !== userStore.userId"
              @click="visitDetail && openEditDialog(visitDetail.id)"
            >
              编辑
            </el-button>
          </div>
        </div>
      </template>
      <template v-if="visitDetail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="来访日期">{{ visitDetail.visitDate }}</el-descriptions-item>
          <el-descriptions-item label="客户">{{ visitDetail.clientName }}</el-descriptions-item>
          <el-descriptions-item label="联系人">
            <template v-if="visitDetail.contact">
              <el-button link type="primary" size="small" @click="openContactDetailPopup(visitDetail.contact.id)">
                {{ visitDetail.contact.contactName }}（{{ visitDetail.contact.contactPhone }}）
              </el-button>
            </template>
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="渠道">{{ visitDetail.channelTypeName || '-' }}
            <template v-if="visitDetail.channelInstanceName"> / {{ visitDetail.channelInstanceName }}</template>
          </el-descriptions-item>
          <el-descriptions-item label="添加人">{{ visitDetail.createdBy || '-' }}</el-descriptions-item>
          <el-descriptions-item label="详情说明" :span="2">{{ visitDetail.detailDescription || '-' }}</el-descriptions-item>
        </el-descriptions>

        <h4 class="section-title">带看房源</h4>
        <el-table v-if="visitDetail.houses?.length" :data="visitDetail.houses" size="small" stripe highlight-current-row @row-click="(h: any) => openHouseDetail(h.id)">
          <el-table-column prop="houseName" label="房源名称" />
          <el-table-column label="状态" width="100">
            <template #default="{ row: h }">
              <el-tag :type="h.houseStatus === 'idle' ? '' : 'success'" size="small">
                {{ h.houseStatusName }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-else description="无带看房源" :image-size="60" />

        <h4 class="section-title">需求清单</h4>
        <el-table v-if="visitDetail.requirementsConfig && Object.keys(visitDetail.requirementsConfig).length" :data="reqTableData" size="small" stripe>
          <el-table-column prop="key" label="需求项" />
          <el-table-column prop="value" label="内容" />
        </el-table>
        <el-empty v-else description="无需求记录" :image-size="60" />
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
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  getVisitList, getVisitDetail, createVisit, updateVisit,
  type VisitRecord,
} from '@/api/visit'
import {
  getVisitDraftList, createVisitDraft, updateVisitDraft, deleteVisitDraft,
  type VisitDraftRecord,
} from '@/api/visit-draft'
import { getClientList, getClientDetail, getClientContacts, type ClientRecord, type ClientDetail, type ClientContact } from '@/api/client'
import { getContactDetail, type ContactRecord } from '@/api/contact'
import { getDealList, type DealRecord } from '@/api/deal'
import { getHouseList, getHouseDetail, type HouseDetail } from '@/api/house'
import { getChannelList, getAgencyList, type ChannelRecord, type AgencyRecord } from '@/api/channel'
import { getParamByKey } from '@/api/system'
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
const tableData = ref<VisitRecord[]>([])
const total = ref(0)
const clientList = ref<ClientRecord[]>([])
const channelList = ref<ChannelRecord[]>([])
const houseList = ref<{ id: number; houseName: string }[]>([])
const agencyList = ref<AgencyRecord[]>([])
const selectedChannel = ref<ChannelRecord | null>(null)

const clientContactList = ref<ClientContact[]>([])

const contactDetailVisible = ref(false)
const contactDetail = ref<ContactRecord | null>(null)

const clientDetailVisible = ref(false)
const clientDetail = ref<ClientDetail | null>(null)
const clientDeals = ref<DealRecord[]>([])

const houseDetailVisible = ref(false)
const houseDetail = ref<HouseDetail | null>(null)

const visitDetailVisible = ref(false)
const visitDetail = ref<VisitRecord | null>(null)

const reqTableData = computed(() => {
  if (!visitDetail.value?.requirementsConfig) return []
  return Object.entries(visitDetail.value.requirementsConfig).map(([key, value]) => ({ key, value }))
})

const reqSchema = ref<{ key: string; type: string }[]>([])

const draftDialogVisible = ref(false)
const draftLoading = ref(false)
const draftList = ref<VisitDraftRecord[]>([])
const draftTotal = ref(0)
const draftQuery = reactive({ page: 1, size: 10 })

const query = reactive({
  clientId: undefined as number | undefined,
  houseId: undefined as number | undefined,
  channelId: undefined as number | undefined,
  visitDateFrom: '' as string,
  visitDateTo: '' as string,
  page: 1,
  size: 10,
})

const form = reactive({
  visitDate: '',
  clientId: undefined as number | undefined,
  contactId: undefined as number | undefined,
  houseIds: [] as number[],
  channelId: undefined as number | undefined,
  channelInstanceId: undefined as number | undefined,
  channelInstanceName: '',
  detailDescription: '',
  reqValues: {} as Record<string, string>,
})

const formRules: FormRules = {
  visitDate: [{ required: true, message: '请选择来访日期', trigger: 'blur' }],
  clientId: [{ required: true, message: '请选择客户', trigger: 'change' }],
  houseIds: [{ required: true, message: '请选择带看房源', trigger: 'change' }],
}

function formatTime(dateStr: string) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

function fillFormFromDraft(d: VisitDraftRecord) {
  form.visitDate = d.visitDate || ''
  form.clientId = d.clientId ?? undefined
  form.contactId = undefined
  form.houseIds = d.houseIds || []
  form.channelId = d.channelId ?? undefined
  form.channelInstanceId = d.channelInstanceId ?? undefined
  form.channelInstanceName = d.channelInstanceName || ''
  form.detailDescription = d.detailDescription || ''
  form.reqValues = d.requirementsConfig ? { ...d.requirementsConfig } : {}
  selectedChannel.value = null
}

function buildSavePayload() {
  const requirementsConfig: Record<string, string> = {}
  Object.entries(form.reqValues).forEach(([key, val]) => {
    if (val) requirementsConfig[key] = val
  })
  const payload: any = {
    visitDate: form.visitDate || undefined,
    clientId: form.clientId,
    contactId: form.contactId,
    houseIds: form.houseIds.length ? form.houseIds : undefined,
    channelId: form.channelId,
    detailDescription: form.detailDescription || undefined,
    requirementsConfig: Object.keys(requirementsConfig).length ? requirementsConfig : undefined,
  }
  if (form.channelId && selectedChannel.value?.instanceType === 'agency') {
    payload.channelInstanceId = form.channelInstanceId
  } else if (form.channelId) {
    payload.channelInstanceName = form.channelInstanceName || undefined
  }
  return payload
}

async function fetchList() {
  loading.value = true
  try {
    const params: any = { page: query.page, size: query.size }
    if (query.clientId) params.clientId = query.clientId
    if (query.houseId) params.houseId = query.houseId
    if (query.channelId) params.channelId = query.channelId
    if (query.visitDateFrom) params.visitDateFrom = query.visitDateFrom
    if (query.visitDateTo) params.visitDateTo = query.visitDateTo
    const res = await getVisitList(params)
    tableData.value = res.records
    total.value = res.total
  } finally {
    loading.value = false
  }
}

async function fetchOptions() {
  const [clientsRes, housesRes, channelsRes] = await Promise.all([
    getClientList({ page: 1, size: 200 }),
    getHouseList({ page: 1, size: 200 }),
    getChannelList({ page: 1, size: 50 }),
  ])
  clientList.value = clientsRes.records
  houseList.value = housesRes.records.map((h) => ({ id: h.id, houseName: h.houseName }))
  channelList.value = channelsRes.records
}

function handleSearch() { query.page = 1; fetchList() }
function handleReset() {
  query.clientId = undefined
  query.houseId = undefined
  query.channelId = undefined
  query.visitDateFrom = ''
  query.visitDateTo = ''
  query.page = 1
  fetchList()
}

function resetForm() {
  form.visitDate = ''
  form.clientId = undefined
  form.contactId = undefined
  form.houseIds = []
  form.channelId = undefined
  form.channelInstanceId = undefined
  form.channelInstanceName = ''
  form.detailDescription = ''
  form.reqValues = {}
  selectedChannel.value = null
  clientContactList.value = []
  formRef.value?.resetFields()
}

async function fetchReqSchema() {
  try {
    const res = await getParamByKey('CVRC')
    const schema = JSON.parse(res.paramValue)
    if (Array.isArray(schema)) {
      reqSchema.value = schema.filter((s: any) => s && s.key)
    } else {
      reqSchema.value = []
    }
  } catch {
    reqSchema.value = []
  }
}

async function onClientChange(clientId: number | undefined) {
  form.contactId = undefined
  clientContactList.value = []
  if (clientId) {
    try {
      clientContactList.value = await getClientContacts(clientId)
    } catch { /* ignore */ }
  }
}

async function onChannelChange(channelId: number | undefined) {
  form.channelInstanceId = undefined
  form.channelInstanceName = ''
  agencyList.value = []
  if (channelId) {
    selectedChannel.value = channelList.value.find((c) => c.id === channelId) || null
    if (selectedChannel.value?.instanceType === 'agency') {
      const res = await getAgencyList(channelId, { page: 1, size: 200 })
      agencyList.value = res.records
    }
  } else {
    selectedChannel.value = null
  }
}

async function openCreateDialog() {
  isEdit.value = false; isDraft.value = false; editId.value = 0; draftId.value = 0
  resetForm()
  await fetchReqSchema()
  dialogVisible.value = true
}

async function openEditDialog(id: number) {
  isEdit.value = true; isDraft.value = false; editId.value = id; draftId.value = 0
  resetForm()
  try {
    const [detail] = await Promise.all([getVisitDetail(id), fetchReqSchema()])
    form.visitDate = detail.visitDate
    form.clientId = detail.clientId
    form.contactId = detail.contactId ?? undefined
    if (detail.contactId) {
      try { clientContactList.value = await getClientContacts(detail.clientId) } catch { /* ignore */ }
    }
    form.houseIds = detail.houseIds || []
    houseList.value = detail.houses || []
    form.detailDescription = detail.detailDescription || ''
    if (detail.channelId) {
      form.channelId = detail.channelId
      await onChannelChange(detail.channelId)
      form.channelInstanceId = detail.channelInstanceId ?? undefined
      form.channelInstanceName = detail.channelInstanceName || ''
    }
    if (detail.requirementsConfig) {
      form.reqValues = { ...detail.requirementsConfig }
    }
    dialogVisible.value = true
  } catch {
    ElMessage.error('获取来访详情失败')
  }
}

async function handleSubmit() {
  if (isDraft.value) {
    submitLoading.value = true
    try {
      const payload = buildSavePayload()
      if (draftId.value) {
        await updateVisitDraft(draftId.value, payload)
        ElMessage.success('草稿已保存')
      } else {
        await createVisitDraft(payload)
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
    const payload = buildSavePayload()
    if (isEdit.value) {
      await updateVisit(editId.value, payload)
      ElMessage.success('修改成功')
    } else {
      await createVisit(payload)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchList()
  } finally {
    submitLoading.value = false
  }
}

async function openVisitDetail(row: VisitRecord) {
  visitDetail.value = row
  visitDetailVisible.value = true
}

async function openClientDetail(id: number) {
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

async function openHouseDetail(id: number) {
  houseDetail.value = null
  houseDetailVisible.value = true
  try {
    houseDetail.value = await getHouseDetail(id)
  } catch {
    ElMessage.error('获取房源详情失败')
    houseDetailVisible.value = false
  }
}

async function startVisitFromClient(c: ClientDetail | null) {
  if (!c) return
  clientDetailVisible.value = false
  isEdit.value = false; isDraft.value = false; editId.value = 0; draftId.value = 0
  resetForm()
  await fetchReqSchema()
  form.clientId = c.id
  onClientChange(c.id)
  dialogVisible.value = true
}

async function startVisitFromHouse() {
  if (!houseDetail.value) return
  houseDetailVisible.value = false
  isEdit.value = false; isDraft.value = false; editId.value = 0; draftId.value = 0
  resetForm()
  await fetchReqSchema()
  form.houseIds = [houseDetail.value.house.id]
  dialogVisible.value = true
}

async function fetchDraftList() {
  draftLoading.value = true
  try {
    const res = await getVisitDraftList({ page: draftQuery.page, size: draftQuery.size })
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
  fetchReqSchema()
  dialogVisible.value = true
}

async function editDraft(row: VisitDraftRecord) {
  draftDialogVisible.value = false
  isEdit.value = false; isDraft.value = true; editId.value = 0; draftId.value = row.id
  resetForm()
  await fetchReqSchema()
  fillFormFromDraft(row)
  dialogVisible.value = true
}

async function useDraft(row: VisitDraftRecord) {
  draftDialogVisible.value = false
  isEdit.value = false; isDraft.value = false; editId.value = 0; draftId.value = 0
  resetForm()
  await fetchReqSchema()
  fillFormFromDraft(row)
  dialogVisible.value = true
}

async function deleteDraftItem(id: number) {
  try {
    await deleteVisitDraft(id)
    ElMessage.success('草稿已删除')
    fetchDraftList()
  } catch {
    ElMessage.error('删除失败')
  }
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

onMounted(() => { fetchList(); fetchOptions() })
</script>

<style scoped>
.visit-page { display: flex; flex-direction: column; gap: 16px; }
.search-card :deep(.el-card__body) { padding-bottom: 0; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.card-header-actions { display: flex; gap: 8px; }
.detail-header { display: flex; justify-content: space-between; align-items: center; width: 100%; }
.detail-header-actions { display: flex; gap: 8px; }
.item-tag { margin-right: 4px; margin-bottom: 2px; }
.item-link { margin-right: 4px; }
.section-title { margin: 20px 0 12px; }
.pagination-wrap { display: flex; justify-content: flex-end; margin-top: 16px; }

.requirements-wrap { width: 100%; }
.req-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.req-label {
  width: 80px;
  font-size: 13px;
  color: #606266;
  flex-shrink: 0;
}
</style>
