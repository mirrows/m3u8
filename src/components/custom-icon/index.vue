<script setup lang="ts">
import { defineProps } from 'vue'
import * as iconMap from './svg-list.js'

const props = defineProps({
  icon: {
    type: String,
    required: true
  }
})

</script>

<template>
  <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" v-html="(iconMap as Record<string, string>)[props.icon]">
  </svg>
</template>

<style scoped>
.custom_icon{
  width: fit-content;
  height: fit-content;
}
</style>
