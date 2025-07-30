<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';
import GridGuideLine from '../components/sap1/GridGuideLine.vue';
import SimulationSpace from '../components/sap1/SimulationSpace.vue';
import { Button } from '@/components/ui/button';
</script>

<template>
  <main class="w-full flex flex-col items-center p-10 space-y-4 overflow-auto">

    <!-- Simulation Area -->
    <div class="relative" style="width: 720px; height: 768px;">
      <GridGuideLine class="absolute inset-0 z-0 pointer-events-none bg-yellow-200/10" />
      <SimulationSpace class="absolute inset-0 z-10" />
    </div>

    <!-- Controls -->
    <div class="flex space-x-4 mt-8">
  <Button variant="default" >Manual</Button>
  <Button variant="default" >Auto</Button>
  <Button variant="default">Reset</Button>
</div>


  </main>
</template>
