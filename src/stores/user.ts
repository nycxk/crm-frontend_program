import { defineStore } from 'pinia'
import { ref } from 'vue'
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
  const departmentId = ref<number>(Number(localStorage.getItem('departmentId')) || 0)
  const modules = ref<ModuleInfo[]>(
    JSON.parse(localStorage.getItem('modules') || '[]'),
  )
  const defaultPassword = ref<number>(Number(localStorage.getItem('defaultPassword')) || 0)

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
      departmentId.value = profile.departmentId || 0
      modules.value = profile.modules || []
      defaultPassword.value = profile.defaultPassword || 0

      localStorage.setItem('username', profile.username)
      localStorage.setItem('userId', String(profile.id))
      localStorage.setItem('phone', profile.phone)
      localStorage.setItem('email', profile.email || '')
      localStorage.setItem('avatarUrl', profile.avatarUrl || '')
      localStorage.setItem('roleCode', firstRole?.roleCode || '')
      localStorage.setItem('roleName', firstRole?.roleName || '')
      localStorage.setItem('departmentId', String(profile.departmentId || 0))
      localStorage.setItem('modules', JSON.stringify(profile.modules || []))
      localStorage.setItem('defaultPassword', String(profile.defaultPassword || 0))

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
    departmentId.value = 0
    modules.value = []
    defaultPassword.value = 0
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
    localStorage.removeItem('modules')
    localStorage.removeItem('defaultPassword')
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
    departmentId,
    modules,
    defaultPassword,
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
