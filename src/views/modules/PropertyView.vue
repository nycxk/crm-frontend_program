<template>
  <div class="house-page">
    <el-card class="search-card">
      <el-form :inline="true" :model="query" class="search-form">
        <el-form-item label="关键字">
          <el-input v-model="query.keyword" placeholder="名称/坐落/描述" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="经营部">
          <el-select v-model="query.operationDepartmentId" clearable filterable placeholder="全部" style="width:180px" @change="handleSearch">
            <el-option
              v-for="d in searchOperationDeptList"
              :key="d.id"
              :value="d.id"
              :label="d.departmentName"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="项目部">
          <el-select v-model="query.departmentId" clearable filterable placeholder="全部" style="width:180px" @change="handleSearch">
            <el-option
              v-for="d in deptList"
              :key="d.id"
              :value="d.id"
              :label="d.departmentName"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.houseStatus" clearable placeholder="全部" style="width:120px" @change="handleSearch">
            <el-option
              v-for="item in houseStatusOptions"
              :key="item.value"
              :value="item.value"
              :label="item.label"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="适租面积(㎡)">
          <div class="area-range">
            <el-input-number
              v-model="query.rentableAreaMin"
              :min="0"
              :precision="2"
              controls-position="right"
              placeholder="最小"
              clearable
              style="width: 120px"
            />
            <span class="area-range-sep">-</span>
            <el-input-number
              v-model="query.rentableAreaMax"
              :min="0"
              :precision="2"
              controls-position="right"
              placeholder="最大"
              clearable
              style="width: 120px"
            />
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
        <el-form-item label="业态" class="business-type-filter">
          <el-radio-group v-model="query.businessType" @change="handleSearch">
            <el-radio-button value="">全部</el-radio-button>
            <el-radio-button
              v-for="item in businessTypeOptions"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>房源列表</span>
          <el-button v-if="userStore.canWrite" type="primary" @click="openCreateDialog">新增房源</el-button>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" stripe highlight-current-row @row-click="openDetailFromRow">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="houseName" label="房源名称" min-width="140" />
        <el-table-column label="面积(㎡)" min-width="200">
          <template #default="{ row }">
            <span v-if="row.rentableArea">适租:{{ row.rentableArea }}</span>
            <span v-if="row.totalArea"> 总:{{ row.totalArea }}</span>
            <span v-if="row.certificatedArea"> 证:{{ row.certificatedArea }}</span>
            <span v-if="!row.rentableArea && !row.totalArea">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="location" label="坐落" min-width="120" show-overflow-tooltip />
        <el-table-column label="业态" width="90">
          <template #default="{ row }">{{ row.businessTypeName || '-' }}</template>
        </el-table-column>
        <el-table-column label="城区" width="90">
          <template #default="{ row }">{{ row.beijingDistrict || '-' }}</template>
        </el-table-column>
        <el-table-column label="报价" width="100" align="right">
          <template #default="{ row }">
            <span v-if="row.guidePrice">{{ row.guidePrice.priceValue }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column v-if="userStore.canViewAssessedPrice" label="评估价" width="100" align="right">
          <template #default="{ row }">
            <span v-if="row.assessedPrice">{{ row.assessedPrice.priceValue }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="departmentName" label="项目部" width="100" />
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="houseStatusTagType(row.houseStatus)" size="small">
              {{ row.houseStatusName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="图片" width="80" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.images?.length" size="small" type="success">{{ row.images.length }}张</el-tag>
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
      :title="isEdit ? '编辑房源' : '新增房源'"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="120px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="房源名称" prop="houseName">
              <el-input v-model="form.houseName" placeholder="请输入房源名称" maxlength="64" />
            </el-form-item>
            <el-form-item label="适租面积" prop="rentableArea">
              <el-input v-model="form.rentableArea" type="number" placeholder="㎡">
                <template #suffix>㎡</template>
              </el-input>
            </el-form-item>
            <el-form-item label="不适租面积" prop="nonRentableArea">
              <el-input v-model="form.nonRentableArea" type="number" placeholder="㎡">
                <template #suffix>㎡</template>
              </el-input>
            </el-form-item>
            <el-form-item label="总面积" prop="totalArea">
              <el-input v-model="form.totalArea" type="number" placeholder="㎡">
                <template #suffix>㎡</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="有证面积" prop="certificatedArea">
              <el-input v-model="form.certificatedArea" type="number" placeholder="㎡">
                <template #suffix>㎡</template>
              </el-input>
            </el-form-item>
            <el-form-item label="无证面积" prop="uncertificatedArea">
              <el-input v-model="form.uncertificatedArea" type="number" placeholder="㎡">
                <template #suffix>㎡</template>
              </el-input>
            </el-form-item>
            <el-form-item label="坐落位置">
              <el-input v-model="form.location" placeholder="如：XX路88号" maxlength="128" />
            </el-form-item>
            <el-form-item label="水电气暖">
              <el-input v-model="form.utilityStatus" type="textarea" :rows="2" placeholder="如水、电、气、暖开通情况" maxlength="500" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="房源业态">
              <el-select v-model="form.businessType" clearable placeholder="请选择" style="width:100%">
                <el-option v-for="item in businessTypeOptions" :key="item.value" :value="item.value" :label="item.label" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="装修等级">
              <el-select v-model="form.decorationGrade" clearable placeholder="请选择" style="width:100%">
                <el-option v-for="item in decorationGradeOptions" :key="item.value" :value="item.value" :label="item.label" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="北京城区">
              <el-select v-model="form.beijingDistrict" clearable filterable placeholder="请选择" style="width:100%">
                <el-option v-for="item in beijingDistrictOptions" :key="item.value" :value="item.value" :label="item.label" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="环数">
              <el-select v-model="form.ringRoad" clearable placeholder="请选择" style="width:100%">
                <el-option v-for="item in ringRoadOptions" :key="item.value" :value="item.value" :label="item.label" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="描述">
              <el-input v-model="form.description" type="textarea" :rows="2" placeholder="房源描述" maxlength="256" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="报价(元/㎡)" prop="guidePriceValue" :required="!isEdit">
              <el-input
                v-model="form.guidePriceValue"
                type="number"
                :placeholder="isEdit ? '选填' : '必填'"
                @blur="validatePriceDateField('guidePriceDate')"
              />
            </el-form-item>
            <el-form-item label="报价日期" prop="guidePriceDate" :required="!isEdit || !!form.guidePriceValue">
              <el-date-picker
                v-model="form.guidePriceDate"
                type="date"
                value-format="YYYY-MM-DD"
                :placeholder="isEdit ? '选填' : '必填'"
                style="width:100%"
              />
            </el-form-item>
          </el-col>
          <el-col v-if="userStore.canManageAssessedPrice" :span="12">
            <el-form-item label="评估价(元/㎡)" prop="assessedPriceValue" :required="!isEdit">
              <el-input
                v-model="form.assessedPriceValue"
                type="number"
                :placeholder="isEdit ? '选填' : '必填'"
                @blur="validatePriceDateField('assessedPriceDate')"
              />
            </el-form-item>
            <el-form-item label="评估价日期" prop="assessedPriceDate" :required="!isEdit || !!form.assessedPriceValue">
              <el-date-picker
                v-model="form.assessedPriceDate"
                type="date"
                value-format="YYYY-MM-DD"
                :placeholder="isEdit ? '选填' : '必填'"
                style="width:100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="房源状态">
          <el-select
            v-model="form.houseStatus"
            placeholder="请选择状态"
            style="width:100%"
          >
            <el-option
              v-for="item in houseStatusEditableOptions"
              :key="item.value"
              :value="item.value"
              :label="item.label"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="所属项目部" prop="departmentId">
          <el-select v-model="form.departmentId" filterable placeholder="请选择项目部" style="width:100%" @change="onProjectChange">
            <el-option
              v-for="d in projectDeptList"
              :key="d.id"
              :value="d.id"
              :label="d.departmentName"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="所属经营部" prop="operationDepartmentId">
          <el-select v-model="form.operationDepartmentId" filterable placeholder="请选择经营部" style="width:100%">
            <el-option
              v-for="d in operationDeptList"
              :key="d.id"
              :value="d.id"
              :label="d.departmentName"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="房源图片">
          <div class="image-upload-wrap">
            <div class="image-list">
              <div v-for="(url, index) in form.images" :key="index" class="image-item">
                <el-image
                  :src="resolveImageUrl(url)"
                  :preview-src-list="form.images.map(u => resolveImageUrl(u))"
                  :initial-index="index"
                  fit="cover"
                  class="thumb-img"
                />
                <el-icon class="remove-btn" :size="18" @click="removeImage(index)"><CircleCloseFilled /></el-icon>
              </div>
            </div>
            <el-upload
              :show-file-list="false"
              :http-request="handleUpload"
              :before-upload="beforeUpload"
              accept="image/*"
              class="upload-btn"
            >
              <el-button size="small" type="primary" :loading="uploading">+ 上传图片</el-button>
            </el-upload>
          </div>
        </el-form-item>
      </el-form>

      <template v-if="isEdit && editPriceData">
        <el-divider />
        <h4 class="section-title">报价版本历史</h4>
        <el-table v-if="editPriceData.guidePrices?.length" :data="editPriceData.guidePrices" size="small" stripe>
          <el-table-column prop="versionName" label="版本" width="100" />
          <el-table-column prop="priceValue" label="价格(元/㎡)" width="120" />
          <el-table-column prop="effectiveDate" label="生效日期" width="120" />
          <el-table-column label="失效日期" width="120">
            <template #default="{ row }">{{ row.expiryDate || '至今' }}</template>
          </el-table-column>
          <el-table-column label="操作" width="80">
            <template #default="{ $index }">
              <el-button
                v-if="$index === 0"
                link
                type="danger"
                size="small"
                :loading="rollbackLoading"
                :disabled="editPriceData.guidePrices.length <= 1"
                @click="handleRollback('guide')"
              >
                回退
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-else description="暂无报价数据" :image-size="60" />

        <template v-if="userStore.canViewAssessedPrice">
        <h4 class="section-title">评估价版本历史</h4>
        <el-table v-if="editPriceData.assessedPrices?.length" :data="editPriceData.assessedPrices" size="small" stripe>
          <el-table-column prop="versionName" label="版本" width="100" />
          <el-table-column prop="priceValue" label="价格(元/㎡)" width="120" />
          <el-table-column prop="effectiveDate" label="生效日期" width="120" />
          <el-table-column label="失效日期" width="120">
            <template #default="{ row }">{{ row.expiryDate || '至今' }}</template>
          </el-table-column>
          <el-table-column v-if="userStore.canManageAssessedPrice" label="操作" width="80">
            <template #default="{ $index }">
              <el-button
                v-if="$index === 0"
                link
                type="danger"
                size="small"
                :loading="rollbackLoading"
                :disabled="editPriceData.assessedPrices.length <= 1"
                @click="handleRollback('assessed')"
              >
                回退
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-else description="暂无评估价数据" :image-size="60" />
        </template>
      </template>

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
          <span>房源详情</span>
          <div class="detail-header-actions">
            <el-button v-if="userStore.canWrite" type="primary" size="small" @click="detail && openEditDialog(detail.house.id)">编辑</el-button>
          </div>
        </div>
      </template>
      <template v-if="detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="房源名称">{{ detail.house.houseName }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="houseStatusTagType(detail.house.houseStatus)" size="small">
              {{ detail.house.houseStatusName }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="项目部">{{ detail.house.departmentName }}</el-descriptions-item>
          <el-descriptions-item label="所属经营部">{{ detail.house.operationDepartmentName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="适租面积">{{ detail.house.rentableArea || '-' }} ㎡</el-descriptions-item>
          <el-descriptions-item label="总面积">{{ detail.house.totalArea || '-' }} ㎡</el-descriptions-item>
          <el-descriptions-item label="有证面积">{{ detail.house.certificatedArea || '-' }} ㎡</el-descriptions-item>
          <el-descriptions-item label="坐落">{{ detail.house.location || '-' }}</el-descriptions-item>
          <el-descriptions-item label="房源业态">{{ detail.house.businessTypeName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="装修等级">{{ detail.house.decorationGrade || '-' }}</el-descriptions-item>
          <el-descriptions-item label="北京城区">{{ detail.house.beijingDistrict || '-' }}</el-descriptions-item>
          <el-descriptions-item label="环数">{{ detail.house.ringRoadName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">{{ detail.house.description || '-' }}</el-descriptions-item>
          <el-descriptions-item label="水电气暖" :span="2">{{ detail.house.utilityStatus || '-' }}</el-descriptions-item>
        </el-descriptions>

        <h4 class="section-title">房源图片</h4>
        <div v-if="detail.house.images?.length" class="images-grid">
          <el-image
            v-for="(url, idx) in detail.house.images"
            :key="idx"
            :src="resolveImageUrl(url)"
            :preview-src-list="detail.house.images.map(u => resolveImageUrl(u))"
            :initial-index="idx"
            fit="cover"
            style="width:140px; height:140px; border-radius:4px;"
          />
        </div>
        <el-empty v-else description="暂无图片" :image-size="60" />

        <h4 class="section-title">报价历史</h4>
        <el-table v-if="detail.guidePrices?.length" :data="detail.guidePrices" size="small" stripe>
          <el-table-column prop="versionName" label="版本" width="100" />
          <el-table-column prop="priceValue" label="价格(元/㎡)" width="120" />
          <el-table-column prop="effectiveDate" label="生效日期" width="120" />
          <el-table-column label="失效日期" width="120">
            <template #default="{ row }">{{ row.expiryDate || '至今' }}</template>
          </el-table-column>
          <el-table-column label="创建时间" width="160">
            <template #default="{ row }">{{ formatTime(row.createTime) }}</template>
          </el-table-column>
        </el-table>
        <el-empty v-else description="暂无报价数据" :image-size="60" />

        <template v-if="userStore.canViewAssessedPrice">
        <h4 class="section-title">评估价历史</h4>
        <el-table v-if="detail.assessedPrices?.length" :data="detail.assessedPrices" size="small" stripe>
          <el-table-column prop="versionName" label="版本" width="100" />
          <el-table-column prop="priceValue" label="价格(元/㎡)" width="120" />
          <el-table-column prop="effectiveDate" label="生效日期" width="120" />
          <el-table-column label="失效日期" width="120">
            <template #default="{ row }">{{ row.expiryDate || '至今' }}</template>
          </el-table-column>
          <el-table-column label="创建时间" width="160">
            <template #default="{ row }">{{ formatTime(row.createTime) }}</template>
          </el-table-column>
        </el-table>
        <el-empty v-else description="暂无评估价数据" :image-size="60" />
        </template>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { CircleCloseFilled } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { UploadRequestOptions } from 'element-plus'
import {
  getHouseList,
  getHouseDetail,
  createHouse,
  updateHouse,
  rollbackGuidePrice,
  rollbackAssessedPrice,
  resolveImageUrl,
  type HouseRecord,
  type HouseDetail,
  type PriceRecord,
} from '@/api/house'
import { uploadFile } from '@/api/file'
import { getDepartmentList, getDepartmentTree, getParentOperationDepartment, type DepartmentRecord } from '@/api/system'
import { useUserStore } from '@/stores/user'
import {
  HOUSE_BUSINESS_TYPE_OPTIONS,
  HOUSE_DECORATION_GRADE_OPTIONS,
  BEIJING_DISTRICT_OPTIONS,
  HOUSE_RING_ROAD_OPTIONS,
} from '@/constants/house-meta'
import {
  HOUSE_STATUS_OPTIONS,
  HOUSE_STATUS_EDITABLE_OPTIONS,
  houseStatusTagType,
} from '@/constants/house-status'

const businessTypeOptions = HOUSE_BUSINESS_TYPE_OPTIONS
const decorationGradeOptions = HOUSE_DECORATION_GRADE_OPTIONS
const beijingDistrictOptions = BEIJING_DISTRICT_OPTIONS
const ringRoadOptions = HOUSE_RING_ROAD_OPTIONS
const houseStatusOptions = HOUSE_STATUS_OPTIONS
const houseStatusEditableOptions = HOUSE_STATUS_EDITABLE_OPTIONS

const userStore = useUserStore()

const loading = ref(false)
const dialogVisible = ref(false)
const submitLoading = ref(false)
const uploading = ref(false)
const isEdit = ref(false)
const editId = ref(0)
const formRef = ref<FormInstance>()
const tableData = ref<HouseRecord[]>([])
const total = ref(0)
const deptList = ref<DepartmentRecord[]>([])
const searchOperationDeptList = ref<DepartmentRecord[]>([])
const projectDeptList = ref<DepartmentRecord[]>([])
const operationDeptList = ref<DepartmentRecord[]>([])
const deptTree = ref<DepartmentRecord[]>([])

const detailVisible = ref(false)
const detail = ref<HouseDetail | null>(null)

const editPriceData = ref<{ guidePrices: PriceRecord[]; assessedPrices: PriceRecord[] } | null>(null)
const rollbackLoading = ref(false)

const query = reactive({
  keyword: '',
  operationDepartmentId: undefined as number | undefined,
  departmentId: undefined as number | undefined,
  houseStatus: '' as string,
  businessType: '' as string,
  rentableAreaMin: undefined as number | undefined,
  rentableAreaMax: undefined as number | undefined,
  page: 1,
  size: 10,
})

const form = reactive({
  houseName: '',
  rentableArea: '',
  nonRentableArea: '',
  totalArea: '',
  certificatedArea: '',
  uncertificatedArea: '',
  location: '',
  description: '',
  businessType: '',
  decorationGrade: '',
  beijingDistrict: '',
  ringRoad: '',
  utilityStatus: '',
  houseStatus: 'rentable',
  departmentId: undefined as number | undefined,
  operationDepartmentId: undefined as number | undefined,
  images: [] as string[],
  guidePriceValue: '',
  guidePriceDate: '',
  assessedPriceValue: '',
  assessedPriceDate: '',
})

function validateNumber(_rule: any, value: string, cb: any) {
  if (!value) return cb()
  const n = Number(value)
  if (isNaN(n) || n < 0) return cb(new Error('请输入有效数字'))
  cb()
}

function validateGuidePriceValue(_rule: any, value: string, cb: any) {
  if (!isEdit.value && !value) {
    return cb(new Error('请填写报价'))
  }
  if (!value) return cb()
  const n = Number(value)
  if (isNaN(n) || n < 0) return cb(new Error('请输入有效数字'))
  cb()
}

function validateAssessedPriceValue(_rule: any, value: string, cb: any) {
  if (!userStore.canManageAssessedPrice) return cb()
  if (!isEdit.value && !value) {
    return cb(new Error('请填写评估价'))
  }
  if (!value) return cb()
  const n = Number(value)
  if (isNaN(n) || n < 0) return cb(new Error('请输入有效数字'))
  cb()
}

function validateGuidePriceDate(_rule: any, value: string, cb: any) {
  if (!isEdit.value) {
    if (!value) return cb(new Error('请填写报价日期'))
    return cb()
  }
  if (form.guidePriceValue && !value) {
    return cb(new Error('请填写报价日期'))
  }
  cb()
}

function validateAssessedPriceDate(_rule: any, value: string, cb: any) {
  if (!userStore.canManageAssessedPrice) return cb()
  if (!isEdit.value) {
    if (!value) return cb(new Error('请填写评估价日期'))
    return cb()
  }
  if (form.assessedPriceValue && !value) {
    return cb(new Error('请填写评估价日期'))
  }
  cb()
}

function validatePriceDateField(field: 'guidePriceDate' | 'assessedPriceDate') {
  formRef.value?.validateField(field).catch(() => {})
}

const formRules: FormRules = {
  houseName: [{ required: true, message: '请输入房源名称', trigger: 'blur' }],
  departmentId: [{ required: true, message: '请选择项目部', trigger: 'change' }],
  operationDepartmentId: [{ required: true, message: '请选择经营部', trigger: 'change' }],
  rentableArea: [{ validator: validateNumber, trigger: 'blur' }],
  nonRentableArea: [{ validator: validateNumber, trigger: 'blur' }],
  totalArea: [{ validator: validateNumber, trigger: 'blur' }],
  certificatedArea: [{ validator: validateNumber, trigger: 'blur' }],
  uncertificatedArea: [{ validator: validateNumber, trigger: 'blur' }],
  guidePriceValue: [{ validator: validateGuidePriceValue, trigger: 'blur' }],
  guidePriceDate: [{ validator: validateGuidePriceDate, trigger: 'change' }],
  assessedPriceValue: [{ validator: validateAssessedPriceValue, trigger: 'blur' }],
  assessedPriceDate: [{ validator: validateAssessedPriceDate, trigger: 'change' }],
}

function formatTime(s: string) { return s ? new Date(s).toLocaleString('zh-CN') : '-' }

async function fetchList() {
  loading.value = true
  try {
    const params: any = { page: query.page, size: query.size }
    if (query.keyword) params.keyword = query.keyword
    if (query.operationDepartmentId) params.operationDepartmentId = query.operationDepartmentId
    if (query.departmentId) params.departmentId = query.departmentId
    if (query.houseStatus) params.houseStatus = query.houseStatus
    if (query.businessType) params.businessType = query.businessType
    if (query.rentableAreaMin != null) params.rentableAreaMin = query.rentableAreaMin
    if (query.rentableAreaMax != null) params.rentableAreaMax = query.rentableAreaMax
    const res = await getHouseList(params)
    tableData.value = res.records
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function findDeptInTree(tree: DepartmentRecord[], id: number): DepartmentRecord | null {
  for (const d of tree) {
    if (d.id === id) return d
    if (d.children) {
      const found = findDeptInTree(d.children, id)
      if (found) return found
    }
  }
  return null
}

function getProjectDeptsUnder(tree: DepartmentRecord[], operationId: number): DepartmentRecord[] {
  for (const d of tree) {
    if (d.id === operationId) {
      return d.children?.filter((c) => c.departmentType === 'project') || []
    }
    if (d.children) {
      const found = getProjectDeptsUnder(d.children, operationId)
      if (found.length) return found
    }
  }
  return []
}

function resolveUserDepts(tree: DepartmentRecord[]): DepartmentRecord[] {
  return (userStore.departmentIds || [])
    .map((id) => findDeptInTree(tree, id))
    .filter((d): d is DepartmentRecord => !!d)
}

async function fetchDeptList() {
  const [projectRes, operationRes, tree] = await Promise.all([
    getDepartmentList({ page: 1, size: 200, departmentType: 'project' }),
    getDepartmentList({ page: 1, size: 200, departmentType: 'operation' }),
    getDepartmentTree(),
  ])
  deptList.value = projectRes.records
  searchOperationDeptList.value = operationRes.records
  deptTree.value = tree

  const userDepts = resolveUserDepts(tree)

  if (userDepts.length && userDepts.every((d) => d.departmentType === 'project')) {
    projectDeptList.value = userDepts
    const parents = userDepts
      .map((d) => findDeptInTree(tree, d.parentId))
      .filter((d): d is DepartmentRecord => !!d && d.departmentType === 'operation')
    operationDeptList.value = [...new Map(parents.map((d) => [d.id, d])).values()]
  } else if (userDepts.length && userDepts.every((d) => d.departmentType === 'operation')) {
    operationDeptList.value = userDepts
    projectDeptList.value = userDepts.flatMap((d) => getProjectDeptsUnder(tree, d.id))
  } else {
    operationDeptList.value = flatTree(tree).filter((d) => d.departmentType === 'operation')
    projectDeptList.value = projectRes.records
  }
}

function flatTree(nodes: DepartmentRecord[]): DepartmentRecord[] {
  const result: DepartmentRecord[] = []
  nodes.forEach((n) => {
    result.push(n)
    if (n.children?.length) result.push(...flatTree(n.children))
  })
  return result
}

function handleSearch() {
  query.page = 1
  fetchList()
}

function handleReset() {
  query.keyword = ''
  query.operationDepartmentId = undefined
  query.departmentId = undefined
  query.houseStatus = ''
  query.businessType = ''
  query.rentableAreaMin = undefined
  query.rentableAreaMax = undefined
  query.page = 1
  fetchList()
}

function resetForm() {
  form.houseName = ''
  form.rentableArea = ''
  form.nonRentableArea = ''
  form.totalArea = ''
  form.certificatedArea = ''
  form.uncertificatedArea = ''
  form.location = ''
  form.description = ''
  form.businessType = ''
  form.decorationGrade = ''
  form.beijingDistrict = ''
  form.ringRoad = ''
  form.utilityStatus = ''
  form.houseStatus = 'rentable'
  form.departmentId = undefined
  form.operationDepartmentId = undefined
  form.images = []
  form.guidePriceValue = ''
  form.guidePriceDate = ''
  form.assessedPriceValue = ''
  form.assessedPriceDate = ''
  formRef.value?.resetFields()
}

function onProjectChange(projectId: number | undefined) {
  if (!projectId) {
    form.operationDepartmentId = undefined
    return
  }
  getParentOperationDepartment(projectId).then((op) => {
    if (op && !operationDeptList.value.find((d) => d.id === op.id)) {
      operationDeptList.value = [op]
    }
    form.operationDepartmentId = op.id
  }).catch(() => {
    form.operationDepartmentId = undefined
  })
}

async function openCreateDialog() {
  isEdit.value = false
  editId.value = 0
  resetForm()

  if (deptTree.value.length) {
    const userDepts = resolveUserDepts(deptTree.value)
    // 仅当用户唯一归属一个部门时才自动带出默认值；多部门时由用户自行选择
    if (userDepts.length === 1) {
      const userDept = userDepts[0]
      if (userDept.departmentType === 'project') {
        form.departmentId = userDept.id
        try {
          const op = await getParentOperationDepartment(userDept.id)
          if (!operationDeptList.value.find((d) => d.id === op.id)) {
            operationDeptList.value = [op]
          }
          form.operationDepartmentId = op.id
        } catch {}
      } else if (userDept.departmentType === 'operation') {
        form.operationDepartmentId = userDept.id
      }
    }
  }

  dialogVisible.value = true
}

async function openEditDialog(id: number) {
  isEdit.value = true
  editId.value = id
  resetForm()
  editPriceData.value = null
  try {
    const d = await getHouseDetail(id)
    const h = d.house
    form.houseName = h.houseName
    form.rentableArea = h.rentableArea ? String(h.rentableArea) : ''
    form.nonRentableArea = h.nonRentableArea ? String(h.nonRentableArea) : ''
    form.totalArea = h.totalArea ? String(h.totalArea) : ''
    form.certificatedArea = h.certificatedArea ? String(h.certificatedArea) : ''
    form.uncertificatedArea = h.uncertificatedArea ? String(h.uncertificatedArea) : ''
    form.location = h.location || ''
    form.description = h.description || ''
    form.businessType = h.businessType || ''
    form.decorationGrade = h.decorationGrade || ''
    form.beijingDistrict = h.beijingDistrict || ''
    form.ringRoad = h.ringRoad || ''
    form.utilityStatus = h.utilityStatus || ''
    form.houseStatus = h.houseStatus || 'rentable'
    form.departmentId = h.departmentId
    form.operationDepartmentId = h.operationDepartmentId
    if (h.departmentId && !operationDeptList.value.find((d) => d.id === h.operationDepartmentId)) {
      try {
        const op = await getParentOperationDepartment(h.departmentId)
        if (!operationDeptList.value.find((d) => d.id === op.id)) {
          operationDeptList.value = [op]
        }
      } catch {}
    }
    form.images = h.images || []
    editPriceData.value = {
      guidePrices: d.guidePrices || [],
      assessedPrices: d.assessedPrices || [],
    }
    dialogVisible.value = true
  } catch {
    ElMessage.error('获取房源详情失败')
  }
}

async function openDetailDialog(id: number) {
  detail.value = null
  detailVisible.value = true
  try {
    detail.value = await getHouseDetail(id)
  } catch {
    ElMessage.error('获取房源详情失败')
    detailVisible.value = false
  }
}

function openDetailFromRow(row: HouseRecord) {
  openDetailDialog(row.id)
}

function beforeUpload(file: File) {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('仅支持图片格式')
    return false
  }
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    ElMessage.error('图片大小不超过10MB')
    return false
  }
  return true
}

async function handleUpload(options: UploadRequestOptions) {
  uploading.value = true
  try {
    const res = await uploadFile(options.file, 'house')
    form.images.push(res.url)
    ElMessage.success('上传成功')
  } catch {
    ElMessage.error('上传失败')
  } finally {
    uploading.value = false
  }
}

function removeImage(index: number) {
  form.images.splice(index, 1)
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitLoading.value = true
  try {
    const payload: any = {
      houseName: form.houseName,
      departmentId: form.departmentId,
      operationDepartmentId: form.operationDepartmentId,
      rentableArea: form.rentableArea ? Number(form.rentableArea) : undefined,
      nonRentableArea: form.nonRentableArea ? Number(form.nonRentableArea) : undefined,
      totalArea: form.totalArea ? Number(form.totalArea) : undefined,
      certificatedArea: form.certificatedArea ? Number(form.certificatedArea) : undefined,
      uncertificatedArea: form.uncertificatedArea ? Number(form.uncertificatedArea) : undefined,
      location: form.location || undefined,
      description: form.description || undefined,
      businessType: form.businessType,
      decorationGrade: form.decorationGrade,
      beijingDistrict: form.beijingDistrict,
      ringRoad: form.ringRoad,
      utilityStatus: form.utilityStatus || undefined,
      images: form.images,
      houseStatus: form.houseStatus,
    }

    if (form.guidePriceValue && form.guidePriceDate) {
      payload.guidePrice = {
        priceValue: Number(form.guidePriceValue),
        effectiveDate: form.guidePriceDate,
      }
    }
    if (userStore.canManageAssessedPrice && form.assessedPriceValue && form.assessedPriceDate) {
      payload.assessedPrice = {
        priceValue: Number(form.assessedPriceValue),
        effectiveDate: form.assessedPriceDate,
      }
    }

    if (isEdit.value) {
      await updateHouse(editId.value, payload)
      ElMessage.success('修改成功')
    } else {
      await createHouse(payload)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchList()
  } finally {
    submitLoading.value = false
  }
}

async function handleRollback(type: 'guide' | 'assessed') {
  if (!editId.value || !editPriceData.value) return
  ElMessageBox.confirm(
    `确认回退${type === 'guide' ? '报价' : '评估价'}到上一版本吗？`,
    '版本回退',
    { confirmButtonText: '确定回退', cancelButtonText: '取消', type: 'warning' },
  )
    .then(async () => {
      rollbackLoading.value = true
      try {
        const result = type === 'guide'
          ? await rollbackGuidePrice(editId.value)
          : await rollbackAssessedPrice(editId.value)
        ElMessage.success(`${type === 'guide' ? '报价' : '评估价'}已回退到${result.versionName}`)
        const d = await getHouseDetail(editId.value)
        editPriceData.value = {
          guidePrices: d.guidePrices || [],
          assessedPrices: d.assessedPrices || [],
        }
        if (type === 'guide') {
          form.guidePriceValue = ''
          form.guidePriceDate = ''
        } else {
          form.assessedPriceValue = ''
          form.assessedPriceDate = ''
        }
      } catch {
        ElMessage.error('回退失败')
      } finally {
        rollbackLoading.value = false
      }
    })
    .catch(() => {})
}

onMounted(() => {
  fetchList()
  fetchDeptList()
})
</script>

<style scoped>
.house-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-card :deep(.el-card__body) {
  padding-bottom: 0;
}

.business-type-filter {
  display: flex;
  width: 100%;
  margin-right: 0;
}

.business-type-filter :deep(.el-form-item__content) {
  flex: 1;
}

.business-type-filter :deep(.el-radio-group) {
  display: flex;
  flex-wrap: wrap;
}

.area-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.area-range-sep {
  color: #909399;
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

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.form-hint {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}

.image-upload-wrap {
  width: 100%;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.image-item {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #dcdfe6;
}

.thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: -4px;
  right: -4px;
  color: #f56c6c;
  cursor: pointer;
  background: #fff;
  border-radius: 50%;
}

.upload-btn {
  display: inline-block;
}

.section-title {
  margin: 20px 0 12px;
}

.images-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
