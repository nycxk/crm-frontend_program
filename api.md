# CRM Backend API 文档

> **说明**：包含认证授权、用户个人中心、文件管理、系统设置（人员/部门/权限）等接口。除标注「公开」外，均需在请求头携带 `Authorization: Bearer {token}`。

---

## 目录

1. [认证 API](#1-认证-api)
2. [用户 API](#2-用户-api)
3. [文件 API](#3-文件-api)
4. [系统设置 API](#4-系统设置-api)

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
    "url": "/uploads/2026/04/10/abc123def456.png",
    "createdAt": "2026-04-10T10:30:00.000Z"
  },
  "timestamp": 1775798820500
}
```

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

系统设置包含：**人员管理**、**部门管理**、**权限管理（角色与模块）**。均需 Token。

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

#### 4.2.3 部门详情

```
GET /api/system/departments/{id}

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

#### 4.2.4 新增部门

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

#### 4.2.5 修改部门

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

#### 4.2.6 删除部门

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

说明: moduleIds 传入时会全量覆盖该角色的模块绑定。

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

说明: 若角色已分配给用户（user_roles 存在记录）则禁止删除。

Response:
{
  "code": 200,
  "message": "操作成功",
  "data": null,
  "timestamp": 1775798820500
}
```

### 4.4 系统设置常见错误

| code | 场景 |
|------|------|
| 1001 | 人员不存在 |
| 1004 | 手机号/邮箱/用户名已存在 |
| 1006 | 用户已禁用 |
| 2001 | 不能禁用自己、部门有下级/人员、角色已分配用户等 |
| 2002 | 部门/角色/模块不存在 |
| 2003 | 部门名称、角色编码重复 |
| 40002 | 参数格式错误（如部门类型非法、手机号格式错误） |

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
| 2001 | 操作失败（如不能禁用自己、部门/角色约束等） |
| 2002 | 数据不存在 |
| 2003 | 数据已存在 |

### 认证方式

需要在请求头中携带JWT Token：

```
Authorization: Bearer {token}
```

Token通过登录接口获取，有效期为7天。

---

**文档版本**: v2.1  
**最后更新**: 2026-05-15
