<script setup lang="ts">
import Menu from '@/components/menu/index.vue'
import { computed, ref } from 'vue';
import { useLanguageStore } from '@/store/language'
import { useNav } from './store/nav';

  const nav = useNav()
  const language = useLanguageStore()
  const locale = computed(() => {
    return language.locale
  })
</script>

<template>
  <el-config-provider :locale="locale">
    <el-container style="height: 100vh;">
      <el-header v-show="nav.header" mode="horizontal" class="m_header">
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
      <div class="m_main">
        <Menu />
        <el-main class="m_wrap m_custom_scroller">
          <router-view />
        </el-main>
      </div>
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
  overflow: visible;
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
.m_main {
  display: flex;
  min-height: 100vh;
  height: 100%;
}
</style>
