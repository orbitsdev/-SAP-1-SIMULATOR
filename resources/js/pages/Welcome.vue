<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3'
import SimulationSpace from '../components/sap1/SimulationSpace.vue'
import { Button } from '@/components/ui/button'
import { instructionSet } from '@/lib/instructions'
import { ref } from 'vue'
import GridGuideLine from '../components/sap1/GridGuideLine.vue'
// 🎯 Ref to access SimulationSpace methods
const simRef = ref<InstanceType<typeof SimulationSpace> | null>(null)
</script>

<template>
  <main class="w-full flex flex-col items-center mt-10  overflow-auto">

    <!-- 🧠 Instruction Set Display -->
  <div class="w-full max-w-xl">
  <h2 class="text-base font-semibold text-center mb-2 text-gray-700">Instruction Set</h2>
  <div class="flex justify-center flex-wrap gap-2">
    <div
      v-for="ins in instructionSet"
      :key="ins.binary"
      class="flex flex-col items-center bg-gray-50 border border-gray-300 rounded px-1 py-1 w-20 "
    >
      <span class="text-xs font-medium text-gray-700">{{ ins.name }}</span>
      <span class="font-mono text-blue-600 text-sm">{{ ins.binary }}</span>
    </div>
  </div>
</div>




    <div class="relative" style="width: 720px; height: 768px;">
    <!-- <GridGuideLine  class="absolute inset-0 z-0"/> -->
      <SimulationSpace ref="simRef" class="absolute inset-0 z-10" />
    </div>



        <div class="flex space-x-4 " v-if="simRef">
  <Button
    variant="default"
    @click="simRef?.runManualStep()"
    :disabled="simRef?.isHalted"
  >
    Manual
  </Button>

  <Button
    variant="default"
    @click="simRef?.runAuto()"
    :disabled="simRef?.isHalted || simRef?.isRunning"
  >
    Auto
  </Button>

  <Button
    variant="default"
    @click="simRef?.togglePause()"
    :disabled="simRef?.simulationType !== 'auto' || simRef?.isHalted"
  >
    {{ simRef?.isPaused ? 'Resume' : 'Pause' }}
  </Button>


  <Button
  variant="default"
  @click="simRef?.resetSimulation()"
>
  Reset
</Button>

</div>


  </main>
</template>
