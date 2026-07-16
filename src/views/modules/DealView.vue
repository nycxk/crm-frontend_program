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
            <el-button v-if="userStore.canWrite" @click="openDraftDialog">草稿箱</el-button>
            <el-button v-if="userStore.canWrite" type="primary" @click="openCreateDialog">新建成交</el-button>
          </div>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" stripe highlight-current-row @row-click="openDetailDialog">
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
              @click.stop="openClientDetailPopup(c.id)"
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
              @click.stop="openHouseDetailPopup(h.id)"
            >{{ h.houseName }}</el-button>
          </template>
        </el-table-column>
        <el-table-column label="合同总额" width="120" align="right">
          <template #default="{ row }">{{ row.contractTotalAmount?.toLocaleString() || '-' }}</template>
        </el-table-column>
        <el-table-column label="单价" width="100" align="right">
          <template #default="{ row }">{{ row.unitPrice?.toLocaleString() || '-' }}</template>
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
      width="760px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="isDraft ? {} : formRules" label-width="100px" class="deal-form">
        <div class="deal-form-grid">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="客户" prop="clientIds">
                <div class="client-check-row">
                  <el-select v-model="form.clientIds" multiple filterable clearable placeholder="至少选一个客户" style="flex:1">
                    <el-option v-for="c in clientList" :key="c.id" :value="c.id" :label="c.clientName" />
                  </el-select>
                  <el-button :disabled="!form.clientIds.length" :loading="checkIdLoading" @click="handleCheckIdNumber">检验客户</el-button>
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="房源" prop="houseIds">
                <el-select v-model="form.houseIds" multiple filterable clearable placeholder="请选择内部招租房源" style="width:100%" @change="onHouseIdsChange">
                  <el-option v-for="h in rentalHouseList" :key="h.id" :value="h.id" :label="h.houseName" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="渠道类型" prop="channelTypeId">
                <el-select v-model="form.channelTypeId" filterable placeholder="选择渠道" style="width:100%" @change="onChannelChange">
                  <el-option v-for="ch in channelList" :key="ch.id" :value="ch.id" :label="ch.typeName" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <ChannelInstanceFields
                v-if="form.channelTypeId"
                :channel="selectedChannel"
                v-model:channel-instance-id="form.channelInstanceId"
                v-model:channel-instance-name="form.channelInstanceName"
              />
              <el-form-item v-else label="渠道实例">
                <el-input disabled placeholder="请先选择渠道类型" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="租赁面积" prop="rentalArea">
                <el-input v-model="form.rentalArea" placeholder="请输入租赁面积">
                  <template #suffix>㎡</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="单价" prop="unitPrice">
                <el-input v-model="form.unitPrice" placeholder="请输入单价" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="合同总额" prop="contractTotalAmount">
                <el-input v-model="form.contractTotalAmount" placeholder="请输入合同总额" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="签订日期" prop="contractSignDate">
                <el-date-picker v-model="form.contractSignDate" type="date" value-format="YYYY-MM-DD" style="width:100%" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="起租日期" prop="contractStartDate">
                <el-date-picker v-model="form.contractStartDate" type="date" value-format="YYYY-MM-DD" style="width:100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="退租日期" prop="contractEndDate">
                <el-date-picker v-model="form.contractEndDate" type="date" value-format="YYYY-MM-DD" style="width:100%" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <el-form-item label="备注" prop="dealRemark" class="deal-form-remark">
          <el-input v-model="form.dealRemark" type="textarea" :rows="2" placeholder="请输入成交备注" maxlength="256" />
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
        <el-button v-if="userStore.canWrite" type="primary" size="small" @click="openDraftCreate">新增草稿</el-button>
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
        <el-table-column v-if="userStore.canWrite" label="操作" width="200" fixed="right">
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

    <el-dialog v-model="detailVisible" width="800px" :close-on-click-modal="false">
      <template #header>
        <div class="detail-header">
          <span>成交详情</span>
          <div v-if="userStore.canWrite" class="detail-header-actions">
            <el-button
              type="primary"
              size="small"
              :disabled="!detail || !!detail.actualEndDate || detail.contactBusinessUserId !== userStore.userId"
              @click="detail && openEditDialog(detail.id)"
            >编辑</el-button>
            <el-button
              type="warning"
              size="small"
              :disabled="!detail || !!detail.actualEndDate || detail.contactBusinessUserId !== userStore.userId"
              @click="detail && openCheckoutDialog(detail)"
            >退租</el-button>
          </div>
        </div>
      </template>
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
          <el-descriptions-item label="单价">{{ detail.unitPrice?.toLocaleString() }}</el-descriptions-item>
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
          <el-table-column prop="detailDescription" label="接访概要" min-width="120" />
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
        <el-button v-if="userStore.canWrite" type="primary" @click="startDealFromClient(clientDetail)">继续添加成交</el-button>
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
            <el-tag :type="houseStatusTagType(houseDetail.house.houseStatus)" size="small">
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

        <h4 class="section-title">报价历史</h4>
        <el-table v-if="houseDetail.guidePrices?.length" :data="houseDetail.guidePrices" size="small" stripe>
          <el-table-column prop="versionName" label="版本" width="100" />
          <el-table-column prop="priceValue" label="价格(元/㎡)" width="120" />
          <el-table-column prop="effectiveDate" label="生效日期" width="120" />
          <el-table-column label="失效日期" width="120">
            <template #default="{ row }">{{ row.expiryDate || '至今' }}</template>
          </el-table-column>
        </el-table>
        <el-empty v-else description="暂无报价数据" :image-size="60" />

        <template v-if="userStore.canViewAssessedPrice">
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
      </template>
      <template #footer>
        <el-button @click="houseDetailVisible = false">关闭</el-button>
        <el-button
          v-if="userStore.canWrite && isHouseAvailableForDeal(houseDetail?.house.houseStatus)"
          type="primary"
          @click="startDealFromHouse"
        >继续添加成交</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="incompleteClientVisible" title="待完善客户" width="550px" :close-on-click-modal="false">
      <el-alert
        type="warning"
        :closable="false"
        show-icon
        style="margin-bottom:12px"
      >
        以下客户证件信息不完整，请在成交前完善。
      </el-alert>
      <el-table :data="incompleteClients" size="small" stripe>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="clientName" label="客户姓名" />
        <el-table-column v-if="userStore.canWrite" label="操作" width="80">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openClientEditPopup(row)">
              修改
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <el-dialog v-model="clientEditVisible" title="修改客户证件信息" width="420px" :close-on-click-modal="false">
      <el-form ref="clientEditFormRef" :model="clientEditForm" label-width="80px">
        <el-form-item label="证件类型">
          <el-select v-model="clientEditForm.idType" clearable filterable allow-create placeholder="选择或输入" style="width:100%">
            <el-option v-for="t in idTypeOptions" :key="t" :value="t" :label="t" />
          </el-select>
        </el-form-item>
        <el-form-item label="证件编号">
          <el-input v-model="clientEditForm.idNumber" placeholder="请输入证件编号" maxlength="64" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="clientEditVisible = false">取消</el-button>
        <el-button type="primary" :loading="clientEditLoading" @click="saveClientEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  getDealList, getDealDetail, createDeal, updateDeal, checkoutDeal,
  type DealRecord,
} from '@/api/deal'
import {
  getDealDraftList, createDealDraft, updateDealDraft, deleteDealDraft,
  type DealDraftRecord,
} from '@/api/deal-draft'
import { getClientList, getClientDetail, checkIdNumber, updateClient, mergeClients, type ClientRecord, type ClientDetail } from '@/api/client'
import { getHouseList, getHouseDetail, type HouseRecord, type HouseDetail } from '@/api/house'
import { getInternalRentList } from '@/api/internal-rent'
import { getChannelList, type ChannelRecord } from '@/api/channel'
import { appendChannelInstancePayload, validateChannelInstance } from '@/utils/channel-instance'
import ChannelInstanceFields from '@/components/ChannelInstanceFields.vue'
import { useUserStore } from '@/stores/user'
import { houseStatusTagType, isHouseAvailableForDeal } from '@/constants/house-status'

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
const rentalHouseList = ref<HouseRecord[]>([])
const channelList = ref<ChannelRecord[]>([])
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
const checkIdLoading = ref(false)
const incompleteClientVisible = ref(false)
const incompleteClients = ref<ClientRecord[]>([])
const clientEditVisible = ref(false)
const clientEditLoading = ref(false)
const clientEditFormRef = ref<FormInstance>()
const clientEditForm = reactive({ idType: '', idNumber: '', clientId: 0 })
const idTypeOptions = ['身份证', '护照', '港澳通行证', '台胞证', '营业执照']
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
  unitPrice: '',
  contractSignDate: '',
  contractStartDate: '',
  contractEndDate: '',
  dealRemark: '',
})

const formRules: FormRules = {
  clientIds: [{ required: true, message: '至少选择一个客户', trigger: 'change' }],
  houseIds: [{ required: true, message: '至少选择一个房源', trigger: 'change' }],
  channelTypeId: [{ required: true, message: '请选择渠道类型', trigger: 'change' }],
  rentalArea: [{
    required: true,
    validator: (_rule, value, callback) => {
      const text = String(value ?? '').trim()
      if (!text) {
        callback(new Error('请输入租赁面积'))
        return
      }
      const num = Number(text)
      if (!Number.isFinite(num) || num <= 0) {
        callback(new Error('租赁面积必须大于0'))
        return
      }
      callback()
    },
    trigger: 'blur',
  }],
  contractTotalAmount: [{
    required: true,
    validator: (_rule, value, callback) => {
      const text = String(value ?? '').trim()
      if (!text) {
        callback(new Error('请输入合同总额'))
        return
      }
      const num = Number(text)
      if (!Number.isFinite(num) || num <= 0) {
        callback(new Error('合同总额必须大于0'))
        return
      }
      callback()
    },
    trigger: 'blur',
  }],
  unitPrice: [{
    required: true,
    validator: (_rule, value, callback) => {
      const text = String(value ?? '').trim()
      if (!text) {
        callback(new Error('请输入单价'))
        return
      }
      const num = Number(text)
      if (!Number.isFinite(num) || num <= 0) {
        callback(new Error('单价必须大于0'))
        return
      }
      callback()
    },
    trigger: 'blur',
  }],
  contractSignDate: [{ required: true, message: '请选择签订日期', trigger: 'blur' }],
  contractStartDate: [{ required: true, message: '请选择起租日期', trigger: 'blur' }],
  contractEndDate: [{ required: true, message: '请选择退租日期', trigger: 'blur' }],
  dealRemark: [{
    required: true,
    validator: (_rule, value, callback) => {
      if (!(value || '').trim()) {
        callback(new Error('请输入成交备注'))
        return
      }
      callback()
    },
    trigger: 'blur',
  }],
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
  form.unitPrice = d.unitPrice ? String(d.unitPrice) : ''
  form.contractSignDate = d.contractSignDate || ''
  form.contractStartDate = d.contractStartDate || ''
  form.contractEndDate = d.contractEndDate || ''
  form.dealRemark = d.dealRemark || ''
  selectedChannel.value = null
}

function buildDealPayload() {
  const payload: any = {
    clientIds: form.clientIds,
    houseIds: form.houseIds,
    channelTypeId: form.channelTypeId,
    rentalArea: Number(form.rentalArea),
    contractTotalAmount: Number(form.contractTotalAmount),
    unitPrice: Number(form.unitPrice),
    contractSignDate: form.contractSignDate,
    contractStartDate: form.contractStartDate,
    contractEndDate: form.contractEndDate,
    dealRemark: form.dealRemark.trim(),
  }
  if (form.channelTypeId) {
    appendChannelInstancePayload(
      payload,
      selectedChannel.value,
      form.channelInstanceId,
      form.channelInstanceName,
    )
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
  const [cl, hl, chl, rentalsRes] = await Promise.all([
    getClientList({ page: 1, size: 200 }),
    getHouseList({ page: 1, size: 200, houseStatus: 'rentable' }),
    getChannelList({ page: 1, size: 50 }),
    getInternalRentList({ page: 1, size: 200, status: 'active' }),
  ])
  clientList.value = cl.records
  houseList.value = hl.records
  channelList.value = chl.records
  const rentalHouseIds = new Set(rentalsRes.records.map((r) => r.houseId))
  rentalHouseList.value = hl.records.filter((h) => rentalHouseIds.has(h.id))
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
  form.unitPrice = ''
  form.contractSignDate = ''
  form.contractStartDate = ''
  form.contractEndDate = ''
  form.dealRemark = ''
  selectedChannel.value = null
  formRef.value?.resetFields()
}

async function onChannelChange(id: number | undefined) {
  form.channelInstanceId = undefined
  form.channelInstanceName = ''
  if (id) {
    selectedChannel.value = channelList.value.find((c) => c.id === id) || null
  } else {
    selectedChannel.value = null
  }
}

function onHouseIdsChange(ids: number[]) {
  if (!ids.length) return
  const total = ids.reduce((sum, id) => {
    const h = rentalHouseList.value.find((item) => item.id === id)
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
    form.unitPrice = d.unitPrice ? String(d.unitPrice) : ''
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

  const channelInstanceError = validateChannelInstance(
    selectedChannel.value,
    form.channelInstanceId,
    form.channelInstanceName,
  )
  if (channelInstanceError) {
    ElMessage.error(channelInstanceError)
    return
  }

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

async function openDetailDialog(row: DealRecord) {
  detail.value = null; detailVisible.value = true
  try { detail.value = await getDealDetail(row.id) }
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
  const [detailResult, dealsResult] = await Promise.allSettled([
    getClientDetail(id),
    getDealList({ clientId: id, size: 50 }),
  ])
  if (detailResult.status === 'rejected') {
    ElMessage.error('获取客户详情失败')
    clientDetailVisible.value = false
    return
  }
  clientDetail.value = detailResult.value
  clientDeals.value = dealsResult.status === 'fulfilled' ? dealsResult.value.records : []
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

async function handleCheckIdNumber() {
  if (!form.clientIds.length) return
  checkIdLoading.value = true
  try {
    const res = await checkIdNumber(form.clientIds)
    if (!res.missingIdNumberClientIds.length) {
      ElMessage.success('所选客户证件信息完整')
      return
    }
    incompleteClients.value = clientList.value.filter((c) => res.missingIdNumberClientIds.includes(c.id))
    incompleteClientVisible.value = true
  } catch {
    ElMessage.error('检验失败')
  } finally {
    checkIdLoading.value = false
  }
}

function openClientEditPopup(row: ClientRecord) {
  clientEditForm.clientId = row.id
  clientEditForm.idType = row.idType || ''
  clientEditForm.idNumber = row.idNumber || ''
  clientEditVisible.value = true
}

async function saveClientEdit() {
  clientEditLoading.value = true
  try {
    await updateClient(clientEditForm.clientId, {
      idType: clientEditForm.idType || undefined,
      idNumber: clientEditForm.idNumber || undefined,
    })
    ElMessage.success('修改成功')
    clientEditVisible.value = false
    const idx = incompleteClients.value.findIndex((c) => c.id === clientEditForm.clientId)
    if (idx !== -1) {
      incompleteClients.value.splice(idx, 1)
      if (!incompleteClients.value.length) {
        incompleteClientVisible.value = false
        ElMessage.success('所有客户证件信息已完善')
      }
    }
  } catch (err: any) {
    if (err.__apiCode === 2003 && err.__apiData) {
      const target = err.__apiData
      clientEditLoading.value = false
      ElMessageBox.confirm(
        `证件编号已被客户「${target.clientName}」使用，是否将当前客户合并到该客户？`,
        '证件编号已存在',
        { confirmButtonText: '确定合并', cancelButtonText: '取消', type: 'warning' },
      ).then(async () => {
        try {
          await mergeClients([clientEditForm.clientId], target.id)
          ElMessage.success('合并成功')
          clientEditVisible.value = false
          incompleteClientVisible.value = false
          incompleteClients.value = []
          if (detailVisible.value) {
            detailVisible.value = false
          }
          fetchList()
          fetchOptions()
        } catch {
          ElMessage.error('合并失败')
        }
      }).catch(() => {})
      return
    }
    ElMessage.error('修改失败')
  } finally {
    clientEditLoading.value = false
  }
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
  nextTick(() => formRef.value?.clearValidate())
}

async function editDraft(row: DealDraftRecord) {
  draftDialogVisible.value = false
  isEdit.value = false; isDraft.value = true; editId.value = 0; draftId.value = row.id
  resetForm()
  fillFormFromDealDraft(row)
  dialogVisible.value = true
  await nextTick()
  formRef.value?.clearValidate()
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
.detail-header { display: flex; justify-content: space-between; align-items: center; width: 100%; }
.detail-header-actions { display: flex; gap: 8px; }
.item-tag { margin-right: 4px; margin-bottom: 2px; }
.item-link { margin-right: 4px; }
.section-title { margin: 20px 0 12px; }
.pagination-wrap { display: flex; justify-content: flex-end; margin-top: 16px; }
.client-check-row { display: flex; gap: 8px; align-items: center; width: 100%; }
.deal-form-grid :deep(.el-form-item) { margin-bottom: 18px; }
.deal-form-remark { margin-top: 4px; margin-bottom: 0; }
</style>
