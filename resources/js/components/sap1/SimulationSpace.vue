
<script setup lang="ts">
import Box from './Box.vue'
import Bus from './Bus.vue'
import Arrow from './Arrow.vue';
import { arrows } from '@/lib/arrows'
import { components } from '@/lib/components'


</script>

<template>

<div class="grid grid-cols-16 gap-px w-full h-full" style="grid-template-columns: repeat(16, 45px); grid-template-rows: repeat(16, 48px);">
    <Arrow
  v-for="(arrow, index) in arrows"
  :key="index"
  :from="arrow.from"
  :to="arrow.to"
  :label="arrow.label"
  :offsetY="arrow.offsetY"
  :offsetX="arrow.offsetX"
  :thickness="arrow.thickness"
  :headSize="arrow.headSize"
/>


 <div
      :style="{
        gridColumnStart: 7,
        gridColumnEnd: 'span 3',
        gridRowStart: 2,
        gridRowEnd: 14
      }"
    >
      <Bus title="8"/>
    </div>


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
