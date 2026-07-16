export const INTERNAL_RENT_POSTER_FIELDS = [
  { key: 'houseName', label: '房源名称' },
  { key: 'referencePrice', label: '参考价格' },
  { key: 'rentalArea', label: '租赁面积' },
  { key: 'location', label: '坐落位置' },
  { key: 'businessType', label: '房源业态' },
  { key: 'decorationGrade', label: '装修等级' },
  { key: 'beijingDistrict', label: '北京城区' },
  { key: 'ringRoad', label: '环数' },
  { key: 'utilityStatus', label: '水电气暖' },
  { key: 'usageRequirement', label: '用途要求' },
  { key: 'rentalDurationRequirement', label: '租期要求' },
  { key: 'otherDescription', label: '其他说明' },
  { key: 'viewingContacts', label: '看房联系' },
] as const

export const DEFAULT_POSTER_FIELD_KEYS = INTERNAL_RENT_POSTER_FIELDS.map((item) => item.key)
