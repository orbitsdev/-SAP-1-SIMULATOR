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
import { ldaPaths, addPaths, subPaths, outPaths, hltPaths } from '@/lib/movePaths'

function getPathsByOpcode(opcode: string) {
  switch (opcode) {
    case '0000': return ldaPaths
    case '0001': return addPaths
    case '0010': return subPaths
    case '1110': return outPaths
    default: return ldaPaths // fallback or error
  }
}

// Expose computed properties for simulation state
const simulationType = computed(() => simulationProgramProcess.type)
const isPaused = computed(() => simulationProgramProcess.isPaused)
const isRunning = computed(() => simulationProgramProcess.isRunning)


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



const simulationProgramProcess = reactive({
  type: 'manual',
  isRunning: false,
  isPaused: false,
  currentStep: 0,
  currentInstruction: 0,
  movingText: '',
  movingPath: [] as { x: number; y: number }[],
  highlight: '',
  highlights: [] as string[],
  intervalId: null as ReturnType<typeof setInterval> | null
})


function runCurrentStep() {

}

// 🔘 Button Actions
function runManualStep() {

}

function runAuto() {

}
function pauseSimulation() {

}

function resumeSimulation() {

}

function resetSimulation() {

}

function handleT0(instruction: string) {


}


function updateComponentValue(id: string, value: string) {

}
function handleT1(instruction: string) {

}
function handleT2(instruction: string) {

}
function handleT3(instruction: string) {

}


function handleT4(instruction: string) {

}


function handleT5(instruction: string) {

}



function advanceStep() {

}


function isFinished() {

}


function logInstructionDetails(instruction: string) {

}

function stopSimulation() {

}

function togglePause() {

}

function testMovingPath() {

}
function testLdaPath() {
  stopAllComponentGlows()

//   const testValues: Record<string, string> = {
//     moveFromPcToMar: simulationProgramProcess.currentInstruction.toString(2).padStart(4, '0'), // e.g. '0000'
//     moveFromPromToIr: '00001010',  // LDA 0A
//     moveFromIrToMar: '1010',       // operand from IR
//     moveFromPromToA: '00000101',   // value at M[0A]
//   }

  const glowMap: Record<string, string[]> = {
    moveFromPcToMar: ['program-counter', 'memory-address-register'],
    moveFromPromToIr: ['prom', 'instruction-register', 'control-unit'], // 👈 add control unit
    moveFromIrToMar: ['instruction-register', 'memory-address-register', 'control-unit'], // 👈 add control unit
    moveFromPromToA: ['prom', 'register-a'],
  }

  const valueTargetMap: Record<string, string> = {
    moveFromPcToMar: 'memory-address-register',
    moveFromPromToIr: 'instruction-register',
    moveFromIrToMar: 'memory-address-register',
    moveFromPromToA: 'register-a',
  }

  const pathEntries = Object.entries(ldaPaths)

  function runStep(index = 0) {
    if (index >= pathEntries.length) {
      simulationProgramProcess.movingText = ''
      return
    }

    const [key, path] = pathEntries[index]
    const value = '00000000'
    const glows = glowMap[key] || []
    const targetId = valueTargetMap[key]

    loopMultipleComponentGlows(glows)
    simulationProgramProcess.movingText = value

    animateMovingText('moving-label', path, value, () => {
      if (targetId) updateComponentValue(targetId, value)
      stopSpecificGlows(glows)
      runStep(index + 1) // recursive call
    })
  }

  runStep()
}

function testMovePath() {

const pcBinary = simulationProgramProcess.currentInstruction.toString(2).padStart(4, '0')
updateComponentValue('program-counter', pcBinary)

simulationProgramProcess.movingText = pcBinary

loopMultipleComponentGlows(['prom', 'register-b'])

animateMovingText('moving-label', addPaths.moveFromBToAlu, pcBinary, () => {
updateComponentValue('register-b', pcBinary)

simulationProgramProcess.movingText = ''
stopSpecificGlows(['prom', 'register-b'])

})

}



function testAddPath() {
  stopAllComponentGlows()

  // PROM → Register B
  animateMovingText('moving-label', addPaths.moveFromPromToB, '', () => {
    loopMultipleComponentGlows(['register-b', 'arithmetic-logic-unit'])

    // Register B → ALU
    animateMovingText('moving-label', addPaths.moveFromBToAlu, '', () => {
      stopSpecificGlows(['register-b'])

      // Register A → ALU
      loopMultipleComponentGlows(['register-a', 'arithmetic-logic-unit'])
      animateMovingText('moving-label', addPaths.moveFromAToAlu, '', () => {
        stopSpecificGlows(['register-a'])

        // ALU → Register A
        loopMultipleComponentGlows(['arithmetic-logic-unit', 'register-a'])
        animateMovingText('moving-label', addPaths.moveFromAluToA, '', () => {
          stopSpecificGlows(['arithmetic-logic-unit', 'register-a'])
          simulationProgramProcess.movingText = ''
        })
      })
    })
  })
}





function testSubPath() {
  stopAllComponentGlows()
  animateMovingText('moving-label', subPaths.moveFromBToAlu, '00000101', () => {
    animateMovingText('moving-label', subPaths.moveFromAToAlu, '00000011', () => {
      animateMovingText('moving-label', subPaths.moveFromAluToA, '11111110') // example result
    })
  })
}

function testOutPath() {
  stopAllComponentGlows()
  animateMovingText('moving-label', outPaths.moveFromAToOut, '01010101')
}

function testHltPath() {
  stopAllComponentGlows()
  animateMovingText('moving-label', hltPaths.moveFromAToOut, 'NOOP')
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
    <MovingLabel :text="simulationProgramProcess.movingText" />

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
