<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { instructionSet } from '@/lib/instructions';
import axios from 'axios';
import { computed, onMounted, ref } from 'vue';
import MemoryReference from '../components/sap1/MemoryReference.vue';
import SimulationSpace from '../components/sap1/SimulationSpace.vue';

import UploadModal from '../components/sap1/UploadModal.vue';
import ExecutionLog from '../components/sap1/ExecutionLog.vue';
import GridGuideLine from '../components/sap1/GridGuideLine.vue';
import ControlSignals from '../components/sap1/ControlSignals.vue';

const simRef = ref<InstanceType<typeof SimulationSpace> | null>(null);
const uploadDialogOpen = ref(false);
const uploadedInstructions = ref<string[]>([]);
const errorDialogOpen = ref(false);
const errorMessage = ref('');
const showGuideLine = ref(false);

const hasProgram = computed(() => uploadedInstructions.value.length > 0);

function getInstructionName(binary: string): string {
    if (!binary || binary.length < 4) return 'UNKNOWN';
    const opcode = binary.slice(0, 4);
    const instruction = instructionSet.find((ins) => ins.binary === opcode);
    return instruction ? instruction.name : 'UNKNOWN';
}

async function deleteProgram() {
    try {
        const response = await axios.delete('/program-delete');
        if (response.data?.success) {
            uploadedInstructions.value = [];
            simRef.value?.resetSimulation();
            simRef.value?.loadProgramFromFile([]);
            showError('Program file deleted successfully.');
        } else {
            showError('Failed to delete program file.');
        }
    } catch (err: any) {
        console.error('Delete error:', err);
        if (err.response?.data?.error) {
            showError(err.response.data.error);
        } else {
            showError('Failed to delete program file.');
        }
    }
}

function handleUploadSuccess(lines: string[]) {
    uploadedInstructions.value = lines;
    const validInstructions = lines.filter((line) => /^[01]{8}$/.test(line.trim()));
    simRef.value?.loadProgramFromFile(validInstructions);
}

function showError(message: string) {
    errorMessage.value = message;
    errorDialogOpen.value = true;
}

async function fetchSavedProgram() {
    try {
        const res = await axios.get('/fetch-program');
        if (res.data.instructions) {
            uploadedInstructions.value = res.data.instructions;
            simRef.value?.loadProgramFromFile(res.data.instructions);
        }
    } catch (err: any) {
        console.warn('No program file found.');
        if (err.response?.data?.error) {
            showError(err.response.data.error);
        }
    }
}

onMounted(fetchSavedProgram);
</script>
<template>
    <main class="mx-auto mt-2 grid grid-cols-5 gap-4 p-6">
        <section class="col-span-2 p-4 rounded-lg border bg-white">
  <!-- Grouped Panels in Grid -->
  <div class="grid grid-cols-2 gap-4">
    <!-- 🧠 Memory Panel -->
    <div class="w-full">
      <MemoryReference class="w-full" :active-memory-address="simRef?.activeMemoryAddress" />
    </div>

    <!-- 🔹 Instructions Panel -->
    <div class="w-full">
        <h2 class="mt-6 mb-3 text-sm font-semibold text-gray-800 uppercase tracking-wide">
        Instruction Set
      </h2>
      <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        <div
          v-for="ins in instructionSet"
          :key="ins.binary"
          class="flex flex-col items-center rounded border border-gray-300 bg-gray-100 p-1 text-center"
        >
          <span class="text-[11px] font-semibold text-gray-700 uppercase">{{ ins.name }}</span>
          <span class="font-mono text-[11px] tracking-widest text-gray-500">{{ ins.binary }}</span>
        </div>
      </div>

      <!-- Control Signals Panel -->      
      <div class="mt-6 border border-gray-200 rounded-lg p-2 bg-gray-50">
        <h2 class="mb-2 text-xs font-semibold text-gray-800 uppercase tracking-wide">Control Signals</h2>
        <ControlSignals 
          :opcode="uploadedInstructions[simRef?.currentInstruction || 0]?.slice(0, 4) || '0000'" 
          :t-state="simRef?.currentStep || 0" 
          :is-running="!!simRef?.isRunning" 
          class="text-[10px] scale-90 origin-top-left"
        />
      </div>
      <h2 class="mb-3 text-sm font-semibold text-gray-800 uppercase tracking-wide mt-6 flex items-center">
        <span class="mr-2">Loaded Instructions</span>
        <span v-if="simRef?.isRunning" class="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
      </h2>

      <div v-if="hasProgram" class="space-y-1.5 overflow-y-auto max-h-64 w-full pr-1 border border-gray-200 rounded-md p-2 bg-gray-50 shadow-inner">
        <div
          v-for="(line, index) in uploadedInstructions"
          :key="index"
          :class="[
            'rounded border px-3 py-1.5 font-mono text-xs transition-all duration-300',
            simRef?.currentInstruction === index
              ? 'active-instruction font-bold text-gray-800  '
              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
          ]"
        >
          <div class="flex justify-between">
            <span class="font-semibold">{{ index.toString().padStart(1, '0') }}: {{ getInstructionName(line) }}</span>
            <span class="text-gray-500">{{ line }}</span>
          </div>
        </div>
      </div>

      <p v-else class="mt-2 rounded bg-gray-50 p-3 text-xs text-gray-500 w-full text-center">
        No program loaded. Please upload a <code class="font-mono">program_instructions.txt</code> file.
      </p>

      <!-- 📁 Buttons -->
      <div class="mt-3 flex flex-wrap gap-2">
        <Button variant="default" v-if="hasProgram" @click="deleteProgram">Delete Program</Button>
        <Button variant="default" @click="uploadDialogOpen = true">Upload Program</Button>
      </div>

      <!-- 📘 Instruction Set -->

    </div>
  </div>
  <div class="w-full mt-4">
    <h2 class="mb-3 text-sm font-semibold text-gray-800 uppercase tracking-wide">Execution Log</h2>
    <ExecutionLog :logs="simRef?.executionLogs" />
  </div>
</section>




      <!-- 🖥️ Simulation + Controls -->
      <section class="col-span-3 flex flex-col items-center bg-white p-6 rounded-lg border">
        <!-- Simulation canvas (adjust to fill available space) -->
        <div class="relative mb-6 w-full max-w-[720px] h-[768px]">
          <GridGuideLine class="absolute inset-0 z-0 pointer-events-none" v-if="showGuideLine" />
          <SimulationSpace ref="simRef" class="absolute inset-0 z-10" />
        </div>

        <!-- Simulation Controls -->
        <div class="flex flex-wrap gap-3 items-center">
          <Button variant="default" @click="simRef?.runManualStep()" :disabled="!hasProgram || simRef?.isHalted">Manual</Button>
          <Button variant="default" @click="simRef?.runAuto()" :disabled="!hasProgram || simRef?.isHalted || simRef?.isRunning">Auto</Button>
          <Button
            variant="default"
            @click="simRef?.togglePause()"
            :disabled="!hasProgram || simRef?.simulationType !== 'auto' || simRef?.isHalted"
          >
            {{ simRef?.isPaused ? 'Resume' : 'Pause' }}
          </Button>
          <Button variant="default" @click="simRef?.resetSimulation()" :disabled="!hasProgram">Reset</Button>
          <Button variant="secondary" @click="showGuideLine = !showGuideLine">{{ showGuideLine ? 'Hide Grid' : 'Show Grid' }}</Button>
        </div>

        <!-- Upload Modal -->
        <UploadModal v-model:open="uploadDialogOpen" @success="handleUploadSuccess" />
      </section>
    </main>

    <!-- Error Dialog -->
    <Dialog v-model:open="errorDialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Error</DialogTitle>
        </DialogHeader>
        <DialogDescription>{{ errorMessage }}</DialogDescription>
      </DialogContent>
    </Dialog>
  </template>
