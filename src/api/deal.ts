import { get, post, put, del } from '@/utils/request'

export interface DealHouse {
  id: number
  houseName: string
}

export interface DealClient {
  id: number
  clientName: string
}

export interface DealUser {
  id: number
  username: string
}

export interface DealPrice {
  id: number
  priceValue?: number
  houseName?: string
}

export interface DealRecord {
  id: number
  houseIds: number[]
  houses: DealHouse[]
  clientIds: number[]
  clients: DealClient[]
  channelTypeId: number | null
  channelTypeName: string | null
  channelInstanceId: number | null
  channelInstanceModel: string | null
  channelInstanceName: string | null
  guidePriceId: number | null
  guidePrice: DealPrice | null
  assessedPriceId: number | null
  assessedPrice: DealPrice | null
  rentalArea: number
  contractTotalAmount: number
  unitPrice: number
  contractSignDate: string
  contractStartDate: string
  contractEndDate: string | null
  actualEndDate: string | null
  dealRemark: string | null
  dealBusinessUserId: number
  dealBusinessUser: DealUser | null
  contactBusinessUserId: number | null
  contactBusinessUser: DealUser | null
  createTime: string
  updateTime: string
}

export interface DealQuery {
  page?: number
  size?: number
  keyword?: string
  channelTypeId?: number
  clientId?: number
  houseId?: number
  dealBusinessUserId?: number
  contractSignDateFrom?: string
  contractSignDateTo?: string
}

export interface DealSaveParams {
  houseIds: number[]
  clientIds: number[]
  channelTypeId: number
  channelInstanceId?: number
  channelInstanceName?: string
  rentalArea: number
  contractTotalAmount: number
  unitPrice: number
  contractSignDate: string
  contractStartDate: string
  contractEndDate: string
  dealRemark: string
  contactBusinessUserId?: number
}

export interface CheckoutParams {
  actualEndDate: string
}

export interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

export function getDealList(query: DealQuery): Promise<PageResult<DealRecord>> {
  return get('/api/deals', query)
}
export function getDealDetail(id: number): Promise<DealRecord> {
  return get(`/api/deals/${id}`)
}
export function createDeal(data: DealSaveParams): Promise<number> {
  return post('/api/deals', data)
}
export function updateDeal(id: number, data: Partial<DealSaveParams>): Promise<null> {
  return put(`/api/deals/${id}`, data)
}
export function checkoutDeal(id: number, data: CheckoutParams): Promise<null> {
  return post(`/api/deals/${id}/checkout`, data)
}
export function deleteDeal(id: number): Promise<null> {
  return del(`/api/deals/${id}`)
}
