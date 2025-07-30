
<script setup lang="ts">
import Box from './Box.vue'
import Bus from './Bus.vue'
import Arrow from './Arrow.vue';
import { arrows } from '@/lib/arrows'
import { components } from '@/lib/components'
import { nextTick, reactive } from 'vue';
import { onMounted } from 'vue'
import { gsap } from 'gsap';
import { animateMovingText, animateHighlightAndGlow } from '@/lib/animation'
import { movePaths } from '@/lib/movePaths'





// onMounted(() => {
//   testMoveLabel()
// })


//simulation data
const program: string[] = [
  '00001001', // LDA 09H → A ← M[09]
  '00011010', // ADD 0AH → A ← A + M[0A]
  '00101100', // SUB 0CH → A ← A - M[0C]
  '11100000', // OUT      → OUT ← A
  '11110000'  // HLT      → Stop
];
const simulationProgramProcess = reactive({
  type: 'manual',       // or 'auto'
  currentStep: 0,       // T0–T5 index
  currentInstruction: 0, // instruction pointer (PC)
  movingText: '',       // floating label for "data moving"
  highlight: '',        // ID of box or signal being highlighted
  intervalId: null as ReturnType<typeof setInterval> | null
});
function testMoveLabel() {
  const moveFromPcToMar = movePaths.moveFromPcToMar
  simulationProgramProcess.movingText = '0000'

  nextTick(() => {
    animateMovingText('moving-label', moveFromPcToMar, '0000', () => {
      simulationProgramProcess.movingText = ''
      console.log('Finished')
    })
  })
}





</script>

<template>

<div class="relative grid grid-cols-16 gap-px w-full h-full" style="grid-template-columns: repeat(16, 45px); grid-template-rows: repeat(16, 48px);">
    <div class="mt-4 flex justify-center">
        <button
  @click="animateHighlightAndGlow('program-counter')"
  class="bg-yellow-500 text-white px-3 py-1 rounded ml-2"
>
  Highlight PC
</button>

  <button
  @click="testMoveLabel()"

    class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
  >
    Test Move Label
  </button>
</div>

<p
  id="moving-label"
  class="absolute text-white text-lg px-2 shadow transition-all duration-300 font-mono bg-blue-600 z-50"
  v-show="simulationProgramProcess.movingText !== ''"
>
  {{ simulationProgramProcess.movingText }}
</p>



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
  :id="c.id"
  :title="c.title"
  :value="c.value"
  :highlight="simulationProgramProcess.highlight"
  :style="{
    gridColumnStart: c.col,
    gridRowStart: c.row,
    gridColumnEnd: `span ${c.colSpan}`,
    gridRowEnd: `span ${c.rowSpan}`
  }"
/>

</div>

</template>
<style>

</style>
