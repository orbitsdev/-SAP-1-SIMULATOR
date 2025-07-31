<!-- Bus.vue -->
<script setup lang="ts">
defineProps<{
  title: string,
  style?: Record<string, string>
}>()
</script>

<template>
  <div class="w-full h-full bg-gray-500 opacity-60 rounded flex flex-col justify-center items-center relative text-white">

    <!-- Arrows + Label vertically centered -->
    <div class="flex flex-col items-center space-y-0.5 text-sm">
      <span class="text-base">↑</span>
      <div class="font-semibold tracking-wide">{{ title }}</div>
      <span class="text-base">↓</span>
    </div>

  </div>
</template>
