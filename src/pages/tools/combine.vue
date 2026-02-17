<script setup lang="ts">
import Back from '@/components/back/index.vue'
import { languageKeys } from '@/languages';
import { useLanguageStore } from '@/store/language'
import { computed, onMounted, ref } from 'vue';
import { useConfig } from '@/store/config'
import { downloadDir } from '@tauri-apps/api/path';
import { selectFolder } from '@/utils/tool';
import { ElMessage } from 'element-plus'
import type { Res, ResStatus} from '@/types/common'
import { core } from '@tauri-apps/api'

const { invoke } = core

const config = useConfig()

const language = useLanguageStore()

const languageOptions = computed(() => languageKeys.map(key => ({
  label: language.cur[key],
  value: key
})))

const folderName = ref('')
const videoType = ref('m4s')

const videoTypeOptions = ref([
  { label: 'm4s', value: 'm4s' },
  { label: 'mp4', value: 'mp4' },
  { label: 'm4a', value: 'm4a' },
  { label: 'png', value: 'png' },
])

const onClickFolder = (type: string) => {
  selectFolder().then((folder) => {
    if (folder) {
      if (type === 'source') {
        folderName.value = folder
      } else if (type === 'target') {
        videoType.value = folder
      }
      console.log(folder)
    }
  })
}

const startCombine = () => {
  console.log(folderName.value, videoType.value)
  if (!folderName.value || !videoType.value) {
    ElMessage.error(language.cur.completeMsg)
    return
  }
  invoke<Res<ResStatus>>('combine_splits', {
    name: folderName.value,
    fileType: videoType.value,
  });
}

</script>

<template>
  <div class="combine_wrap">
    <div class="tool_title">{{ language.cur.combine2mp4 }}</div>
    <div class="tool_content">
      <div class="combine_item">
        <div class="combine_item_name">{{ language.cur.folderName }}：</div>
        <div class="combine_item_value">
          <el-input v-model="folderName" style="width: 240px" />
        </div>
      </div>
      <div class="combine_item">
        <div class="combine_item_name">{{ language.cur.videoType }}：</div>
        <div class="combine_item_value">
          <el-select v-model="videoType" :options="videoTypeOptions" style="width: 120px">
          </el-select>
        </div>
      </div>
      <div class="combine_item">
        <div class="combine_item_name"></div>
        <el-button type="primary" @click="startCombine">{{ language.cur.combine }}</el-button>
      </div>
    </div>
    <Back />
  </div>
</template>

<style scoped>
.combine_wrap{
  padding-bottom: 40px;
}
.tool_title{
  border-left: 5px solid var(--el-color-primary);
  padding: 4px 10px;
  background-color: #f5f5f5;
}
.tool_content{
  padding: 10px;
}
.combine_item{
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-size: 16px;
}
.combine_item_name{
  width: 100px;
  margin-right: 10px;
  text-align: right;
  color: #333;
}
.combine_empty{
  margin: 20px auto;
  text-align: center;
  font-size: 16px;
  color: #999;
}
.folder_path{
  width: 200px;
  height: 32px;
  border: 1px solid #ccc;
  padding: 5px;
  border-radius: 4px;
  cursor: pointer;
  box-sizing: border-box;
}
.folder_input{
  display: none;
}
</style>
