<script setup lang="ts">
import Back from '@/components/back/index.vue'
import { useDownload } from '@/store/download'
import { useRoute } from 'vue-router'
import { computed, onMounted, ref } from 'vue'
import type { Source } from '@/types/common'
import { useLanguageStore } from '@/store/language'
import { LINK_STATUS, PROGRESS_MAP, TO_SOURCE_STATUS } from '@/types/enum'


const language = useLanguageStore();
const download = useDownload()
const routes =  useRoute()
console.log(56, routes.query)
const downloadInfo = computed<Source>(() => download.list.find((item) => item.id === routes.query.id) || {} as Source)

const doneLength = computed(() => {
  return downloadInfo.value.links.filter(link => link.status === LINK_STATUS.DONE).length
})

const percentage = computed(() => {
  return Math.min(doneLength.value/downloadInfo.value.links.length * 100, 100)
})


</script>

<template>
  <div class="download_detail_wrap">
    <el-card class="download_info_card">
      <div class="download_info_content" :class="['done', 'error'].includes(downloadInfo.status) ? `status_${downloadInfo.status}_wrap` : ''">
        <div class="download_info_left">
          <div class="download_info_poster">
            <div class="poster_wrap">
              <el-image
                :preview-src-list="[downloadInfo.posterUrl]"
                class="poster"
                loading="lazy"
                :src="downloadInfo.posterUrl"
                fit="cover"
              />
            </div>
            <div class="download_info_title">
              <span class="download_info_title_status" :class="`status_${downloadInfo.status}`"></span>
              <span>{{ downloadInfo.title }}</span>
            </div>
          </div>
          <div v-if="downloadInfo.siteUrl" class="download_info_site">
            <el-icon><CopyDocument /></el-icon>
            {{ downloadInfo.siteUrl }}
            </div>
        </div>
        <div>
        </div>
      </div>
      <template #footer>{{downloadInfo.timeStr}}</template>
    </el-card>
    <el-card class="status_area_card">
      <div class="status_area_wrap">
        <div class="status_area_first_line">
          <div style="display:flex" class="m_custom_scroller status_area_exp">
            <div class="status_area_exp_item">
              <div class="link_item"></div>
              <div>{{ language.cur.statusReady }}</div>
            </div>
            <div class="status_area_exp_item">
              <div class="link_item" :class="`status_padding`"></div>
              <div>{{ language.cur.statusPadding }}</div>
            </div>
            <div class="status_area_exp_item">
              <div class="link_item" :class="`status_done`"></div>
              <div>{{ language.cur.statusDone }}</div>
            </div>
            <div class="status_area_exp_item">
              <div class="link_item" :class="`status_error`"></div>
              <div>{{ language.cur.statusError }}</div>
            </div>
          </div>
          <div class="progress_wrap">
            <span style="margin-right: 10px;">{{ doneLength }}/{{ downloadInfo.links.length }}</span>
            <el-progress
              type="circle"
              width="32"
              :status="PROGRESS_MAP[TO_SOURCE_STATUS[downloadInfo.status as keyof typeof TO_SOURCE_STATUS]]"
              :percentage="percentage"
            >
              <!-- <template #default="{ percentage }">
                <div style="width: 32px;font-size: 10px;">{{ percentage.toFixed(0) }}</div>
              </template> -->
            </el-progress>
          </div>
        </div>
        <div class="m_custom_scroller link_list">
          <div
            v-for="(link, index) in downloadInfo.links"
            :key="index"
            class="link_item"
            :class="`status_${link.status}`"
          ></div>
        </div>
      </div>
    </el-card>
    <Back to="/download" />
  </div>
</template>

<style scoped>
.download_detail_wrap{
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 10px;
  box-sizing: border-box;
}
.download_info_card{
  margin-bottom: 10px;
}
.download_info_left{
  padding: 10px;
}
.status_done_wrap{
  position: relative;
  border: 1px solid var(--el-color-success);
  border-radius: 4px 4px 0 0;
  z-index: 2;
}
.status_error_wrap{
  position: relative;
  border: 1px solid var(--el-color-danger);
  border-radius: 4px 4px 0 0;
  z-index: 2;
}

.status_error_wrap:before,
.status_done_wrap:before{
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: currentColor;
  color: #f5f5f5;
  opacity: 0.1;
}
.status_done_wrap:before{
  color: var(--el-color-success);
}
.status_error_wrap:before{
  color: var(--el-color-danger);
}
.download_info_poster{
  display: flex;
  align-items: flex-start;
}
.poster_wrap{
  flex: 0 0 60px;
  width: 60px;
  height: 60px;
  border-radius: 5px;
  margin-right: 10px;
}
.poster{
  width: 100%;
  height: 100%;
  border-radius: 5px;
  box-sizing: border-box;
}
.download_info_title{
  font-weight: 700;
  font-size: 1rem;
  vertical-align: bottom;
}
.download_info_title_status{
  display: inline-block;
  width: 10px;
  height: 10px;
  margin-right: 10px;
  border-radius: 16px;
  box-shadow: 0 0 5px 2px currentColor;
}
.download_info_title_status.status_downloading{
  animation: rotate 1s linear infinite;
}
.download_info_title_status.status_downloading::before{
  content: '';
  position: absolute;
  top: 25%;
  left: 25%;
  width: 2px;
  height: 2px;
  border-radius: 50%;
  background-color: currentColor;
  color: #fff;
  box-shadow: 0 0 5px 2px currentColor;
}
.download_info_site{
  margin-top: 10px;
  font-size: 13px;
  color: #999;
  cursor: pointer;
}
.status_area_card{
  flex: 1;
}
.status_area_wrap{
  display: flex;
  flex-direction: column;
  height: 100%;
}
.status_area_first_line{
  position: relative;
  font-size: 12px;
  color: #999;
}
.status_area_exp{
  display:flex;
  padding: 10px;
  padding-right: 80px;
  overflow: auto;
  font-size: 12px;
  color: #999;
}
.progress_wrap{
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  padding: 7px;
  background-color: #fff;
  box-shadow: 0 0 2px 0 #fff;
  border-radius: 8px;
}
.status_area_exp_item{
  display: flex;
  align-items: center;
  margin-right: 10px;
  white-space: nowrap;
}
.status_area{
  height: 100%;
  overflow: auto;
}
.link_list{
  flex: 1 1 auto;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  /* justify-content: center; */
  /* align-items: center; */
  height: 0;
  padding: 0 10px 10px;
  overflow-y: auto;
}
.link_item{
  width: 16px;
  height: 16px;
  margin: 2px;
  border: 3px double #f5f5f5;
  border-radius: 4px;
  box-shadow: inset 0 0 5px 1px #fff3f3;
  background-color: currentColor;
  color: #f5f5f5;
}

.status_ready,
.status_paused{
  background-color: currentColor;
  color: #f5f5f5;
}
.status_padding,
.status_downloading{
  background-color: currentColor;
  color: var(--el-color-warning);
}
.status_done{
  background-color: currentColor;
  color: var(--el-color-success);
}
.status_error{
  background-color: currentColor;
  color: var(--el-color-danger);
}
</style>

<style>
.download_info_card .el-card__body{
  padding: 0;
  box-sizing: border-box;
}
.status_area_card .el-card__body{
  height: 100%;
  padding: 0;
  box-sizing: border-box;
}
.download_info_card .el-card__footer{
  padding: 3px 10px;
  font-size: 12px;
  color: #999;
}
.progress_wrap .el-progress__text{
  min-width: 0;
  font-size: 12px !important;
}
</style>
