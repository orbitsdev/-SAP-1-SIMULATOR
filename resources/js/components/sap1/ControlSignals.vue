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
    return executeCycleSignals[currentInstruction.value] || [];
  }
});

const activeTState = computed(() => {
  return `T${props.tState}`;
});
</script>

<template>
  <div class="control-signals-container" v-bind="$attrs">
    <div class="fetch-cycle">
      <h2 class="text-2xl font-bold mb-2 border-b pb-1">Fetch Cycle</h2>
      <div v-for="(signal, index) in fetchCycleSignals" :key="index" 
           class="signal-row" 
           :class="{ 'active': props.tState <= 2 && `T${props.tState}` === signal.state }">
        <div class="t-state">{{ signal.state }}</div>
        <div class="signal-details">
          <div v-for="(sig, i) in signal.signals" :key="i" class="signal-item">
            {{ sig }}
          </div>
          <div class="signal-description">{{ signal.description }}</div>
        </div>
      </div>
    </div>

    <div class="execute-cycle">
      <h2 class="text-2xl font-bold mb-2 mt-4 border-b pb-1">Execute Cycle</h2>
      <div class="instruction-header">
        <h3 class="text-xl font-semibold">{{ currentInstruction }}</h3>
      </div>
      <div v-if="executeCycleSignals[currentInstruction]">
        <div v-for="(signal, index) in executeCycleSignals[currentInstruction]" :key="index"
             class="signal-row"
             :class="{ 'active': props.tState > 2 && `T${props.tState}` === signal.state }">
          <div class="t-state">{{ signal.state }}</div>
          <div class="signal-details">
            <div v-for="(sig, i) in signal.signals" :key="i" class="signal-item">
              {{ sig }}
            </div>
            <div class="signal-description">{{ signal.description }}</div>
          </div>
        </div>
      </div>
      <div v-else class="no-instruction">
        Select an instruction to view execution cycle
      </div>
    </div>
  </div>
</template>

<style scoped>
.control-signals-container {
  font-family: system-ui, -apple-system, sans-serif;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.signal-row {
  display: flex;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  border-radius: 0.25rem;
}

.signal-row.active {
  background-color: #e9f5ff;
  border-left: 4px solid #3b82f6;
}

.t-state {
  font-weight: bold;
  width: 3rem;
  flex-shrink: 0;
}

.signal-details {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.signal-item {
  background-color: #e2e8f0;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-family: monospace;
  font-size: 0.9rem;
}

.signal-description {
  margin-left: 0.5rem;
  color: #4b5563;
  font-family: monospace;
}

.no-instruction {
  color: #6b7280;
  font-style: italic;
  padding: 1rem 0;
}

.instruction-header {
  margin-bottom: 0.5rem;
}
</style>
