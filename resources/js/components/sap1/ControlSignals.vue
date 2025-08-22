<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { controlWords } from '@/lib/controlWords';

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  opcode: string;
  tState: number;
  isRunning: boolean;
}>();

const instructionMap: { [key: string]: string } = {
  '0000': 'LDA',
  '0001': 'ADD',
  '0010': 'SUB',
  '1110': 'OUT',
  '1111': 'HLT'
};

const currentInstruction = computed(() => {
  return instructionMap[props.opcode] || 'N/A';
});

const fetchCycleSignals = [
  { state: 'T0', signals: ['EpLm', 'CON'], description: '(MAR) ← (PC)' },
  { state: 'T1', signals: ['ErLi', 'CON'], description: '(IR) ← (R←MAR)' },
  { state: 'T2', signals: ['Cp', 'CON'], description: '(PC) ← (PC)+1' },
];

const executeCycleSignals = {
  'LDA': [
    { state: 'T3', signals: ['LmEi', 'CON'], description: '(MAR) ← (oooo)' },
    { state: 'T4', signals: ['ErLa', 'CON'], description: '(A) ← (Roooo)' },
    { state: 'T5', signals: ['No op'], description: '' },
  ],
  'ADD': [
    { state: 'T3', signals: ['LmEi', 'CON'], description: '(MAR) ← (oooo)' },
    { state: 'T4', signals: ['ErLb', 'CON'], description: '(B) ← (Roooo)' },
    { state: 'T5', signals: ['LaEu', 'CON'], description: '(ALU) ← (A)+(B), (A) ← (ALU)' },
  ],
  'SUB': [
    { state: 'T3', signals: ['LmEi', 'CON'], description: '(MAR) ← (oooo)' },
    { state: 'T4', signals: ['ErLb', 'CON'], description: '(B) ← (Roooo)' },
    { state: 'T5', signals: ['LaSuEu', 'CON'], description: '(ALU) ← (A)-(B), (A) ← (ALU)' },
  ],
  'OUT': [
    { state: 'T3', signals: ['EaLo', 'CON'], description: '(O) ← (A)' },
    { state: 'T4', signals: ['No Op'], description: '' },
    { state: 'T5', signals: ['No Op'], description: '' },
  ],
  'HLT': [
    { state: 'T3', signals: ['HLT signal'], description: 'Halt processor' },
    { state: 'T4', signals: [''], description: '' },
    { state: 'T5', signals: [''], description: '' },
  ],
};

const activeSignals = computed(() => {
  if (props.tState <= 2) {
    return fetchCycleSignals;
  } else {
    const instruction = currentInstruction.value as keyof typeof executeCycleSignals;
    return executeCycleSignals[instruction] || [];
  }
});

const activeTState = computed(() => {
  return `T${props.tState}`;
});

// Function to check if a signal is active based on current T-state and instruction
const isSignalActive = (signal: string): boolean => {
  // Always show active signals during simulation, regardless of running state
  const tState = props.tState;
  const tStateKey = `T${tState}`;
  
  // Check fetch cycle signals (T0-T2)
  if (tState <= 2) {
    const fetchSignals = fetchCycleSignals.find((s: {state: string; signals: string[]}) => s.state === tStateKey);
    if (fetchSignals) {
      // Check if the signal is in the active signals list or if it's the CON signal
      return fetchSignals.signals.includes(signal) || signal === 'CON';
    }
  }

  // Check execute cycle signals (T3-T5)
  const instruction = currentInstruction.value;
  // Make sure instruction is one of the valid keys
  if (instruction === 'LDA' || instruction === 'ADD' || instruction === 'SUB' || 
      instruction === 'OUT' || instruction === 'HLT') {
    // Use type assertion to tell TypeScript this is a valid key
    const executeSignals = executeCycleSignals[instruction as keyof typeof executeCycleSignals];
    if (executeSignals) {
      const signalSet = executeSignals.find((s: {state: string; signals: string[]}) => s.state === tStateKey);
      if (signalSet) {
        // Check if the signal is in the active signals list or if it's the CON signal
        return signalSet.signals.includes(signal) || signal === 'CON';
      }
    }
  }

  return false;
}
</script>
<template>
  <div class="control-signals-container" v-bind="$attrs">
    <!-- Control Signal Words -->
    <div class="grid grid-cols-5 gap-1">
      <div class="signal-word" :class="{ 'active': isSignalActive('EpLm') }">EpLm</div>
      <div class="signal-word" :class="{ 'active': isSignalActive('ErLi') }">ErLi</div>
      <div class="signal-word" :class="{ 'active': isSignalActive('Cp') }">Cp</div>
      <div class="signal-word" :class="{ 'active': isSignalActive('LmEi') }">LmEi</div>
      <div class="signal-word" :class="{ 'active': isSignalActive('ErLa') }">ErLa</div>
      <div class="signal-word" :class="{ 'active': isSignalActive('ErLb') }">ErLb</div>
      <div class="signal-word" :class="{ 'active': isSignalActive('LaEu') }">LaEu</div>
      <div class="signal-word" :class="{ 'active': isSignalActive('LaSuEu') }">LaSuEu</div>
      <div class="signal-word" :class="{ 'active': isSignalActive('EaLo') }">EaLo</div>
      <div class="signal-word" :class="{ 'active': isSignalActive('HLT') }">HLT</div>
    </div>
  </div>
</template>

<style scoped>
.control-signals-container {
  font-family: system-ui, -apple-system, sans-serif;
  padding: 0.25rem;
  background-color: transparent;
}

.signal-word {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 0.25rem;
  padding: 0.15rem 0.1rem;
  font-size: 0.6rem;
  font-weight: 500;
  color: #64748b;
  text-align: center;
  font-family: monospace;
}

.signal-word.active {
  background-color: #dbeafe;
  border-color: #93c5fd;
  color: #1e40af;
  font-weight: 600;
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.5);
}

.t-state-box {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 0.25rem;
  padding: 0.15rem 0.3rem;
  font-size: 0.6rem;
  font-weight: 500;
  color: #64748b;
  min-width: 1.2rem;
  text-align: center;
}

.t-state-box.active {
  background-color: #dbeafe;
  border-color: #93c5fd;
  color: #1e40af;
  font-weight: 600;
}
</style>
