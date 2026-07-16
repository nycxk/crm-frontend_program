<template>
  <div class="requirements-wrap">
    <div v-for="item in schema" :key="item.key" class="req-row">
      <span class="req-label">
        <span v-if="item.required" class="req-required">*</span>
        {{ item.key }}<template v-if="item.unit">（{{ item.unit }}）</template>
      </span>

      <el-input
        v-if="item.type === 'text'"
        :model-value="modelValue[item.key] || ''"
        placeholder="请输入"
        style="width:240px"
        @update:model-value="(val: string) => updateValue(item.key, val)"
      />
      <el-input
        v-else-if="item.type === 'int'"
        :model-value="modelValue[item.key] || ''"
        placeholder="请输入整数"
        style="width:240px"
        type="number"
        @update:model-value="(val: string) => updateValue(item.key, val)"
      />
      <el-input
        v-else-if="item.type === 'float'"
        :model-value="modelValue[item.key] || ''"
        placeholder="请输入浮点数"
        style="width:240px"
        type="number"
        @update:model-value="(val: string) => updateValue(item.key, val)"
      />
      <el-date-picker
        v-else-if="item.type === 'date'"
        :model-value="modelValue[item.key] || ''"
        type="date"
        value-format="YYYY-MM-DD"
        style="width:240px"
        @update:model-value="(val: string | undefined) => updateValue(item.key, val || '')"
      />
      <el-select
        v-else-if="item.type === 'select'"
        :model-value="modelValue[item.key] || ''"
        clearable
        placeholder="请选择"
        style="width:240px"
        @update:model-value="(val: string | undefined) => updateValue(item.key, val || '')"
      >
        <el-option v-for="option in item.options || []" :key="option" :value="option" :label="option" />
      </el-select>
      <el-select
        v-else-if="item.type === 'multiSelect'"
        :model-value="getMultiSelectValues(modelValue[item.key])"
        multiple
        collapse-tags
        collapse-tags-tooltip
        clearable
        placeholder="请选择"
        style="width:240px"
        @update:model-value="(val: string[]) => updateValue(item.key, (val || []).join(','))"
      >
        <el-option v-for="option in item.options || []" :key="option" :value="option" :label="option" />
      </el-select>
      <el-input
        v-else
        :model-value="modelValue[item.key] || ''"
        placeholder="请输入"
        style="width:240px"
        @update:model-value="(val: string) => updateValue(item.key, val)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { VisitRequirementSchemaItem } from '@/utils/visit-requirement'
import { getMultiSelectValues } from '@/utils/visit-requirement'

const props = defineProps<{
  schema: VisitRequirementSchemaItem[]
  modelValue: Record<string, string>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, string>]
}>()

function updateValue(key: string, value: string) {
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: value,
  })
}
</script>

<style scoped>
.requirements-wrap {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.req-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.req-label {
  width: 140px;
  flex-shrink: 0;
  color: #606266;
}

.req-required {
  color: #f56c6c;
  margin-right: 4px;
}
</style>
