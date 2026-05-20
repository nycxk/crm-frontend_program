import { get, post, put, del } from '@/utils/request'
import type { DealHouse, DealClient, DealUser, DealPrice, PageResult } from './deal'

export interface DealDraftRecord {
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
  rentalArea: number | null
  contractTotalAmount: number | null
  contractSignDate: string | null
  contractStartDate: string | null
  contractEndDate: string | null
  dealRemark: string | null
  dealBusinessUserId: number | null
  dealBusinessUser: DealUser | null
  contactBusinessUserId: number | null
  contactBusinessUser: DealUser | null
  createdBy: number
  createTime: string
  updateTime: string
}

export interface DealDraftQuery {
  page?: number
  size?: number
  keyword?: string
  clientId?: number
  houseId?: number
}

export interface DealDraftSaveParams {
  houseIds?: number[]
  clientIds?: number[]
  channelTypeId?: number
  channelInstanceId?: number
  channelInstanceName?: string
  channelInstanceModel?: string
  rentalArea?: number
  contractTotalAmount?: number
  contractSignDate?: string
  contractStartDate?: string
  contractEndDate?: string
  dealRemark?: string
  dealBusinessUserId?: number
  contactBusinessUserId?: number
}

export function getDealDraftList(query: DealDraftQuery): Promise<PageResult<DealDraftRecord>> {
  return get('/api/deal-drafts', query)
}
export function getDealDraftDetail(id: number): Promise<DealDraftRecord> {
  return get(`/api/deal-drafts/${id}`)
}
export function createDealDraft(data: DealDraftSaveParams): Promise<number> {
  return post('/api/deal-drafts', data)
}
export function updateDealDraft(id: number, data: DealDraftSaveParams): Promise<null> {
  return put(`/api/deal-drafts/${id}`, data)
}
export function deleteDealDraft(id: number): Promise<null> {
  return del(`/api/deal-drafts/${id}`)
}
