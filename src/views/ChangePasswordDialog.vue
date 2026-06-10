<template>
  <el-dialog
    v-model="visible"
    title="修改密码"
    width="460px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
  >
    <div class="dialog-tip">
      检测到您当前使用的是初始密码，为了账号安全，请修改密码后再继续使用系统。
    </div>
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      class="password-form"
    >
      <el-form-item label="原密码" prop="oldPassword">
        <el-input
          v-model="form.oldPassword"
          type="password"
          placeholder="请输入原密码"
          show-password
          maxlength="32"
        />
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input
          v-model="form.newPassword"
          type="password"
          placeholder="请输入新密码"
          show-password
          maxlength="32"
        />
      </el-form-item>
      <el-form-item label="确认新密码" prop="confirmPassword">
        <el-input
          v-model="form.confirmPassword"
          type="password"
          placeholder="请再次输入新密码"
          show-password
          maxlength="32"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="primary" :loading="loading" @click="handleSubmit">
        确认修改
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { changePassword } from '@/api/auth'

const emit = defineEmits<{
  (e: 'success'): void
}>()

const props = defineProps<{
  modelValue: boolean
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => {
    if (!val) return
  },
})

const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const validateConfirmPassword = (_rule: any, value: string, callback: (error?: Error) => void) => {
  if (!value) {
    callback(new Error('请确认新密码'))
  } else if (value !== form.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules: FormRules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' },
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
  ],
  confirmPassword: [
    { validator: validateConfirmPassword, trigger: 'blur' },
  ],
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    const msg = await changePassword({
      oldPassword: form.oldPassword,
      newPassword: form.newPassword,
    })
    ElMessage.success(msg || '密码修改成功')
    emit('success')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.dialog-tip {
  padding: 12px 16px;
  margin-bottom: 16px;
  background-color: #fdf6ec;
  border: 1px solid #faecd8;
  border-radius: 4px;
  color: #e6a23c;
  font-size: 13px;
  line-height: 1.6;
}

.password-form {
  padding-top: 8px;
}
</style>
