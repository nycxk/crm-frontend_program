import { get } from '@/utils/request'

export interface OperationLogRecord {
  id: number
  logType: string
  logTypeName: string
  module: string
  action: string
  actionName: string
  operatorUserId: number | null
  operatorName: string
  targetId: string
  summary: string
  requestMethod: string
  requestUri: string
  clientIp: string
  status: string
  statusName: string
  errorMessage: string | null
  detail: string | null
  jobName: string | null
  durationMs: number | null
  affectCount: number | null
  createTime: string
}

export interface OperationLogQuery {
  page?: number
  size?: number
  logType?: string
  module?: string
  action?: string
  operatorUserId?: number
  status?: string
  keyword?: string
  jobName?: string
  createDateFrom?: string
  createDateTo?: string
}

export interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

export function getOperationLogList(query: OperationLogQuery): Promise<PageResult<OperationLogRecord>> {
  return get('/api/system/operation-logs', query)
}

export function getOperationLogDetail(id: number): Promise<OperationLogRecord> {
  return get(`/api/system/operation-logs/${id}`)
}
