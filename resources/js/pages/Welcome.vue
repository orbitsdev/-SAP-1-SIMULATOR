<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import SimulationSpace from '../components/sap1/SimulationSpace.vue'
import UploadModal from '../components/sap1/UploadModal.vue'
import { Button } from '@/components/ui/button'
import { instructionSet } from '@/lib/instructions'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

const simRef = ref<InstanceType<typeof SimulationSpace> | null>(null)
const uploadDialogOpen = ref(false)
const uploadedInstructions = ref<string[]>([])
const errorDialogOpen = ref(false)
const errorMessage = ref('')

const hasProgram = computed(() => uploadedInstructions.value.length > 0)

function handleUploadSuccess(lines: string[]) {
  uploadedInstructions.value = lines
  // Only pass valid 8-bit binary instructions to the simulation
  const validInstructions = lines.filter(line => /^[01]{8}$/.test(line.trim()))
  simRef.value?.loadProgramFromFile(validInstructions)
}

function showError(message: string) {
  errorMessage.value = message
  errorDialogOpen.value = true
}

async function fetchSavedProgram() {
  try {
    const res = await axios.get('/fetch-program')
    if (res.data.instructions) {
      uploadedInstructions.value = res.data.instructions
      simRef.value?.loadProgramFromFile(res.data.instructions)
    }
  } catch (err: any) {
    console.warn('No program file found.')
    if (err.response?.status === 404) {
      showError('No program file found. Please upload a program_instructions.txt file.')
    } else if (err.response?.data?.error) {
      showError(err.response.data.error)
    }
  }
}

onMounted(fetchSavedProgram)
</script>

<template>
  <main class="grid grid-cols-3 gap-4 p-6">

<!-- 🧾 Instruction List Panel -->
<section class="bg-gray-50 border border-gray-200 rounded p-4">
  <h2 class="text-base font-semibold mb-2 text-gray-800">Loaded Instructions</h2>
  <div v-if="hasProgram" class="space-y-1">
    <div
      v-for="(line, index) in uploadedInstructions"
      :key="index"
      :class="[
        'font-mono text-sm px-2 py-1 border rounded transition-all',
        simRef?.currentInstruction === index
          ? 'bg-yellow-100 border-yellow-400'
          : 'bg-white border-gray-200'
      ]"
    >
      {{ index.toString().padStart(2, '0') }}: {{ line }}
    </div>
  </div>
  <p v-else class="text-sm text-gray-500">
    No program loaded. Please upload a <code>program_instructions.txt</code> file.
  </p>
</section>



    <!-- 🖥️ Simulation + Controls -->
    <section class="col-span-2 w-full flex flex-col items-center overflow-auto">

      <!-- Instruction Set Reference -->
      <div class="w-full max-w-xl mb-4">
        <h2 class="text-base font-semibold text-center mb-2 text-gray-700">Instruction Set</h2>
        <div class="flex justify-center flex-wrap gap-2">
          <div
            v-for="ins in instructionSet"
            :key="ins.binary"
            class="flex flex-col items-center bg-gray-50 border border-gray-300 rounded px-1 py-1 w-20"
          >
            <span class="text-xs font-medium text-gray-700">{{ ins.name }}</span>
            <span class="font-mono text-blue-600 text-sm">{{ ins.binary }}</span>
          </div>
        </div>
      </div>

      <!-- Simulation Canvas -->
      <div class="relative mb-6" style="width: 720px; height: 768px;">
        <!-- <GridGuideLine class="absolute inset-0 z-0" /> -->
        <SimulationSpace ref="simRef" class="absolute inset-0 z-10" />
      </div>

      <!-- Control Buttons -->
      <div class="flex flex-wrap gap-3" v-if="simRef">
        <Button variant="default" @click="simRef?.runManualStep()" :disabled="!hasProgram || simRef?.isHalted">
          Manual
        </Button>

        <Button variant="default" @click="simRef?.runAuto()" :disabled="!hasProgram || simRef?.isHalted || simRef?.isRunning">
          Auto
        </Button>

        <Button variant="default" @click="simRef?.togglePause()" :disabled="!hasProgram || simRef?.simulationType !== 'auto' || simRef?.isHalted">
          {{ simRef?.isPaused ? 'Resume' : 'Pause' }}
        </Button>

        <Button variant="default" @click="simRef?.resetSimulation()" :disabled="!hasProgram">
          Reset
        </Button>

        <Button variant="secondary" @click="uploadDialogOpen = true">
          Upload File
        </Button>
      </div>

      <!-- File Upload Dialog -->
      <UploadModal v-model:open="uploadDialogOpen" @success="handleUploadSuccess" />
    </section>
  </main>

  <Dialog v-model:open="errorDialogOpen">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Error</DialogTitle>
      </DialogHeader>
      <DialogDescription>{{ errorMessage }}</DialogDescription>
    </DialogContent>
  </Dialog>
</template>
