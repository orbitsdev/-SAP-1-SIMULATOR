<script setup lang="ts">
defineProps<{
  id: string,
  title: string,
  value: string,
  highlight?: string
}>()
</script>

<template>
  <div
    class="w-full h-full bg-green-300 border rounded p-1 flex flex-col items-center justify-center text-xs text-center transition-all duration-300"
    :class="{ 'animation-test': highlight === id }"
  >
    <div class="font-bold">{{ title }}</div>
    <div class="font-mono">{{ value }}</div>
  </div>
</template>
