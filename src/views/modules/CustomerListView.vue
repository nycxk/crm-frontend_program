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

      <el-table :data="tableData" v-loading="loading" stripe>
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
              <el-tag v-for="c in row.contacts" :key="c.id" size="small" class="contact-tag">
                {{ c.contactName }} {{ c.contactPhone }}
              </el-tag>
            </template>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">{{ formatTime(row.createTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openDetailDialog(row.id)">详情</el-button>
            <el-button link size="small" :disabled="row.createdBy !== userStore.userId" @click="openEditDialog(row.id)">编辑</el-button>
            <el-button link type="danger" size="small" :disabled="row.createdBy !== userStore.userId" @click="handleDelete(row)">删除</el-button>
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
      :title="isEdit ? '编辑客户' : '新增客户'"
      width="560px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
        <el-form-item label="客户姓名" prop="clientName">
          <el-input v-model="form.clientName" placeholder="请输入客户姓名" maxlength="32" />
        </el-form-item>
        <el-form-item label="证件类型">
          <el-input v-model="form.idType" placeholder="如：身份证" maxlength="32" />
        </el-form-item>
        <el-form-item label="证件编号">
          <el-input v-model="form.idNumber" placeholder="证件类型和编号须同时填写" maxlength="64" />
        </el-form-item>

        <el-divider v-if="!isEdit">联系人</el-divider>

        <el-form-item v-if="!isEdit" label="已有联系人">
          <el-select v-model="form.contactIds" multiple filterable placeholder="选择已有联系人" style="width:100%">
            <el-option
              v-for="c in contactList"
              :key="c.id"
              :value="c.id"
              :label="`${c.contactName}（${c.contactPhone}）`"
            />
          </el-select>
        </el-form-item>

        <el-form-item v-if="isEdit" label="关联联系人">
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
              <el-input v-model="nc.contactName" placeholder="姓名" style="width:130px" />
              <el-input v-model="nc.contactPhone" placeholder="手机号" style="width:150px" />
              <el-button link type="danger" size="small" @click="removeNewContact(index)">删除</el-button>
            </div>
            <el-button size="small" type="primary" @click="addNewContact">+ 添加联系人</el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="detailVisible"
      title="客户详情"
      width="800px"
      :close-on-click-modal="false"
    >
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
        <el-table :data="detail.contacts" size="small" stripe>
          <el-table-column prop="contactName" label="姓名" />
          <el-table-column prop="contactPhone" label="电话" />
          <el-table-column prop="model" label="从属类型" />
          <el-table-column prop="remark" label="备注" />
          <el-table-column label="操作" width="80">
            <template #default="{ row: c }">
              <el-button link type="danger" size="small" @click="handleUnbindContact(c.id)">解绑</el-button>
            </template>
          </el-table-column>
        </el-table>

        <h4 class="section-title">来访记录</h4>
        <el-table :data="detail.visits" size="small" stripe>
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
                @click="openHouseDetailPopup(h.id)"
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  getClientList,
  getClientDetail,
  createClient,
  updateClient,
  deleteClient,
  bindClientContacts,
  unbindClientContact,
  type ClientRecord,
  type ClientDetail,
} from '@/api/client'
import { getDealList, type DealRecord } from '@/api/deal'
import { getContactList, type ContactRecord } from '@/api/contact'
import { getHouseDetail, type HouseDetail } from '@/api/house'
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

const query = reactive({
  keyword: '',
  status: '' as string,
  page: 1,
  size: 10,
})

const form = reactive({
  clientName: '',
  idType: '',
  idNumber: '',
  contactIds: [] as number[],
  newContacts: [] as { contactName: string; contactPhone: string }[],
})

const formRules: FormRules = {
  clientName: [{ required: true, message: '请输入客户姓名', trigger: 'blur' }],
}

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
  formRef.value?.resetFields()
}

async function fetchContactOptions() {
  const res = await getContactList({ page: 1, size: 200 })
  contactList.value = res.records
}

function openCreateDialog() {
  isEdit.value = false
  editId.value = 0
  resetForm()
  fetchContactOptions()
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
    const validNewContacts = form.newContacts.filter((nc) => nc.contactName && nc.contactPhone)
    if (validNewContacts.length) {
      payload.newContacts = validNewContacts
    }

    if (isEdit.value) {
      await updateClient(editId.value, payload)
      ElMessage.success('修改成功')
    } else {
      await createClient(payload)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchList()
  } finally {
    submitLoading.value = false
  }
}

function addNewContact() {
  form.newContacts.push({ contactName: '', contactPhone: '' })
}

function removeNewContact(index: number) {
  form.newContacts.splice(index, 1)
}

function handleDelete(row: ClientRecord) {
  ElMessageBox.confirm(
    `确认删除客户「${row.clientName}」吗？`,
    '删除确认',
    { confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning' },
  )
    .then(async () => {
      await deleteClient(row.id)
      ElMessage.success('已删除')
      fetchList()
    })
    .catch(() => {})
}

async function openDetailDialog(id: number) {
  detail.value = null
  clientDeals.value = []
  detailVisible.value = true
  try {
    const [d, dealsRes] = await Promise.all([
      getClientDetail(id),
      getDealList({ clientId: id, size: 50 }),
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

.contact-tag {
  margin-right: 4px;
  margin-bottom: 2px;
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
</style>
