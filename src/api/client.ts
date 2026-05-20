import { get, post, put, del } from '@/utils/request'

export interface ClientContact {
  id: number
  contactName: string
  contactPhone: string
  model: string | null
  remark: string | null
  createTime: string
  updateTime: string
}

export interface VisitHouse {
  id: number
  houseName: string
}

export interface ClientVisit {
  id: number
  visitDate: string
  clientId: number
  clientName: string
  houseIds: number[]
  houses: VisitHouse[]
  channelId: number
  channelTypeName: string
  channelInstanceId: number
  channelInstanceName: string
  detailDescription: string
  requirementsConfig: Record<string, string>
  createTime: string
  updateTime: string
}

export interface ClientRecord {
  id: number
  clientName: string
  idType: string | null
  idNumber: string | null
  createdBy: number
  clientStatus: string
  clientStatusName: string
  visitCount: number
  contacts: ClientContact[]
  createTime: string
  updateTime: string
}

export interface ClientDetail extends ClientRecord {
  visits: ClientVisit[]
}

export interface ClientQuery {
  page?: number
  size?: number
  keyword?: string
  status?: string
}

export interface NewContact {
  contactName: string
  contactPhone: string
  model?: string
  remark?: string
}

export interface ClientSaveParams {
  clientName: string
  idType?: string
  idNumber?: string
  contactIds?: number[]
  newContacts?: NewContact[]
}

export interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

export function getClientList(query: ClientQuery): Promise<PageResult<ClientRecord>> {
  return get('/api/clients', query)
}
export function getClientDetail(id: number): Promise<ClientDetail> {
  return get(`/api/clients/${id}`)
}
export function createClient(data: ClientSaveParams): Promise<number> {
  return post('/api/clients', data)
}
export function updateClient(id: number, data: Partial<ClientSaveParams>): Promise<null> {
  return put(`/api/clients/${id}`, data)
}
export function deleteClient(id: number): Promise<null> {
  return del(`/api/clients/${id}`)
}
export function getClientContacts(id: number): Promise<ClientContact[]> {
  return get(`/api/clients/${id}/contacts`)
}
export function bindClientContacts(id: number, contactIds: number[]): Promise<null> {
  return post(`/api/clients/${id}/contacts`, { contactIds })
}
export function unbindClientContact(id: number, contactId: number): Promise<null> {
  return del(`/api/clients/${id}/contacts/${contactId}`)
}

export function getPublicPoolList(query: { page?: number; size?: number; keyword?: string }): Promise<PageResult<ClientRecord>> {
  return get('/api/clients/public-pool', query)
}
export function claimPublicClient(id: number): Promise<ClientRecord> {
  return post(`/api/clients/public-pool/${id}/claim`)
}
