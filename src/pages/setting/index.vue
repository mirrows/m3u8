<script setup lang="ts">
import Back from '@/components/back/index.vue'
import { languageKeys } from '@/languages';
import { useLanguageStore } from '@/store/language'
import { computed, onMounted, ref } from 'vue';
import { useConfig } from '@/store/config'
import { downloadDir } from '@tauri-apps/api/path';

const config = useConfig()

const language = useLanguageStore()

const languageOptions = computed(() => languageKeys.map(key => ({
  label: language.cur[key],
  value: key
})))

const setFolder = (e: any) => {
  console.log(e)
  // config.setFolder(e.target.files[0].path)
}

const folderInputRef = ref<HTMLInputElement | null>(null)


onMounted(async () => {
  const downloadPath = await downloadDir()
  console.log(777, downloadPath)
})


</script>

<template>
  <div class="setting_wrap">
    <div class="setting_item">
      <div class="setting_item_name">{{ language.cur.language }}：</div>
      <div class="setting_item_value">
        <el-select
          v-model="language.curStr"
          placeholder="Select"
          :options="languageOptions"
          style="width: 120px"
          @change="language.setLocale"
        ></el-select>
      </div>
    </div>
    <div class="setting_item">
      <div class="setting_item_name">{{ language.cur.folder }}：</div>
      <div class="setting_item_value">
        <div class="folder_path" @click="folderInputRef?.click()">{{ config.folder }}</div>
        <input ref="folderInputRef" class="folder_input" type="file" webkitdirectory multiple @change="setFolder">
      </div>
    </div>
    <!-- <div class="setting_empty">{{ language.cur.noSettingItem }}</div> -->
    <Back />
  </div>
</template>

<style scoped>
.setting_wrap{
  padding: 10px;
  padding-bottom: 40px;
}
.setting_item{
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-size: 16px;
}
.setting_item_name{
  width: 160px;
  margin-right: 10px;
  text-align: right;
  color: #333;
}
.setting_empty{
  margin: 20px auto;
  text-align: center;
  font-size: 16px;
  color: #999;
}
.folder_path{
  width: 300px;
  height: 30px;
  border: 1px solid #ccc;
  padding: 5px;
  border-radius: 4px;
  cursor: pointer;
}
.folder_input{
  display: none;
}
</style>
