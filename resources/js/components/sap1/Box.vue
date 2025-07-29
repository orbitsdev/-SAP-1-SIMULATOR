<script setup>
defineProps({
    title: String,
    value: String,
    row: Number,
    col: Number,
    rowSpan: {
      type: Number,
      default: 2
    },
    colSpan: {
      type: Number,
      default: 2
    },
    styleClass: {
      type: String,
      default: ''
    }
})
</script>
<template>
  <div :class="['bg-green-400/50 rounded-md p-2 flex flex-col items-center justify-center', styleClass]"
       :style="{
         gridRowStart: row,
         gridRowEnd: row + rowSpan,
         gridColumnStart: col,
         gridColumnEnd: col + colSpan
       }">
    <div class="text-xs font-bold mb-1 text-center">{{ title }}</div>
    <div class="text-sm font-mono text-center">{{ value }}</div>
  </div>
</template>
