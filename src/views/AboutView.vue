<template>
  <div class="about-view">
    <el-card>
      <template #header>
        <span>关于</span>
      </template>
      <div class="about-content">
        <h3>My Vue App</h3>
        <p>这是一个基于 Vue 3 + TypeScript 构建的示例项目。</p>
        <el-divider />
        <h4>技术栈</h4>
        <el-space wrap>
          <el-tag type="primary">Vue 3</el-tag>
          <el-tag type="success">TypeScript</el-tag>
          <el-tag type="warning">Vite</el-tag>
          <el-tag type="danger">Element Plus</el-tag>
          <el-tag>Vue Router</el-tag>
          <el-tag>Pinia</el-tag>
          <el-tag>Axios</el-tag>
        </el-space>
        <el-divider />
        <p class="footer-text">
          <router-link to="/">
            <el-button type="primary" size="small">返回首页</el-button>
          </router-link>
        </p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.about-view {
  max-width: 600px;
  margin: 0 auto;
}

.about-content h3 {
  color: #303133;
  margin-bottom: 12px;
}

.about-content h4 {
  color: #606266;
  margin-bottom: 12px;
}

.about-content p {
  color: #606266;
  line-height: 1.8;
}

.footer-text {
  text-align: center;
}
</style>
