import axios, { type AxiosRequestConfig, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  success: boolean
  timestamp: number
}

const request = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL as string) || '',
  timeout: 15000,
})

request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data
    if (res.success && res.code === 200) {
      return res.data as any
    }
    if (res.code === 2003) {
      const err = new Error(res.message || '证件编号已存在')
      ;(err as any).__apiCode = res.code
      ;(err as any).__apiData = res.data
      return Promise.reject(err)
    }
    ElMessage.error(res.message || '请求失败')
    return Promise.reject(new Error(res.message || '请求失败'))
  },
  (error) => {
    if (error.response) {
      const { status } = error.response
      if (status === 401 || status === 403) {
        localStorage.removeItem('token')
        window.location.href = '/login'
        return Promise.reject(error)
      }
      const msg = error.response.data?.message || `请求错误 ${status}`
      ElMessage.error(msg)
    } else if (error.message) {
      ElMessage.error(error.message)
    }
    return Promise.reject(error)
  },
)

export function get<T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
  return request.get(url, { params, ...config }) as any
}

export function post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  return request.post(url, data, config) as any
}

export function put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  return request.put(url, data, config) as any
}

export function del<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return request.delete(url, config) as any
}

export default request
