import { get, post, put, del } from '@/utils/request'

export interface StaffRecord {
  id: number
  username: string
  email: string | null
  phone: string
  departmentIds: number[]
  departmentNames: string[]
  /** 部门名称拼接展示（多个用「、」分隔） */
  departmentName: string | null
  status: number
  createdAt: string
  lastLoginAt: string
  roles: {
    id: number
    roleCode: string
    roleName: string
    description: string
    level: number
  }[]
}

export interface StaffDetail extends StaffRecord {
  avatarUrl: string | null
  updatedAt: string
}

export interface StaffQuery {
  page?: number
  size?: number
  keyword?: string
  departmentId?: number
  status?: number
  roleId?: number
  /** 全员营销渠道选人：全系统激活用户，排除系统管理员 */
  channelPicker?: boolean
}

export interface StaffSaveParams {
  username: string
  phone: string
  email?: string
  /** 归属部门（可多个，须为同一类型：多个经营部或多个项目部） */
  departmentIds: number[]
  status?: number
  roleIds: number[]
}

export interface StaffUpdateParams {
  username?: string
  email?: string
  /** 归属部门（可多个，须为同一类型）；不传表示不修改 */
  departmentIds?: number[]
  status?: number
  roleIds?: number[]
}

export interface DepartmentRecord {
  id: number
  departmentName: string
  departmentType: 'marketing' | 'operation' | 'project'
  departmentTypeName: string
  parentId: number
  parentName: string | null
  createTime: string
  updateTime: string
  children?: DepartmentRecord[]
}

export interface DepartmentQuery {
  page?: number
  size?: number
  keyword?: string
  departmentType?: string
  parentId?: number
}

export interface DepartmentSaveParams {
  departmentName: string
  departmentType: string
  parentId?: number
}

export interface RoleRecord {
  id: number
  roleCode: string
  roleName: string
  description: string
  level: number
  moduleCount?: number
  createdAt: string
  updatedAt: string
}

export interface RoleDetail extends RoleRecord {
  moduleIds: number[]
  modules?: ModuleTreeNode[]
}

export interface RoleQuery {
  page?: number
  size?: number
  keyword?: string
}

export interface RoleSaveParams {
  roleCode: string
  roleName: string
  description?: string
  level: number
  moduleIds: number[]
}

export interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

export interface ModuleTreeNode {
  id: number
  parentId: number
  moduleName: string
  moduleCode: string
  icon: string | null
  path: string | null
  sort: number
  status: number
  isLast: number
  children: ModuleTreeNode[]
}

// 人员管理
export function getStaffList(query: StaffQuery): Promise<PageResult<StaffRecord>> {
  return get('/api/system/staff', query)
}

/** 全员营销等渠道选人：全系统激活用户，排除系统管理员 */
export function getChannelPickerStaffList(query?: Omit<StaffQuery, 'channelPicker'>): Promise<PageResult<StaffRecord>> {
  return get('/api/system/staff/channel-picker', query)
}
export function getStaffDetail(id: number): Promise<StaffDetail> {
  return get(`/api/system/staff/${id}`)
}
export function createStaff(data: StaffSaveParams): Promise<number> {
  return post('/api/system/staff', data)
}
export function updateStaff(id: number, data: StaffUpdateParams): Promise<null> {
  return put(`/api/system/staff/${id}`, data)
}
export function updateStaffPhone(id: number, phone: string): Promise<null> {
  return put(`/api/system/staff/${id}/phone`, { phone })
}
export function resetStaffPassword(id: number): Promise<string> {
  return post(`/api/system/staff/${id}/password/reset`)
}
export function disableStaff(id: number): Promise<null> {
  return del(`/api/system/staff/${id}`)
}

// 部门管理
export function getDepartmentList(query: DepartmentQuery): Promise<PageResult<DepartmentRecord>> {
  return get('/api/system/departments', query)
}
export function getDepartmentTree(): Promise<DepartmentRecord[]> {
  return get('/api/system/departments/tree')
}
export function getDepartmentDetail(id: number): Promise<DepartmentRecord> {
  return get(`/api/system/departments/${id}`)
}
export function createDepartment(data: DepartmentSaveParams): Promise<number> {
  return post('/api/system/departments', data)
}
export function updateDepartment(id: number, data: Partial<DepartmentSaveParams>): Promise<null> {
  return put(`/api/system/departments/${id}`, data)
}
export function deleteDepartment(id: number): Promise<null> {
  return del(`/api/system/departments/${id}`)
}
export function getParentOperationDepartment(projectId: number): Promise<DepartmentRecord> {
  return get('/api/system/departments/parent-operation', { projectId })
}

// 权限管理
export function getRoleList(query: RoleQuery): Promise<PageResult<RoleRecord>> {
  return get('/api/system/roles', query)
}
export function getModuleTree(): Promise<ModuleTreeNode[]> {
  return get('/api/system/roles/modules/tree')
}
export function getRoleDetail(id: number): Promise<RoleDetail> {
  return get(`/api/system/roles/${id}`)
}
export function createRole(data: RoleSaveParams): Promise<number> {
  return post('/api/system/roles', data)
}
export function updateRole(id: number, data: Partial<RoleSaveParams>): Promise<null> {
  return put(`/api/system/roles/${id}`, data)
}
export function deleteRole(id: number): Promise<null> {
  return del(`/api/system/roles/${id}`)
}

// 系统参数
export interface SystemParamRecord {
  id: number
  code: string
  paramKey: string
  paramValue: string
  paramType: string
  unit: string | null
  createdBy: number
  createdByName: string
  createTime: string
  updatedTime: string
}

export interface SystemParamQuery {
  page?: number
  size?: number
  keyword?: string
  code?: string
  paramKey?: string
  paramType?: string
}

export function getParamList(query: SystemParamQuery): Promise<PageResult<SystemParamRecord>> {
  return get('/api/system/params', query)
}
export function getParamDetail(id: number): Promise<SystemParamRecord> {
  return get(`/api/system/params/${id}`)
}
export function updateParamValue(id: number, paramValue: string): Promise<null> {
  return put(`/api/system/params/${id}`, { paramValue })
}

export interface ParamByKeyResult {
  paramKey: string
  paramValue: string
}
export function getParamByKey(paramKey: string): Promise<ParamByKeyResult> {
  return get(`/api/system/params/by-key/${encodeURIComponent(paramKey)}`)
}
