<script setup lang="ts">
import { useLanguageStore } from '@/store/language';
import { ElLoading, ElMessage } from 'element-plus';
import { computed, reactive, ref } from 'vue';
import { core } from '@tauri-apps/api'
import { parseSize } from '@/utils/tool';

const { invoke } = core

const language = useLanguageStore()
const textarea = ref('')
const loading = ref(false)
const curVideo = reactive<VideoMsg>({} as VideoMsg)
const drawer = computed({
  get() {
    return curVideo?.url
  },
  set(val) {
    if (!val) {
      Object.assign(curVideo, {})
    }
  }
})
const historyList = reactive<VideoMsg[]>([])
const curLanguage = computed(() => {
  return language.curLanguage
})

const submit = () => {
  if (!textarea.value) {
    ElMessage.warning('请输入url');
    return;
  }
  loading.value = true;
  invoke<Res<VideoMsg>>('parse_site', {
    url: textarea.value,
  }).then((res) => {
    loading.value = false;
    if (res.code === 0) {
      const video = {
        ...res.data,
        timeStr: new Date(res.data.timestamp * 1000).toLocaleString(),
        quality: res.data.quality.map(item => ({
          ...item,
          size: parseSize(+item.size),
        })),
      }
      historyList.unshift(video);
      Object.assign(curVideo, video);
    } else {
      ElMessage.error(res.msg);
    }
  }).catch((err: any) => {
    loading.value = false;
    ElMessage.error('解析失败：' + err);
  })
}
const downloadVideo = (quality: VideoMsg['quality'][0]) => {
  const loading = ElLoading.service({
    lock: true,
    text: '正在解析链接... ...',
    background: 'rgba(255, 255, 255, 0.7)',
  })
  invoke('download_video', {
    url: quality.url,
    name: quality.name,
  })
}
</script>

<template>
  <el-image
    class="header_img"
    loading="lazy"
    src="/logo.png"
    fit="cover"
  />
  <el-main>
    <el-space direction="vertical" fill class="main_space">
      <el-input
        v-model="textarea"
        :rows="5"
        type="textarea"
        class="url_textarea"
        :placeholder="curLanguage.placeholder"
      />
      <el-button :loading="loading" type="primary" @click="submit">{{curLanguage.submit}}</el-button>
      <div v-if="historyList.length > 0" class="history_wrap">
        <el-row>
          <el-col :span="24">
            <div class="history_title">{{curLanguage.history}}</div>
          </el-col>
        </el-row>
        <el-row v-for="history in historyList" class="history_row" @click="Object.assign(curVideo, history)">
          <el-col :span="18" class="flex">
            <div class="grid-content ep-bg-purple-dark video_title">
              <div class="two_line">{{ history.name }}</div>
              <div class="oneline history_tip">{{ history.url }}</div>
              <div class="oneline history_tip">{{ history.timeStr }}</div>
            </div>
          </el-col>
          <el-col :span="6" style="text-align: right;">
            <div class="poster_width_wrap">
              <div class="poster_wrap" @click.stop>
                <el-image
                  :preview-src-list="[history.poster_url]"
                  class="poster"
                  loading="lazy"
                  :src="history.poster_url"
                  fit="cover"
                />
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-space>
    <div class="quality_drawer">
      <el-drawer v-model="drawer" direction="btt" :with-header="false" resizable>
        <el-row>
          <el-col :span="24">
            <div class="drawer_title oneline">{{ curVideo.name }}</div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24" v-for="(quality, i) in curVideo.quality" :key="i" class="quality_item" @click="downloadVideo(quality)">
            <div class="drawer_item oneline">{{ quality.name }}</div>
            <el-tag
              type="info"
              effect="dark"
              size="small"
            >
              {{ quality.size }}
            </el-tag>
          </el-col>
        </el-row>
      </el-drawer>
    </div>
  </el-main>
</template>

<style scoped>
.header_img{
  height: 200px;
  width: 100%;
}
.main_space{
  display: flex;
  width: 100%;
  max-width: 800px;
  margin: auto;
}
.history_wrap{
  margin-top: 20px;
}
.history_title{
  font-size: 0.8rem;
  font-weight: 700;
  padding: 10px 0;
}
.history_tip{
  font-size: 0.7rem;
  color: #bababa;
}
.history_row {
  padding: 5px;
  border-radius: 5px;
  box-shadow: var(--el-box-shadow-lighter);
}
.video_title{
  flex: 1;
  width: 0;
  font-size: 1rem;
  padding-left: 10px;
  padding-right: 5px;
}
.poster_width_wrap{
  display: inline-block;
  width: 100%;
  max-width: 100px;
  vertical-align: bottom;
}
.poster_wrap{
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 100%;
}
.poster{
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  border-radius: 5px;
  box-sizing: border-box;
}
.quality_item{
  display: flex;
  align-items: flex-end;
  padding: 10px 0;
  border-bottom: 1px solid #e5e5e5;
  cursor: pointer;
}
.drawer_title {
  font-weight: 600;
  margin-bottom: 20px;
}
.drawer_item {
  margin-right: 10px;
}

</style>

<style>
.quality_drawer .el-splitter__vertical .el-splitter-panel:first-child{
  flex: 1 1 30vh !important;
}
.quality_drawer .el-splitter__vertical .el-splitter-panel:last-child{
  flex: 1 1 70vh !important;
  min-height: 200px;
  max-height: fit-content;
  /* max-height: 60vh; */
  box-sizing: border-box;
}
</style>
