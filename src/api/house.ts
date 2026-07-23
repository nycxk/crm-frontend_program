import { get, post, put, del } from '@/utils/request'
import axios from 'axios'

export interface PriceRecord {
  id: number
  priceValue: number
  version: number
  priceVisionId: number | null
  versionName: string
  effectiveDate: string
  expiryDate: string | null
  createTime: string
  updateTime: string
}

export interface PriceInput {
  priceValue: number
  effectiveDate: string
  expiryDate?: string | null
}

export interface HouseRecord {
  id: number
  houseName: string
  rentableArea: number
  nonRentableArea: number
  totalArea: number
  certificatedArea: number
  uncertificatedArea: number
  location: string | null
  description: string | null
  images: string[]
  departmentId: number
  departmentName: string
  operationDepartmentId: number
  operationDepartmentName: string
  houseStatus: string
  houseStatusName: string
  businessType: string | null
  businessTypeName: string | null
  decorationGrade: string | null
  beijingDistrict: string | null
  ringRoad: string | null
  ringRoadName: string | null
  utilityStatus: string | null
  guidePrice: PriceRecord | null
  assessedPrice: PriceRecord | null
  createTime: string
  updateTime: string
}

export interface HouseDetail {
  house: HouseRecord
  guidePrices: PriceRecord[]
  assessedPrices: PriceRecord[]
}

export interface HouseQuery {
  page?: number
  size?: number
  keyword?: string
  departmentId?: number
  /** 所属经营部 ID */
  operationDepartmentId?: number
  houseStatus?: string
  /** 适租面积下限（㎡，含） */
  rentableAreaMin?: number
  /** 适租面积上限（㎡，含） */
  rentableAreaMax?: number
  /** 房源业态编码 */
  businessType?: string
}

export interface HouseSaveParams {
  houseName: string
  rentableArea?: number
  nonRentableArea?: number
  totalArea?: number
  certificatedArea?: number
  uncertificatedArea?: number
  location?: string
  description?: string
  images?: string[]
  departmentId: number
  operationDepartmentId?: number
  businessType?: string
  decorationGrade?: string
  beijingDistrict?: string
  ringRoad?: string
  utilityStatus?: string
  houseStatus?: string
  guidePrice?: PriceInput
  assessedPrice?: PriceInput
}

export interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

export function resolveImageUrl(url: string): string {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('/')) return url
  const base = (import.meta.env.VITE_API_BASE_URL as string) || ''
  return `${base}/uploads/${url}`
}

export function getHouseList(query: HouseQuery): Promise<PageResult<HouseRecord>> {
  return get('/api/houses', query)
}

/** 按当前筛选条件导出房源 Excel（字段与列表一致） */
export async function exportHouseList(query: Omit<HouseQuery, 'page' | 'size'> = {}) {
  const base = (import.meta.env.VITE_API_BASE_URL as string) || ''
  const token = localStorage.getItem('token')
  const resp = await axios.get(`${base}/api/houses/export`, {
    params: query,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    responseType: 'blob',
  })
  const contentTypeHeader = resp.headers['content-type']
  const contentType = typeof contentTypeHeader === 'string' ? contentTypeHeader : ''
  if (contentType.includes('application/json')) {
    const text = await (resp.data as Blob).text()
    const json = JSON.parse(text) as { message?: string }
    throw new Error(json.message || '导出失败')
  }
  const disposition = resp.headers['content-disposition'] as string | undefined
  let filename = `房源列表_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.xlsx`
  const match = disposition?.match(/filename\*=UTF-8''([^;]+)/i)
  if (match?.[1]) {
    filename = decodeURIComponent(match[1])
  }
  const url = window.URL.createObjectURL(new Blob([resp.data]))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

/** 分页拉全量房源（不受单次 size 上限限制） */
export async function getAllHouseList(
  query: Omit<HouseQuery, 'page' | 'size'> = {},
  pageSize = 500,
): Promise<HouseRecord[]> {
  const all: HouseRecord[] = []
  let page = 1
  while (true) {
    const res = await getHouseList({ ...query, page, size: pageSize })
    all.push(...res.records)
    if (all.length >= res.total || res.records.length === 0) break
    page++
  }
  return all
}
export function getHouseDetail(id: number): Promise<HouseDetail> {
  return get(`/api/houses/${id}`)
}
export function createHouse(data: HouseSaveParams): Promise<number> {
  return post('/api/houses', data)
}
export function updateHouse(id: number, data: Partial<HouseSaveParams>): Promise<null> {
  return put(`/api/houses/${id}`, data)
}
export function deleteHouse(id: number): Promise<null> {
  return del(`/api/houses/${id}`)
}
export function rollbackGuidePrice(id: number): Promise<PriceRecord> {
  return post(`/api/houses/${id}/guide-prices/rollback`)
}
export function rollbackAssessedPrice(id: number): Promise<PriceRecord> {
  return post(`/api/houses/${id}/assessed-prices/rollback`)
}
