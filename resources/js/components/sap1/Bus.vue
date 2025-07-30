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
    <div class="flex flex-col items-center text-xl leading-none space-y-1">
      <span class="text-3xl">⬆</span>
      <div class="font-extrabold text-lg">{{ title }}</div>
      <span class="text-3xl">⬇</span>
    </div>

  </div>
</template>
