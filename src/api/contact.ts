import { get, post, put, del } from '@/utils/request'

export interface ContactRecord {
  id: number
  contactName: string
  contactPhone: string
  model: string | null
  agencyId: number | null
  agencyName: string | null
  remark: string | null
  createTime: string
  updateTime: string
}

export interface ContactQuery {
  page?: number
  size?: number
  keyword?: string
  phone?: string
}

export interface ContactSaveParams {
  contactName: string
  contactPhone: string
  model: string
  agencyId?: number
  remark?: string
}

export interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

export function getContactList(query: ContactQuery): Promise<PageResult<ContactRecord>> {
  return get('/api/contacts', query)
}
export function getContactDetail(id: number): Promise<ContactRecord> {
  return get(`/api/contacts/${id}`)
}
export function createContact(data: ContactSaveParams): Promise<number> {
  return post('/api/contacts', data)
}
export function updateContact(id: number, data: Partial<ContactSaveParams>): Promise<null> {
  return put(`/api/contacts/${id}`, data)
}
export function deleteContact(id: number): Promise<null> {
  return del(`/api/contacts/${id}`)
}
