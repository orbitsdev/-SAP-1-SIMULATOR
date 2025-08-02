<script setup lang="ts">
defineOptions({ inheritAttrs: false });
import { animateHighlightAndGlow, animateMovingText, loopMultipleComponentGlows, pauseAllComponentGlows, pauseMovingAnimation, resumeAllComponentGlows, resumeMovingAnimation, stopAllComponentGlows, stopSpecificGlows } from '@/lib/animation';
import { arrows } from '@/lib/arrows';
import { components } from '@/lib/components';
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
import { ControlStep, executeSteps, fetchSteps } from '@/lib/controlWords';

// Expose computed properties for simulation state
const simulationType = computed(() => processor.type);
const isPaused = computed(() => processor.isPaused);
const isRunning = computed(() => processor.isRunning);
const isHalted = computed(() => processor.halted);

const program = ref<string[]>([]);
const uploadedInstructions = ref<string[]>([]); //
const hasProgram = ref(false); //


function isProgramLoaded(): boolean {
    return program.value.length > 0;
}

onMounted(async () => {
    try {
        const res = await axios.get('/program-load');
        if (res.data.exists) {

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

  type: 'manual' as 'manual' | 'auto',
  isRunning: false,
  isPaused: false,
  halted: false,
  currentInstruction: 0,
  currentStep: 0,
  opcode: '',
  operand: '',
  movingText: '',


  explanationLog: [] as string[],
  showErrorModal: false,
  simulationDone: false,
  errorMessage: '',
  invalidInstructionIndex: -1, // 🆕 to highlight which line is wrong
});


const validOpcodes = ['0000', '0001', '0010', '1110', '1111'];
let autoIntervalId: ReturnType<typeof setInterval> | null = null;


function loadProgramFromFile(lines: string[]) {
    program.value = lines.filter((l: string) => /^[01]{8}$/.test(l.trim()));
    resetSimulation();
}

// CONTROLLER FUNCTIONS
function runManualStep() {
  if (processor.halted || processor.isPaused || !isProgramLoaded()) return;
  nextStep();
}

function runAuto() {
  if (processor.halted || !isProgramLoaded() || processor.isRunning) return;

  processor.type = 'auto';
  processor.isRunning = true;
  processor.isPaused = false;

  autoIntervalId = setInterval(() => {
    if (processor.isPaused || processor.halted || processor.simulationDone) {
      clearInterval(autoIntervalId!);
      autoIntervalId = null;
      processor.isRunning = false;
      return;
    }

    nextStep();
  }, animationSpeed.value * 1000 + 300); // delay = animation + buffer
}



function nextStep() {
  const step = processor.currentStep;
  const instruction = program.value[processor.currentInstruction];

  if (!instruction || instruction.length !== 8 || !validOpcodes.includes(instruction.slice(0, 4))) {
    showInvalidInstruction(processor.currentInstruction, instruction);
    return;
  }

  // Fetch phase (T0–T2)
  let config: ControlStep | undefined;
  if (step <= 2) {
    config = fetchSteps[step];
  } else {
    if (step === 3) {
      // Decode only once before T3
      processor.opcode = instruction.slice(0, 4);
      processor.operand = instruction.slice(4, 8);
    }
    const mnemonic = opcodeName(processor.opcode);
    config = executeSteps[mnemonic]?.[step];
  }

  if (!config) {
    logExplanation(`No config for step ${step}`);
    return;
  }

  // 🔆 Glow components
  if (config.glow && config.glow.length > 0) {
    loopMultipleComponentGlows(config.glow);
  }

  // 🏷️ Animate moves (single or multiple)
  const moves = config.move
  ? (Array.isArray(config.move) ? config.move : [config.move])
  : [];

  const animationSequence = moves.reduce(
    (prev, move) => prev.then(() => {
      return new Promise(resolve => {
        const valueToMove = resolveMoveValue(config.update?.value ?? '');
        animateMovingText('moving-label', movePaths[move], valueToMove, resolve);
      });
    }),
    Promise.resolve()
  );

  animationSequence.then(() => {
    // 🧠 Update component value (after movement)
    if (config.update) {
      const { componentId, value } = config.update;
      const resolved = resolveUpdateValue(value);
      updateComponentValue(componentId, resolved);
    }

    // 📝 Log explanation
    if (config.note) {
      logExplanation(config.note);
    }

    stopAllComponentGlows();

    // ➕ Proceed to next T-state or instruction
    if (step < 5) {
      processor.currentStep++;
    } else {
      if (config.halt) {
        processor.halted = true;
        logExplanation('Simulation halted.');
        return;
      }

      if (processor.currentInstruction + 1 >= program.value.length) {
        markSimulationDone();
        return;
      }

      processor.currentInstruction++;
      processor.currentStep = 0;
    }
  });
}

function opcodeName(code: string): keyof typeof executeSteps {
  switch (code) {
    case '0000': return 'LDA';
    case '0001': return 'ADD';
    case '0010': return 'SUB';
    case '1110': return 'OUT';
    case '1111': return 'HLT';
    default: return 'HLT';
  }
}

function resolveUpdateValue(source: string): string {
  if (source === 'pc') return getComponentValue('pc');
  if (source === 'pc+1') {
    const pc = parseInt(getComponentValue('pc'), 2);
    return pc.toString(2).padStart(8, '0');
  }
  if (source === 'fromOperand') return processor.operand;
  if (source === 'a') return getComponentValue('a');
  if (source === 'b') return getComponentValue('b');
  if (source === 'a + b') {
    const a = parseInt(getComponentValue('a'), 2);
    const b = parseInt(getComponentValue('b'), 2);
    return (a + b).toString(2).padStart(8, '0');
  }
  if (source === 'a - b') {
    const a = parseInt(getComponentValue('a'), 2);
    const b = parseInt(getComponentValue('b'), 2);
    return (a - b).toString(2).padStart(8, '0');
  }
  if (source.startsWith('memory[')) {
    const addr = source.match(/\[(.*)\]/)?.[1] || '0000';
    return memory[addr] ?? '00000000';
  }
  return source;
}

function resolveMoveValue(source: string): string {
  return resolveUpdateValue(source);
}


function togglePause() {
  if (processor.isPaused) {
    resumeSimulation();
  } else {
    pauseSimulation();
  }
}

function pauseSimulation() {
  if (autoIntervalId) {
    clearInterval(autoIntervalId);
    autoIntervalId = null;
  }

  pauseAllComponentGlows();
  pauseMovingAnimation();
  processor.isPaused = true;
  processor.isRunning = false;
}

function resumeSimulation() {
  if (processor.halted || processor.simulationDone || processor.isRunning) return;

  resumeAllComponentGlows();
  resumeMovingAnimation();

  processor.isPaused = false;
  processor.isRunning = true;

  runAuto(); // resume by re-calling auto
}

function resetSimulation() {
  if (autoIntervalId) {
    clearInterval(autoIntervalId);
    autoIntervalId = null;
  }

  stopAllComponentGlows();
  processor.currentInstruction = 0;
  processor.currentStep = 0;
  processor.opcode = '';
  processor.operand = '';
  processor.movingText = '';
  processor.halted = false;
  processor.isRunning = false;
  processor.isPaused = false;
  processor.explanationLog = [];
  processor.simulationDone = false;
  processor.showErrorModal = false;
  processor.invalidInstructionIndex = -1;
  processor.errorMessage = '';

  // Reset all component values to default (e.g. '00000000')
  components.forEach(c => (c.value = ''));
}


function validateInstruction(binary: string){}
function decodeInstruction(binary: string){}
function validateProgram(program: string[]){}



function updateComponentValue(id: string, value: string) {
    const comp = components.find((c) => c.id === id);
    if (comp) comp.value = value;
}

function getComponentValue(id: string): string {
    const c = components.find((x) => x.id === id);
    return c?.value || '';
}

// UI MANIPULATION FUNCTIONS

//GLOW ANIMATIONS
//EMAPLE
// loopMultipleComponentGlows(['ir', 'mar']);
// MOVING LABEL ANIMATION
// animateMovingText('moving-label', movePaths.irToMar, binary, () => {
//     updateComponentValue('mar', binary);
//     processor.movingText = '';
//     stopSpecificGlows(['ir', 'mar']);
// });

// UPDATE COMPOENT VALUE
//updateComponentValue('ir', binary);


function fetchCurrentInstruction(){
    const binary = program.value[processor.currentInstruction];
processor.opcode = binary.slice(0, 4);
processor.operand = binary.slice(4, 8);

}

function executeControlWord(stepConfig: ControlStep){

}

function showInvalidInstruction(index: number, binary: string){}

function markSimulationDone(){}

function logExplanation(text: string) {
  processor.explanationLog.push(text);
}

function highlightStep(){}


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
