import { get } from '@/utils/request'

export interface DashboardPeriodQuery {
  periodType?: 'month' | 'quarter' | 'year'
  periodValue?: string
}

export interface DashboardWidget {
  key: string
  title: string
  endpoint: string
  visible?: boolean
}

export interface DashboardOverviewMeta {
  scopeLabel: string
  roleCode: string
  canViewOperationComparison: boolean
  defaultPeriodType: string
  defaultPeriodValue: string
  widgets: DashboardWidget[]
}

export interface OverviewSummary {
  periodType: string
  periodValue: string
  periodLabel: string
  newClientCount: number
  rentableHouseCount: number
  rentableHouseArea: number
  rentedHouseCount: number
  rentedRentableArea: number
  occupancyRate: number | null
  periodDealCount: number
  periodDealArea: number
  periodDealAmount: number
}

export interface OperationDealRow {
  operationDepartmentId: number
  operationDepartmentName: string
  dealCount: number
  dealArea: number
  dealAmount: number
  occupancyRate: number | null
}

export interface OperationDeals {
  periodType: string
  periodValue: string
  periodLabel: string
  rows: OperationDealRow[]
  total: {
    dealCount: number
    dealArea: number
    dealAmount: number
  }
}

export interface OperationDealTrendPoint {
  periodValue: string
  periodLabel: string
  dealCount: number
  dealAmount: number
}

export interface OperationDealTrendSeries {
  operationDepartmentId: number
  operationDepartmentName: string
  points: OperationDealTrendPoint[]
}

export interface OperationDealTrend {
  periodType: string
  series: OperationDealTrendSeries[]
}

const PREFIX = '/api/dashboard/overview'

export function getDashboardMeta(): Promise<DashboardOverviewMeta> {
  return get<DashboardOverviewMeta>(`${PREFIX}/meta`)
}

export function getDashboardSummary(query?: DashboardPeriodQuery): Promise<OverviewSummary> {
  return get<OverviewSummary>(`${PREFIX}/summary`, query)
}

export function getOperationDeals(query?: DashboardPeriodQuery): Promise<OperationDeals> {
  return get<OperationDeals>(`${PREFIX}/operation-deals`, query)
}

export function getOperationDealTrend(query?: DashboardPeriodQuery): Promise<OperationDealTrend> {
  return get<OperationDealTrend>(`${PREFIX}/operation-deals/trend`, query)
}
