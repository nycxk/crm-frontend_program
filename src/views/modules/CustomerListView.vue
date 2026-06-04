<template>
  <div class="client-page">
    <el-card class="search-card">
      <el-form :inline="true" :model="query" class="search-form">
        <el-form-item label="关键字">
          <el-input v-model="query.keyword" placeholder="姓名/证件类型/证件号" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" clearable placeholder="全部" style="width:120px" @change="handleSearch">
            <el-option value="mine" label="我的客户" />
            <el-option value="tenant" label="租户" />
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
          <span>客户列表</span>
          <el-button type="primary" @click="openCreateDialog">新增客户</el-button>
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
        <el-table-column label="来访次数" width="90" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.visitCount" type="primary" size="small">{{ row.visitCount }}</el-tag>
            <span v-else>0</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.clientStatus === 'mine' ? 'warning' : 'success'" size="small">
              {{ row.clientStatusName }}
            </el-tag>
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
      v-model="dialogVisible"
      :title="isEdit ? '编辑客户' : '新增客户'"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
        <el-form-item label="客户姓名" prop="clientName">
          <el-input v-model="form.clientName" placeholder="请输入客户姓名" maxlength="32" />
        </el-form-item>
        <el-form-item label="证件类型">
          <el-select v-model="form.idType" clearable filterable allow-create placeholder="请选择或输入证件类型" style="width:100%">
            <el-option v-for="item in idTypeOptions" :key="item" :value="item" :label="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="证件编号">
          <el-input v-model="form.idNumber" placeholder="证件类型和编号须同时填写" maxlength="64" />
        </el-form-item>

        <el-divider v-if="!isEdit">联系人</el-divider>

        <el-form-item v-if="!isEdit" label="已有联系人" prop="contactIds">
          <el-select v-model="form.contactIds" multiple filterable placeholder="选择已有联系人" style="width:100%">
            <el-option
              v-for="c in contactList"
              :key="c.id"
              :value="c.id"
              :label="`${c.contactName}（${c.contactPhone}）`"
            />
          </el-select>
        </el-form-item>

        <el-form-item v-if="isEdit" label="关联联系人" prop="contactIds">
          <el-select v-model="form.contactIds" multiple filterable placeholder="选择关联联系人" style="width:100%">
            <el-option
              v-for="c in contactList"
              :key="c.id"
              :value="c.id"
              :label="`${c.contactName}（${c.contactPhone}）`"
            />
          </el-select>
        </el-form-item>

        <el-form-item v-if="!isEdit" label="新建联系人">
          <div class="new-contact-wrap">
            <div v-for="(nc, index) in form.newContacts" :key="index" class="new-contact-row">
              <el-input v-model="nc.contactName" placeholder="姓名" style="width:110px" />
              <el-input v-model="nc.contactPhone" placeholder="手机号" style="width:135px" />
              <el-select v-model="nc.model" placeholder="从属类型" style="width:100px" @change="onNewContactModelChange(index)">
                <el-option v-for="m in modelOptions" :key="m" :value="m" :label="m" />
              </el-select>
              <template v-if="nc.model === '中介公司'">
                <el-select v-model="nc.agencyId" filterable placeholder="中介公司" style="width:120px">
                  <el-option v-for="a in contactAgencyList" :key="a.id" :value="a.id" :label="a.companyName" />
                </el-select>
              </template>
              <el-button link type="danger" size="small" @click="removeNewContact(index)">删除</el-button>
            </div>
            <el-button size="small" type="primary" @click="addNewContact">+ 添加联系人</el-button>
          </div>
        </el-form-item>

        <template v-if="!isEdit">
          <el-divider>来访信息</el-divider>

          <el-form-item label="来访日期" prop="visitDate">
            <el-date-picker v-model="visitForm.visitDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width:200px" />
          </el-form-item>
          <el-form-item label="带看房源" prop="houseIds">
            <el-select v-model="visitForm.houseIds" multiple filterable placeholder="选择房源" style="width:100%">
              <el-option v-for="h in houseList" :key="h.id" :value="h.id" :label="h.houseName" />
            </el-select>
          </el-form-item>
          <el-form-item label="渠道类型">
            <el-select v-model="visitForm.channelId" clearable placeholder="选择渠道类型" style="width:100%" @change="onVisitChannelChange">
              <el-option v-for="ch in channelList" :key="ch.id" :value="ch.id" :label="ch.typeName" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="visitSelectedChannel?.instanceType === 'agency'" label="中介公司">
            <el-select v-model="visitForm.channelInstanceId" clearable filterable placeholder="选择中介公司" style="width:100%">
              <el-option v-for="a in agencyList" :key="a.id" :value="a.id" :label="a.companyName" />
            </el-select>
          </el-form-item>
          <el-form-item v-else-if="visitForm.channelId" label="实例名称">
            <el-input v-model="visitForm.channelInstanceName" placeholder="渠道实例名称" />
          </el-form-item>
          <el-form-item label="详情说明">
            <el-input v-model="visitForm.detailDescription" type="textarea" :rows="2" placeholder="来访详情描述" />
          </el-form-item>
          <el-form-item v-if="reqSchema.length" label="需求配置">
            <div class="requirements-wrap">
              <div v-for="item in reqSchema" :key="item.key" class="req-row">
                <span class="req-label">{{ item.key }}</span>
                <el-input
                  v-if="item.type === 'text'"
                  v-model="visitForm.reqValues[item.key]"
                  placeholder="请输入"
                  style="width:240px"
                />
                <el-input
                  v-else-if="item.type === 'int'"
                  v-model="visitForm.reqValues[item.key]"
                  placeholder="请输入整数"
                  style="width:240px"
                  type="number"
                />
                <el-input
                  v-else-if="item.type === 'float'"
                  v-model="visitForm.reqValues[item.key]"
                  placeholder="请输入浮点数"
                  style="width:240px"
                  type="number"
                />
                <el-date-picker
                  v-else-if="item.type === 'date'"
                  v-model="visitForm.reqValues[item.key]"
                  type="date"
                  value-format="YYYY-MM-DD"
                  style="width:240px"
                />
                <el-input
                  v-else
                  v-model="visitForm.reqValues[item.key]"
                  placeholder="请输入"
                  style="width:240px"
                />
              </div>
            </div>
          </el-form-item>
        </template>
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
          <span>客户详情</span>
          <div class="detail-header-actions">
            <el-button
              type="primary"
              size="small"
              :disabled="!detail || detail.createdBy !== userStore.userId"
              @click="detail && openEditDialog(detail.id)"
            >
              编辑
            </el-button>
            <el-button
              type="warning"
              size="small"
              :disabled="!detail || detail.createdBy !== userStore.userId || detail.clientStatus !== 'mine'"
              :loading="releaseLoading"
              @click="detail && handleReleaseToPool(detail)"
            >
              投放公海
            </el-button>
          </div>
        </div>
      </template>
      <template v-if="detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="客户姓名">{{ detail.clientName }}</el-descriptions-item>
          <el-descriptions-item label="证件信息">
            {{ detail.idType ? `${detail.idType}：${detail.idNumber}` : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatTime(detail.createTime) }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ formatTime(detail.updateTime) }}</el-descriptions-item>
        </el-descriptions>

        <h4 class="section-title">
          关联联系人
          <el-button size="small" type="primary" @click="openBindContactDialog">绑定联系人</el-button>
        </h4>
        <el-table :data="detail.contacts" size="small" stripe highlight-current-row @row-click="(c: any) => openContactDetailPopup(c.id)">
          <el-table-column prop="contactName" label="姓名" />
          <el-table-column prop="contactPhone" label="电话" />
          <el-table-column prop="model" label="从属类型" />
          <el-table-column label="关联中介">
            <template #default="{ row: c }">{{ c.agencyName || '-' }}</template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" />
          <el-table-column label="操作" width="80">
            <template #default="{ row: c }">
              <el-button link type="danger" size="small" @click.stop="handleUnbindContact(c.id)">解绑</el-button>
            </template>
          </el-table-column>
        </el-table>

        <h4 class="section-title">来访记录</h4>
        <el-table :data="detail.visits" size="small" stripe highlight-current-row @row-click="(v: any) => openVisitDetailPopup(v.id)">
          <el-table-column prop="visitDate" label="来访日期" width="120" />
          <el-table-column label="房产" min-width="140">
            <template #default="{ row: v }">
              <el-button
                v-for="h in v.houses"
                :key="h.id"
                link
                type="primary"
                size="small"
                class="contact-link"
                @click.stop="openHouseDetailPopup(h.id)"
              >{{ h.houseName }}</el-button>
            </template>
          </el-table-column>
          <el-table-column label="渠道" min-width="180">
            <template #default="{ row: v }">
              {{ v.channelTypeName }}
              <template v-if="v.channelInstanceName"> / {{ v.channelInstanceName }}</template>
            </template>
          </el-table-column>
          <el-table-column prop="detailDescription" label="描述" min-width="140" />
          <el-table-column label="需求" min-width="140">
            <template #default="{ row: v }">
              <template v-if="v.requirementsConfig">
                <el-tag
                  v-for="(val, key) in v.requirementsConfig"
                  :key="key"
                  size="small"
                  class="contact-tag"
                >
                  {{ key }}：{{ val }}
                </el-tag>
              </template>
            </template>
          </el-table-column>
        </el-table>

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
                class="contact-link"
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
      </template>
    </el-dialog>

    <el-dialog
      v-model="bindDialogVisible"
      title="绑定联系人"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-select v-model="bindContactIds" multiple filterable placeholder="选择要绑定的联系人" style="width:100%">
        <el-option
          v-for="c in contactList"
          :key="c.id"
          :value="c.id"
          :label="`${c.contactName}（${c.contactPhone}）`"
        />
      </el-select>
      <template #footer>
        <el-button @click="bindDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="bindLoading" @click="handleBindContacts">确定</el-button>
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

    <el-dialog v-model="visitDetailVisible" title="来访详情" width="600px" :close-on-click-modal="false">
      <template v-if="visitDetail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="来访日期">{{ visitDetail.visitDate }}</el-descriptions-item>
          <el-descriptions-item label="客户">{{ visitDetail.clientName }}</el-descriptions-item>
          <el-descriptions-item label="渠道">{{ visitDetail.channelTypeName || '-' }}
            <template v-if="visitDetail.channelInstanceName"> / {{ visitDetail.channelInstanceName }}</template>
          </el-descriptions-item>
          <el-descriptions-item label="详情说明" :span="2">{{ visitDetail.detailDescription || '-' }}</el-descriptions-item>
        </el-descriptions>

        <h4 class="section-title">带看房源</h4>
        <el-table v-if="visitDetail.houses?.length" :data="visitDetail.houses" size="small" stripe>
          <el-table-column prop="houseName" label="房源名称" />
        </el-table>
        <el-empty v-else description="无带看房源" :image-size="60" />

        <h4 v-if="visitDetail.requirementsConfig && Object.keys(visitDetail.requirementsConfig).length" class="section-title">需求清单</h4>
        <el-table v-if="visitDetail.requirementsConfig && Object.keys(visitDetail.requirementsConfig).length" :data="visitReqTableData" size="small" stripe>
          <el-table-column prop="key" label="需求项" />
          <el-table-column prop="value" label="内容" />
        </el-table>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  getClientList,
  getClientDetail,
  createClient,
  updateClient,
  bindClientContacts,
  unbindClientContact,
  releaseToPublicPool,
  type ClientRecord,
  type ClientDetail,
} from '@/api/client'
import { getDealList, type DealRecord } from '@/api/deal'
import { getContactList, getContactDetail, type ContactRecord } from '@/api/contact'
import { getHouseList, getHouseDetail, type HouseDetail } from '@/api/house'
import { createVisit, getVisitDetail, type VisitRecord } from '@/api/visit'
import { getChannelList, getAgencyList, type ChannelRecord, type AgencyRecord } from '@/api/channel'
import { getParamByKey } from '@/api/system'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const loading = ref(false)
const dialogVisible = ref(false)
const submitLoading = ref(false)
const isEdit = ref(false)
const editId = ref(0)
const formRef = ref<FormInstance>()
const tableData = ref<ClientRecord[]>([])
const total = ref(0)
const contactList = ref<ContactRecord[]>([])

const detailVisible = ref(false)
const detail = ref<ClientDetail | null>(null)
const clientDeals = ref<DealRecord[]>([])

const houseDetailVisible = ref(false)
const houseDetail = ref<HouseDetail | null>(null)

const bindDialogVisible = ref(false)
const bindLoading = ref(false)
const bindContactIds = ref<number[]>([])
const releaseLoading = ref(false)

const contactDetailVisible = ref(false)
const contactDetail = ref<ContactRecord | null>(null)

const visitDetailVisible = ref(false)
const visitDetail = ref<VisitRecord | null>(null)

const visitReqTableData = computed(() => {
  if (!visitDetail.value?.requirementsConfig) return []
  return Object.entries(visitDetail.value.requirementsConfig).map(([key, value]) => ({ key, value }))
})

const query = reactive({
  keyword: '',
  status: '' as string,
  page: 1,
  size: 10,
})

const idTypeOptions = [
  '身份证',
  '护照',
  '港澳通行证',
  '台胞证',
  '军官证',
  '士兵证',
  '营业执照',
]

const form = reactive({
  clientName: '',
  idType: '',
  idNumber: '',
  contactIds: [] as number[],
  newContacts: [] as { contactName: string; contactPhone: string; model?: string; agencyId?: number }[],
})

const formRules: FormRules = {
  clientName: [{ required: true, message: '请输入客户姓名', trigger: 'blur' }],
  contactIds: [
    {
      required: true,
      validator: (_rule, _value, callback) => {
        if (isEdit.value) {
          if (!form.contactIds.length) {
            callback(new Error('请至少关联一个联系人'))
          } else {
            callback()
          }
        } else {
          if (!form.contactIds.length && !form.newContacts.length) {
            callback(new Error('请至少选择一个已有联系人或新建联系人'))
          } else {
            callback()
          }
        }
      },
      trigger: 'change',
    },
  ],
}

const visitForm = reactive({
  visitDate: '',
  houseIds: [] as number[],
  channelId: undefined as number | undefined,
  channelInstanceId: undefined as number | undefined,
  channelInstanceName: '',
  detailDescription: '',
  reqValues: {} as Record<string, string>,
})

const houseList = ref<{ id: number; houseName: string }[]>([])
const channelList = ref<ChannelRecord[]>([])
const agencyList = ref<AgencyRecord[]>([])
const visitSelectedChannel = ref<ChannelRecord | null>(null)
const contactAgencyList = ref<{ id: number; companyName: string }[]>([])
const modelOptions = ['个人', '中介公司', '其他组织']
const reqSchema = ref<{ key: string; type: string }[]>([])

function formatTime(dateStr: string) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

async function fetchList() {
  loading.value = true
  try {
    const params: any = { page: query.page, size: query.size }
    if (query.keyword) params.keyword = query.keyword
    if (query.status) params.status = query.status
    const res = await getClientList(params)
    tableData.value = res.records
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  query.page = 1
  fetchList()
}

function handleReset() {
  query.keyword = ''
  query.status = ''
  query.page = 1
  fetchList()
}

function resetForm() {
  form.clientName = ''
  form.idType = ''
  form.idNumber = ''
  form.contactIds = []
  form.newContacts = []
  contactAgencyList.value = []
  visitForm.visitDate = ''
  visitForm.houseIds = []
  visitForm.channelId = undefined
  visitForm.channelInstanceId = undefined
  visitForm.channelInstanceName = ''
  visitForm.detailDescription = ''
  visitForm.reqValues = {}
  visitSelectedChannel.value = null
  agencyList.value = []
  formRef.value?.resetFields()
}

async function fetchContactOptions() {
  const res = await getContactList({ page: 1, size: 200 })
  contactList.value = res.records
}

async function fetchVisitOptions() {
  const [housesRes, channelsRes] = await Promise.all([
    getHouseList({ page: 1, size: 200, houseStatus: 'idle' }),
    getChannelList({ page: 1, size: 50 }),
  ])
  houseList.value = housesRes.records.map((h) => ({ id: h.id, houseName: h.houseName }))
  channelList.value = channelsRes.records
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

async function onVisitChannelChange(channelId: number | undefined) {
  visitForm.channelInstanceId = undefined
  visitForm.channelInstanceName = ''
  agencyList.value = []
  if (channelId) {
    visitSelectedChannel.value = channelList.value.find((c) => c.id === channelId) || null
    if (visitSelectedChannel.value?.instanceType === 'agency') {
      const res = await getAgencyList(channelId, { page: 1, size: 200 })
      agencyList.value = res.records
    }
  } else {
    visitSelectedChannel.value = null
  }
}

function buildVisitPayload(clientId: number) {
  const requirementsConfig: Record<string, string> = {}
  Object.entries(visitForm.reqValues).forEach(([key, val]) => {
    if (val) requirementsConfig[key] = val
  })
  const payload: any = {
    visitDate: visitForm.visitDate || undefined,
    clientId,
    houseIds: visitForm.houseIds.length ? visitForm.houseIds : undefined,
    channelId: visitForm.channelId,
    detailDescription: visitForm.detailDescription || undefined,
    requirementsConfig: Object.keys(requirementsConfig).length ? requirementsConfig : undefined,
  }
  if (visitForm.channelId && visitSelectedChannel.value?.instanceType === 'agency') {
    payload.channelInstanceId = visitForm.channelInstanceId
  } else if (visitForm.channelId) {
    payload.channelInstanceName = visitForm.channelInstanceName || undefined
  }
  return payload
}

async function openCreateDialog() {
  isEdit.value = false
  editId.value = 0
  resetForm()
  await Promise.all([fetchContactOptions(), fetchVisitOptions(), fetchReqSchema(), fetchAllAgencies()])
  dialogVisible.value = true
}

async function openEditDialog(id: number) {
  isEdit.value = true
  editId.value = id
  resetForm()
  await fetchContactOptions()
  try {
    const d = await getClientDetail(id)
    form.clientName = d.clientName
    form.idType = d.idType || ''
    form.idNumber = d.idNumber || ''
    form.contactIds = d.contacts?.map((c) => c.id) || []
    dialogVisible.value = true
  } catch {
    ElMessage.error('获取客户详情失败')
  }
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitLoading.value = true
  try {
    const payload: any = {
      clientName: form.clientName,
      idType: form.idType || undefined,
      idNumber: form.idNumber || undefined,
    }
    if (form.contactIds.length) {
      payload.contactIds = form.contactIds
    }
    const validNewContacts = form.newContacts
      .filter((nc) => nc.contactName && nc.contactPhone)
      .map((nc) => ({
        contactName: nc.contactName,
        contactPhone: nc.contactPhone,
        model: nc.model || undefined,
        agencyId: nc.model === '中介公司' ? nc.agencyId : undefined,
      }))
    if (validNewContacts.length) {
      payload.newContacts = validNewContacts
    }

    if (isEdit.value) {
      await updateClient(editId.value, payload)
      ElMessage.success('修改成功')
    } else {
      const clientId = await createClient(payload)
      if (visitForm.visitDate || visitForm.houseIds.length > 0 || visitForm.channelId || visitForm.detailDescription) {
        try {
          await createVisit(buildVisitPayload(clientId))
        } catch {
          ElMessage.warning('客户已创建，但来访记录添加失败')
        }
      }
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchList()
  } finally {
    submitLoading.value = false
  }
}

async function fetchAllAgencies() {
  contactAgencyList.value = []
  try {
    const channelsRes = await getChannelList({ page: 1, size: 50, instanceType: 'agency' })
    for (const ch of channelsRes.records) {
      const res = await getAgencyList(ch.id, { page: 1, size: 200 })
      for (const a of res.records) {
        contactAgencyList.value.push({ id: a.id, companyName: a.companyName })
      }
    }
  } catch { /* ignore */ }
}

function onNewContactModelChange(index: number) {
  const nc = form.newContacts[index]
  if (nc) nc.agencyId = undefined
}

function addNewContact() {
  form.newContacts.push({ contactName: '', contactPhone: '', model: undefined, agencyId: undefined })
  formRef.value?.validateField('contactIds')
}

function removeNewContact(index: number) {
  form.newContacts.splice(index, 1)
  formRef.value?.validateField('contactIds')
}

async function openDetailDialog(row: ClientRecord) {
  detail.value = null
  clientDeals.value = []
  detailVisible.value = true
  try {
    const [d, dealsRes] = await Promise.all([
      getClientDetail(row.id),
      getDealList({ clientId: row.id, size: 50 }),
    ])
    detail.value = d
    clientDeals.value = dealsRes.records
  } catch {
    ElMessage.error('获取客户详情失败')
    detailVisible.value = false
  }
}

async function openBindContactDialog() {
  bindContactIds.value = []
  await fetchContactOptions()
  bindDialogVisible.value = true
}

async function handleBindContacts() {
  if (!detail.value || !bindContactIds.value.length) return
  bindLoading.value = true
  try {
    await bindClientContacts(detail.value.id, bindContactIds.value)
    ElMessage.success('绑定成功')
    bindDialogVisible.value = false
    detail.value = await getClientDetail(detail.value.id)
  } finally {
    bindLoading.value = false
  }
}

function handleUnbindContact(contactId: number) {
  if (!detail.value) return
  ElMessageBox.confirm(
    '确认解除该联系人与客户的关联吗？',
    '解绑确认',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' },
  )
    .then(async () => {
      await unbindClientContact(detail.value!.id, contactId)
      ElMessage.success('已解绑')
      detail.value = await getClientDetail(detail.value!.id)
    })
    .catch(() => {})
}

function handleReleaseToPool(row: ClientDetail) {
  ElMessageBox.confirm(
    `确认将客户「${row.clientName}」投放至公海吗？投放后该客户将从您的客户列表中移除。`,
    '投放确认',
    { confirmButtonText: '确定投放', cancelButtonText: '取消', type: 'warning' },
  )
    .then(async () => {
      releaseLoading.value = true
      try {
        await releaseToPublicPool(row.id)
        ElMessage.success('已投放至公海')
        detailVisible.value = false
        fetchList()
      } finally {
        releaseLoading.value = false
      }
    })
    .catch(() => {})
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

async function openVisitDetailPopup(id: number) {
  visitDetail.value = null
  visitDetailVisible.value = true
  try {
    visitDetail.value = await getVisitDetail(id)
  } catch {
    ElMessage.error('获取来访详情失败')
    visitDetailVisible.value = false
  }
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.client-page {
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

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.detail-header-actions {
  display: flex;
  gap: 8px;
}

.contact-tag {
  margin-right: 4px;
  margin-bottom: 2px;
}

.clickable-tag {
  cursor: pointer;
}

.contact-link {
  margin-right: 4px;
}

.section-title {
  margin: 20px 0 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.new-contact-wrap {
}

.new-contact-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.requirements-wrap {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.req-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.req-label {
  width: 100px;
  font-size: 13px;
  color: #606266;
  flex-shrink: 0;
}
</style>
