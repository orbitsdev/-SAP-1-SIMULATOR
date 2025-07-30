<script setup lang="ts">
import { watch, ref } from 'vue'

const props = defineProps<{
  id: string
  title: string
  value: string
  highlight?: string
}>()

const animateClass = ref(false)

watch(() => props.value, () => {
  animateClass.value = true
  setTimeout(() => animateClass.value = false, 300)
})
</script>

<template>
  <div
    :id="id"
    class="w-full h-full border rounded p-1 flex flex-col items-center justify-center text-xs text-center"
    :style="{
      backgroundColor: highlight === id ? '#fde047' : '#86efac',
      transition: 'background-color 0.3s ease'
    }"
  >
    <div class="font-bold">{{ title }}</div>
    <div class=" font-extrabold  transition-all duration-300" :class="{ 'scale-110 text-blue-800': animateClass }">
      {{ value }}
    </div>
  </div>
</template>

<style scoped>
.scale-110 {
  transform: scale(1.1);
}
</style>
