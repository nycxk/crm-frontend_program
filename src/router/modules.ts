import type { RouteRecordRaw } from 'vue-router'

const DashboardView = () => import('@/views/modules/DashboardView.vue')
const CustomerListView = () => import('@/views/modules/CustomerListView.vue')
const CustomerVisitView = () => import('@/views/modules/CustomerVisitView.vue')
const SeaView = () => import('@/views/modules/SeaView.vue')
const PropertyView = () => import('@/views/modules/PropertyView.vue')
const ChannelView = () => import('@/views/modules/ChannelView.vue')
const DealView = () => import('@/views/modules/DealView.vue')
const ContactView = () => import('@/views/modules/ContactView.vue')
const SystemPersonnelView = () => import('@/views/modules/SystemPersonnelView.vue')
const SystemDepartmentView = () => import('@/views/modules/SystemDepartmentView.vue')
const SystemPermissionView = () => import('@/views/modules/SystemPermissionView.vue')

export const moduleRoutes: RouteRecordRaw[] = [
  {
    path: 'dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: { moduleCode: '01', moduleName: '数据概览' },
  },
  {
    path: 'customers',
    name: 'customers',
    redirect: '/customers/list',
    meta: { moduleCode: '02', moduleName: '客户管理' },
    children: [
      {
        path: 'list',
        name: 'customerList',
        component: CustomerListView,
        meta: { moduleCode: '09', moduleName: '客户列表' },
      },
      {
        path: 'visits',
        name: 'customerVisits',
        component: CustomerVisitView,
        meta: { moduleCode: '10', moduleName: '客户来访' },
      },
    ],
  },
  {
    path: 'sea',
    name: 'sea',
    component: SeaView,
    meta: { moduleCode: '03', moduleName: '公海客户' },
  },
  {
    path: 'properties',
    name: 'properties',
    component: PropertyView,
    meta: { moduleCode: '04', moduleName: '房产管理' },
  },
  {
    path: 'channels',
    name: 'channels',
    component: ChannelView,
    meta: { moduleCode: '05', moduleName: '渠道管理' },
  },
  {
    path: 'deals',
    name: 'deals',
    component: DealView,
    meta: { moduleCode: '06', moduleName: '成交管理' },
  },
  {
    path: 'contacts',
    name: 'contacts',
    component: ContactView,
    meta: { moduleCode: '07', moduleName: '联系人' },
  },
  {
    path: 'system',
    name: 'system',
    redirect: '/system/personnel',
    meta: { moduleCode: '08', moduleName: '系统管理' },
    children: [
      {
        path: 'personnel',
        name: 'systemPersonnel',
        component: SystemPersonnelView,
        meta: { moduleCode: '12', moduleName: '人员管理' },
      },
      {
        path: 'department',
        name: 'systemDepartment',
        component: SystemDepartmentView,
        meta: { moduleCode: '13', moduleName: '部门管理' },
      },
      {
        path: 'permission',
        name: 'systemPermission',
        component: SystemPermissionView,
        meta: { moduleCode: '14', moduleName: '权限管理' },
      },
    ],
  },
]
