import { get, post, put, del } from '@/utils/request'
import type { PageResult } from './house'

export interface HouseBriefVO {
  id: number
  houseName: string
  departmentId: number
  departmentName: string
  operationDepartmentId: number
  operationDepartmentName: string
  houseStatus: string
  houseStatusName: string
}

export interface UserBriefVO {
  id: number
  username: string
}

export interface InternalRentRecord {
  id: number
  houseId: number
  house: HouseBriefVO | null
  initiateUserId: number
  initiateUser: UserBriefVO | null
  initiateDate: string
  stopDate: string | null
  posterUrl: string | null
  viewingUserIds: number[]
  viewingUsers: UserBriefVO[]
  rentalArea: number
  referencePrice: number
  priceUnit: string | null
  usageRequirement: string | null
  rentalDurationRequirement: string | null
  otherDescription: string | null
  createTime: string
  updateTime: string
}

export interface InternalRentQuery {
  page?: number
  size?: number
  keyword?: string
  houseId?: number
  status?: string
  initiateUserId?: number
  initiateDateFrom?: string
  initiateDateTo?: string
}

export interface InternalRentSaveParams {
  houseId: number
  initiateDate: string
  stopDate?: string | null
  viewingUserIds?: number[]
  rentalArea: number
  referencePrice: number
  priceUnit?: string
  usageRequirement?: string
  rentalDurationRequirement?: string
  otherDescription?: string
}

export interface InternalRentUpdateParams {
  houseId?: number
  initiateDate?: string
  stopDate?: string | null
  clearStopDate?: boolean
  viewingUserIds?: number[]
  rentalArea?: number
  referencePrice?: number
  priceUnit?: string
  usageRequirement?: string
  rentalDurationRequirement?: string
  otherDescription?: string
}

export function getInternalRentList(query: InternalRentQuery): Promise<PageResult<InternalRentRecord>> {
  return get('/api/internal-rents', query)
}
export function getInternalRentDetail(id: number): Promise<InternalRentRecord> {
  return get(`/api/internal-rents/${id}`)
}
export function createInternalRent(data: InternalRentSaveParams): Promise<number> {
  return post('/api/internal-rents', data)
}
export function updateInternalRent(id: number, data: InternalRentUpdateParams): Promise<null> {
  return put(`/api/internal-rents/${id}`, data)
}
export function deleteInternalRent(id: number): Promise<null> {
  return del(`/api/internal-rents/${id}`)
}
export function generateInternalRentPoster(id: number): Promise<InternalRentRecord> {
  return post(`/api/internal-rents/${id}/poster`)
}
