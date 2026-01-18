<script setup lang="ts">
import Back from '@/components/back/index.vue'
import { languageKeys } from '@/languages';
import { useLanguageStore } from '@/store/language'
import { computed, onMounted, ref } from 'vue';
import { useConfig } from '@/store/config'
import { downloadDir } from '@tauri-apps/api/path';
import { selectFolder } from '@/utils/tool';

const config = useConfig()

const language = useLanguageStore()

const languageOptions = computed(() => languageKeys.map(key => ({
  label: language.cur[key],
  value: key
})))

const tasks = computed({
  get: () => config.tasks,
  set: (val) => config.setConfig({ tasks: val })
})

const process = computed({
  get: () => config.process,
  set: (val) => config.setConfig({ process: val })
})

const onClickFolder = () => {
  selectFolder().then((folder) => {
    if (folder) {
      config.setFolder(folder)
      console.log(folder)
    }
  })
}

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
        <div class="folder_path" @click="onClickFolder">{{ config.downloadFolder }}</div>
      </div>
    </div>
    <div class="setting_item">
      <div class="setting_item_name">{{ language.cur.maxTasks }}：</div>
      <div class="setting_item_value">
        <el-input v-model="tasks" type="number" style="width: 120px" />
      </div>
    </div>
    <div class="setting_item">
      <div class="setting_item_name">{{ language.cur.maxProcess }}：</div>
      <div class="setting_item_value">
        <el-input v-model="process" type="number" style="width: 120px" />
      </div>
    </div>
    <!-- <div class="setting_empty">{{ language.cur.noSettingItem }}</div> -->
    <Back to="/" />
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
  width: 100px;
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
