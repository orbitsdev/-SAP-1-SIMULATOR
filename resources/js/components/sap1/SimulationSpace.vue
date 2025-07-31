<script setup lang="ts">
import Box from './Box.vue'
import Bus from './Bus.vue'
import Arrow from './Arrow.vue'
import MovingLabel from './MovingLabel.vue'
import { arrows } from '@/lib/arrows'
import { components } from '@/lib/components'
import { animateHighlightAndGlow, animateMovingText, loopMultipleComponentGlows, stopSpecificGlows, stopAllComponentGlows, pauseMovingAnimation, resumeMovingAnimation } from '@/lib/animation'
import { nextTick, reactive, onMounted, computed } from 'vue'
import { defineExpose } from 'vue'
import { movePaths } from '@/lib/movePaths'


// Expose computed properties for simulation state
const simulationType = computed(() => processor.type)
const isPaused = computed(() => processor.isPaused)
const isRunning = computed(() => processor.isRunning)


defineExpose({
  runManualStep,
  runAuto,
  pauseSimulation,
  resumeSimulation,
  resetSimulation,
  togglePause,
  simulationType,
  isPaused,
  isRunning
})

const processor = reactive({
  type: 'manual',
  isRunning: false,
  isPaused: false,
  currentStep: 0,
  currentInstruction: 0,
  instruction: '',
  highlights: [] as string[],
  movingText: '', // ✅ this is enough for the floating label
  intervalId: null as ReturnType<typeof setInterval> | null,
  opcode: '',   // e.g. '0001' for ADD
  operand: '',
  errorMessage: '',
})




// 🔘 Button Actions
function runManualStep() {}
function runAuto() {}
function pauseSimulation() {}
function resumeSimulation() {}
function resetSimulation() {}
function togglePause() {}

// 📊 Instruction Handling
function handleT0(instruction: string) {}
function handleT1(instruction: string) {}
function handleT2(instruction: string) {}
function handleT3(instruction: string) {}
function handleT4(instruction: string) {}
function handleT5(instruction: string) {}

// 📊 Simulation Control
function advanceStep() {}
function isFinished() {}
function stopSimulation() {}
function getCurrentOpcode(){}
function getOperand(){}
function parseInstruction(){}
function binaryToDecimal(){}
function decimalToBinary(){}
function logInstructionDetails(){}

function setInstruction(bin: string) {
  if (!isValidInstruction(bin)) {
    processor.errorMessage = 'Invalid instruction format.'
    return false
  }
  processor.instruction = bin
  processor.opcode = bin.slice(0, 4)
  processor.operand = bin.slice(4)
  return true
}

function canAdvanceStep(): boolean {
  return !processor.isPaused && processor.isRunning
}


//validation

function isValidInstruction(bin: string): boolean {
  return /^[01]{8}$/.test(bin)
}


function updateComponentValue(id: string, value: string) {
  const comp = components.find(c => c.id === id)
  if (comp) comp.value = value
}

// ✅ TEST PC → MAR
function testMovePath() {
  const binary = processor.currentInstruction.toString(2).padStart(4, '0')
  console.log('🧪 PC to MAR →', binary)

  processor.movingText = binary
  updateComponentValue('prom', binary)

  loopMultipleComponentGlows(['out'])

  animateMovingText('moving-label', movePaths.aToOut, binary, () => {
    updateComponentValue('out', binary)
    processor.movingText = ''
    stopSpecificGlows(['out'])
  })
}



</script>

<template>
  <div class="relative grid grid-cols-16 gap-px w-full h-full"
       style="grid-template-columns: repeat(16, 45px); grid-template-rows: repeat(16, 48px);">

       <!-- 🧪 Instruction Path Tests -->
<div class="absolute top-2 left-2 z-50 flex flex-col gap-2 bg-white/80 p-3 rounded shadow">

  <button @click="testMovePath">Test Move Path</button>


</div>

    <!-- ✨ Floating moving text -->
    <MovingLabel id="moving-label" :text="processor.movingText" />


    <!-- 🔁 Arrows -->
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

    <!-- 🚌 Bus in center -->
    <div
      :style="{
        gridColumnStart: 7,
        gridColumnEnd: 'span 3',
        gridRowStart: 2,
        gridRowEnd: 14
      }">
      <Bus title="8" />
    </div>

    <!-- 🧱 Components -->
    <Box
      v-for="c in components"
      :key="c.id"
      :id="c.id"
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
