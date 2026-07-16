import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi, logout as logoutApi, getUserProfile, type LoginParams, type ModuleInfo } from '@/api/auth'
import router from '@/router'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  const username = ref<string>(localStorage.getItem('username') || '')
  const userId = ref<number>(Number(localStorage.getItem('userId')) || 0)
  const phone = ref<string>(localStorage.getItem('phone') || '')
  const email = ref<string>(localStorage.getItem('email') || '')
  const avatarUrl = ref<string>(localStorage.getItem('avatarUrl') || '')
  const roleCode = ref<string>(localStorage.getItem('roleCode') || '')
  const roleName = ref<string>(localStorage.getItem('roleName') || '')
  const departmentIds = ref<number[]>(
    JSON.parse(localStorage.getItem('departmentIds') || '[]'),
  )
  const modules = ref<ModuleInfo[]>(
    JSON.parse(localStorage.getItem('modules') || '[]'),
  )
  const defaultPassword = ref<number>(Number(localStorage.getItem('defaultPassword')) || 0)
  const readOnly = ref<boolean>(
    localStorage.getItem('readOnly') === 'true'
    || localStorage.getItem('roleCode') === 'COMPANY_LEADER',
  )
  const canViewAssessedPrice = ref<boolean>(
    localStorage.getItem('canViewAssessedPrice') === 'true'
    || localStorage.getItem('roleCode') === 'MARKETING_ADMIN'
    || localStorage.getItem('roleCode') === 'SYSTEM_ADMIN',
  )

  const canWrite = computed(() => {
    if (readOnly.value) return false
    if (roleCode.value === 'COMPANY_LEADER') return false
    return true
  })

  const canManageAssessedPrice = computed(() => canViewAssessedPrice.value && canWrite.value)

  const isLoggedIn = () => !!token.value

  const profileFetched = ref(false)
  const profileLoading = ref(false)

  function getTopModules(): ModuleInfo[] {
    return modules.value.filter((m) => m.parentId === 0).sort((a, b) => a.sort - b.sort)
  }

  async function fetchUserProfile() {
    if (!token.value) return
    profileLoading.value = true
    try {
      const profile = await getUserProfile()
      const firstRole = profile.roles?.[0]

      username.value = profile.username
      userId.value = profile.id
      phone.value = profile.phone
      email.value = profile.email || ''
      avatarUrl.value = profile.avatarUrl || ''
      roleCode.value = firstRole?.roleCode || ''
      roleName.value = firstRole?.roleName || ''
      departmentIds.value = profile.departmentIds || []
      modules.value = profile.modules || []
      defaultPassword.value = profile.defaultPassword || 0
      readOnly.value = !!profile.readOnly
        || (profile.roles?.some((role) => role.roleCode === 'COMPANY_LEADER') ?? false)
      canViewAssessedPrice.value = !!profile.canViewAssessedPrice
        || (profile.roles?.some((role) =>
          role.roleCode === 'MARKETING_ADMIN' || role.roleCode === 'SYSTEM_ADMIN') ?? false)

      localStorage.setItem('username', profile.username)
      localStorage.setItem('userId', String(profile.id))
      localStorage.setItem('phone', profile.phone)
      localStorage.setItem('email', profile.email || '')
      localStorage.setItem('avatarUrl', profile.avatarUrl || '')
      localStorage.setItem('roleCode', firstRole?.roleCode || '')
      localStorage.setItem('roleName', firstRole?.roleName || '')
      localStorage.setItem('departmentIds', JSON.stringify(profile.departmentIds || []))
      localStorage.setItem('modules', JSON.stringify(profile.modules || []))
      localStorage.setItem('defaultPassword', String(profile.defaultPassword || 0))
      localStorage.setItem('readOnly', readOnly.value ? 'true' : 'false')
      localStorage.setItem('canViewAssessedPrice', canViewAssessedPrice.value ? 'true' : 'false')

      profileFetched.value = true
    } finally {
      profileLoading.value = false
    }
  }

  async function login(params: LoginParams) {
    const loginRes = await loginApi(params)

    token.value = loginRes.token
    localStorage.setItem('token', loginRes.token)

    await fetchUserProfile()

    router.push('/')
  }

  function clearLogin() {
    token.value = ''
    username.value = ''
    userId.value = 0
    phone.value = ''
    email.value = ''
    avatarUrl.value = ''
    roleCode.value = ''
    roleName.value = ''
    departmentIds.value = []
    modules.value = []
    defaultPassword.value = 0
    readOnly.value = false
    canViewAssessedPrice.value = false
    profileFetched.value = false

    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('userId')
    localStorage.removeItem('phone')
    localStorage.removeItem('email')
    localStorage.removeItem('avatarUrl')
    localStorage.removeItem('roleCode')
    localStorage.removeItem('roleName')
    localStorage.removeItem('departmentId')
    localStorage.removeItem('departmentIds')
    localStorage.removeItem('modules')
    localStorage.removeItem('defaultPassword')
    localStorage.removeItem('readOnly')
    localStorage.removeItem('canViewAssessedPrice')
  }

  async function handleLogout() {
    try {
      await logoutApi()
    } finally {
      clearLogin()
      router.push('/login')
    }
  }

  return {
    token,
    username,
    userId,
    phone,
    email,
    avatarUrl,
    roleCode,
    roleName,
    departmentIds,
    modules,
    defaultPassword,
    readOnly,
    canWrite,
    canViewAssessedPrice,
    canManageAssessedPrice,
    profileFetched,
    profileLoading,
    isLoggedIn,
    getTopModules,
    fetchUserProfile,
    login,
    handleLogout,
    clearLogin,
  }
})
