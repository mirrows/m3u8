<script setup lang="ts">
import Back from '@/components/back/index.vue'
import { useDownload } from '@/store/download'
import { computed, onMounted, ref } from 'vue'
import { useLanguageStore } from '@/store/language'
import { CloseBold } from '@element-plus/icons-vue'
import CustomIcon from '@/components/custom-icon/index.vue'
import { ElMessageBox } from 'element-plus'
import { confirmD } from '@/utils/tool'
import type { Source } from '@/types/common'
import { useRouter } from 'vue-router'

const router = useRouter()
const download = useDownload();
const language = useLanguageStore();
const loadTimes = ref(0)
const downloadList = computed<Source[]>(() => {
  return download.list || []
})
const showedList = computed(() => {
  return downloadList.value.slice(0, loadTimes.value * 10)
})

const loadList = () => {
  if (showedList.value.length === downloadList.value.length) return
  loadTimes.value += 1
}


onMounted(() => {
  console.log('downloadList', downloadList.value)
})

const deleteVideo = (item: Source) => {
  confirmD({
    cb: () => {
      download.remove(item)
    }
  })
}

const goDetail = (item: Source) => {
  router.push({
    path: '/download/detail',
    query: {
      id: item.id
    }
  })
}

</script>

<template>
  <div class="download_list_wrap m_custom_scroller" v-infinite-scroll="loadList">
    <div
      v-for="item in showedList"
      :key="item.id"
      class="download_list_item"
    >
      <el-image :src="item.posterUrl" :preview-src-list="[item.posterUrl]" alt="poster" class="download_list_item_poster" />
      <div class="download_list_item_msg" @click.stop="goDetail(item)">
        <div class="download_list_item_firstline">
          <div class="download_list_item_title">{{ item.title }}</div>
          <div v-if="item.status !== 'done'" class="download_list_item_operate">
            <div v-if="item.status === 'downloading' && !item.links.every(link => link.url)" class="inqueue_tips">{{ language.cur.waitingForSource }}</div>
            <template v-else-if="item.status !== 'ready'">
              <el-icon v-if="item.status === 'paused'" class="operate_icon" @click.stop="download.resume(item)"><CustomIcon icon="play" /></el-icon>
              <el-icon v-else class="operate_icon" @click.stop="download.pause(item)"><CustomIcon icon="pause" /></el-icon>
            </template>
            <div v-else class="inqueue_tips">{{ language.cur.inTheQueue }}</div>
            <el-icon class="operate_icon" @click.stop="deleteVideo(item)"><CloseBold /></el-icon>
          </div>
        </div>
        <el-progress
          v-if="item.status !== 'done'"
          :percentage="Math.min(item.links.filter(link => link.status === 'done').length/item.links.length * 100, 100)"
          :stroke-width="5"
          striped
          striped-flow
          :duration="40"
        >
          <template #default="{ percentage }">
            <div class="download_list_item_percentage">{{ percentage.toFixed(0) }}%</div>
          </template>
        </el-progress>
      </div>

    </div>
    <div v-if="downloadList.length === 0" class="setting_empty">{{ language.cur.noDownloadItem }}</div>
  </div>
  <Back to="/" />
</template>

<style scoped>
.download_list_wrap{
  padding: 10px;
}
.download_list_item{
  display: flex;
  align-items: center;
  padding-top: 10px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
}
.download_list_item_poster{
  height: 40px;
  margin-right: 10px;
}
.download_list_item_msg{
  flex: 1;
  width: 0;
}
.download_list_item_firstline{
  display: flex;
  align-items: center;
}
.download_list_item_operate{
  display: flex;
  margin-left: auto;
  align-items: center;
}
.operate_icon{
  padding: 0 10px;
  font-size: 16px;
  color: #999;
}
.download_list_item_title{
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.download_list_item_percentage{
  text-align: right;
}
.setting_empty{
  margin: 20px auto;
  text-align: center;
  font-size: 16px;
  color: #999;
}
.inqueue_tips{
  white-space: nowrap;
}
</style>
