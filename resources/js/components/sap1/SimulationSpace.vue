<script setup lang="ts">
import Box from './Box.vue'
import Bus from './Bus.vue'
import Arrow from './Arrow.vue'
import MovingLabel from './MovingLabel.vue'
import { arrows } from '@/lib/arrows'
import { components } from '@/lib/components'
import { movePaths } from '@/lib/movePaths'
import { animateHighlightAndGlow, animateMovingText, loopMultipleComponentGlows, stopSpecificGlows, stopAllComponentGlows, pauseMovingAnimation, resumeMovingAnimation } from '@/lib/animation'
import { nextTick, reactive, onMounted, computed } from 'vue'
import { defineExpose } from 'vue'

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

const program = [
  '00001110', // 00: LDA 0E → A ← M[0E] = 00000011 (3)
  '0001100F', // 01: ADD 0F → A ← A + M[0F] = 3 + 4
  '11100000', // 02: OUT      → OUT ← A = 7
  '11110000', // 03: HLT
  '', '', '', '',  // 04–07: unused
  '', '', '', '',  // 08–0B: unused
  '', '',          // 0C, 0D: unused
  '00000011',      // 0E: value = 3
  '00000100'       // 0F: value = 4
]

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

// 🎯 Step Execution Logic
function runCurrentStep() {
  // If we're finished, stop everything
  if (isFinished()) {
    stopSimulation()
    return
  }

  // 🛑 Ensure any active animation is stopped before proceeding
  stopAllComponentGlows()
  simulationProgramProcess.movingText = ''

  const step = simulationProgramProcess.currentStep
  const instruction = program[simulationProgramProcess.currentInstruction]

  // Log for debugging
  logInstructionDetails(instruction)

  // Route to correct T-step
  switch (step) {
    case 0: handleT0(instruction); break
    case 1: handleT1(instruction); break
    case 2: handleT2(instruction); break
    case 3: handleT3(instruction); break
    case 4: handleT4(instruction); break
    case 5: handleT5(instruction); break
  }
}

// 🔘 Button Actions
function runManualStep() {
  if(isFinished()) return

  // 🧼 Reset before running
  stopAllComponentGlows()
  simulationProgramProcess.movingText = ''

  // If already running, reset to current step
  if(simulationProgramProcess.isRunning) {
    simulationProgramProcess.isRunning = false
    return
  }

  simulationProgramProcess.type = 'manual'
  simulationProgramProcess.isRunning = true
  simulationProgramProcess.isPaused = false
  runCurrentStep()
}

function runAuto() {
  if(isFinished()) return

  // 🧼 Clean up previous state
  stopAllComponentGlows()
  simulationProgramProcess.movingText = ''

  // If already running, reset to current step
  if(simulationProgramProcess.isRunning) {
    simulationProgramProcess.isRunning = false
    return
  }

  simulationProgramProcess.type = 'auto'
  simulationProgramProcess.isRunning = true
  simulationProgramProcess.isPaused = false

  // Run the first step
  runCurrentStep()
}
function pauseSimulation() {
  if (simulationProgramProcess.type === 'auto') {
    simulationProgramProcess.isPaused = true
    simulationProgramProcess.isRunning = false

    // Pause any active animations
    pauseMovingAnimation()
  }
}

function resumeSimulation() {
  if (simulationProgramProcess.type === 'auto' && simulationProgramProcess.isPaused) {
    simulationProgramProcess.isPaused = false
    simulationProgramProcess.isRunning = true

    // Resume any active animations
    if (!resumeMovingAnimation()) {
      // If no animation to resume, continue with next step
      runCurrentStep()
    }
  }
}

function resetSimulation() {
  simulationProgramProcess.currentInstruction = 0
  simulationProgramProcess.currentStep = 0
  simulationProgramProcess.movingText = ''
  simulationProgramProcess.highlight = ''
  simulationProgramProcess.highlights = []
  simulationProgramProcess.isPaused = false
  simulationProgramProcess.isRunning = false

  // Clear interval if any
  if (simulationProgramProcess.intervalId) {
    clearInterval(simulationProgramProcess.intervalId)
    simulationProgramProcess.intervalId = null
  }

  // Reset all component values
  components.forEach(c => (c.value = ''))

  // Stop glowing
  stopAllComponentGlows()
}

function handleT0(instruction: string) {

  const pcBinary = simulationProgramProcess.currentInstruction.toString(2).padStart(4, '0')
  updateComponentValue('program-counter', pcBinary)

  simulationProgramProcess.movingText = pcBinary

  loopMultipleComponentGlows(['program-counter', 'memory-address-register'])

  animateMovingText('moving-label', movePaths.moveFromPcToMar, pcBinary, () => {
  updateComponentValue('memory-address-register', pcBinary)

  simulationProgramProcess.movingText = ''
  stopSpecificGlows(['program-counter', 'memory-address-register'])

  advanceStep()
  simulationProgramProcess.isRunning = false // 👈 Allow next manual click

  if (simulationProgramProcess.type === 'auto' && !simulationProgramProcess.isPaused) {
    runCurrentStep()
  }
})

}


function updateComponentValue(id: string, value: string) {
  const comp = components.find(c => c.id === id)
  if (comp) comp.value = value
}
function handleT1(instruction: string) {
  const marValue = components.find(c => c.id === 'memory-address-register')?.value || '0000'

  // Simulate reading instruction from PROM using address in MAR
  const addressDecimal = parseInt(marValue, 2)
  const instructionAtAddress = program[addressDecimal] || '00000000' // fallback

  // Store PROM content visually
  updateComponentValue('prom', instructionAtAddress)

  // ✨ Highlight PROM, IR, and CONTROL UNIT (CON)
  loopMultipleComponentGlows(['prom', 'instruction-register', 'control-unit'])

  // 🛸 Animate movement of instruction → IR
  simulationProgramProcess.movingText = instructionAtAddress
  animateMovingText('moving-label', movePaths.moveFromPromToIr, instructionAtAddress, () => {
    updateComponentValue('instruction-register', instructionAtAddress)
    simulationProgramProcess.movingText = ''

    // 🔕 Stop glowing all involved components
    stopSpecificGlows(['prom', 'instruction-register', 'control-unit'])

    // ⏭ Advance to next micro step
    advanceStep()
    simulationProgramProcess.isRunning = false // ✅ Allow next manual click

    // 🔁 Continue auto if enabled
    if (simulationProgramProcess.type === 'auto' && !simulationProgramProcess.isPaused) {
      runCurrentStep()
    }
  })
}
function handleT2(instruction: string) {
  const irValue = components.find(c => c.id === 'instruction-register')?.value || '00000000'
  const operand = irValue.slice(4)

  // Store to MAR visually
  updateComponentValue('memory-address-register', operand)

  // Animate text moving from IR to MAR
  simulationProgramProcess.movingText = operand
  loopMultipleComponentGlows(['instruction-register', 'memory-address-register'])

  animateMovingText('moving-label', movePaths.moveFromIrToMar, operand, () => {
    simulationProgramProcess.movingText = ''
    stopSpecificGlows(['instruction-register', 'memory-address-register'])

    advanceStep()
    simulationProgramProcess.isRunning = false

    if (simulationProgramProcess.type === 'auto' && !simulationProgramProcess.isPaused) {
      runCurrentStep()
    }
  })
}
function handleT3(instruction: string) {
  const opcode = instruction.slice(0, 4)

  // Skip T3 for OUT and HLT
  if (opcode === '1110' || opcode === '1111') {
    advanceStep()
    simulationProgramProcess.isRunning = false
    return
  }

  const operandBinary = instruction.slice(4)
  const address = parseInt(operandBinary, 2)
  const valueFromMemory = program[address] || '00000000'

  // Debug logs
  console.log('Opcode:', opcode, 'Value from PROM:', valueFromMemory)
  console.log('Address in binary:', operandBinary, 'Address in decimal:', address)

  updateComponentValue('prom', valueFromMemory)

  if (opcode === '0000') {
    // LDA → Load to A
    console.log('→ Loading to A register')
    loopMultipleComponentGlows(['prom', 'register-a'])
    simulationProgramProcess.movingText = valueFromMemory
    animateMovingText('moving-label', movePaths.moveFromPromToA, valueFromMemory, () => {
      updateComponentValue('register-a', valueFromMemory)
      simulationProgramProcess.movingText = ''
      stopSpecificGlows(['prom', 'register-a'])
      advanceStep()
      simulationProgramProcess.isRunning = false
    })
  } else {
    // ADD / SUB → Load to B
    console.log('→ Loading to B register')
    loopMultipleComponentGlows(['prom', 'register-b'])
    simulationProgramProcess.movingText = valueFromMemory
    animateMovingText('moving-label', movePaths.moveFromPromToB, valueFromMemory, () => {
      updateComponentValue('register-b', valueFromMemory)
      simulationProgramProcess.movingText = ''
      stopSpecificGlows(['prom', 'register-b'])
      advanceStep()
      simulationProgramProcess.isRunning = false
    })
  }
}


function handleT4(instruction: string) {
  const opcode = instruction.slice(0, 4)

  if (opcode === '0001' || opcode === '0010') {
    // ADD or SUB operation

    const aValBin = components.find(c => c.id === 'register-a')?.value || '00000000'
    const bValBin = components.find(c => c.id === 'register-b')?.value || '00000000'
    const aVal = parseInt(aValBin, 2)
    const bVal = parseInt(bValBin, 2)

    const result = opcode === '0001'
      ? (aVal + bVal) & 0xFF
      : (aVal - bVal + 256) & 0xFF // wrap for SUB

    const resultBinary = result.toString(2).padStart(8, '0')

    console.log(`🔧 T4 EXECUTE: ${opcode === '0001' ? 'ADD' : 'SUB'} → A(${aVal}) ${opcode === '0001' ? '+' : '-'} B(${bVal}) = ${result} (${resultBinary})`)

    // 🔁 Step 1: B → ALU
    simulationProgramProcess.movingText = bValBin
    loopMultipleComponentGlows(['register-b', 'arithmetic-logic-unit'])

    animateMovingText('moving-label', movePaths.moveFromBToAlu, bValBin, () => {
      stopSpecificGlows(['register-b'])

      // 🔁 Step 2: A → ALU
      simulationProgramProcess.movingText = aValBin
      loopMultipleComponentGlows(['register-a', 'arithmetic-logic-unit'])

      animateMovingText('moving-label', movePaths.moveFromAToAlu, aValBin, () => {
        stopSpecificGlows(['register-a'])

        // 🔁 Step 3: ALU → A
        simulationProgramProcess.movingText = resultBinary
        loopMultipleComponentGlows(['arithmetic-logic-unit', 'register-a'])

        animateMovingText('moving-label', movePaths.moveFromAluToA, resultBinary, () => {
          updateComponentValue('register-a', resultBinary)
          simulationProgramProcess.movingText = ''
          stopSpecificGlows(['arithmetic-logic-unit', 'register-a'])

          advanceStep()
          simulationProgramProcess.isRunning = false

          // Auto-continue
          if (simulationProgramProcess.type === 'auto' && !simulationProgramProcess.isPaused) {
            runCurrentStep()
          }
        })
      })
    })
  }

  else if (opcode === '1110') {
    // OUT instruction: A → OUT
    const aVal = components.find(c => c.id === 'register-a')?.value || '00000000'
    simulationProgramProcess.movingText = aVal

    loopMultipleComponentGlows(['register-a', 'output-register'])

    animateMovingText('moving-label', movePaths.moveFromAToOut, aVal, () => {
      updateComponentValue('output-register', aVal)
      updateComponentValue('binary-display', aVal)
      simulationProgramProcess.movingText = ''
      stopSpecificGlows(['register-a', 'output-register'])

      advanceStep()
      simulationProgramProcess.isRunning = false

      if (simulationProgramProcess.type === 'auto' && !simulationProgramProcess.isPaused) {
        runCurrentStep()
      }
    })
  }

  else {
    // T4 skipped for LDA / HLT
    advanceStep()
    simulationProgramProcess.isRunning = false

    if (simulationProgramProcess.type === 'auto' && !simulationProgramProcess.isPaused) {
      runCurrentStep()
    }
  }
}


function handleT5(instruction: string) {
  // Most instructions don’t require T5
  advanceStep()
  simulationProgramProcess.isRunning = false

  if (simulationProgramProcess.type === 'auto' && !simulationProgramProcess.isPaused) {
    runCurrentStep()
  }
}



function advanceStep() {
  if (simulationProgramProcess.currentStep < 5) {
    simulationProgramProcess.currentStep++
  } else {
    simulationProgramProcess.currentStep = 0
    simulationProgramProcess.currentInstruction++
  }

  // ✅ Unlock for manual mode
  if (simulationProgramProcess.type === 'manual') {
    simulationProgramProcess.isRunning = false
  }
}


function isFinished() {
  return simulationProgramProcess.currentInstruction >= program.length
}


function logInstructionDetails(instruction: string) {
  const opcode = instruction.slice(0, 4)
  const operand = instruction.slice(4)
  console.log(`Opcode: ${opcode}, Operand: ${operand}`)
}

function stopSimulation() {
  if (simulationProgramProcess.intervalId) {
    clearInterval(simulationProgramProcess.intervalId)
    simulationProgramProcess.intervalId = null
  }

  simulationProgramProcess.isRunning = false
  simulationProgramProcess.isPaused = false
}

function togglePause() {
  if (simulationProgramProcess.isPaused) {
    resumeSimulation()
  } else {
    pauseSimulation()
  }
}

function testMovingPath() {
  animateMovingText('moving-label', movePaths.moveFromPcToMar, '0000', () => {
    console.log('Animation completed')
  })
}

</script>

<template>
  <div class="relative grid grid-cols-16 gap-px w-full h-full"
       style="grid-template-columns: repeat(16, 45px); grid-template-rows: repeat(16, 48px);">
<button @click="testMovingPath">Test Moving Path</button>
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
