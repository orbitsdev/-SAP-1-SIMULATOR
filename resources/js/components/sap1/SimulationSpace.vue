<script setup lang="ts">
defineOptions({ inheritAttrs: false });
import { animateHighlightAndGlow, animateMovingText, loopMultipleComponentGlows, pauseAllComponentGlows, pauseMovingAnimation, resumeAllComponentGlows, resumeMovingAnimation, stopAllComponentGlows, stopSpecificGlows } from '@/lib/animation';
import { arrows } from '@/lib/arrows';
import { components } from '@/lib/components';
import { controlWords } from '@/lib/controlWords';
import { movePaths } from '@/lib/movePaths';
import axios from 'axios';
import { computed, onMounted, reactive, ref } from 'vue';
import Arrow from './Arrow.vue';
import Box from './Box.vue';
import Bus from './Bus.vue';
import MovingLabel from './MovingLabel.vue';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { memory } from '@/lib/fakeMemory';
import { animationSpeed } from '@/lib/settings';

// Expose computed properties for simulation state
const simulationType = computed(() => processor.type);
const isPaused = computed(() => processor.isPaused);
const isRunning = computed(() => processor.isRunning);
const isHalted = computed(() => processor.halted);

const showEmptySteps = false;

const program = ref<string[]>([]);
const uploadedInstructions = ref<string[]>([]); //
const hasProgram = ref(false); //

function loadProgramFromFile(lines: string[]) {
    program.value = lines.filter((l: string) => /^[01]{8}$/.test(l.trim()));
    resetSimulation();
}

function isProgramLoaded(): boolean {
    return program.value.length > 0;
}

onMounted(async () => {
    try {
        const res = await axios.get('/program-load');
        if (res.data.exists) {
            // Load program directly without using uploadedInstructions
            program.value = res.data.lines.filter((l: string) => /^[01]{8}$/.test(l.trim()));
            hasProgram.value = true;
        } else {
            hasProgram.value = false;
        }
    } catch (e) {
        console.error('Failed to load program:', e);
        hasProgram.value = false;
    }
});



const processor = reactive({
    type: 'manual', // 'manual' | 'auto'
    isRunning: false,
    isPaused: false,
    halted: false,

    currentInstruction: 0, // Index of instruction in program[]
    currentStep: 0, // T0 to T5 → corresponds to T-state

    opcode: '', // Extracted opcode (4 bits)
    operand: '', // Extracted operand (4 bits)
    instruction: '', // Full 8-bit binary instruction string

    intervalId: null as ReturnType<typeof setInterval> | null,

    movingText: '', // For visual text movement
    highlights: [] as string[], // Glowing component IDs

    explanationLog: [] as string[], // NEW: step-by-step logs
    showErrorModal: false,
    simulationDone: false,

    errorMessage: '', // For invalid instructions
    invalidInstructionIndex: -1, // If any
    lastSource: 'pc' as 'pc' | 'ir',
    pendingFinalStep: false,

});

const validOpcodes = ['0000', '0001', '0010', '1110', '1111'];

function runManualStep() {
  if (!isProgramLoaded() || processor.simulationDone || processor.halted) return;

  // Set mode to manual if not already set
  if (processor.type !== 'manual') {
    processor.type = 'manual';
  }

  // If paused, resume animations but stay in manual mode
  if (processor.isPaused) {
    processor.isPaused = false;
    resumeMovingAnimation();
    resumeAllComponentGlows();
  }

  processor.isRunning = true;

  // Check if there's an active animation in progress
  if (activeMovingAnimation !== null) {
    console.log('Animation in progress. Wait for it to complete before next step.');
    return;
  }

  const currentInstruction = program.value[processor.currentInstruction];
  if (!isValidInstruction(currentInstruction)) {
    handleInvalidInstruction(processor.currentInstruction);
    return;
  }

  // Decode T0
  if (processor.currentStep === 0) {
    const { opcode, operand } = extractOpcodeOperand(currentInstruction);
    processor.opcode = opcode;
    processor.operand = operand;
    processor.instruction = currentInstruction;
  }

  const tStateName = `T${processor.currentStep}`;
  const controlSignals = getCurrentControlWords(processor.opcode, processor.currentStep);

  logStep(tStateName, controlSignals);

  // Use callback to ensure nextTState is called only after all animations complete
  applyControlWords(controlSignals, () => {
    nextTState();
  });
}

function logStep(tState: string, controlSignals: string[]) {
  const control = controlSignals.join(', ');
  const flow = describeControlFlow(controlSignals);
  const message = `STEP ${tState} | Instruction: ${processor.instruction} | Control: [${control || '—'}] | Flow: ${flow}`;

  // Only log meaningful steps, or show all if debugging
  if (showEmptySteps || controlSignals.length > 0 || flow !== '—') {
    processor.explanationLog.push(message);
    console.log('\n▶ ' + message);
  }
}
function runAuto() {
  if (!isProgramLoaded() || processor.simulationDone || processor.halted) return;

  // Set mode to auto
  processor.type = 'auto';
  processor.isRunning = true;

  // If already paused, just change the mode but don't resume
  if (processor.isPaused) {
    console.log('Auto mode set, but simulation remains paused. Click Resume to continue.');
    return;
  }

  // Start or continue auto execution
  autoStep();
}

function autoStep() {
  if (processor.halted || processor.isPaused || processor.simulationDone) return;

  runManualStep();

  if (!processor.simulationDone && !processor.isPaused) {
    processor.intervalId = setTimeout(autoStep, animationSpeed.value * 1000);
  }
}
function pauseSimulation() {
  processor.isPaused = true;
  pauseMovingAnimation();
  pauseAllComponentGlows();
  clearTimeout(processor.intervalId);

}

function resumeSimulation() {
  if (processor.simulationDone || processor.halted) return;
  processor.isPaused = false;
  resumeMovingAnimation();
  resumeAllComponentGlows();
  autoStep();
}

function togglePause() {
  if (processor.isPaused) {
    resumeSimulation();
  } else {
    pauseSimulation();
  }
}

function resetSimulation() {
  // Clear any active timers
  if (processor.intervalId !== null) {
    clearTimeout(processor.intervalId);
    processor.intervalId = null;
  }

  // Reset animation state
  pauseMovingAnimation();
  stopAllComponentGlows();

  // Reset processor state
  processor.currentInstruction = 0;
  processor.currentStep = 0;
  processor.opcode = '';
  processor.operand = '';
  processor.instruction = '';
  processor.isRunning = false;
  processor.isPaused = false;
  processor.simulationDone = false;
  processor.halted = false;
  processor.pendingFinalStep = false;
  processor.type = 'manual';
  processor.lastSource = '';
  processor.movingText = '';

  processor.explanationLog = [];

  updateComponentValue('pc', '00000000'); // INITIALIZE PC here
  updateComponentValue('mar', '');
  updateComponentValue('ir', '');
  updateComponentValue('a', '');
  updateComponentValue('b', '');
  updateComponentValue('out', '');
  updateComponentValue('alu', '');
  updateComponentValue('prom', '');

  console.log('Simulation reset');
}

function isSimulationComplete(): boolean {
    return false;
}



//Instruction + Control Word Functions
function getCurrentInstructionBinary(): string {
    return program.value[processor.currentInstruction] || '';
}

function extractOpcodeOperand(instruction: string): { opcode: string; operand: string } {
    const opcode = instruction.slice(0, 4);
    const operand = instruction.slice(4, 8);
    return { opcode, operand };
}

function getCurrentControlWords(opcode: string, tStep: number): string[] {
    const instructionType = getMnemonicFromOpcode(opcode);
    const tKey = `T${tStep}` as keyof (typeof controlWords)[keyof typeof controlWords];

    const signals = controlWords[instructionType]?.[tKey] || [];
    return signals;
}
function getMnemonicFromOpcode(opcode: string): keyof typeof controlWords {
    switch (opcode) {
        case '0000':
            return 'LDA';
        case '0001':
            return 'ADD';
        case '0010':
            return 'SUB';
        case '1110':
            return 'OUT';
        case '1111':
            return 'HLT';
        default:
            return 'HLT'; // fallback
    }
}

function applyControlWords(controlSignals: string[], onDone: () => void = () => {}) {
  animateHighlightAndGlow('con');

  let completed = 0;
  const total = controlSignals.length;

  if (total === 0) {
    onDone();
    return;
  }

  for (const signal of controlSignals) {
    executeControlWord(signal, () => {
      completed++;
      if (completed === total) {
        onDone();
      }
    });
  }
}
function checkIfFinalStepComplete() {
  if (processor.pendingFinalStep) {

    pauseMovingAnimation();
    stopAllComponentGlows();


    if (processor.intervalId !== null) {
      clearTimeout(processor.intervalId);
      processor.intervalId = null;
    }

    processor.simulationDone = true;
    processor.pendingFinalStep = false;
    processor.isRunning = false;
    console.log('✅ Simulation complete after final animation.');
  }
}

function executeControlWord(signal: string, onDone: () => void = () => {}) {
  switch (signal) {
    case 'Ep': // PC → Bus
    processor.lastSource = 'pc';
      loopMultipleComponentGlows(['pc', 'mar']);
      console.log(`→ [Ep] PC outputs to Bus: ${getComponentValue('pc')}`);
      onDone();
      break;

      case 'Lm': {
  const source = processor.lastSource;
  const value = source === 'pc'
    ? getComponentValue('pc').slice(4)
    : getComponentValue('ir').slice(4);

  const path = source === 'pc'
    ? movePaths.pcToMar
    : movePaths.irToMar;

  processor.movingText = value;

  console.log(`→ [Lm] Load MAR ← ${source.toUpperCase()}[4-7]: ${value}`);

  animateMovingText('moving-label', path, value, () => {
    updateComponentValue('mar', value);
    processor.movingText = '';
    stopSpecificGlows([source, 'mar']);
    console.log(`✓ MAR now holds: ${value}`);
    onDone();
  });

  break;
}


    case 'Ce': { // PC++
      const old = getComponentValue('pc');
      const next = parseInt(old, 2) + 1;
      const newValue = next.toString(2).padStart(8, '0');

      // ⏳ Add a small delay to make sure MAR animation is shown first
      setTimeout(() => {
        updateComponentValue('pc', newValue);
        animateHighlightAndGlow('pc');
        console.log(`→ [Ce] PC incremented: ${old} → ${newValue}`);
        onDone();
      }, 300);
      break;
    }

    case 'Li': { // IR ← PROM[MAR]
      loopMultipleComponentGlows(['prom', 'ir']);
      const mar = getComponentValue('mar');
      const promValue = memory[mar] || '00000000';
      updateComponentValue('prom', promValue);
      processor.movingText = promValue;

      console.log(`→ [Li] Load IR ← PROM[${mar}] = ${promValue}`);

      animateMovingText('moving-label', movePaths.promToIr, promValue, () => {
        updateComponentValue('ir', promValue);
        processor.movingText = '';
        stopSpecificGlows(['prom', 'ir']);
        console.log(`✓ IR now holds: ${getComponentValue('ir')}`);
        onDone();
      });
      break;
    }

    case 'La': {
      loopMultipleComponentGlows(['prom', 'a']);
      const value = getComponentValue('prom');
      processor.movingText = value;
      console.log(`→ [La] Load A ← ${value} from PROM`);

      animateMovingText('moving-label', movePaths.promToA, value, () => {
        updateComponentValue('a', value);
        processor.movingText = '';
        stopSpecificGlows(['prom', 'a']);
        onDone();
      });
      break;
    }

    case 'Lb': {
      loopMultipleComponentGlows(['prom', 'b']);
      const value = getComponentValue('prom');
      processor.movingText = value;
      console.log(`→ [Lb] Load B ← ${value} from PROM`);

      animateMovingText('moving-label', movePaths.promToB, value, () => {
        updateComponentValue('b', value);
        processor.movingText = '';
        stopSpecificGlows(['prom', 'b']);
        onDone();
      });
      break;
    }

    case 'Ea': // A → Bus
      loopMultipleComponentGlows(['a', 'alu']);
      console.log(`→ [Ea] A → ALU input: ${getComponentValue('a')}`);
      onDone();
      break;

    case 'Eu': {
      const a = getComponentValue('a');
      const b = getComponentValue('b');
      const result = binaryAdd(a, b);
      updateComponentValue('alu', result);
      processor.movingText = result;

      console.log(`→ [Eu] ALU Add: ${a} + ${b} = ${result}`);

      loopMultipleComponentGlows(['alu', 'a']);
      animateMovingText('moving-label', movePaths.aluToA, result, () => {
        updateComponentValue('a', result);
        processor.movingText = '';
        stopSpecificGlows(['alu', 'a']);
        onDone();
      });
      break;
    }

    case 'Su': {
  const a = getComponentValue('a');
  const b = getComponentValue('b');
  const result = binarySub(a, b);
  updateComponentValue('alu', result);
  processor.movingText = result;

  console.log(`→ [Su] ALU Sub: ${a} - ${b} = ${result}`);

  loopMultipleComponentGlows(['alu', 'a']);
  animateMovingText('moving-label', movePaths.aluToA, result, () => {
    updateComponentValue('a', result);
    processor.movingText = '';
    stopSpecificGlows(['alu', 'a']);
    checkIfFinalStepComplete(); //
    onDone();
  });
  break;
}


case 'Lo': {
  const value = getComponentValue('a');
  loopMultipleComponentGlows(['a', 'out']);
  processor.movingText = value;

  console.log(`→ [Lo] OUT ← A = ${value}`);

  animateMovingText('moving-label', movePaths.aToOut, value, () => {
    updateComponentValue('out', value);
    processor.movingText = '';
    stopSpecificGlows(['a', 'out']);
    console.log(` OUT now holds: ${getComponentValue('out')}`);
    checkIfFinalStepComplete(); //
    onDone();
  });
  break;
}


    case 'Lu': {
  const result = getComponentValue('alu');
  processor.movingText = result;

  console.log(`→ [Lu] Load A ← ALU = ${result}`);

  loopMultipleComponentGlows(['alu', 'a']);
  animateMovingText('moving-label', movePaths.aluToA, result, () => {
    updateComponentValue('a', result);
    processor.movingText = '';
    stopSpecificGlows(['alu', 'a']);
    console.log(` A now holds: ${result} from ALU`);
    checkIfFinalStepComplete(); //
    onDone();
  });
  break;
}


case 'Ea': {
  const value = getComponentValue('a');
  processor.movingText = value;

  loopMultipleComponentGlows(['a', 'alu']);
  console.log(`→ [Ea] A → ALU: ${value}`);

  animateMovingText('moving-label', movePaths.aToAlu, value, () => {
    // No value update; just visual
    processor.movingText = '';
    stopSpecificGlows(['a', 'alu']);
    onDone();
  });

  break;
}
case 'Ei': {
  processor.lastSource = 'ir';
  const ir = getComponentValue('ir');
  const operand = ir.slice(4); // Only use lower 4 bits
  processor.movingText = operand;

  loopMultipleComponentGlows(['ir', 'mar']);
  console.log(`→ [Ei] IR → Bus: operand=${operand}`);

  animateMovingText('moving-label', movePaths.irToMar, operand, () => {
    updateComponentValue('mar', operand);
    processor.movingText = '';
    stopSpecificGlows(['ir', 'mar']);
    console.log(` MAR now holds operand from IR: ${operand}`);
    onDone();
  });

  break;
}



    default:
      console.warn(` Unknown signal: ${signal}`);
      onDone();
  }
}

function nextTState() {
  processor.currentStep++;

  const mnemonic = getMnemonicFromOpcode(processor.opcode);
  const maxT = Object.keys(controlWords[mnemonic]).length;

  if (processor.currentStep >= maxT) {
    processor.currentStep = 0;
    processor.currentInstruction++;

    if (mnemonic === 'HLT') {
      haltSimulation();
      return;
    }

    // WAIT for animation, do NOT set simulationDone here
    const isLastInstruction = processor.currentInstruction >= program.value.length;
    if (isLastInstruction) {
      processor.pendingFinalStep = true; // wait for last animation
    }
  }

  // If in auto mode and not paused/halted/done, schedule next step
  if (processor.type === 'auto' && !processor.isPaused && !processor.halted && !processor.simulationDone) {
    if (processor.intervalId !== null) {
      clearTimeout(processor.intervalId);
    }
    processor.intervalId = setTimeout(autoStep, animationSpeed.value * 1000);
  }
}

function updateComponentValue(id: string, value: string) {
    const comp = components.find((c) => c.id === id);
    if (comp) comp.value = value;
}

function getComponentValue(id: string): string {
    const c = components.find((x) => x.id === id);
    return c?.value || '00000000';
}

function binaryAdd(a: string, b: string): string {
    const sum = parseInt(a, 2) + parseInt(b, 2);
    return sum.toString(2).padStart(8, '0');
}

function binarySub(a: string, b: string): string {
    const diff = parseInt(a, 2) - parseInt(b, 2);
    return diff.toString(2).padStart(8, '0');
}

//Validation + Error Handling
function isValidInstruction(bin: string): boolean {
    if (!/^[01]{8}$/.test(bin)) return false;
    const opcode = bin.slice(0, 4);
    return validOpcodes.includes(opcode);
}

function describeControlFlow(signals: string[]): string {
  const flows: string[] = [];

  if (signals.includes('Ep') && signals.includes('Lm')) flows.push('PC → MAR');
  if (signals.includes('Ce')) flows.push('PC++');
  if (signals.includes('Li')) flows.push('PROM → IR');
  if (signals.includes('La')) flows.push('PROM → A');
  if (signals.includes('Lb')) flows.push('PROM → B');
  if (signals.includes('Ea')) flows.push('A → Bus');
  if (signals.includes('Eu')) flows.push('ALU(Add) → A');
  if (signals.includes('Su')) flows.push('ALU(Sub) → A');
  if (signals.includes('Lo')) flows.push('A → OUT');

  return flows.length > 0 ? flows.join(', ') : '—';
}


function handleInvalidInstruction(index: number) {}

function haltSimulation() {
    processor.halted = true;
}

function setExplanation(text: string) {}
function getExplanation() {}
function logExplanation() {}
function clearExplanation() {}
function logState() {}

function testMovePath() {
    const binary = processor.currentInstruction.toString(2).padStart(4, '0');
    console.log('');

    processor.movingText = binary;
    updateComponentValue('ir', binary);

    loopMultipleComponentGlows(['ir', 'mar']);

    animateMovingText('moving-label', movePaths.irToMar, binary, () => {
        updateComponentValue('mar', binary);
        processor.movingText = '';
        stopSpecificGlows(['ir', 'mar']);
    });
}

//  Animation + Visual Feedback Helper
function highlightComponents(ids: string[]) {}
function clearHighlights() {}
function animateBusTransfer(from: string, to: string, value: string) {}
function displayErrorModal() {}
function showSimulationCompleteModal() {}

function isFinished(): boolean {
    return false;
}



defineExpose({
    testMovePath,
    loadProgramFromFile,
    runManualStep,
    runAuto,
    pauseSimulation,
    resumeSimulation,
    resetSimulation,
    togglePause,
    simulationType,
    isPaused,
    isRunning,
    isHalted,
    currentInstruction: computed(() => processor.currentInstruction),
    explanationLog: computed(() => processor.explanationLog),
});
</script>

<template>
    <div
        v-bind="$attrs"
        class="relative grid h-full w-full grid-cols-16 gap-px"
        style="grid-template-columns: repeat(16, 45px); grid-template-rows: repeat(16, 48px)"
    >
        <!-- <div
      class="absolute top-2 right-2 z-50 bg-white/90 px-4 py-2 rounded shadow text-sm font-mono"
    >
      <span class="text-gray-500">Now Running:</span>
      <span class="font-bold text-blue-700">{{ processor.instruction }}</span>
    </div> -->

        <!-- <div class="absolute top-2 left-2 z-50 flex flex-col gap-2 bg-white/80 p-3 rounded shadow">

     <button @click="testMovePath">Test Move Path</button>


    </div> -->
        <MovingLabel id="moving-label" :text="processor.movingText" />

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
                gridRowEnd: 14,
            }"
        >
            <Bus title="8" />
        </div>

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
                gridRowEnd: `span ${c.rowSpan}`,
            }"
        />
    </div>
    <Dialog v-model:open="processor.showErrorModal">
        <DialogContent>
            <DialogHeader>
                <DialogTitle class="text-red-600">Invalid Instruction</DialogTitle>
                <DialogDescription>
                    Instruction at line {{ processor.invalidInstructionIndex + 1 }} is not valid:
                    <code class="rounded bg-gray-100 px-2 py-1 text-red-500">
                        {{ program[processor.invalidInstructionIndex] }}
                    </code>
                </DialogDescription>
            </DialogHeader>
            <div class="mt-4 flex justify-end">
                <button class="rounded bg-red-600 px-4 py-2 text-white" @click="processor.showErrorModal = false">Close</button>
            </div>
        </DialogContent>
    </Dialog>

    <Dialog v-model:open="processor.simulationDone">
        <DialogContent>
            <DialogHeader>
                <DialogTitle class="text-green-700">Simulation Complete</DialogTitle>
                <DialogDescription> All instructions have been processed successfully. </DialogDescription>
            </DialogHeader>
            <div class="mt-4 flex justify-end">
                <button class="rounded bg-green-700 px-4 py-2 text-white" @click="processor.simulationDone = false">Close</button>
            </div>
        </DialogContent>
    </Dialog>
</template>
