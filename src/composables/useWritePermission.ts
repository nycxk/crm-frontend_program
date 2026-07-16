import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

/** 当前用户是否可执行新增/修改/删除等写操作 */
export function useWritePermission() {
  const userStore = useUserStore()
  const canWrite = computed(() => userStore.canWrite)
  return { canWrite }
}
