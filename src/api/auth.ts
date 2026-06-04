import { post, get, put } from '@/utils/request'

export interface LoginParams {
  phone: string
  password: string
}

export interface RoleInfo {
  id: number
  roleCode: string
  roleName: string
  description: string
  level: number
}

export interface ModuleInfo {
  id: number
  parentId: number
  moduleName: string
  moduleCode: string
  icon: string | null
  path: string | null
  sort: number
  status: number
  isLast: number
  children: ModuleInfo[]
}

export interface LoginData {
  token: string
  tokenType: string | null
  userId: number
  username: string
  email: string | null
}

export interface RegisterParams {
  username: string
  password: string
  phone: string
  code: string
  registrationSource: string
}

export interface RegisterData {
  token: string
  tokenType: string | null
  userId: number
  username: string
  email: string | null
}

export interface UserProfile {
  id: number
  username: string
  email: string | null
  avatarUrl: string | null
  phone: string
  departmentId: number | null
  status: number
  defaultPassword: number
  defaultPasswordName: string
  createdAt: string
  lastLoginAt: string
  roles: RoleInfo[]
  modules: ModuleInfo[]
}

export interface ChangePasswordParams {
  oldPassword: string
  newPassword: string
}

export function login(data: LoginParams): Promise<LoginData> {
  return post<LoginData>('/api/auth/login', {
    ...data,
    loginType: 'password',
  })
}

export function logout(): Promise<null> {
  return post('/api/auth/logout')
}

export function register(data: RegisterParams): Promise<RegisterData> {
  return post<RegisterData>('/api/auth/register', data)
}

export function sendCode(phone: string, captchaType: string): Promise<string> {
  return post<string>('/api/auth/code', { phone, captchaType })
}

export function getUserProfile(): Promise<UserProfile> {
  return get<UserProfile>('/api/user/profile')
}

export function changePassword(data: ChangePasswordParams): Promise<string> {
  return put<string>('/api/user/password', data)
}
