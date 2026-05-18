import { get, post, put, del } from '@/utils/request'

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
