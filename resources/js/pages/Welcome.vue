<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';
import GridGuideLine from '../components/sap1/GridGuideLine.vue';
import SimulationSpace from '../components/sap1/SimulationSpace.vue';
//add bus


</script>

<template>
 <main class="w-full flex justify-center items-start bg-white p-10 overflow-auto">
  <div class="relative" style="width: 720px; height: 768px;">
    <GridGuideLine class="absolute inset-0 z-0 pointer-events-none bg-yellow-200/10" />
    <SimulationSpace class="absolute inset-0 z-10" />
  </div>
</main>

</template>


<style>

</style>
