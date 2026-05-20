import { get, post, put, del } from '@/utils/request'
import type { PageResult, HouseBrief } from './visit'

export interface VisitDraftRecord {
  id: number
  visitDate: string | null
  clientId: number | null
  clientName: string | null
  houseIds: number[]
  houses: HouseBrief[]
  channelId: number | null
  channelTypeName: string | null
  channelInstanceId: number | null
  channelInstanceName: string | null
  detailDescription: string | null
  requirementsConfig: Record<string, string> | null
  createdBy: number
  createTime: string
  updateTime: string
}

export interface VisitDraftQuery {
  page?: number
  size?: number
  clientId?: number
  keyword?: string
}

export interface VisitDraftSaveParams {
  visitDate?: string
  clientId?: number
  houseIds?: number[]
  channelId?: number
  channelInstanceId?: number
  channelInstanceName?: string
  detailDescription?: string
  requirementsConfig?: Record<string, string>
}

export function getVisitDraftList(query: VisitDraftQuery): Promise<PageResult<VisitDraftRecord>> {
  return get('/api/visit-drafts', query)
}
export function getVisitDraftDetail(id: number): Promise<VisitDraftRecord> {
  return get(`/api/visit-drafts/${id}`)
}
export function createVisitDraft(data: VisitDraftSaveParams): Promise<number> {
  return post('/api/visit-drafts', data)
}
export function updateVisitDraft(id: number, data: VisitDraftSaveParams): Promise<null> {
  return put(`/api/visit-drafts/${id}`, data)
}
export function deleteVisitDraft(id: number): Promise<null> {
  return del(`/api/visit-drafts/${id}`)
}
