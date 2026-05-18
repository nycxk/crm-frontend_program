import { get, post } from '@/utils/request'
import axios from 'axios'

export interface HouseSnapshot {
  houseId: number
  guideVersion: number | null
  assessedVersion: number | null
}

export interface PriceBatchRecord {
  id: number
  batchName: string
  batchCode: string
  priceType: string
  priceTypeLabel: string
  status: string
  statusLabel: string
  sourceFile: string | null
  uploadUserId: number
  uploadUserName: string
  uploadDate: string
  remark: string | null
  affectedHouseCount: number
  houseSnapshot: HouseSnapshot[]
  createTime: string
  updateTime: string
}

export interface PriceBatchQuery {
  page?: number
  size?: number
  priceType?: string
  status?: string
  keyword?: string
}

export interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

export function getPriceBatchList(query: PriceBatchQuery): Promise<PageResult<PriceBatchRecord>> {
  return get('/api/price-batches', query)
}

export function getPriceBatchDetail(id: number): Promise<PriceBatchRecord> {
  return get(`/api/price-batches/${id}`)
}

export async function downloadPriceTemplate(priceType: 'guide' | 'assessed') {
  const base = (import.meta.env.VITE_API_BASE_URL as string) || ''
  const token = localStorage.getItem('token')
  const resp = await axios.get(`${base}/api/price-batches/template`, {
    params: { priceType },
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    responseType: 'blob',
  })
  const url = window.URL.createObjectURL(new Blob([resp.data]))
  const a = document.createElement('a')
  a.href = url
  a.download = `price-template.xlsx`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

export async function uploadPriceBatch(
  file: File,
  priceType: string,
  batchName?: string,
  remark?: string,
): Promise<PriceBatchRecord> {
  const base = (import.meta.env.VITE_API_BASE_URL as string) || ''
  const token = localStorage.getItem('token')
  const formData = new FormData()
  formData.append('file', file)
  formData.append('priceType', priceType)
  if (batchName) formData.append('batchName', batchName)
  if (remark) formData.append('remark', remark)
  const resp = await axios.post(`${base}/api/price-batches/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  const d = resp.data as { code: number; message: string; data: PriceBatchRecord; success: boolean }
  if (d.success && d.code === 200) return d.data
  throw new Error(d.message || '上传失败')
}

export function rollbackPriceBatch(id: number): Promise<null> {
  return post(`/api/price-batches/${id}/rollback`)
}
