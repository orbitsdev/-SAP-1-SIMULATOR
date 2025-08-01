<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import SimulationSpace from '../components/sap1/SimulationSpace.vue'
import UploadModal from '../components/sap1/UploadModal.vue'
import { Button } from '@/components/ui/button'
import { instructionSet } from '@/lib/instructions'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import GridGuideLine from '../components/sap1/GridGuideLine.vue'

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
    //   showError('No program file found. Please upload a program_instructions.txt file.')
    } else if (err.response?.data?.error) {
      showError(err.response.data.error)
    }
  }
}

onMounted(fetchSavedProgram)
</script>

<template>
  <main class="grid grid-cols-6  max-w-7xl mx-auto mt-2 p-8">

<!-- 🧾 Instruction List Panel -->
<!-- 🧾 Instruction Panel -->
<section class="b rounded-lg p-6  w-full max-w-2xl space-y-6 col-span-2 ">

<!-- 🔹 Loaded Instructions -->
<div>
  <h2 class="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2 uppercase">
    <span></span> Loaded Instructions
  </h2>

  <div v-if="hasProgram" class="space-y-1 max-h-64 overflow-y-auto pr-1">
    <div
      v-for="(line, index) in uploadedInstructions"
      :key="index"
      :class="[
        'font-mono text-sm px-3 py-1.5 border rounded transition-colors',
        simRef?.currentInstruction === index
          ? 'bg-[#86efac] border-[#86efac] font-bold text-gray-800'
          : 'bg-gray-50 border-gray-200 text-gray-700'
      ]"
    >
      {{ index.toString().padStart(2, '0') }}: {{ line }}
    </div>
  </div>
  <p v-else class="text-sm text-gray-500 mt-2">
     No program loaded. Please upload a <code class="font-mono">program_instructions.txt</code> file.
  </p>
</div>

<!-- 🔸 Instruction Set Reference -->
<div>
  <h2 class="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2 uppercase">
    <span></span> Instruction Set Reference
  </h2>
  <div class="flex flex-wrap gap-2">
    <div
      v-for="ins in instructionSet"
      :key="ins.binary"
      class="flex flex-col items-center bg-gray-100 border border-gray-300 rounded px-3 py-2 w-24 text-center"
    >
      <span class="text-xs font-semibold text-gray-700 uppercase">{{ ins.name }}</span>
      <span class="font-mono text-blue-600 text-sm tracking-widest">{{ ins.binary }}</span>
    </div>
  </div>
</div>

</section>




    <!-- 🖥️ Simulation + Controls -->
    <section class="col-span-4 w-full flex flex-col items-center overflow-auto">



      <!-- Simulation Canvas -->
      <div class="relative mb-6" style="width: 720px; height: 768px;">
        <GridGuideLine class="absolute inset-0 z-0" />
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
