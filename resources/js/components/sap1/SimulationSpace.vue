<script setup lang="ts">
import Box from './Box.vue'

const components = [
{
    id:'pc',
  title: 'Program Counter (PC)',
  value: '0000',
  row: 2,        // Start at row 2
  col: 2,        // Start at col 4
  rowSpan: 2,    // Covers rows 2 and 3
  colSpan: 2     // Covers cols 4 and 5
},
{
    id:'mar',
  title: 'Memory Address Register (MAR)',
  value: '0000',
  row: 5,        // Start at row 2
  col: 2,        // Start at col 4
  rowSpan: 2,    // Covers rows 2 and 3
  colSpan: 2     // Covers cols 4 and 5
},
{
    id:'prom',
  title: '16x8 PROM',
  value: '0000',
  row: 8,        // Start at row 2
  col: 2,        // Start at col 4
  rowSpan: 2,    // Covers rows 2 and 3
  colSpan: 2     // Covers cols 4 and 5
},
{
    id:'ir',
  title: 'Instruction Register (IR)',
  value: '0000',
  row: 11,        // Start at row 2
  col: 2,        // Start at col 4
  rowSpan: 2,    // Covers rows 2 and 3
  colSpan: 2     // Covers cols 4 and 5
},

{
    id:'con',
  title: 'Control Unit CON',
  value: '0000',
  row: 14,        // Start at row 2
  col: 2,        // Start at col 4
  rowSpan: 2,    // Covers rows 2 and 3
  colSpan: 2     // Covers cols 4 and 5
},

{
    id:'ar',
  title: 'A Register',
  value: '0000',
  row: 2,        // Start at row 2
  col: 12,        // Start at col 4
  rowSpan: 2,    // Covers rows 2 and 3
  colSpan: 2     // Covers cols 4 and 5
},
{
    id:'alu',
  title: 'Arithmetic Logic Unit (ALU)',
  value: '0000',
  row: 5,        // Start at row 2
  col: 12,        // Start at col 4
  rowSpan: 2,    // Covers rows 2 and 3
  colSpan: 2     // Covers cols 4 and 5
},
{
    id:'br',
  title: 'B Register',
  value: '0000',
  row: 8,        // Start at row 2
  col: 12,        // Start at col 4
  rowSpan: 2,    // Covers rows 2 and 3
  colSpan: 2     // Covers cols 4 and 5
},
{
    id:'or',
  title: 'Output Register',
  value: '0000',
  row: 11,        // Start at row 2
  col: 12,        // Start at col 4
  rowSpan: 2,    // Covers rows 2 and 3
  colSpan: 2     // Covers cols 4 and 5
},
{
    id:'bd',
  title: 'Binary Display',
  value: '0000',
  row: 14,        // Start at row 2
  col: 12,        // Start at col 4
  rowSpan: 2,    // Covers rows 2 and 3
  colSpan: 2     // Covers cols 4 and 5
},

]
</script>

<template>
<div class="grid grid-cols-16 gap-px w-full h-full" style="grid-template-columns: repeat(16, 45px); grid-template-rows: repeat(16, 48px);">
  <Box
    v-for="c in components"
    :key="c.id"
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
