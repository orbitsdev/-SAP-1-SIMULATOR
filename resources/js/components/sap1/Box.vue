<script setup>
defineProps({
    title: String,
    value: String,
    styleClass: {
    type: String,
    default: ''
  }
})
</script>
<template>
  <div :class="['bg-green-400/50  rounded-md  w-32 h-24 p-2 flex flex-col items-center justify-center', styleClass]">
    <div class="text-xs font-bold mb-1 text-center">{{ title }}</div>
    <div class="text-sm font-mono text-center">{{ value }}</div>
  </div>
</template>
