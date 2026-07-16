<template>
  <template v-if="channel">
    <el-form-item v-if="instanceModel === 'agency'" label="中介公司" required>
      <el-select
        :model-value="channelInstanceId"
        clearable
        filterable
        placeholder="选择中介公司"
        style="width:100%"
        @update:model-value="emit('update:channelInstanceId', $event)"
      >
        <el-option v-for="a in agencyList" :key="a.id" :value="a.id" :label="a.companyName" />
      </el-select>
    </el-form-item>

    <el-form-item v-else-if="instanceModel === 'client'" label="推荐客户" required>
      <el-select
        :model-value="channelInstanceId"
        clearable
        filterable
        placeholder="选择在租或已退租客户"
        style="width:100%"
        @update:model-value="emit('update:channelInstanceId', $event)"
      >
        <el-option
          v-for="c in referralClientList"
          :key="c.id"
          :value="c.id"
          :label="referralClientLabel(c)"
        />
      </el-select>
    </el-form-item>

    <el-form-item v-else-if="instanceModel === 'user'" label="营销人员" required>
      <el-select
        :model-value="channelInstanceId"
        clearable
        filterable
        placeholder="选择系统用户"
        style="width:100%"
        @update:model-value="emit('update:channelInstanceId', $event)"
      >
        <el-option
          v-for="u in staffList"
          :key="u.id"
          :value="u.id"
          :label="staffLabel(u)"
        />
      </el-select>
    </el-form-item>

    <el-form-item v-else-if="instanceModel === 'contact'" label="实例名称" required>
      <el-input
        :model-value="channelInstanceName"
        placeholder="请输入渠道实例名称"
        @update:model-value="emit('update:channelInstanceName', $event)"
      />
    </el-form-item>

    <el-form-item v-else-if="instanceModel === 'none'" label="实例名称" required>
      <el-input
        :model-value="channelInstanceName"
        placeholder="请输入渠道实例名称"
        @update:model-value="emit('update:channelInstanceName', $event)"
      />
    </el-form-item>
  </template>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { ChannelRecord, AgencyRecord } from '@/api/channel'
import { getAgencyList } from '@/api/channel'
import { getClientList, type ClientRecord } from '@/api/client'
import { getChannelPickerStaffList, type StaffRecord } from '@/api/system'
import { resolveChannelInstanceModel } from '@/utils/channel-instance'

const props = defineProps<{
  channel: ChannelRecord | null
  channelInstanceId?: number
  channelInstanceName?: string
}>()

const emit = defineEmits<{
  'update:channelInstanceId': [value: number | undefined]
  'update:channelInstanceName': [value: string]
}>()

const agencyList = ref<AgencyRecord[]>([])
const referralClientList = ref<ClientRecord[]>([])
const staffList = ref<StaffRecord[]>([])

const instanceModel = computed(() => resolveChannelInstanceModel(props.channel))

function referralClientLabel(c: ClientRecord) {
  const tag = c.referralRentalLabel || c.clientStatusName
  return tag ? `${c.clientName}（${tag}）` : c.clientName
}

function staffLabel(u: StaffRecord) {
  return u.phone ? `${u.username}（${u.phone}）` : u.username
}

async function loadOptions(channel: ChannelRecord | null) {
  agencyList.value = []
  referralClientList.value = []
  staffList.value = []
  if (!channel) return

  const model = resolveChannelInstanceModel(channel)
  if (model === 'agency') {
    const res = await getAgencyList(channel.id, { page: 1, size: 500 })
    agencyList.value = res.records
  } else if (model === 'client') {
    const res = await getClientList({ page: 1, size: 500, referralEligible: true })
    referralClientList.value = res.records
  } else if (model === 'user') {
    const res = await getChannelPickerStaffList({ page: 1, size: 500 })
    staffList.value = res.records
  }
}

watch(
  () => [props.channel?.id, props.channel?.typeName, props.channel?.instanceModel] as const,
  ([id]) => {
    if (!id) {
      agencyList.value = []
      referralClientList.value = []
      staffList.value = []
      return
    }
    loadOptions(props.channel)
  },
  { immediate: true },
)
</script>
