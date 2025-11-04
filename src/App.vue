<script setup lang="ts">
  import Menu from '@/components/menu/index.vue'
  import { computed, onMounted, ref } from 'vue';
  import { useLanguageStore } from '@/store/language'
  import { useNav } from './store/nav';
  import { useDownloadHistory } from './store/history';
  import { useDownload } from './store/download';
  import { useConfig } from './store/config';
import { languageKeys } from './languages';

  const nav = useNav()
  const language = useLanguageStore()
  const locale = computed(() => {
    return language.locale
  })
  const history = useDownloadHistory()
  const download = useDownload()
  const config = useConfig()


  const languageOptions = computed(() => languageKeys.map(key => ({
    label: language.cur[key],
    value: key
  })))

  const available = computed(() => {
    return config.available
  })



  onMounted(async () => {
    await history.load()
    await download.load()
    await config.load()
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
        <div class="head_line">
          <el-select
            v-model="language.curStr"
            placeholder="Select"
            :options="languageOptions"
            style="width: 100px"
            @change="language.setLocale"
          ></el-select>
        </div>
        <div v-if="!config.available" class="service_start_wrap">
          <div class="service_start_tips">{{ language.cur.startService }}</div>
          <el-switch v-model="available" @change="config.checkAvailable" />
        </div>
        <el-main v-else class="m_wrap m_custom_scroller">
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
  overflow: auto;
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
.head_line {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  margin: 20px auto;
  width: 80%;
  padding: 0 20px;
  box-sizing: border-box;
}
.service_start_wrap{
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 10% auto;
  text-align: center;
}
.service_start_tips{
  font-family: 'Yesteryear', 'Pfzf', '微软雅黑';
  font-size: 32px;
  color: #a8a8a8;
}
</style>
