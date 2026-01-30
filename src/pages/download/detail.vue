<script setup lang="ts">
import Back from '@/components/back/index.vue'
import { useDownload } from '@/store/download'
import { useRoute } from 'vue-router'
import { computed, onMounted, ref } from 'vue'
import { Source, LINK_STATUS } from '@/types/common'
import { useLanguageStore } from '@/store/language'

const language = useLanguageStore();
const download = useDownload()
const routes =  useRoute()
console.log(56, routes.query)
const downloadInfo = computed<Source>(() => download.list.find((item) => item.id === routes.query.id) || {})

</script>

<template>
  <div class="download_detail_wrap">
    <el-card class="download_info_card">
      <div class="download_info_content">
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
            <div class="download_info_title">{{ downloadInfo.title }}</div>
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
        <div style="display:flex" class="status_area_exp">
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
.download_info_poster{
  display: flex;
  align-items: center;
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
.status_area_exp{
  display:flex;
  padding: 10px;
  font-size: 12px;
  color: #999;
}
.status_area_exp_item{
  display: flex;
  align-items: center;
  margin-right: 10px;
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
  background-color: #f5f5f5;
}
.status_padding{
  background-color: var(--el-color-warning);
}
.status_done{
  background-color: var(--el-color-success);
}
.status_error{
  background-color: var(--el-color-danger);
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
</style>
