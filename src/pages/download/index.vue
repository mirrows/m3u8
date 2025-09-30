<script setup lang="ts">
import Back from '@/components/back/index.vue'
import { useDownload } from '@/store/download'
import { computed, onMounted } from 'vue'
import { useLanguageStore } from '@/store/language'

const download = useDownload();
const language = useLanguageStore();
const downloadList = computed(() => {
  return download.list || []
})

onMounted(() => {
  console.log('downloadList', downloadList.value)
})
</script>

<template>
  <div class="download_list_wrap">
    <div
      v-for="item in downloadList"
      :key="item.id"
      class="download_list_item"
    >
      <img :src="item.posterUrl" alt="poster" class="download_list_item_poster">
      <div class="download_list_item_msg">
        <div class="download_list_item_title">{{ item.title }}</div>
        <el-progress
          :percentage="Math.min(item.links.filter(link => link.status === 'success').length/item.links.length * 100, 100)"
          :stroke-width="5"
          striped
          striped-flow
          :duration="40"
        >
          <template #status="{ percentage }">
            <div class="download_list_item_percentage">{{ percentage.toFixed(0) }}%</div>
          </template>
        </el-progress>
      </div>

    </div>
    <div v-if="downloadList.length === 0" class="setting_empty">{{ language.cur.noDownloadItem }}</div>
  </div>
  <Back  />
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
}
.download_list_item_poster{
  height: 40px;
  margin-right: 10px;
}
.download_list_item_msg{
  flex: 1;
  width: 0;
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
</style>
