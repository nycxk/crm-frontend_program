import { get, post, put, del } from '@/utils/request'

export interface ChannelRecord {
  id: number
  typeName: string
  instanceType: 'agency' | 'none'
  instanceModel?: 'agency' | 'client' | 'user' | 'contact' | 'none'
  hasAgency: boolean
  agencyCount: number
  createTime: string
  updateTime: string
  agencies: AgencyRecord[]
}

export interface ChannelDetail extends ChannelRecord {}

export interface ChannelQuery {
  page?: number
  size?: number
  keyword?: string
  instanceType?: string
}

export interface ChannelSaveParams {
  typeName: string
  instanceType?: string
}

export interface AgencyRecord {
  id: number
  channelId: number
  companyName: string
  createTime: string
  updateTime: string
}

export interface AgencyQuery {
  page?: number
  size?: number
  keyword?: string
}

export interface AgencySaveParams {
  companyName: string
}

export interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

// 渠道类型
export function getChannelList(query: ChannelQuery): Promise<PageResult<ChannelRecord>> {
  return get('/api/channels', query)
}
export function getChannelDetail(id: number): Promise<ChannelDetail> {
  return get(`/api/channels/${id}`)
}
export function createChannel(data: ChannelSaveParams): Promise<number> {
  return post('/api/channels', data)
}
export function updateChannel(id: number, data: Partial<ChannelSaveParams>): Promise<null> {
  return put(`/api/channels/${id}`, data)
}
export function deleteChannel(id: number): Promise<null> {
  return del(`/api/channels/${id}`)
}

// 中介公司
export function getAgencyList(channelId: number, query: AgencyQuery): Promise<PageResult<AgencyRecord>> {
  return get(`/api/channels/${channelId}/agencies`, query)
}
export function createAgency(channelId: number, data: AgencySaveParams): Promise<number> {
  return post(`/api/channels/${channelId}/agencies`, data)
}
export function updateAgency(channelId: number, agencyId: number, data: Partial<AgencySaveParams>): Promise<null> {
  return put(`/api/channels/${channelId}/agencies/${agencyId}`, data)
}
export function deleteAgency(channelId: number, agencyId: number): Promise<null> {
  return del(`/api/channels/${channelId}/agencies/${agencyId}`)
}
