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
      :id="id"
      class="w-full h-full border rounded p-1 flex flex-col items-center justify-center text-xs text-center"
      style="background-color: #86efac; transition: background-color 0.3s ease;"
    >
      <div class="font-bold">{{ title }}</div>
      <div class="font-mono">{{ value }}</div>
    </div>
  </template>
    