import { get, post, put, del } from '@/utils/request'

export interface HouseBrief {
  id: number
  houseName: string
}

export interface VisitRecord {
  id: number
  visitDate: string
  clientId: number
  clientName: string
  houseIds: number[]
  houses: HouseBrief[]
  channelId: number | null
  channelTypeName: string
  channelInstanceId: number | null
  channelInstanceName: string
  detailDescription: string
  requirementsConfig: Record<string, string>
  createdBy: number
  createTime: string
  updateTime: string
}

export interface VisitQuery {
  page?: number
  size?: number
  clientId?: number
  houseId?: number
  channelId?: number
  visitDateFrom?: string
  visitDateTo?: string
}

export interface VisitSaveParams {
  visitDate: string
  clientId: number
  houseIds?: number[]
  channelId?: number
  channelInstanceId?: number
  channelInstanceName?: string
  detailDescription?: string
  requirementsConfig?: Record<string, string>
}

export interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

export function getVisitList(query: VisitQuery): Promise<PageResult<VisitRecord>> {
  return get('/api/visits', query)
}
export function getVisitDetail(id: number): Promise<VisitRecord> {
  return get(`/api/visits/${id}`)
}
export function createVisit(data: VisitSaveParams): Promise<number> {
  return post('/api/visits', data)
}
export function updateVisit(id: number, data: Partial<VisitSaveParams>): Promise<null> {
  return put(`/api/visits/${id}`, data)
}
export function deleteVisit(id: number): Promise<null> {
  return del(`/api/visits/${id}`)
}
