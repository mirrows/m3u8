<script setup lang="ts">
import { computed, ref } from 'vue';
import { useLanguageStore } from '@/store/language'

  const showHeader = ref(false)
  const language = useLanguageStore()
  const locale = computed(() => {
    return language.locale
  })
</script>

<template>
  <el-config-provider :locale="locale">
    <el-container style="height: 100vh;">
      <el-header v-show="showHeader" mode="horizontal" class="m_header">
        <el-container class="flex_between">
          <el-image
            class="m_logo"
            loading="lazy"
            src="/logo.png"
            fit="cover"
          />
          <el-icon
            size="30"
            color="#ffd04b"
            class="m_setting"
          >
            <Setting />
          </el-icon>
        </el-container>
      </el-header>
      <el-main class="m_wrap m_custom_scroller">
        <router-view />
      </el-main>
    </el-container>
  </el-config-provider>
</template>

<style scoped>
.m_header{
  height: fit-content;
  background-color: #545c64;
}
.m_logo{
  height: 30px;
  width: 30px;
  border-radius: 30px;
}
.m_setting{
  padding: 10px 0;
}
.m_wrap{
  padding: 0;
}
.flex {
  display: flex;
  align-items: center;
}
.flex_between{
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
