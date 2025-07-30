<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3'
import SimulationSpace from '../components/sap1/SimulationSpace.vue'
import { Button } from '@/components/ui/button'
import { instructionSet } from '@/lib/instructions'
import { ref } from 'vue'

// 🎯 Ref to access SimulationSpace methods
const simRef = ref<InstanceType<typeof SimulationSpace> | null>(null)
</script>

<template>
  <main class="w-full flex flex-col items-center p-10 space-y-6 overflow-auto">

    <!-- 🧠 Instruction Set Display -->
    <div class="w-full max-w-2xl">
      <h2 class="text-lg font-bold text-center mb-2">Instruction Set</h2>
      <div class="flex justify-center flex-wrap gap-4">
        <div
          v-for="ins in instructionSet"
          :key="ins.binary"
          class="flex flex-col items-center bg-gray-100 border border-gray-300 rounded px-4 py-2"
        >
          <span class="text-sm font-semibold text-gray-800">{{ ins.name }}</span>
          <span class="font-mono text-blue-600">{{ ins.binary }}</span>
        </div>
      </div>
    </div>

    <!-- 🟦 Simulation Grid -->
    <div class="relative" style="width: 720px; height: 768px;">
      <SimulationSpace ref="simRef" class="absolute inset-0 z-10" />
    </div>

    <!-- 🕹 Simulation Controls -->
    <div class="flex space-x-4 mt-4" v-if="simRef">
        <Button variant="default" @click="simRef?.runManualStep()">Manual</Button>
        <Button variant="default" @click="simRef?.runAuto()">Auto</Button>
        <Button variant="default" @click="simRef?.togglePause()">Pause</Button>
        <Button variant="default" @click="simRef?.resetSimulation()">Reset</Button>
    </div>

  </main>
</template>
