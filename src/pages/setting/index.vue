<script setup lang="ts">
import Back from '@/components/back/index.vue'
import { languageKeys } from '@/languages';
import { useLanguageStore } from '@/store/language'
import { computed } from 'vue';


const language = useLanguageStore()

const languageOptions = computed(() => languageKeys.map(key => ({
  label: language.cur[key],
  value: key
})))

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
    <!-- <div class="setting_empty">{{ language.cur.noSettingItem }}</div> -->
    <Back />
  </div>
</template>

<style scoped>
.setting_wrap{
  padding: 10px;
}
.setting_item{
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-size: 16px;
}
.setting_item_name{
  margin-right: 10px;
  color: #333;
}
.setting_empty{
  margin: 20px auto;
  text-align: center;
  font-size: 16px;
  color: #999;
}
</style>
