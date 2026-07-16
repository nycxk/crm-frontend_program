export const HOUSE_STATUS_OPTIONS = [
  { value: 'rentable', label: '可租' },
  { value: 'rented', label: '已租' },
  { value: 'unavailable', label: '不可租' },
] as const

/** 新增/编辑时可手动设置的状态 */
export const HOUSE_STATUS_EDITABLE_OPTIONS = HOUSE_STATUS_OPTIONS

export type HouseStatusCode = (typeof HOUSE_STATUS_OPTIONS)[number]['value']

/** 将旧版状态码映射为三态 */
export function normalizeHouseStatus(value?: string | null) {
  if (!value) return value
  if (value === 'idle') return 'rentable'
  if (value === 'self_use' || value === 'self_operated') return 'unavailable'
  return value
}

export function houseStatusLabel(value?: string | null) {
  const code = normalizeHouseStatus(value)
  return HOUSE_STATUS_OPTIONS.find((item) => item.value === code)?.label || value || '-'
}

export function houseStatusTagType(status?: string | null): '' | 'success' | 'warning' | 'info' {
  const code = normalizeHouseStatus(status)
  if (code === 'rentable') return ''
  if (code === 'rented') return 'success'
  if (code === 'unavailable') return 'info'
  return ''
}

/** 是否可签约成交、发起内部招租 */
export function isHouseAvailableForDeal(status?: string | null) {
  return normalizeHouseStatus(status) === 'rentable'
}
