<script setup>
defineProps({
  title: String,
  value: String
})
</script>

<template>
  <div class="w-full h-full bg-green-300 border  rounded p-1 flex flex-col items-center justify-center text-xs text-center">
    <div class="font-bold">{{ title }}</div>
    <div class="font-mono">{{ value }}</div>
  </div>
</template>
