
<script setup lang="ts">
import { Back } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  console.log(window.history)
  if (window.history.length > 1) {
    router.back();
  } else {
    router.replace('/');
  }
}

</script>

<template>
  <div class="m_back_wrap" @click="goBack">
    <el-icon
      size="30"
      color="#ffd04b"
    >
      <Back />
    </el-icon>
  </div>
</template>

<style scoped>
.m_back_wrap{
  position: fixed;
  left: 0;
  bottom: 0;
  margin: 19px;
  padding: 10px;
  border-radius: 40px;
  background-color: #fff;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
  font-size: 0;
  cursor: pointer;
}
</style>
