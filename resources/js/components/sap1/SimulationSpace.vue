<script setup lang="ts">
import Box from './Box.vue'

const components = [
{
  title: 'Program Counter (PC)',
  value: '0001',
  row: 2,        // Start at row 2
  col: 4,        // Start at col 4
  rowSpan: 2,    // Covers rows 2 and 3
  colSpan: 2     // Covers cols 4 and 5
}

]
</script>

<template>
<div class="grid grid-cols-16 gap-px w-full h-full" style="grid-template-columns: repeat(16, 45px); grid-template-rows: repeat(16, 48px);">
  <Box
    v-for="c in components"
    :key="c.title"
    :title="c.title"
    :value="c.value"
    :style="{
      gridColumnStart: c.col,
      gridRowStart: c.row,
      gridColumnEnd: `span ${c.colSpan}`,
      gridRowEnd: `span ${c.rowSpan}`
    }"
  />
</div>

</template>
