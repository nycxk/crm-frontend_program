import type { ChannelRecord } from '@/api/channel'

export type ChannelInstanceModel = 'agency' | 'client' | 'user' | 'contact' | 'none'

const TYPE_NAME_REFERRAL = '老带新'
const TYPE_NAME_STAFF = '全员营销'
const TYPE_NAME_CONTACT = '泛销'

export function resolveChannelInstanceModel(channel?: ChannelRecord | null): ChannelInstanceModel {
  if (!channel) return 'none'
  if (channel.instanceModel) return channel.instanceModel as ChannelInstanceModel
  if (channel.instanceType === 'agency') return 'agency'
  switch (channel.typeName) {
    case TYPE_NAME_REFERRAL:
      return 'client'
    case TYPE_NAME_STAFF:
      return 'user'
    case TYPE_NAME_CONTACT:
      return 'contact'
    default:
      return 'none'
  }
}

export function channelInstanceUsesIdSelect(model: ChannelInstanceModel) {
  return model === 'agency' || model === 'client' || model === 'user'
}

/** 选择渠道后校验实例是否已填写，返回错误文案或 null */
export function validateChannelInstance(
  channel: ChannelRecord | null | undefined,
  channelInstanceId?: number | null,
  channelInstanceName?: string | null,
): string | null {
  if (!channel) return null
  const model = resolveChannelInstanceModel(channel)
  if (channelInstanceUsesIdSelect(model)) {
    if (channelInstanceId != null) return null
    if (model === 'agency') return '请选择中介公司'
    if (model === 'client') return '请选择老带新推荐客户'
    return '请选择全员营销人员'
  }
  if (channelInstanceId != null) return null
  if ((channelInstanceName || '').trim()) return null
  return '请填写渠道实例名称'
}

export function appendChannelInstancePayload(
  payload: Record<string, unknown>,
  channel: ChannelRecord | null | undefined,
  channelInstanceId?: number | null,
  channelInstanceName?: string | null,
) {
  if (!channel) return
  const model = resolveChannelInstanceModel(channel)
  if (channelInstanceUsesIdSelect(model)) {
    if (channelInstanceId != null) {
      payload.channelInstanceId = channelInstanceId
    }
    return
  }
  if (model === 'contact' && channelInstanceId != null) {
    payload.channelInstanceId = channelInstanceId
    return
  }
  const name = (channelInstanceName || '').trim()
  if (name) {
    payload.channelInstanceName = name
  }
}
