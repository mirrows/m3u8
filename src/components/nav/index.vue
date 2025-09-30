<script setup lang="ts">
import { useNav } from '@/store/nav'
import { Menu } from '@element-plus/icons-vue'
import { onMounted } from 'vue'

const nav = useNav()

const initMenu = () => {
  nav.setMenu(document.body.offsetWidth < 768)
}

onMounted(() => {
  initMenu()
  addEventListener('resize', () => {
    initMenu()
  })
})

</script>

<template>
  <div class="m_menu_wrap" :class="{'m_active': !nav.menu}" @click="nav.toggleMenu">
    <el-icon
      class="icon-primary"
      size="16"
    >
      <Menu />
    </el-icon>
  </div>
</template>


<style scoped>
.m_menu_wrap{
  position: absolute;
  left: 0;
  top: 0;
  margin: 19px;
  padding: 10px;
  border-radius: 40px;
  background-color: #fff;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
  font-size: 0;
  cursor: pointer;
}
@media screen and (min-width: 768px) {
  .m_menu_wrap.m_active{
    left: -36px;
  }
}
</style>
