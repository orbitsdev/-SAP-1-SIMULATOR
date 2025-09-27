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

// Define control signals and their bit positions in the control vector
const controlSignalBits = {
  'Cp': 0,   // Program Counter increment
  'Ep': 1,   // Program Counter output enable
  'Lm': 2,   // MAR load
  'Er': 3,   // RAM output enable
  'Li': 4,   // Instruction Register load
  'Ei': 5,   // Instruction Register output enable
  'La': 6,   // A Register load
  'Ea': 7,   // A Register output enable
  'Su': 8,   // ALU subtract mode
  'Eu': 9,   // ALU output enable
  'Lb': 10,  // B Register load
  'Lo': 11,  // Output Register load
  'HLT': 12  // Halt signal
};

// Generate the binary control vector based on active signals
const controlVector = computed(() => {
  // Initialize a 13-bit vector with default values
  // Some signals are active-high (0 by default, 1 when active)
  // Others are active-low (1 by default, 0 when active)
  const vector = ['0','0','1','1','1','1','1','0','0','0','0','0','1'];

  // Set bits based on active signals
  if (props.isRunning) {
    // CP, EP are active-high (0→1)
    if (isSignalActive('Cp')) vector[controlSignalBits['Cp']] = '1';
    if (isSignalActive('Ep') || isSignalActive('EpLm')) vector[controlSignalBits['Ep']] = '1';

    // LM, ER, LI, EI, LA are active-low (1→0)
    if (isSignalActive('Lm') || isSignalActive('EpLm') || isSignalActive('LmEi')) vector[controlSignalBits['Lm']] = '0';
    if (isSignalActive('Er') || isSignalActive('ErLi') || isSignalActive('ErLa') || isSignalActive('ErLb')) vector[controlSignalBits['Er']] = '0';
    if (isSignalActive('Li') || isSignalActive('ErLi')) vector[controlSignalBits['Li']] = '0';
    if (isSignalActive('Ei') || isSignalActive('LmEi')) vector[controlSignalBits['Ei']] = '0';
    if (isSignalActive('La') || isSignalActive('ErLa') || isSignalActive('LaEu') || isSignalActive('LaSuEu')) vector[controlSignalBits['La']] = '0';

    // EA, SU, EU are active-high (0→1)
    if (isSignalActive('Ea') || isSignalActive('EaLo')) vector[controlSignalBits['Ea']] = '1';
    if (isSignalActive('Su') || isSignalActive('LaSuEu')) vector[controlSignalBits['Su']] = '1';
    if (isSignalActive('Eu') || isSignalActive('LaEu') || isSignalActive('LaSuEu')) vector[controlSignalBits['Eu']] = '1';

    // LB, LO are active-low (1→0)
    if (isSignalActive('Lb') || isSignalActive('ErLb')) vector[controlSignalBits['Lb']] = '0';
    if (isSignalActive('Lo') || isSignalActive('EaLo')) vector[controlSignalBits['Lo']] = '0';

    // HLT is active-high (0→1)
    if (isSignalActive('HLT')) vector[controlSignalBits['HLT']] = '1';
  }

  // Format the vector with spaces for readability (4 bits per group)
  return `${vector.slice(0, 4).join('')} ${vector.slice(4, 8).join('')} ${vector.slice(8, 13).join('')}`.trim();
});

// Function to check if a signal is active based on current T-state and instruction
const isSignalActive = (signal: string): boolean => {
  // Only show active signals when the processor is running
  if (!props.isRunning) {
    return false;
  }

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
    <!-- Individual Control Signals -->
    <div class="mb-2">
      <h3 class="text-xs font-semibold mb-1">Control Signals</h3>
      <div class="grid grid-cols-9 gap-1 mb-1">
        <!-- Active-high signals (highlighted when active) -->
        <div class="signal-bit" :class="{ 'active': isSignalActive('Cp') }">CP</div>
        <div class="signal-bit" :class="{ 'active': isSignalActive('Ep') || isSignalActive('EpLm') }">EP</div>

        <!-- Active-low signals (highlighted when active) -->
        <div class="signal-bit" :class="{ 'active': isSignalActive('Lm') || isSignalActive('EpLm') || isSignalActive('LmEi') }">LM</div>
        <div class="signal-bit" :class="{ 'active': isSignalActive('Er') || isSignalActive('ErLi') || isSignalActive('ErLa') || isSignalActive('ErLb') }">ER</div>
        <div class="signal-bit" :class="{ 'active': isSignalActive('LI') || isSignalActive('ErLi') }">LI</div>
        <div class="signal-bit" :class="{ 'active': isSignalActive('EI') || isSignalActive('LmEi') }">EI</div>
        <div class="signal-bit" :class="{ 'active': isSignalActive('La') || isSignalActive('ErLa') || isSignalActive('LaEu') || isSignalActive('LaSuEu') }">LA</div>

        <!-- Active-high signals (highlighted when active) -->
        <div class="signal-bit" :class="{ 'active': isSignalActive('Ea') || isSignalActive('EaLo') }">EA</div>
        <div class="signal-bit" :class="{ 'active': isSignalActive('Su') || isSignalActive('LaSuEu') }">SU</div>
      </div>
      <div class="grid grid-cols-4 gap-1">
        <!-- Active-high signal (highlighted when active) -->
        <div class="signal-bit" :class="{ 'active': isSignalActive('Eu') || isSignalActive('LaEu') || isSignalActive('LaSuEu') }">EU</div>

        <!-- Active-low signals (highlighted when active) -->
        <div class="signal-bit" :class="{ 'active': isSignalActive('Lb') || isSignalActive('ErLb') }">LB</div>
        <div class="signal-bit" :class="{ 'active': isSignalActive('Lo') || isSignalActive('EaLo') }">LO</div>

        <!-- Active-high signal (highlighted when active) -->
        <div class="signal-bit" :class="{ 'active': isSignalActive('HLT') }">HLT</div>
      </div>
    </div>

    <!-- Control Vector Display -->
    <div class="mt-3">
      <h3 class="text-xs font-semibold mb-1">Control Vector</h3>
      <div class="control-vector font-mono">{{ controlVector }}</div>
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
  background-color: #86efac;
  border-color: #22c55e;
  color: #166534;
  font-weight: 600;
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.5);
}

.signal-bit {
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

.signal-bit.active {
  background-color: #86efac;
  border-color: #22c55e;
  color: #166534;
  font-weight: 600;
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.5);
}

.control-vector {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: #1e293b;
  padding: 0.25rem 0.5rem;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.25rem;
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
