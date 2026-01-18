<script setup lang="ts">
import Back from '@/components/back/index.vue'
import { useLanguageStore } from '@/store/language'
import { computed, onMounted, ref } from 'vue';
import CustomIcon from '@/components/custom-icon/index.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const language = useLanguageStore()

const goCombine = () => {
  router.push({
    name: 'combine',
  });
}

const tools = computed(() => [
  { icon: 'combine', name: language.cur.combine2mp4, fn: goCombine }
])

onMounted(async () => {
})



</script>

<template>
  <div class="tools_wrap">
    <div class="tools_list">
      <div v-for="(item, i) in tools" :key="i" :title="item.name" class="list_item" @click="item.fn">
        <el-icon class="list_icon"><CustomIcon :icon="item.icon" /></el-icon>
        <div class="item_name">{{item.name}}</div>
      </div>
    </div>
    <Back to="/" />
  </div>
</template>

<style scoped>
.tools_wrap{
  padding: 10px;
  padding-bottom: 40px;
}
.tools_list{
  display: flex;
  flex-wrap: wrap;
}
.list_item{
  width: 100px;
  padding:10px;
  margin: 3px;
  border-radius: 3px;
  box-sizing: border-box;
  text-align: center;
  cursor: pointer;
}
.list_item:hover {
  box-shadow: 0 0 5px #00000044;
}
.list_icon{
  width: 48px;
  height: 48px;
  font-size: 36px;
}
.item_name{
  box-sizing: border-box;
  width: 100%;
  padding: 0 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

</style>
