# CRM Backend API 文档

> **说明**：包含认证授权、用户个人中心、文件管理、系统设置（人员/部门/权限）、渠道管理、客户、联系人、来访、房源、内部招租及成交等接口。除标注「公开」外，均需在请求头携带 `Authorization: Bearer {token}`。

---

## 目录

1. [认证 API](#1-认证-api)
2. [用户 API](#2-用户-api)
3. [文件 API](#3-文件-api)
4. [系统设置 API](#4-系统设置-api)
5. [渠道管理 API](#5-渠道管理-api)
6. [客户管理 API](#6-客户管理-api)
6A. [联系人 API](#6a-联系人-api)
7. [客户来访 API](#7-客户来访-api)
8. [房源管理 API](#8-房源管理-api)
9. [成交管理 API](#9-成交管理-api)
10. [内部招租 API](#10-内部招租-api)

---

## 1 认证 API

| 方法 | 端点 | 说明 | 权限 |
|------|------|------|------|
| POST | `/api/auth/login` | 用户登录 | 公开 |
| POST | `/api/auth/logout` | 用户登出 | 需Token |
| POST | `/api/auth/register` | 用户注册 | 公开 |
| POST | `/api/auth/code` | 发送验证码 | 公开 |

### 1.1 用户登录

```
POST /api/auth/login

Request:
{
  "phone": "15552655631",
  "loginType": "password",  // password: 密码登录
  "password": "******",
  "code": "123456"  // loginType=code 时必填
}

Response (成功):
{
	"code": 200,
	"message": "登录成功",
	"data": {
		"token": "eyJhbGciOiJIUzUxMiJ9.eyJwaG9uZSI6IjEzODAwMTM4MDAwIiwidXNlcklkIjoyLCJzdWIiOiIxMzgwMDEzODAwMCIsImlhdCI6MTc3ODgyNzU5MiwiZXhwIjoxNzc5NDMyMzkyfQ.ttj8MhctTLrZR5GQeXVEAd_YHZMSxBPcWrRbWeGbiGfOcTQ-d4c5UPf_-HVHA3nAQKLFV3T_SePZd9P-KDusww",
		"tokenType": null,
		"userId": 2,
		"username": "admin",
		"email": "admin@example.com"
	},
	"success": true,
	"timestamp": 1778827592557
}

> 登录后调用 `GET /api/user/profile` 获取完整用户信息、角色及模块权限树。

Response (失败):
{
  "code": 1005,
  "message": "密码错误",
  "data": null,
  "timestamp": 1770105868772
}
```

### 1.2 用户登出

```
POST /api/auth/logout

Headers:
Authorization: Bearer {token}

Response:
{
  "code": 200,
  "message": "登出成功",
  "data": null,
  "timestamp": 1770105868772
}
```

### 1.3 用户注册

```
POST /api/auth/register

Request:
{
  "username": "张三",
  "password": "******",
  "phone": "15552655632",
  "code": "123456",
  "registrationSource": "mobile_code"
}

Response (成功):
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "token": "eyJhbGciOiJIUzUxMiJ9...",
    "tokenType": null,
    "userId": 3,
    "username": "用户_Fy09mESwoi",
    "email": null
  },
  "timestamp": 1770105924267
}

Response (失败):
{
  "code": 1004,
  "message": "手机号已被注册",
  "data": null,
  "timestamp": 1770105823333
}
```

### 1.4 发送验证码

```
POST /api/auth/code

Request:
{
  "phone": "15552655631",
  "captchaType": "login"  // login: 登录, register: 注册, reset: 重置密码
}

Response (成功):
{
  "code": 200,
  "message": "操作成功",
  "data": "发送成功",
  "timestamp": 1770365133426
}

Response (失败):
{
  "code": 500,
  "message": "请求过于频繁，请55秒后再试",
  "data": null,
  "timestamp": 1770365137903
}
```

---

## 2 用户 API

| 方法 | 端点 | 说明 | 权限 |
|------|------|------|------|
| GET | `/api/user/profile` | 获取当前用户信息（含角色、模块权限树） | 需Token |
| PUT | `/api/user/profile` | 修改个人资料 | 需Token |
| PUT | `/api/user/password` | 登录态修改密码 | 需Token |
| POST | `/api/user/password/reset` | 短信验证码重置密码 | 公开 |

### 2.1 获取用户信息

```
GET /api/user/profile

Headers:
Authorization: Bearer {token}

Response:
{
	"code": 200,
	"message": "操作成功",
	"data": {
		"id": 2,
		"username": "admin",
		"email": "admin@example.com",
		"avatarUrl": null,
		"phone": "13800138000",
		"departmentId": null,
		"status": 1,
		"createdAt": "2026-05-15T06:22:25.000Z",
		"lastLoginAt": "2026-05-15T08:00:22.000Z",
		"roles": [
			{
				"id": 1,
				"roleCode": "SYSTEM_ADMIN",
				"roleName": "系统管理员",
				"description": "系统最高管理员",
				"level": 4
			}
		],
		"modules": [
			{
				"id": 1,
				"parentId": 0,
				"moduleName": "数据概览",
				"moduleCode": "01",
				"icon": null,
				"path": null,
				"sort": 1,
				"status": 1,
				"isLast": 1,
				"children": []
			},
			{
				"id": 2,
				"parentId": 0,
				"moduleName": "客户管理",
				"moduleCode": "02",
				"icon": null,
				"path": null,
				"sort": 2,
				"status": 1,
				"isLast": 2,
				"children": [
					{
						"id": 9,
						"parentId": 2,
						"moduleName": "客户列表",
						"moduleCode": "09",
						"icon": null,
						"path": null,
						"sort": 9,
						"status": 1,
						"isLast": 1,
						"children": []
					},
					{
						"id": 10,
						"parentId": 2,
						"moduleName": "客户来访",
						"moduleCode": "10",
						"icon": null,
						"path": null,
						"sort": 10,
						"status": 1,
						"isLast": 1,
						"children": []
					}
				]
			},
			{
				"id": 3,
				"parentId": 0,
				"moduleName": "公海客户",
				"moduleCode": "03",
				"icon": null,
				"path": null,
				"sort": 3,
				"status": 1,
				"isLast": 1,
				"children": []
			},
			{
				"id": 4,
				"parentId": 0,
				"moduleName": "房产管理",
				"moduleCode": "04",
				"icon": null,
				"path": null,
				"sort": 4,
				"status": 1,
				"isLast": 1,
				"children": []
			},
			{
				"id": 5,
				"parentId": 0,
				"moduleName": "渠道管理",
				"moduleCode": "05",
				"icon": null,
				"path": null,
				"sort": 5,
				"status": 1,
				"isLast": 1,
				"children": []
			},
			{
				"id": 6,
				"parentId": 0,
				"moduleName": "成交管理",
				"moduleCode": "06",
				"icon": null,
				"path": null,
				"sort": 6,
				"status": 1,
				"isLast": 1,
				"children": []
			},
			{
				"id": 7,
				"parentId": 0,
				"moduleName": "联系人",
				"moduleCode": "07",
				"icon": null,
				"path": null,
				"sort": 7,
				"status": 1,
				"isLast": 1,
				"children": []
			},
			{
				"id": 8,
				"parentId": 0,
				"moduleName": "系统管理",
				"moduleCode": "08",
				"icon": null,
				"path": null,
				"sort": 8,
				"status": 1,
				"isLast": 2,
				"children": [
					{
						"id": 12,
						"parentId": 8,
						"moduleName": "人员管理",
						"moduleCode": "12",
						"icon": null,
						"path": null,
						"sort": 12,
						"status": 1,
						"isLast": 1,
						"children": []
					},
					{
						"id": 13,
						"parentId": 8,
						"moduleName": "部门管理",
						"moduleCode": "13",
						"icon": null,
						"path": null,
						"sort": 13,
						"status": 1,
						"isLast": 1,
						"children": []
					},
					{
						"id": 14,
						"parentId": 8,
						"moduleName": "权限管理",
						"moduleCode": "14",
						"icon": null,
						"path": null,
						"sort": 14,
						"status": 1,
						"isLast": 1,
						"children": []
					}
				]
			}
		]
	},
	"success": true,
	"timestamp": 1778832597329
}
```

**用户状态 `status`**：`1` 激活、`2` 未激活、`3` 封禁。

### 2.2 修改个人资料

```
PUT /api/user/profile

Request（字段均可选，只传需要修改的）:
{
  "username": "admin",
  "email": "admin@example.com",
  "avatarUrl": "/uploads/2026/05/15/avatar.png"
}

Response: 同 2.1，返回更新后的完整 profile
```

### 2.3 登录态修改密码

```
PUT /api/user/password

Request:
{
  "oldPassword": "******",
  "newPassword": "******"
}

Response:
{
  "code": 200,
  "message": "操作成功",
  "data": "密码已修改，请重新登录",
  "timestamp": 1775798820500
}
```

> 修改成功后会清除 Redis 中的 Token，需重新登录。

### 2.4 重置密码（无需登录）

```
POST /api/user/password/reset

Request:
{
  "phone": "13800138000",
  "code": "123456",
  "newPassword": "******"
}

说明: 需先调用 POST /api/auth/code，captchaType=reset 获取验证码

Response:
{
  "code": 200,
  "message": "操作成功",
  "data": "密码已重置，请重新登录",
  "timestamp": 1775798820500
}
```

---

## 3 文件 API

| 方法 | 端点 | 说明 | 权限 |
|------|------|------|------|
| POST | `/api/file/upload` | 上传文件 | 需Token |
| GET | `/api/file` | 当前用户文件分页列表 | 需Token |
| GET | `/api/file/{id}` | 文件详情 | 需Token |
| GET | `/api/file/{id}/download` | 下载文件 | 需Token |
| GET | `/uploads/**` | 访问已上传的静态文件 | 公开 |

### 3.1 上传文件

```
POST /api/file/upload
Content-Type: multipart/form-data

Parameters:
- file: 文件（必填，form-data 字段名 file）
- bizType: 业务类型（可选，如 avatar、document）

Headers:
Authorization: Bearer {token}

Response:
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": 1,
    "originalName": "example.png",
    "storedName": "abc123def456.png",
    "relativePath": "2026/04/10/abc123def456.png",
    "mimeType": "image/png",
    "sizeBytes": 102400,
    "fileKind": "IMAGE",
    "bizType": "avatar",
    "url": "/uploads/2026/04/10/abc123def456.png"
  },
  "timestamp": 1775798820500
}
```

> 列表/详情接口返回的 `FileRecord` 含 `createTime`、`updateTime`、`deletedTime`（未删除时 `deletedTime` 为 null）。

### 3.2 文件分页列表

```
GET /api/file?page=1&size=10

Query Parameters:
- page: 页码，默认 1
- size: 每页条数，默认 10

Response:
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "records": [ { "id": 1, "originalName": "example.png", "...": "..." } ],
    "total": 5,
    "size": 10,
    "current": 1,
    "pages": 1
  },
  "timestamp": 1775798820500
}
```

### 3.3 文件详情

```
GET /api/file/{id}

Response: data 为 FileRecord 对象
```

### 3.4 下载文件

```
GET /api/file/{id}/download

Response: 文件二进制流，Content-Disposition: attachment
```

### 3.5 访问静态文件

```
GET /uploads/2026/04/10/abc123def456.png

Response: 文件二进制流（无需 Token）
```

---

## 4 系统设置 API

系统设置包含：**人员管理**、**部门管理**、**权限管理（角色与模块）**、**系统参数**。均需 Token。

### 4.0 接口总览

#### 人员管理 `/api/system/staff`

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/system/staff` | 分页列表 |
| GET | `/api/system/staff/{id}` | 详情 |
| POST | `/api/system/staff` | 新增 |
| PUT | `/api/system/staff/{id}` | 修改（不含手机号、密码） |
| PUT | `/api/system/staff/{id}/phone` | 修改手机号 |
| POST | `/api/system/staff/{id}/password/reset` | 重置密码为 admin123 |
| DELETE | `/api/system/staff/{id}` | 禁用（status=3） |

#### 部门管理 `/api/system/departments`

组织架构为两级：**经营部（operation，顶级）→ 项目部（project，隶属某经营部）**。

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/system/departments` | 分页列表（扁平） |
| GET | `/api/system/departments/tree` | 经营部-项目部树 |
| GET | `/api/system/departments/parent-operation?projectId=` | 根据项目部查上级经营部 |
| GET | `/api/system/departments/{id}` | 详情（经营部含下级项目部列表） |
| POST | `/api/system/departments` | 新增 |
| PUT | `/api/system/departments/{id}` | 修改 |
| DELETE | `/api/system/departments/{id}` | 软删除 |

#### 权限管理 `/api/system/roles`

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/system/roles` | 角色分页列表 |
| GET | `/api/system/roles/modules/tree` | 全部启用模块树（配置权限用） |
| GET | `/api/system/roles/{id}` | 角色详情（含模块权限） |
| POST | `/api/system/roles` | 新增角色 |
| PUT | `/api/system/roles/{id}` | 修改角色 |
| DELETE | `/api/system/roles/{id}` | 删除角色 |

#### 系统参数 `/api/system/params`

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/system/params` | 分页列表 |
| GET | `/api/system/params/by-key/{paramKey}` | 按 key 查询 value（无角色权限限制） |
| GET | `/api/system/params/{id}` | 详情 |
| PUT | `/api/system/params/{id}` | 修改参数值（仅 `paramValue`） |

---

### 4.1 人员管理

#### 4.1.1 人员分页列表

```
GET /api/system/staff?page=1&size=10&keyword=admin&departmentId=1&status=1&roleId=1

Query Parameters:
- page: 页码，默认 1
- size: 每页条数，默认 10
- keyword: 模糊匹配用户名/手机号/邮箱（可选）
- departmentId: 部门 ID（可选）
- status: 用户状态 1/2/3（可选）
- roleId: 按角色筛选（可选）

> 列表与详情返回的 `phone` 已脱敏，11 位手机号格式为 `138****8000`。

Response:
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "records": [
      {
        "id": 1,
        "username": "admin",
        "email": "admin@example.com",
        "phone": "138****8000",
        "departmentId": 1,
        "departmentName": "总部经营部",
        "status": 1,
        "createdAt": "2026-05-15T06:22:25.000Z",
        "lastLoginAt": "2026-05-15T06:46:33.000Z",
        "roles": [
          {
            "id": 1,
            "roleCode": "SYSTEM_ADMIN",
            "roleName": "系统管理员",
            "description": "系统最高管理员",
            "level": 4
          }
        ]
      }
    ],
    "total": 1,
    "size": 10,
    "current": 1,
    "pages": 1
  },
  "timestamp": 1775798820500
}
```

#### 4.1.2 人员详情

```
GET /api/system/staff/{id}

Response:
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "avatarUrl": null,
    "phone": "138****8000",
    "departmentId": 1,
    "departmentName": "总部经营部",
    "status": 1,
    "createdAt": "2026-05-15T06:22:25.000Z",
    "updatedAt": "2026-05-15T06:22:25.000Z",
    "lastLoginAt": "2026-05-15T06:46:33.000Z",
    "roles": [ { "id": 1, "roleCode": "SYSTEM_ADMIN", "roleName": "系统管理员", "level": 4 } ]
  },
  "timestamp": 1775798820500
}
```

#### 4.1.3 新增人员

```
POST /api/system/staff

Request:
{
  "username": "zhangsan",
  "phone": "13800138001",
  "email": "zhangsan@example.com",
  "departmentId": 1,
  "status": 1,
  "roleIds": [4]
}

字段说明:
- username: 必填，用户名
- phone: 必填，11 位手机号
- 初始密码: 固定为 `admin123`（无需传 password，用户首次登录后可自行修改）
- email: 可选
- departmentId: 可选，所属部门 ID（可为经营部或项目部）
- status: 可选，默认 1（激活）
- roleIds: 必填，至少一个角色 ID

Response:
{
  "code": 200,
  "message": "操作成功",
  "data": 2,
  "timestamp": 1775798820500
}
```

> `data` 为新建用户的 ID。

#### 4.1.4 修改人员

```
PUT /api/system/staff/{id}

Request（字段均可选，**不含手机号、密码**）:
{
  "username": "zhangsan",
  "email": "zhangsan@example.com",
  "departmentId": 2,
  "status": 1,
  "roleIds": [3, 4]
}

说明:
- roleIds 传入时至少保留一个角色，会覆盖原角色绑定
- 修改手机号请使用 [4.1.5 修改人员手机号](#415-修改人员手机号)
- 重置密码请使用 [4.1.6 重置人员密码](#416-重置人员密码)

Response:
{
  "code": 200,
  "message": "操作成功",
  "data": null,
  "timestamp": 1775798820500
}
```

#### 4.1.5 修改人员手机号

```
PUT /api/system/staff/{id}/phone

Request:
{
  "phone": "13800138002"
}

说明:
- phone: 必填，11 位大陆手机号
- 手机号不可与其他用户重复

Response:
{
  "code": 200,
  "message": "操作成功",
  "data": null,
  "timestamp": 1775798820500
}
```

#### 4.1.6 重置人员密码

```
POST /api/system/staff/{id}/password/reset

说明:
- 无需请求体，将密码重置为固定值 `admin123`
- 重置后会清除该用户 Redis 中的 Token，需重新登录

Response:
{
  "code": 200,
  "message": "操作成功",
  "data": "密码已重置为 admin123，该用户需重新登录",
  "timestamp": 1775798820500
}
```

#### 4.1.7 禁用人员

```
DELETE /api/system/staff/{id}

说明: 将用户 status 设为 3（封禁），非物理删除；不能禁用当前登录账号。

Response:
{
  "code": 200,
  "message": "操作成功",
  "data": null,
  "timestamp": 1775798820500
}
```

---

### 4.2 部门管理

#### 组织架构规则

| 类型 | departmentType | 上级 parentId | 说明 |
|------|----------------|---------------|------|
| 经营部 | `operation` | 固定 `0`（顶级） | 不可挂在上级之下 |
| 项目部 | `project` | 必填，为某经营部 ID | 必须隶属经营部，不可再嵌套 |

> 接口字段 `parentId` 对应数据库 `department_data.print_id`。人员可归属**经营部**或**项目部**。

#### 数据权限（列表 / 树 / 详情）

与业务角色无关，**仅** `SYSTEM_ADMIN` 可见全部部门；其他用户按**本人所属部门类型与上下级**判断：

| 条件 | 可见范围 |
|------|----------|
| `SYSTEM_ADMIN` | 全部部门 |
| 所属部门为**经营部**（`operation`） | 本经营部 + 其下全部项目部 |
| 所属部门为**项目部**（`project`） | 仅所属项目部 |
| 未分配部门 | 不可见任何部门 |

#### 4.2.1 部门分页列表

```
GET /api/system/departments?page=1&size=10&keyword=华东&departmentType=project&parentId=1

Query Parameters:
- page, size: 分页，默认 1 / 10
- keyword: 部门名称模糊搜索（可选）
- departmentType: operation=经营部 / project=项目部（可选）
- parentId: 经营部 ID；返回该经营部自身 + 其下属项目部（传 `0` 时仅查顶级经营部）（可选）

Response:
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "records": [
      {
        "id": 2,
        "departmentName": "华东项目部",
        "departmentType": "project",
        "departmentTypeName": "项目部",
        "parentId": 1,
        "parentName": "总部经营部",
        "createTime": "2026-05-15T08:00:00",
        "updateTime": "2026-05-15T08:00:00",
        "children": []
      }
    ],
    "total": 1,
    "size": 10,
    "current": 1,
    "pages": 1
  },
  "timestamp": 1775798820500
}
```

#### 4.2.2 部门树（经营部 → 项目部）

```
GET /api/system/departments/tree

说明: 数据权限同 4.2.1；项目部人员若仅可见单个项目部，树可能为空（请用分页列表）

Response:
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "id": 1,
      "departmentName": "总部经营部",
      "departmentType": "operation",
      "departmentTypeName": "经营部",
      "parentId": 0,
      "parentName": null,
      "children": [
        {
          "id": 2,
          "departmentName": "华东项目部",
          "departmentType": "project",
          "departmentTypeName": "项目部",
          "parentId": 1,
          "parentName": "总部经营部",
          "children": []
        }
      ]
    }
  ],
  "timestamp": 1775798820500
}
```

#### 4.2.3 根据项目部查询上级经营部

```
GET /api/system/departments/parent-operation?projectId=2

Query Parameters:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| projectId | long | 是 | 项目部 ID |

说明:
- `projectId` 须为 `departmentType=project` 的部门
- 返回该项目部 `printId` 对应的经营部（扁平一条，结构同列表单条，`children` 为空数组）
- 须在部门数据权限内可见该项目部，否则 403
- 若项目部未关联经营部或数据异常，返回业务错误

Response.data 示例:
{
  "id": 1,
  "departmentName": "总部经营部",
  "departmentType": "operation",
  "departmentTypeName": "经营部",
  "parentId": 0,
  "parentName": null,
  "children": [],
  "createTime": "2026-05-15T08:00:00",
  "updateTime": "2026-05-15T08:00:00"
}
```

#### 4.2.4 部门详情

```
GET /api/system/departments/{id}

说明: 须在数据权限范围内，否则 403

说明:
- 经营部详情：data.children 为下属项目部列表
- 项目部详情：含 parentName（所属经营部名称）

Response（经营部示例）:
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": 1,
    "departmentName": "总部经营部",
    "departmentType": "operation",
    "departmentTypeName": "经营部",
    "parentId": 0,
    "parentName": null,
    "children": [
      {
        "id": 2,
        "departmentName": "华东项目部",
        "departmentType": "project",
        "departmentTypeName": "项目部",
        "parentId": 1,
        "parentName": "总部经营部",
        "children": []
      }
    ],
    "createTime": "2026-05-15T08:00:00",
    "updateTime": "2026-05-15T08:00:00"
  },
  "timestamp": 1775798820500
}
```

#### 4.2.5 新增部门

```
POST /api/system/departments

新增经营部:
{
  "departmentName": "总部经营部",
  "departmentType": "operation"
}

新增项目部:
{
  "departmentName": "华东项目部",
  "departmentType": "project",
  "parentId": 1
}

字段说明:
- departmentName: 必填，不可重复
- departmentType: 必填，operation（经营部）或 project（项目部）
- parentId: 项目部必填（经营部 ID）；经营部无需传，系统自动为 0

Response:
{
  "code": 200,
  "message": "操作成功",
  "data": 2,
  "timestamp": 1775798820500
}
```

#### 4.2.6 修改部门

```
PUT /api/system/departments/{id}

Request（字段均可选）:
{
  "departmentName": "华东一部",
  "parentId": 1
}

说明:
- 经营部修改后 parentId 始终为 0
- 项目部可调整所属经营部（parentId 须为经营部 ID）
- 经营部下仍有项目部时不可改为项目部；项目部有人员时不可改为经营部

Response:
{
  "code": 200,
  "message": "操作成功",
  "data": null,
  "timestamp": 1775798820500
}
```

#### 4.2.7 删除部门

```
DELETE /api/system/departments/{id}

说明:
- 软删除（写入 deleted_time）
- 经营部：下属仍有项目部时不可删
- 部门下仍有人员时不可删

Response:
{
  "code": 200,
  "message": "操作成功",
  "data": null,
  "timestamp": 1775798820500
}
```

---

### 4.3 权限管理（角色）

内置角色编码参考：`SYSTEM_ADMIN`、`OPERATE_ADMIN`、`PROJECT_ADMIN`、`SALES`。

#### 4.3.1 角色分页列表

```
GET /api/system/roles?page=1&size=10&keyword=管理

Query Parameters:
- page, size: 分页
- keyword: 模糊匹配角色名称/编码（可选）

Response:
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "records": [
      {
        "id": 1,
        "roleCode": "SYSTEM_ADMIN",
        "roleName": "系统管理员",
        "description": "系统最高管理员",
        "level": 4,
        "createdAt": "2026-02-01T00:00:00.000Z",
        "moduleCount": 12
      }
    ],
    "total": 4,
    "size": 10,
    "current": 1,
    "pages": 1
  },
  "timestamp": 1775798820500
}
```

#### 4.3.2 全部模块树

```
GET /api/system/roles/modules/tree

说明: 返回所有 status=1 的模块，按 parentId 组装为 children 树形结构，供新建/编辑角色时勾选。

Response:
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "id": 1,
      "parentId": 0,
      "moduleName": "数据概览",
      "moduleCode": "01",
      "icon": null,
      "path": null,
      "sort": 1,
      "status": 1,
      "isLast": 1,
      "children": []
    },
    {
      "id": 2,
      "parentId": 0,
      "moduleName": "客户管理",
      "moduleCode": "02",
      "children": [
        { "id": 9, "parentId": 2, "moduleName": "客户列表", "moduleCode": "09", "children": [] }
      ]
    }
  ],
  "timestamp": 1775798820500
}
```

#### 4.3.3 角色详情

```
GET /api/system/roles/{id}

Response:
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": 2,
    "roleCode": "OPERATE_ADMIN",
    "roleName": "经营部管理员",
    "description": "经营部管理员",
    "level": 3,
    "createdAt": "2026-02-01T00:00:00.000Z",
    "moduleIds": [1, 2, 3, 9, 10],
    "modules": [
      {
        "id": 2,
        "parentId": 0,
        "moduleName": "客户管理",
        "moduleCode": "02",
        "children": [
          { "id": 9, "moduleName": "客户列表", "children": [] }
        ]
      }
    ]
  },
  "timestamp": 1775798820500
}
```

> `moduleIds` 为扁平 ID 列表；`modules` 为含祖先节点的树形结构，便于前端展示。

#### 4.3.4 新增角色

```
POST /api/system/roles

Request:
{
  "roleCode": "CUSTOM_ROLE",
  "roleName": "自定义角色",
  "description": "描述",
  "level": 2,
  "moduleIds": [1, 2, 9, 10]
}

字段说明:
- roleCode: 必填，唯一
- roleName: 必填
- description: 可选
- level: 必填，角色层级（数字越大权限越高）
- moduleIds: 可选，绑定的模块 ID 列表

Response:
{
  "code": 200,
  "message": "操作成功",
  "data": 5,
  "timestamp": 1775798820500
}
```

#### 4.3.5 修改角色

```
PUT /api/system/roles/{id}

Request（字段均可选）:
{
  "roleCode": "CUSTOM_ROLE",
  "roleName": "自定义角色",
  "description": "更新描述",
  "level": 2,
  "moduleIds": [1, 2, 3]
}

说明:
- moduleIds 传入时会全量覆盖该角色的模块绑定
- `SYSTEM_ADMIN`（系统管理员）角色**禁止修改** moduleIds

Response:
{
  "code": 200,
  "message": "操作成功",
  "data": null,
  "timestamp": 1775798820500
}
```

#### 4.3.6 删除角色

```
DELETE /api/system/roles/{id}

说明:
- `SYSTEM_ADMIN`（系统管理员）角色**禁止删除**
- 其他角色若已分配给用户（user_roles 存在记录）则禁止删除

Response:
{
  "code": 200,
  "message": "操作成功",
  "data": null,
  "timestamp": 1775798820500
}
```

### 4.4 系统参数

数据表：`system`（字段 `code`、`key`、`value`、`type`、`unit`、`role_id`；接口 JSON 使用 `paramKey`、`paramValue`、`paramType`、`unit`、`roleId`）。

说明：参数由初始化数据维护，**不提供新增接口**；前端仅可修改参数值。

**数据权限**：

| 角色 | 可见 / 可改范围 |
|------|----------------|
| `SYSTEM_ADMIN` | 全部系统参数 |
| 其他角色 | 仅 `roleId` 与当前用户所持角色 ID 一致的记录 |

定时任务等内部读取（如客户保护期 `CPP`）不受接口权限限制，仍按 `paramKey` 查询。

#### 4.4.1 分页列表

```
GET /api/system/params?page=1&size=10&keyword=短信&code=SMS&paramKey=template&type=string

Query:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 默认 1 |
| size | int | 否 | 默认 10 |
| keyword | string | 否 | 模糊匹配 code、key、value、type |
| code | string | 否 | 精确匹配代码 |
| paramKey | string | 否 | 精确匹配键 |
| paramType | string | 否 | 精确匹配类型 |

排序: updatedTime 倒序

Response.data.records[]:
{
  "id": 1,
  "code": "SMS",
  "paramKey": "template_code",
  "paramValue": "100001",
  "paramType": "string",
  "unit": "元/㎡",
  "roleId": 4,
  "roleName": "成员",
  "createdBy": 2,
  "createdByName": "admin",
  "createTime": "2026-05-18T10:00:00",
  "updatedTime": "2026-05-18T10:00:00"
}
```

#### 4.4.2 按 key 查询 value

```
GET /api/system/params/by-key/CPP

说明:
- 根据 `paramKey`（表字段 `key`）返回参数值
- **不做** `roleId` 角色权限过滤，任意已登录用户均可调用
- 参数不存在时返回 2002

Response.data:
{
  "paramKey": "CPP",
  "paramValue": "30"
}
```

#### 4.4.3 详情 / 修改

```
GET /api/system/params/{id}

PUT /api/system/params/{id}
{
  "paramValue": "100002"
}

说明:
- **仅可修改** `paramValue`（对应表字段 `value`）
- `code`、`paramKey`、`paramType`、`unit`、`roleId` 等只读，由数据初始化维护
- 无权限访问时返回 403；记录不存在返回 2002
- 不提供删除接口
```

### 4.5 系统设置常见错误

| code | 场景 |
|------|------|
| 1001 | 人员不存在 |
| 1004 | 手机号/邮箱/用户名已存在 |
| 1006 | 用户已禁用 |
| 2001 | 不能禁用自己、部门有下级/人员、角色已分配用户、系统管理员禁止删除/改权限等 |
| 2002 | 部门/角色/模块/系统参数不存在 |
| 2003 | 部门名称、角色编码重复 |
| 40002 | 参数格式错误（如部门类型非法、手机号格式错误） |

---

## 5 渠道管理 API

渠道分为**渠道类型**（`channel` 表）与**二级实例数据**。当 `instanceType=agency` 时（如「中介公司」），二级数据为 `agency` 表中的中介公司信息；`instanceType=none` 时无二级数据。

> 已有库升级请执行 `sql/migrate_channel_agency.sql`。

### 5.0 接口总览

#### 渠道类型 `/api/channels`

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/channels` | 渠道类型分页列表 |
| GET | `/api/channels/{id}` | 渠道类型详情（中介公司渠道含 agencies） |
| POST | `/api/channels` | 新增渠道类型 |
| PUT | `/api/channels/{id}` | 修改渠道类型 |
| DELETE | `/api/channels/{id}` | 软删除渠道类型 |

#### 中介公司（二级）`/api/channels/{channelId}/agencies`

仅当渠道 `instanceType=agency` 时可操作。

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/channels/{channelId}/agencies` | 中介公司分页列表 |
| GET | `/api/channels/{channelId}/agencies/{agencyId}` | 中介公司详情 |
| POST | `/api/channels/{channelId}/agencies` | 新增中介公司 |
| PUT | `/api/channels/{channelId}/agencies/{agencyId}` | 修改中介公司 |
| DELETE | `/api/channels/{channelId}/agencies/{agencyId}` | 软删除中介公司 |

### 5.1 数据模型说明

| 字段 | 表 | 说明 |
|------|-----|------|
| `typeName` | channel | 渠道类型名称，如「中介公司」「老带新」 |
| `instanceType` | channel | `agency`：可挂中介公司；`none`：无二级数据 |
| `companyName` | agency | 中介公司名称 |
| `channelId` | agency | 所属渠道类型 ID |

**初始渠道类型**（见 `init_data.sql`）：中介公司（agency）、老带新、市场自来、全员营销、泛销（后四者为 none）。

### 5.2 渠道类型

#### 5.2.1 渠道类型分页列表

```
GET /api/channels?page=1&size=10&keyword=中介&instanceType=agency

Query Parameters:
- page: 页码，默认 1
- size: 每页条数，默认 10
- keyword: 类型名称模糊搜索（可选）
- instanceType: agency / none（可选）

Response:
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "records": [
      {
        "id": 1,
        "typeName": "中介公司",
        "instanceType": "agency",
        "hasAgency": true,
        "agencyCount": 3,
        "createTime": "2026-05-15T08:00:00",
        "updateTime": "2026-05-15T08:00:00",
        "agencies": []
      },
      {
        "id": 2,
        "typeName": "老带新",
        "instanceType": "none",
        "hasAgency": false,
        "agencyCount": 0,
        "createTime": "2026-05-15T08:00:00",
        "updateTime": "2026-05-15T08:00:00",
        "agencies": []
      }
    ],
    "total": 5,
    "size": 10,
    "current": 1,
    "pages": 1
  },
  "timestamp": 1775798820500
}
```

> 列表接口 `agencies` 为空数组；`agencyCount` 仅在 `hasAgency=true` 时有意义。

#### 5.2.2 渠道类型详情

```
GET /api/channels/{id}

说明: instanceType=agency 时，data.agencies 返回该渠道下全部中介公司（未分页）。

Response（中介公司渠道示例）:
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": 1,
    "typeName": "中介公司",
    "instanceType": "agency",
    "hasAgency": true,
    "agencyCount": 2,
    "agencies": [
      {
        "id": 1,
        "channelId": 1,
        "companyName": "某某房产中介",
        "createTime": "2026-05-15T09:00:00",
        "updateTime": "2026-05-15T09:00:00"
      }
    ],
    "createTime": "2026-05-15T08:00:00",
    "updateTime": "2026-05-15T08:00:00"
  },
  "timestamp": 1775798820500
}
```

#### 5.2.3 新增渠道类型

```
POST /api/channels

Request:
{
  "typeName": "中介公司",
  "instanceType": "agency"
}

字段说明:
- typeName: 必填，类型名称，不可与未删除记录重复
- instanceType: 可选，默认 none；agency=可挂中介公司，none=无二级数据

Response:
{
  "code": 200,
  "message": "操作成功",
  "data": 1,
  "timestamp": 1775798820500
}
```

#### 5.2.4 修改渠道类型

```
PUT /api/channels/{id}

Request（字段均可选）:
{
  "typeName": "中介渠道",
  "instanceType": "agency"
}

说明:
- 若渠道下仍有中介公司，不可将 instanceType 从 agency 改为 none

Response:
{
  "code": 200,
  "message": "操作成功",
  "data": null,
  "timestamp": 1775798820500
}
```

#### 5.2.5 删除渠道类型

```
DELETE /api/channels/{id}

说明:
- 软删除（写入 deleted_time）
- 已被来访(visit)或成交(deal_data)引用时不可删
- instanceType=agency 且下属仍有中介公司时，需先删除中介公司

Response:
{
  "code": 200,
  "message": "操作成功",
  "data": null,
  "timestamp": 1775798820500
}
```

### 5.3 中介公司（二级数据）

#### 5.3.1 中介公司分页列表

```
GET /api/channels/{channelId}/agencies?page=1&size=10&keyword=房产

Query Parameters:
- page, size: 分页，默认 1 / 10
- keyword: 公司名称模糊搜索（可选）

说明: channelId 对应渠道的 instanceType 必须为 agency，否则返回参数错误。

Response:
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "records": [
      {
        "id": 1,
        "channelId": 1,
        "companyName": "某某房产中介",
        "createTime": "2026-05-15T09:00:00",
        "updateTime": "2026-05-15T09:00:00"
      }
    ],
    "total": 1,
    "size": 10,
    "current": 1,
    "pages": 1
  },
  "timestamp": 1775798820500
}
```

#### 5.3.2 中介公司详情

```
GET /api/channels/{channelId}/agencies/{agencyId}

Response: data 为 AgencyVO 对象，结构同列表单条记录。
```

#### 5.3.3 新增中介公司

```
POST /api/channels/{channelId}/agencies

Request:
{
  "companyName": "某某房产中介"
}

字段说明:
- companyName: 必填，同一渠道下不可重复

Response:
{
  "code": 200,
  "message": "操作成功",
  "data": 1,
  "timestamp": 1775798820500
}
```

#### 5.3.4 修改中介公司

```
PUT /api/channels/{channelId}/agencies/{agencyId}

Request（字段均可选）:
{
  "companyName": "某某房产中介有限公司"
}

Response:
{
  "code": 200,
  "message": "操作成功",
  "data": null,
  "timestamp": 1775798820500
}
```

#### 5.3.5 删除中介公司

```
DELETE /api/channels/{channelId}/agencies/{agencyId}

说明: 已被来访记录(visit)引用为渠道实例时不可删除。

Response:
{
  "code": 200,
  "message": "操作成功",
  "data": null,
  "timestamp": 1775798820500
}
```

### 5.4 渠道管理常见错误

| code | 场景 |
|------|------|
| 2001 | 渠道被业务引用、下属仍有中介公司、中介公司被来访引用、渠道类型变更冲突等 |
| 2002 | 渠道或中介公司不存在 |
| 2003 | 渠道类型名称或公司名称重复 |
| 40002 | instanceType 非法、非 agency 渠道操作 agencies 接口等 |

---

## 6 客户管理 API

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/clients` | 客户分页列表（数据权限 + 联系人电话脱敏） |
| GET | `/api/clients/public-pool` | 公海客户分页（联系人电话全量脱敏） |
| POST | `/api/clients/public-pool/{id}/claim` | 认领公海客户 |
| GET | `/api/clients/{id}` | 客户详情（含联系人、来访记录） |
| POST | `/api/clients` | 新增客户（可关联联系人） |
| PUT | `/api/clients/{id}` | 修改客户 |
| DELETE | `/api/clients/{id}` | 软删除客户 |
| GET | `/api/clients/{id}/contacts` | 查询客户关联联系人 |
| POST | `/api/clients/{id}/contacts` | 绑定联系人 |
| DELETE | `/api/clients/{id}/contacts/{contactId}` | 解绑联系人 |

### 6.1 数据权限与电话脱敏

客户、联系人模块采用**相同**的数据权限与电话脱敏规则（均依据记录上的 `createdBy` 字段）。

**数据权限**（与 [4.2 部门数据权限](#数据权限列表--树--详情) 一致：按用户所属部门类型与上下级，**非**按业务角色区分）

| 条件 | 可见客户/联系人范围 |
|------|---------------------|
| `SYSTEM_ADMIN` | 全部 |
| 所属**经营部** | 本经营部及下属项目部内**所有成员**创建的记录 |
| 所属**项目部** | 本项目部内**所有成员**创建的记录 |
| 未分配部门 | 不可见 |

**电话脱敏**（客户关联的 `contacts`、联系人列表/详情、`GET /api/clients/{id}/contacts`）：

- 仅当该联系人或客户的 `createdBy` 等于当前登录用户时，返回完整手机号
- 否则 `contactPhone` 为脱敏格式，如 `138****8000`

> 在客户接口中嵌套展示的联系人，脱敏依据**客户**的 `createdBy`；在联系人模块接口中，脱敏依据**联系人**自身的 `createdBy`。

### 6.2 新增客户

```
POST /api/clients

方式一 — 关联已有联系人（传 contactIds）:
{
  "clientName": "张三",
  "idType": "身份证",
  "idNumber": "110101199001011234",
  "contactIds": [1, 2]
}

方式二 — 同步新增联系人并关联（传 newContacts）:
{
  "clientName": "张三",
  "newContacts": [
    {
      "contactName": "李四",
      "contactPhone": "13800138001",
      "model": "客户",
      "remark": "主要联系人"
    }
  ]
}

方式一 + 方式二 可同时使用:
{
  "clientName": "张三",
  "contactIds": [1],
  "newContacts": [
    {
      "contactName": "王五",
      "contactPhone": "13800138002"
    }
  ]
}

说明:
- clientName: 必填
- idType / idNumber: 可选，但若填写须同时填写；组合唯一不可重复
- contactIds: 可选，已有联系人 ID 列表
- newContacts: 可选，新建联系人信息列表；元素字段同 POST /api/contacts（contactName、contactPhone 必填）
- contactIds 与 newContacts 至少传其一或都不传；都传时先创建 newContacts 再与 contactIds 一并关联
- 创建人自动记录为当前登录用户
- 新建客户状态默认为 `mine`（我的客户）
- 同时写入 `claimTime`（认领时间）

Response.data: 新建客户 ID（long）
```

### 6.2A 客户状态说明

| 状态值 | 含义 | 说明 |
|--------|------|------|
| `mine` | 我的客户 | 新录入客户，默认状态 |
| `tenant` | 租户 | 成交后自动变更 |
| `public_pool` | 公海 | 超保护期等场景转入（列表接口不展示） |

客户列表接口仅查询 `mine`、`tenant`；成交创建成功后，关联客户自动更新为 `tenant`；登记退租后，仅当该客户**无其他未退租成交**时，才将租户客户恢复为 `mine`。

**认领时间 `claimTime`**：首次录入客户、公海认领时写入；用于客户保护期计算。

**客户保护期**：系统参数 `system` 表中 `key=CPP` 的 `value`（天，默认 30）。每日凌晨 1 点定时任务将超保护期的「我的客户」转入公海（`client_status=public_pool`，`created_by` 置空）。

### 6.2B 公海客户

#### 公海分页列表

```
GET /api/clients/public-pool?page=1&size=10&keyword=张

Query: page、size、keyword（同 6.3，无 status 参数）

说明:
- 仅返回 `client_status=public_pool` 的客户
- 所有登录用户均可查看
- 关联联系人 `contactPhone` **全量脱敏**（如 `***********`）

Response: 结构同 6.3 客户分页
```

#### 认领公海客户

```
POST /api/clients/public-pool/{id}/claim

说明:
- 仅 `public_pool` 状态可认领
- 认领后：`client_status=mine`，`created_by` 为当前用户，`claimTime` 更新为当前时间
- 返回认领后的客户信息（联系人电话按本人权限展示，不脱敏）

Response.data: ClientVO（同列表单条）
```

### 6.3 客户分页列表

```
GET /api/clients?page=1&size=10&keyword=张&status=mine

Query Parameters:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认 1 |
| size | int | 否 | 每页条数，默认 10 |
| keyword | string | 否 | 模糊匹配客户姓名、证件类型、证件编号 |
| status | string | 否 | `mine` 或 `tenant`；不传则返回二者（不含公海） |

排序: 按 updateTime 倒序

Response:
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "records": [
      {
        "id": 1,
        "clientName": "张三",
        "idType": "身份证",
        "idNumber": "110101199001011234",
        "createdBy": 2,
        "clientStatus": "mine",
        "clientStatusName": "我的客户",
        "visitCount": 3,
        "contacts": [
          {
            "id": 10,
            "contactName": "李四",
            "contactPhone": "138****8000",
            "model": "客户",
            "remark": "主要联系人",
            "createTime": "2026-05-15T09:00:00",
            "updateTime": "2026-05-15T09:00:00"
          }
        ],
        "createTime": "2026-05-10T10:00:00",
        "updateTime": "2026-05-15T14:30:00"
      }
    ],
    "total": 1,
    "size": 10,
    "current": 1,
    "pages": 1
  },
  "timestamp": 1775798820500
}
```

**records[] 字段说明**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | long | 客户 ID |
| clientName | string | 客户姓名 |
| idType | string | 证件类型，可为 null |
| idNumber | string | 证件编号，可为 null |
| createdBy | long | 创建人用户 ID；公海客户为 null |
| claimTime | datetime | 认领时间 |
| clientStatus | string | 状态：`mine` / `tenant` / `public_pool` |
| clientStatusName | string | 状态中文名 |
| visitCount | int | 该客户未删除来访记录数 |
| contacts | array | 关联联系人列表，结构见 [ContactVO](#contactvo) |
| createTime | datetime | 创建时间 |
| updateTime | datetime | 更新时间 |

> `contacts[].contactPhone` 按 [6.1 脱敏规则](#61-数据权限与电话脱敏) 返回；非本人创建的客户为 `138****8000` 格式。

### 6.4 客户详情

```
GET /api/clients/{id}

说明: 需具备该客户的数据查看权限（见 6.1）；无权限返回 403。

Response:
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": 1,
    "clientName": "张三",
    "idType": "身份证",
    "idNumber": "110101199001011234",
    "createdBy": 2,
    "createTime": "2026-05-10T10:00:00",
    "updateTime": "2026-05-15T14:30:00",
    "contacts": [
      {
        "id": 10,
        "contactName": "李四",
        "contactPhone": "13800138000",
        "model": "客户",
        "remark": "主要联系人",
        "createTime": "2026-05-15T09:00:00",
        "updateTime": "2026-05-15T09:00:00"
      }
    ],
    "visits": [
      {
        "id": 100,
        "visitDate": "2026-05-15",
        "clientId": 1,
        "clientName": "张三",
        "houseIds": [1, 2],
        "houses": [
          { "id": 1, "houseName": "A栋101" },
          { "id": 2, "houseName": "B栋202" }
        ],
        "channelId": 1,
        "channelTypeName": "中介公司",
        "channelInstanceId": 5,
        "channelInstanceName": "某某房产中介",
        "detailDescription": "首次到访",
        "requirementsConfig": { "面积": "500", "预算": "100万" },
        "createTime": "2026-05-15T11:00:00",
        "updateTime": "2026-05-15T11:00:00"
      }
    ]
  },
  "timestamp": 1775798820500
}
```

**data 字段说明**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | long | 客户 ID |
| clientName | string | 客户姓名 |
| idType | string | 证件类型 |
| idNumber | string | 证件编号 |
| createdBy | long | 创建人用户 ID |
| contacts | array | 关联联系人，结构见 [ContactVO](#contactvo) |
| visits | array | 该客户全部来访记录（按 visitDate、updateTime 倒序），结构见 [VisitVO](#visitvo) |
| createTime | datetime | 创建时间 |
| updateTime | datetime | 更新时间 |

### 6.5 客户关联联系人列表

```
GET /api/clients/{id}/contacts

说明: 返回结构与详情中 contacts 相同；电话脱敏规则同 6.1。

Response:
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "id": 10,
      "contactName": "李四",
      "contactPhone": "138****8000",
      "model": "客户",
      "remark": "主要联系人",
      "createTime": "2026-05-15T09:00:00",
      "updateTime": "2026-05-15T09:00:00"
    }
  ],
  "timestamp": 1775798820500
}
```

### 6.6 绑定 / 解绑联系人

```
POST /api/clients/{id}/contacts
{ "contactIds": [1, 2] }

DELETE /api/clients/{id}/contacts/{contactId}
```

---

## 6A 联系人 API

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/contacts` | 联系人分页列表（数据权限 + 电话脱敏） |
| GET | `/api/contacts/{id}` | 联系人详情（数据权限 + 电话脱敏） |
| POST | `/api/contacts` | 新增联系人 |
| PUT | `/api/contacts/{id}` | 修改联系人 |
| DELETE | `/api/contacts/{id}` | 软删除联系人 |

<a id="contactvo"></a>

**ContactVO（联系人对象）**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | long | 联系人 ID |
| contactName | string | 联系人姓名 |
| contactPhone | string | 联系电话；非本人创建的记录为脱敏格式 |
| model | string | 从属类型，如「客户」「中介公司」，可为 null |
| remark | string | 备注，可为 null |
| createdBy | long | 创建人用户 ID |
| createTime | datetime | 创建时间 |
| updateTime | datetime | 更新时间 |

### 6A.1 新增联系人

```
POST /api/contacts

Request:
{
  "contactName": "李四",
  "contactPhone": "13800138000",
  "model": "客户",
  "remark": "备注"
}

说明:
- contactName、contactPhone 必填，手机号为 11 位
- contactPhone 全局唯一（未删除记录内）
- 创建人自动记录为当前登录用户

Response.data: 新建联系人 ID（long）
```

### 6A.2 联系人分页列表

```
GET /api/contacts?page=1&size=10&keyword=李&phone=13800138000

Query Parameters:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认 1 |
| size | int | 否 | 每页条数，默认 10 |
| keyword | string | 否 | 模糊匹配姓名、电话、备注 |
| phone | string | 否 | 手机号精确匹配 |

排序: 按 updateTime 倒序

数据权限: 同 [6.1](#61-数据权限与电话脱敏)，仅返回当前用户有权查看的联系人。

Response:
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "records": [
      {
        "id": 10,
        "contactName": "李四",
        "contactPhone": "138****8000",
        "model": "客户",
        "remark": "主要联系人",
        "createdBy": 2,
        "createTime": "2026-05-15T09:00:00",
        "updateTime": "2026-05-15T09:00:00"
      }
    ],
    "total": 1,
    "size": 10,
    "current": 1,
    "pages": 1
  },
  "timestamp": 1775798820500
}
```

> 示例中 `contactPhone` 为脱敏格式；`createdBy` 为当前用户时返回完整手机号。

### 6A.3 联系人详情

```
GET /api/contacts/{id}

说明: 需具备该联系人的数据查看权限；无权限返回 403。

Response:
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": 10,
    "contactName": "李四",
    "contactPhone": "13800138000",
    "model": "客户",
    "remark": "主要联系人",
    "createdBy": 2,
    "createTime": "2026-05-15T09:00:00",
    "updateTime": "2026-05-15T09:00:00"
  },
  "timestamp": 1775798820500
}
```

字段说明同 [ContactVO](#contactvo)。`contactPhone` 脱敏规则同 [6.1](#61-数据权限与电话脱敏)。

---

## 7 客户来访 API

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/visits` | 来访分页列表（数据权限） |
| GET | `/api/visits/{id}` | 来访详情（数据权限） |
| POST | `/api/visits` | 新增来访 |
| PUT | `/api/visits/{id}` | 修改来访 |
| DELETE | `/api/visits/{id}` | 软删除来访 |

<a id="visitvo"></a>

**VisitVO（来访记录对象）**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | long | 来访 ID |
| visitDate | date | 跟进/来访日期，格式 `yyyy-MM-dd` |
| clientId | long | 关联客户 ID |
| clientName | string | 客户姓名（列表/详情 enrich 填充） |
| houseIds | long[] | 带看房源 ID 列表，可为 null 或空数组 |
| houses | array | 房源摘要列表，元素见下表 |
| channelId | long | 渠道类型 ID，可为 null |
| channelTypeName | string | 渠道类型名称（enrich 填充） |
| channelInstanceId | long | 渠道实例 ID（中介公司/客户/用户/联系人等），可为 null |
| channelInstanceName | string | 渠道实例展示名称（创建时解析或手填） |
| detailDescription | string | 详情说明 |
| requirementsConfig | object | 需求清单 JSON，键值自定义 |
| createdBy | long | 添加人用户 ID |
| createdByName | string | 添加人姓名（列表/详情 enrich 填充） |
| createTime | datetime | 创建时间 |
| updateTime | datetime | 更新时间 |

**houses[] 元素（HouseBriefVO）**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | long | 房源 ID |
| houseName | string | 房源名称 |
| houseStatus | string | 房源状态编码，见 [8.0](#80-房源状态) |
| houseStatusName | string | 房源状态名称 |

### 7.1 数据权限

按来访记录的 **添加人**（`createdBy`）过滤，规则与 [6.1](#61-数据权限与电话脱敏) 一致：

| 条件 | 可见来访范围 |
|------|----------------|
| `SYSTEM_ADMIN` | 全部 |
| 所属**经营部** | 本经营部及下属项目部**成员添加**的来访 |
| 所属**项目部** | 本项目部**成员添加**的来访 |
| 未分配部门 | 不可见 |

新建来访时自动写入当前登录用户为 `createdBy`；关联客户须在权限范围内；带看房源须在 [8.1 房源数据权限](#81-数据权限) 范围内。

### 7.2 来访分页列表

```
GET /api/visits?page=1&size=10&clientId=1&houseId=2&channelId=1&visitDateFrom=2026-01-01&visitDateTo=2026-12-31

Query Parameters:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认 1 |
| size | int | 否 | 每页条数，默认 10 |
| clientId | long | 否 | 按客户 ID 筛选 |
| houseId | long | 否 | 按带看房源 ID 筛选（`houseIds` 包含该房源） |
| channelId | long | 否 | 按渠道类型 ID 筛选 |
| visitDateFrom | date | 否 | 来访日期起（含），`yyyy-MM-dd` |
| visitDateTo | date | 否 | 来访日期止（含），`yyyy-MM-dd` |

排序: 按 updateTime 倒序

Response:
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "records": [
      {
        "id": 100,
        "visitDate": "2026-05-15",
        "clientId": 1,
        "clientName": "张三",
        "houseIds": [1, 2],
        "houses": [
          { "id": 1, "houseName": "A栋101" },
          { "id": 2, "houseName": "B栋202" }
        ],
        "channelId": 1,
        "channelTypeName": "中介公司",
        "channelInstanceId": 5,
        "channelInstanceName": "某某房产中介",
        "detailDescription": "首次到访",
        "requirementsConfig": { "面积": "500", "预算": "100万" },
        "createTime": "2026-05-15T11:00:00",
        "updateTime": "2026-05-15T11:00:00"
      }
    ],
    "total": 1,
    "size": 10,
    "current": 1,
    "pages": 1
  },
  "timestamp": 1775798820500
}
```

字段说明见 [VisitVO](#visitvo)。`houses` 根据 `houseIds` 批量查询填充；ID 不存在或已删除的房源不会出现在 `houses` 中。

### 7.3 来访详情

```
GET /api/visits/{id}

Response:
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": 100,
    "visitDate": "2026-05-15",
    "clientId": 1,
    "clientName": "张三",
    "houseIds": [1, 2],
    "houses": [
      { "id": 1, "houseName": "A栋101" },
      { "id": 2, "houseName": "B栋202" }
    ],
    "channelId": 1,
    "channelTypeName": "中介公司",
    "channelInstanceId": 5,
    "channelInstanceName": "某某房产中介",
    "detailDescription": "首次到访",
    "requirementsConfig": { "面积": "500", "预算": "100万" },
    "createTime": "2026-05-15T11:00:00",
    "updateTime": "2026-05-15T11:00:00"
  },
  "timestamp": 1775798820500
}
```

结构与列表单条 `records[]` 一致，字段说明见 [VisitVO](#visitvo)。

### 7.4 新增来访

```
POST /api/visits

Request:
{
  "visitDate": "2026-05-15",
  "clientId": 1,
  "houseIds": [1, 2],
  "channelId": 1,
  "channelInstanceId": 1,
  "detailDescription": "首次到访",
  "requirementsConfig": { "面积": "500", "预算": "100万" }
}

渠道实例规则（channelId 对应渠道类型）:
| 渠道类型 | instanceType / 名称 | channelInstanceId | channelInstanceName |
|----------|---------------------|-------------------|---------------------|
| 中介公司 | agency | **必填**，agency 表 ID | 由后端解析，可不传 |
| 老带新 | - | 可选，客户 client ID | 可选；未传 ID 时可为空 |
| 全员营销 | - | 可选，用户 users ID | 可选；未传 ID 时可为空 |
| 泛销 | - | 可选，联系人 contact ID | 可选；未传 ID 时可为空 |
| 市场自来等 | none | 不需传 | 可选手填 |

Response.data 为新建来访 ID
```

---

## 7A 客户来访草稿 API

业务字段与正式来访一致，**均可为空**；不做渠道/客户/房源业务校验。仅当前登录用户可查看、修改、删除自己的草稿。

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/visit-drafts` | 草稿分页列表 |
| GET | `/api/visit-drafts/{id}` | 草稿详情 |
| POST | `/api/visit-drafts` | 新增草稿 |
| PUT | `/api/visit-drafts/{id}` | 修改草稿（全量覆盖业务字段） |
| DELETE | `/api/visit-drafts/{id}` | 软删除草稿 |

### 7A.1 分页列表

```
GET /api/visit-drafts?page=1&size=10&clientId=1&keyword=首次

Query:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 默认 1 |
| size | int | 否 | 默认 10 |
| clientId | long | 否 | 按客户筛选 |
| keyword | string | 否 | 详情说明模糊搜索 |

说明: 仅返回 `createdBy` 为当前用户的草稿；按 updateTime 倒序。
```

### 7A.2 详情 / 新增 / 修改 / 删除

```
GET /api/visit-drafts/{id}
POST /api/visit-drafts
PUT /api/visit-drafts/{id}
DELETE /api/visit-drafts/{id}
```

**请求体**（POST/PUT，字段均可空，与 VisitVO 业务字段一致）:

```json
{
  "visitDate": "2026-05-15",
  "clientId": 1,
  "houseIds": [1, 2],
  "channelId": 1,
  "channelInstanceId": null,
  "channelInstanceName": null,
  "detailDescription": "草稿说明",
  "requirementsConfig": { "面积": "500" }
}
```

响应 `VisitDraftVO` 结构类似 [VisitVO](#visitvo)，含 `createdBy`、`createTime`、`updateTime`；列表/详情会 enrich 客户名、渠道名、房源摘要。

---

## 8 房源管理 API

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/houses` | 房源分页列表（按项目部数据权限） |
| GET | `/api/houses/{id}` | 房源详情 |
| POST | `/api/houses` | 新增房源 |
| PUT | `/api/houses/{id}` | 修改房源 |
| DELETE | `/api/houses/{id}` | 软删除房源 |
| POST | `/api/houses/{id}/guide-prices/rollback` | 回退最新指导价版本 |
| POST | `/api/houses/{id}/assessed-prices/rollback` | 回退最新评估价版本 |
| POST | `/api/price-batches/{id}/rollback` | 回退批量调价批次 |

**批量调价（`price-batches`）**

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/price-batches/template` | 下载批量调价 Excel 模板 |
| POST | `/api/price-batches/upload` | 上传 Excel 批量调价 |
| GET | `/api/price-batches` | 批量调价记录分页 |
| GET | `/api/price-batches/{id}` | 批量调价记录详情 |
| POST | `/api/price-batches/{id}/rollback` | 回退批量调价批次 |

### 8.0 房源状态

| 编码 `houseStatus` | 名称 `houseStatusName` | 说明 |
|--------------------|------------------------|------|
| `idle` | 闲置 | 新建房源默认值 |
| `rented` | 在租 | 新增成交成功后，关联房源自动变更为在租 |
| （退租） | 闲置 | 登记实际退租后，关联房源自动恢复为闲置 |

列表、详情响应均包含 `houseStatus`、`houseStatusName`。新增成交时仅允许选择**闲置**房源；签约成功后相关房源状态批量更新为在租；登记退租后恢复为闲置。

### 8.0.1 指导价 / 评估价（版本说明）

| 概念 | 说明 |
|------|------|
| 版本字段 | 版本号存于 `guide_price_data.version`、`assessed_price_data.version`，**按房源、按价格类型**从 1 递增 |
| 展示名称 | `versionName` 为展示用，如 `V1`、`V2`（与 `version` 对应） |
| 单条维护 | 创建房源、修改房源时手工调价：仅写价格表，`priceVisionId` 为 `null` |
| 批量调整 | 批量上传 Excel 写入 `price_vision_data` 并关联 `priceVisionId`；见 [8.7](#87-批量调价) |

**价格记录对象**（列表 `guidePrice`/`assessedPrice`、详情 `guidePrices[]`/`assessedPrices[]` 元素结构一致）:

| 字段 | 类型 | 说明 |
|------|------|------|
| id | long | 价格记录 ID |
| priceValue | int | 价格数值 |
| version | int | 房源内版本号（指导价与评估价各自独立） |
| priceVisionId | long \| null | 批量调整批次 ID；单条维护为 null |
| versionName | string | 展示名称，如 `V2` |
| effectiveDate | date | 生效日期 |
| expiryDate | date \| null | 失效日期；当前有效记录常为 null |
| createTime | datetime | 创建时间 |
| updateTime | datetime | 更新时间 |

### 8.1 数据权限

按房源所属项目部（`departmentId`）过滤，规则与 [4.2 部门数据权限](#数据权限列表--树--详情) 一致：

| 条件 | 可见房源范围 |
|------|--------------|
| `SYSTEM_ADMIN` | 全部 |
| 所属**经营部** | 下属全部**项目部**下的房源（房源仅挂项目部） |
| 所属**项目部** | 本项目部下的房源 |
| 未分配部门 | 不可见 |

新建/修改时 `departmentId` 须为有效项目部，且在上述可见范围内。

### 8.2 新增房源

```
POST /api/houses

Request:
{
  "houseName": "A栋101",
  "rentableArea": 500.00,
  "nonRentableArea": 50.00,
  "totalArea": 550.00,
  "certificatedArea": 480.00,
  "uncertificatedArea": 70.00,
  "location": "XX路88号",
  "description": "临街商铺",
  "images": ["/uploads/2026/05/house1.jpg"],
  "departmentId": 2,
  "operationDepartmentId": 1,
  "guidePrice": {
    "priceValue": 12000,
    "effectiveDate": "2026-05-15",
    "expiryDate": null
  },
  "assessedPrice": {
    "priceValue": 11500,
    "effectiveDate": "2026-05-15",
    "expiryDate": null
  }
}

说明:
- houseName、departmentId、operationDepartmentId、guidePrice、assessedPrice 必填
- departmentId 须为项目部（department_type=project）
- operationDepartmentId 须为经营部（department_type=operation），且须为该项目部的上级经营部
- images 为图片 URL 数组，通常由文件上传接口获得
- 指导价/评估价各新增一条记录，`version` 均为 **1**（两类价格版本互不影响）
- `guidePrice` / `assessedPrice` 结构：`priceValue`、`effectiveDate` 必填；`expiryDate` 可选
- 新建房源默认状态为 **闲置**（`houseStatus=idle`）

Response.data: 新建房源 ID（long）
```

### 8.3 房源分页列表

```
GET /api/houses?page=1&size=10&keyword=A栋&departmentId=2&houseStatus=idle

Query Parameters:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认 1 |
| size | int | 否 | 每页条数，默认 10 |
| keyword | string | 否 | 模糊匹配房源名称、坐落、描述 |
| departmentId | long | 否 | 按项目部筛选（须在权限范围内） |
| houseStatus | string | 否 | 房源状态：`idle`（闲置）、`rented`（在租） |

排序: 按 updateTime 倒序

说明:
- 每条房源附带当前**最高版本**指导价、评估价（`version` 最大的一条）；无记录时为 `null`
- 价格字段结构见 [8.0 价格记录对象](#80-指导价--评估价版本说明)

Response:
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "records": [
      {
        "id": 1,
        "houseName": "A栋101",
        "rentableArea": 500.00,
        "nonRentableArea": 50.00,
        "totalArea": 550.00,
        "certificatedArea": 480.00,
        "uncertificatedArea": 70.00,
        "location": "XX路88号",
        "description": "临街商铺",
        "images": ["/uploads/2026/05/house1.jpg"],
        "departmentId": 2,
        "departmentName": "城东项目部",
        "operationDepartmentId": 1,
        "operationDepartmentName": "总部经营部",
        "houseStatus": "idle",
        "houseStatusName": "闲置",
        "guidePrice": {
          "id": 3,
          "priceValue": 12500,
          "version": 2,
          "priceVisionId": null,
          "versionName": "V2",
          "effectiveDate": "2026-06-01",
          "expiryDate": null,
          "createTime": "2026-06-01T10:00:00",
          "updateTime": "2026-06-01T10:00:00"
        },
        "assessedPrice": {
          "id": 2,
          "priceValue": 11800,
          "version": 1,
          "priceVisionId": null,
          "versionName": "V1",
          "effectiveDate": "2026-05-15",
          "expiryDate": null,
          "createTime": "2026-05-15T10:00:00",
          "updateTime": "2026-05-15T10:00:00"
        },
        "createTime": "2026-05-15T10:00:00",
        "updateTime": "2026-05-15T10:00:00"
      }
    ],
    "total": 1,
    "size": 10,
    "current": 1,
    "pages": 1
  },
  "timestamp": 1775798820500
}
```

### 8.4 房源详情

```
GET /api/houses/{id}

Response.data:
{
  "house": { /* 房源基础字段，同列表 records[]，不含 guidePrice/assessedPrice */ },
  "guidePrices": [
    {
      "id": 3,
      "priceValue": 12500,
      "version": 2,
      "priceVisionId": null,
      "versionName": "V2",
      "effectiveDate": "2026-06-01",
      "expiryDate": null,
      "createTime": "2026-06-01T10:00:00",
      "updateTime": "2026-06-01T10:00:00"
    },
    {
      "id": 1,
      "priceValue": 12000,
      "version": 1,
      "priceVisionId": null,
      "versionName": "V1",
      "effectiveDate": "2026-05-15",
      "expiryDate": "2026-05-31",
      "createTime": "2026-05-15T10:00:00",
      "updateTime": "2026-06-01T10:00:00"
    }
  ],
  "assessedPrices": [ /* 结构同 guidePrices */ ]
}

说明:
- `guidePrices`、`assessedPrices` 为全量历史，按 `version` **降序**排列；最高版本为数组首条
- 无权限返回 403
```

### 8.5 修改 / 删除

```
PUT /api/houses/{id}

Request（基础字段均可选）:
{
  "houseName": "A栋101-更新",
  "departmentId": 2,
  "operationDepartmentId": 1,
  "rentableArea": 520.00,
  "guidePrice": {
    "priceValue": 12500,
    "effectiveDate": "2026-06-01"
  },
  "assessedPrice": {
    "priceValue": 11800,
    "effectiveDate": "2026-06-01"
  }
}

说明:
- `operationDepartmentId` 可选；传入时须为经营部且与当前/请求中的项目部匹配；仅改 `departmentId` 时会校验已有经营部是否仍匹配新项目部
- **仅修改基础信息**：不传 `guidePrice`/`assessedPrice`，或传 `null`/空对象 `{}`，**不新增**价格版本
- **追加价格版本**：对应对象中 `priceValue` 与 `effectiveDate` **均有值** 时，该类型 `version` 自动 +1 并插入新记录；缺一则不处理该类型
- 修改基础信息不会覆盖历史价格
- 新价格生效时，将同类型当前未失效记录（`expiryDate` 为 null）的 `expiryDate` 设为新生效日前一天

示例（只改名称，不调价）:
```json
{ "houseName": "A栋101-更新" }
```

DELETE /api/houses/{id}
```

删除约束：若房源被来访、成交、指导价、评估价或内部招租引用，则无法删除。

### 8.6 价格版本回退

#### 8.6.1 回退房源最新指导价

```
POST /api/houses/{id}/guide-prices/rollback

说明:
- 软删除当前最高 `version` 的指导价记录
- 将回退后当前最高版本的 `expiryDate` 置为 `null`（恢复为有效）
- 已是 V1 时返回业务错误
- 若该版本已被成交引用（`deal_data.guide_price_id`），无法回退

Response.data: 回退后的当前有效指导价（价格记录对象，结构见 8.0）
```

示例响应:

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": 1,
    "priceValue": 12000,
    "version": 1,
    "priceVisionId": null,
    "versionName": "V1",
    "effectiveDate": "2026-05-15",
    "expiryDate": null,
    "createTime": "2026-05-15T10:00:00",
    "updateTime": "2026-06-02T10:00:00"
  }
}
```

#### 8.6.2 回退房源最新评估价

```
POST /api/houses/{id}/assessed-prices/rollback

说明: 同 8.6.1，作用于评估价；成交引用字段为 `assessed_price_id`
```

#### 8.6.3 回退批量调价批次

```
POST /api/price-batches/{id}/rollback

说明:
- 软删除该批次下全部价格记录（`price_vision_id` = 批次 ID）
- 按涉及房源恢复各房源当前最高有效版本的 `expiryDate` 为 `null`
- 批次 `status` 更新为 `rolled_back`；已回退批次不可重复操作
- 批次内任一条价格被成交引用则整批无法回退
- 须对批次涉及的全部房源具备数据权限

Response: 无 data
```

### 8.7 批量调价

#### 8.7.1 下载模板

```
GET /api/price-batches/template?priceType=guide

Query:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| priceType | string | 是 | `guide` 指导价 / `assessed` 评估价 |

Response: Excel 文件流（`.xlsx`）

模板列:
| 列名 | 必填 | 说明 |
|------|------|------|
| 房源ID | 是 | 系统房源主键 |
| 房源名称 | 否 | 仅作核对，与系统不一致将报错 |
| 价格(元) | 是 | 整数 |
| 生效日期 | 是 | `yyyy-MM-dd` |
| 失效日期 | 否 | `yyyy-MM-dd`，留空表示长期有效 |
```

#### 8.7.2 上传批量调价

```
POST /api/price-batches/upload
Content-Type: multipart/form-data

Form:
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| priceType | string | 是 | `guide` / `assessed` |
| file | file | 是 | `.xlsx`，单次最多 5000 行 |
| batchName | string | 否 | 批次名称，默认自动生成 |
| remark | string | 否 | 备注 |

说明:
- 同一文件内房源 ID 不可重复
- 须在房源数据权限范围内
- 全部校验通过后事务写入：创建批次记录 + 各房源新增一条价格（`version`+1，`priceVisionId`=批次ID）
- `houseSnapshot` 记录各房源调价后的版本号，供回退使用
- `sourceFile` 保存上传文件相对路径（`/uploads/price-batch/...`）

Response.data: 批量批次对象（见 8.7.4）
```

#### 8.7.3 批量记录分页

```
GET /api/price-batches?page=1&size=10&priceType=guide&status=applied&keyword=6月

Query:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 默认 1 |
| size | int | 否 | 默认 10 |
| priceType | string | 否 | `guide` / `assessed` |
| status | string | 否 | `applied` / `rolled_back` |
| keyword | string | 否 | 模糊匹配批次名称、编号 |

数据权限:
- 系统管理员：全部批次
- 其他角色：本人上传的批次，或涉及本权限范围内房源的批次

Response.data: 分页，records 为批次对象列表（不含完整 houseSnapshot 时可仅含 affectedHouseCount）
```

#### 8.7.4 批量记录详情

```
GET /api/price-batches/{id}

Response.data 批次对象:
{
  "id": 10,
  "batchName": "指导价批量调整-2026-06-01",
  "batchCode": "G-20260601103000-A1B2",
  "priceType": "guide",
  "priceTypeLabel": "指导价",
  "status": "applied",
  "statusLabel": "已应用",
  "sourceFile": "/uploads/price-batch/2026/06/01/abc.xlsx",
  "uploadUserId": 2,
  "uploadUserName": "admin",
  "uploadDate": "2026-06-01",
  "remark": "6月调价",
  "affectedHouseCount": 2,
  "houseSnapshot": [
    { "houseId": 1, "guideVersion": 3, "assessedVersion": null },
    { "houseId": 2, "guideVersion": 2, "assessedVersion": null }
  ],
  "createTime": "2026-06-01T10:30:00",
  "updateTime": "2026-06-01T10:30:00"
}
```

#### 8.7.5 回退批量批次

同 [8.6.3](#863-回退批量调价批次)。

---

## 9 成交管理 API

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/deals` | 成交分页列表（数据权限） |
| GET | `/api/deals/{id}` | 成交详情（数据权限） |
| POST | `/api/deals` | 新增成交 |
| PUT | `/api/deals/{id}` | 修改成交 |
| POST | `/api/deals/{id}/checkout` | 登记实际退租 |
| DELETE | `/api/deals/{id}` | 软删除成交 |

### 9.1 数据权限

按 **对接业务员**（`contactBusinessUserId`）过滤，规则与 [6.1](#61-数据权限与电话脱敏) 一致（按部门上下级，**非**按业务角色区分）：

| 条件 | 可见成交范围 |
|------|----------------|
| `SYSTEM_ADMIN` | 全部 |
| 所属**经营部** | 本经营部及下属项目部成员作为对接业务员的记录 |
| 所属**项目部** | 本项目部成员作为对接业务员的记录 |
| 未分配部门 | 不可见 |

新建成交时 `dealBusinessUserId`、`contactBusinessUserId` 均自动设为当前登录用户（二者一致）；修改成交时可单独调整对接业务员。关联客户、房源须分别在客户、房源数据权限范围内。

### 9.2 新增成交

```
POST /api/deals

Request:
{
  "houseIds": [1, 2],
  "clientIds": [1],
  "channelTypeId": 1,
  "channelInstanceId": 5,
  "channelInstanceName": null,
  "rentalArea": 500.00,
  "contractTotalAmount": 1200000.00,
  "contractSignDate": "2026-05-15",
  "contractStartDate": "2026-06-01",
  "contractEndDate": "2027-05-31",
  "dealRemark": "首年签约"
}

说明:
- `dealBusinessUserId`、`contactBusinessUserId` 由系统自动设为当前登录用户，无需传入
- houseIds、clientIds：至少各选 1 个，须在数据权限内；房源须为**闲置**（`houseStatus=idle`），成交创建成功后自动改为在租
- channelTypeId：必填；渠道实例规则同来访（见 §7.4）
- rentalArea：可选；不传则按所选房源适租面积之和自动计算
- guidePriceId、assessedPriceId：系统按主房源（houseIds[0]）及签订日期自动匹配时点指导价/评估价
- 日期约束：起租日期 ≥ 签订日期，退租日期 ≥ 起租日期
- 成交成功后，关联客户状态自动更新为 `tenant`（租户）

Response.data: 新建成交 ID（long）
```

### 9.3 成交分页列表

```
GET /api/deals?page=1&size=10&channelTypeId=1&clientId=1&houseId=1
    &dealBusinessUserId=2&contractSignDateFrom=2026-01-01&contractSignDateTo=2026-12-31&keyword=签约

Query Parameters:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认 1 |
| size | int | 否 | 每页条数，默认 10 |
| keyword | string | 否 | 成交备注模糊搜索 |
| channelTypeId | long | 否 | 成交途径（渠道类型） |
| clientId | long | 否 | 关联客户 ID |
| houseId | long | 否 | 关联房源 ID |
| dealBusinessUserId | long | 否 | 成交业务员 |
| contractSignDateFrom | date | 否 | 签订日期起 |
| contractSignDateTo | date | 否 | 签订日期止 |

排序: 按 updateTime 倒序

Response.data.records[] 主要字段:
| 字段 | 类型 | 说明 |
|------|------|------|
| id | long | 成交 ID |
| houseIds / houses | array | 房源 ID 及摘要 |
| clientIds / clients | array | 客户 ID 及摘要 |
| channelTypeId / channelTypeName | - | 渠道类型 |
| channelInstanceId / channelInstanceModel / channelInstanceName | - | 渠道实例 |
| guidePriceId / guidePrice | - | 时点指导价 |
| assessedPriceId / assessedPrice | - | 时点评估价 |
| rentalArea | decimal | 租赁面积 |
| contractTotalAmount | decimal | 合同总额 |
| contractSignDate | date | 签订日期 |
| contractStartDate | date | 起租日期 |
| contractEndDate | date | 合同退租日期 |
| actualEndDate | date | 实际退租日期，未退租为 null |
| dealRemark | string | 备注 |
| dealBusinessUserId / dealBusinessUser | - | 成交业务员 |
| contactBusinessUserId / contactBusinessUser | - | 对接业务员 |
| createTime / updateTime | datetime | 时间戳 |
```

### 9.4 成交详情

```
GET /api/deals/{id}

Response.data 结构与列表单条一致，关联对象均已 enrich 填充。
```

### 9.5 修改成交

```
PUT /api/deals/{id}

说明:
- 已登记实际退租（actualEndDate 非空）的成交不可修改
- 修改签订日期或房源时，将重新匹配指导价/评估价
- 请求体字段均可选，传则更新
```

### 9.6 登记退租

```
POST /api/deals/{id}/checkout

Request:
{ "actualEndDate": "2027-06-30" }

说明: 实际退租日期不能早于合同起租日期；不可重复登记。登记成功后：
- 该成交关联的全部房源状态恢复为**闲置**（`idle`）
- 关联客户中状态为**租户**（`tenant`）且**无其他未退租成交**的，恢复为**我的客户**（`mine`）；若仍在其他在租成交中，保持 `tenant`
```

### 9.7 删除成交

```
DELETE /api/deals/{id}
```

软删除；无额外引用校验。

---

## 9A 成交草稿 API

业务字段与正式成交一致（不含指导价/评估价、实际退租等系统字段），**均可为空**；不做业务校验。仅当前登录用户可操作自己的草稿。

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/deal-drafts` | 草稿分页列表 |
| GET | `/api/deal-drafts/{id}` | 草稿详情 |
| POST | `/api/deal-drafts` | 新增草稿 |
| PUT | `/api/deal-drafts/{id}` | 修改草稿（全量覆盖业务字段） |
| DELETE | `/api/deal-drafts/{id}` | 软删除草稿 |

### 9A.1 分页列表

```
GET /api/deal-drafts?page=1&size=10&keyword=签约&clientId=1&houseId=2

Query:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 默认 1 |
| size | int | 否 | 默认 10 |
| keyword | string | 否 | 成交备注模糊搜索 |
| clientId | long | 否 | JSON 包含该客户 |
| houseId | long | 否 | JSON 包含该房源 |

说明: 仅返回当前用户的草稿；按 updateTime 倒序。
```

### 9A.2 详情 / 新增 / 修改 / 删除

```
GET /api/deal-drafts/{id}
POST /api/deal-drafts
PUT /api/deal-drafts/{id}
DELETE /api/deal-drafts/{id}
```

**请求体**（POST/PUT，字段均可空）:

```json
{
  "houseIds": [1],
  "clientIds": [1],
  "channelTypeId": 1,
  "channelInstanceId": null,
  "channelInstanceName": null,
  "channelInstanceModel": null,
  "rentalArea": 500.00,
  "contractTotalAmount": 1200000.00,
  "contractSignDate": "2026-05-15",
  "contractStartDate": "2026-06-01",
  "contractEndDate": "2027-05-31",
  "dealRemark": "草稿备注",
  "dealBusinessUserId": null,
  "contactBusinessUserId": null
}
```

说明:
- 未传 `dealBusinessUserId` / `contactBusinessUserId` 时，默认使用当前登录用户（二者一致）
- 响应 `DealDraftVO` 含客户/房源/渠道/业务员摘要 enrich 字段

---

## 10 内部招租 API

关联表 `internal_rent`；**列表/详情/改删**按关联房源所属项目部做数据权限，规则与 [8.1 房源数据权限](#81-数据权限) 一致。新建、修改时**房源**须在权限范围内；**看房联系人**须在客户数据权限内可见（与联系人模块一致）。

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/internal-rents` | 分页列表 |
| GET | `/api/internal-rents/{id}` | 详情 |
| POST | `/api/internal-rents` | 新增 |
| PUT | `/api/internal-rents/{id}` | 修改（部分字段） |
| DELETE | `/api/internal-rents/{id}` | 软删除 |

### 10.1 分页列表

```
GET /api/internal-rents?page=1&size=10&keyword=临街&houseId=1&initiateUserId=2&initiateDateFrom=2026-01-01&initiateDateTo=2026-12-31
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 默认 1 |
| size | int | 否 | 默认 10 |
| keyword | string | 否 | 模糊匹配用途要求、租赁时长要求、其他说明 |
| houseId | long | 否 | 按房源筛选（须在权限内，否则无数据） |
| initiateUserId | long | 否 | 按发起人用户 ID |
| initiateDateFrom | date | 否 | 发起招租日期起（含） |
| initiateDateTo | date | 否 | 发起招租日期止（含） |

排序：`updateTime` 倒序。

### 10.2 详情

```
GET /api/internal-rents/{id}
```

`data` 为 `InternalRentVO`：除表字段外，含 `house`（`HouseBriefVO`）、`initiateUser`（`UserBriefVO`）、`contacts`（按 `contactIds` 顺序填充的 `ContactVO` 列表；手机号脱敏规则同联系人模块）。

### 10.3 新增

```
POST /api/internal-rents
```

请求体示例：

```json
{
  "houseId": 1,
  "initiateDate": "2026-05-01",
  "stopDate": null,
  "contactIds": [10, 11],
  "rentalArea": 200.5,
  "referencePrice": 12000,
  "priceUnit": "月",
  "usageRequirement": "零售优先",
  "rentalDurationRequirement": "不少于一年",
  "otherDescription": null
}
```

- `houseId`、`initiateDate`、`rentalArea`、`referencePrice` 必填；`stopDate`、`contactIds` 及各文本字段可选。
- `contactIds` 可空或省略；联系人须存在且当前用户有权查看。
- `stopDate` 不得早于 `initiateDate`。
- `initiateUserId` 由后端写入为当前登录用户。

响应 `data`：新建记录 ID（long）。

### 10.4 修改

```
PUT /api/internal-rents/{id}
```

请求体字段**均可选**；未传的字段不修改。`contactIds` 传**空数组**表示清空联系人。`clearStopDate` 为 `true` 时清空停止招租日期（与同时传 `stopDate` 时以清空为准）。`stopDate` 有值时更新停止日期。

### 10.5 删除

```
DELETE /api/internal-rents/{id}
```

软删除（写入 `deleted_time`）。

---

## 通用说明

### 响应格式

所有API响应遵循统一格式：

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {},
  "timestamp": 1775798820500
}
```

> `code === 200` 表示成功；`data` 无数据时为 `null`。

### 错误码

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 40001 | 缺少必要参数 |
| 40002 | 参数格式错误 |
| 401 | 未授权，请先登录 |
| 40101 | Token 无效或已过期 |
| 40102 | Token 已过期 |
| 403 | 无权限访问 |
| 500 | 服务器内部错误 / 业务失败 |
| 1001 | 用户不存在 |
| 1004 | 手机号/邮箱/用户名已存在 |
| 1005 | 密码错误 |
| 1006 | 用户已被禁用 |
| 1008 | 验证码错误或已过期 |
| 2001 | 操作失败（如不能禁用自己、部门/角色/渠道约束等） |
| 2002 | 数据不存在 |
| 2003 | 数据已存在 |

### 认证方式

需要在请求头中携带JWT Token：

```
Authorization: Bearer {token}
```

Token通过登录接口获取，有效期为7天。

---

**文档版本**: v2.9  
**最后更新**: 2026-05-15
