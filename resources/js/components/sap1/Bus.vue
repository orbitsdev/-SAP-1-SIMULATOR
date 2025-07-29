

<script setup lang="ts">
defineProps<{
    title: string,
    style?: Record<string, string> }>()
</script>


<!-- Bus.vue -->
<template>
    <div class="w-full h-full bg-gray-500 opacity-60 rounded flex items-center justify-center">
        <div class="font-bold text-xs text-center mb-1">{{ title }}</div>
    </div>
  </template>
