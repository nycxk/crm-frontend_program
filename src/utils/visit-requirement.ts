export interface VisitRequirementSchemaItem {
  key: string
  type: string
  required?: boolean
  unit?: string
  options?: string[]
  defaultValue?: string | string[]
}

export function parseVisitRequirementSchema(raw: string): VisitRequirementSchemaItem[] {
  try {
    const schema = JSON.parse(raw)
    if (!Array.isArray(schema)) return []
    return schema
      .filter((item: any) => item && item.key)
      .map((item: any) => ({
        key: String(item.key).trim(),
        type: String(item.type || 'text').trim(),
        required: !!item.required,
        unit: item.unit ? String(item.unit).trim() : undefined,
        options: Array.isArray(item.options)
          ? item.options.map((option: any) => String(option).trim()).filter(Boolean)
          : undefined,
        defaultValue: item.defaultValue,
      }))
  } catch {
    return []
  }
}

export function applyRequirementDefaults(
  schema: VisitRequirementSchemaItem[],
  values: Record<string, string>,
): Record<string, string> {
  const next = { ...values }
  for (const item of schema) {
    if (next[item.key] !== undefined && String(next[item.key]).trim() !== '') continue
    if (item.defaultValue == null) continue
    if (item.type === 'multiSelect') {
      const defaults = Array.isArray(item.defaultValue) ? item.defaultValue : []
      if (defaults.length) next[item.key] = defaults.join(',')
    } else {
      const value = String(item.defaultValue).trim()
      if (value) next[item.key] = value
    }
  }
  return next
}

export function validateRequirementValues(
  schema: VisitRequirementSchemaItem[],
  values: Record<string, string>,
): string | null {
  for (const item of schema) {
    const raw = values[item.key]
    const text = raw == null ? '' : String(raw).trim()
    if (!text) {
      if (item.required) return `${item.key}为必填项`
      continue
    }
    if (item.type === 'int' && !/^-?\d+$/.test(text)) {
      return `${item.key}须为整数`
    }
    if (item.type === 'float' && Number.isNaN(Number(text))) {
      return `${item.key}须为数字`
    }
    if (item.type === 'select' && item.options?.length && !item.options.includes(text)) {
      return `${item.key}的选项无效`
    }
    if (item.type === 'multiSelect') {
      const selected = text.split(',').map((part) => part.trim()).filter(Boolean)
      if (!selected.length && item.required) return `${item.key}为必填项`
      if (item.options?.length) {
        for (const value of selected) {
          if (!item.options.includes(value)) return `${item.key}的选项无效`
        }
      }
    }
  }
  return null
}

export function buildRequirementsConfig(
  schema: VisitRequirementSchemaItem[],
  values: Record<string, string>,
): Record<string, string | string[]> {
  const config: Record<string, string | string[]> = {}
  for (const item of schema) {
    const raw = values[item.key]
    const text = raw == null ? '' : String(raw).trim()
    if (!text) continue
    if (item.type === 'multiSelect') {
      config[item.key] = text.split(',').map((part) => part.trim()).filter(Boolean)
    } else {
      config[item.key] = text
    }
  }
  return config
}

export function getMultiSelectValues(value?: string): string[] {
  if (!value) return []
  return value.split(',').map((part) => part.trim()).filter(Boolean)
}
