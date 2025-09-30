<script setup lang="ts">
import * as Icons from '@element-plus/icons-vue'
import { useNav } from '@/store/nav';
import { useLanguageStore } from '@/store/language';
import { useRouter } from 'vue-router'
import { useDownload } from '@/store/download';
import { computed } from 'vue';

const router = useRouter()

const { Download, Setting } = Icons

const nav = useNav()

const download = useDownload();


const language = useLanguageStore()

const menuList = computed(() => ([
  {
    icon: Download,
    title: language.cur.downloadList,
    tagNum: download.list.length,
    fn: () => {
    nav.toggleMenu()
    router.push({
      name: 'download',
    });
  }},
  {
    icon: Setting,
    title: language.cur.setting,
    fn: () => {
      nav.toggleMenu()
      router.push({
        name: 'setting',
      });
    }
  }
]))
</script>

<template>
  <div class="m_menu" :class="{'collapsed': nav.menu}">
    <div class="m_close_menu" @click="nav.toggleMenu">
      <el-icon
        class="icon-primary"
        size="16"
      >
        <Back />
      </el-icon>
    </div>
    <div class="m_menu_content">
      <div class="m_menu_header">
        <img src="@/assets/img/logo.svg" class="m_logo_in_menu" alt="logo">
        <div class="m_menu_title">M3u8 Parser</div>
      </div>
      <div class="m_menu_list_wrap">
        <div class="m_menu_list">
          <div v-for="item in menuList" :key="item.title" class="m_menu_list_item" @click="item.fn">
            <el-icon
              class="icon-primary m_menu_icon"
              size="16"
            >
              <component :is="item.icon" />
            </el-icon>
            <div>{{ item.title }}</div>
            <div class="m_menu_right_side">
            <el-tag v-if="item.tagNum" effect="dark" round type="danger">{{ item.tagNum }}</el-tag>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>


<style scoped>
.m_menu{
  position: relative;
  width: 300px;
  max-width: 100%;
  background-color: #fff;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  transition: width 0.3s;
}
.m_menu.collapsed{
  width: 0;
}
.m_close_menu{
  display: none;
  position: absolute;
  top: 0;
  right: 0;
  margin: 10px;
  padding: 10px;
  border-radius: 40px;
  background-color: #fff;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
  font-size: 0;
  cursor: pointer;
}
.m_menu_content{
  min-width: 240px;
}
.m_menu_header {
  display: flex;
  align-items: center;
  padding: 10px;
}
.m_menu_icon{
  margin-right: 10px;
}
.m_menu_title{
  font-family: "Geo", "Yesteryear", "Pfzf", Arial, sans-serif;
  font-weight: 700;
  font-size: 28px;
}
.m_menu_right_side{
  margin-left: auto;
}
.m_logo_in_menu{
  width: 60px;
  height: 60px;
}
.m_menu_list_wrap{
  padding: 10px;
  margin-top: 20px;
}
.m_menu_list{
  border-top: 1px solid rgba(0,0,0,.2);
}
.m_menu_list_item{
  display: flex;
  align-items: center;
  padding: 10px;
  margin-top: 20px;
  border-bottom: 1px solid rgba(0,0,0,.2);
  line-height: 1;
  cursor: pointer;
}
.m_menu_list_item:hover{
  background-color: #f0f0f0;
}
@media (max-width: 768px) {
  .m_close_menu{
    display: block;
  }
  .m_menu{
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: 100%;
    z-index: 18;
  }
}
</style>
