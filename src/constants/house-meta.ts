export const HOUSE_BUSINESS_TYPE_OPTIONS = [
  { value: 'office', label: '办公' },
  { value: 'commercial', label: '商业' },
  { value: 'warehouse', label: '仓储' },
  { value: 'other', label: '其他' },
] as const

/** 房源业态中文选项（与 HOUSE_BUSINESS_TYPE_OPTIONS 一致，供需求配置等场景复用） */
export const HOUSE_BUSINESS_TYPE_LABELS = HOUSE_BUSINESS_TYPE_OPTIONS.map((item) => item.label)

export const HOUSE_DECORATION_GRADE_OPTIONS = [
  { value: '毛坯', label: '毛坯' },
  { value: '简装', label: '简装' },
  { value: '精装', label: '精装' },
  { value: '豪装', label: '豪装' },
] as const

export const BEIJING_DISTRICT_OPTIONS = [
  '东城区', '西城区', '朝阳区', '丰台区', '石景山区', '海淀区',
  '门头沟区', '房山区', '通州区', '顺义区', '昌平区', '大兴区',
  '怀柔区', '平谷区', '密云区', '延庆区',
].map((value) => ({ value, label: value }))

export const HOUSE_RING_ROAD_OPTIONS = [
  { value: 'ring_1_inner', label: '1环以内' },
  { value: 'ring_2_3', label: '2到3环' },
  { value: 'ring_3_4', label: '3到4环' },
  { value: 'ring_4_5', label: '4到5环' },
  { value: 'ring_5_plus', label: '5环以上' },
] as const

export function houseBusinessTypeLabel(value?: string | null) {
  return HOUSE_BUSINESS_TYPE_OPTIONS.find((item) => item.value === value)?.label || value || '-'
}

export function houseRingRoadLabel(value?: string | null) {
  return HOUSE_RING_ROAD_OPTIONS.find((item) => item.value === value)?.label || value || '-'
}
