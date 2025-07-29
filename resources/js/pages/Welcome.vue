<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';
import GridGuideLine from '../components/sap1/GridGuideLine.vue';
import SimulationSpace from '../components/sap1/SimulationSpace.vue';
//add bus


</script>

<template>
<!-- Main container with relative positioning -->
<main class="max-w-7xl mx-auto p-16 min-h-screen relative">
    <!-- Grid guideline fixed in the background -->
    <div class="absolute inset-0 pointer-events-none mt-16">
        <GridGuideLine/>
    </div>

    <!-- Content layer where actual components will be placed -->
    <div class="relative z-10 mt-16">
      <SimulationSpace>

      </SimulationSpace>
    </div>
</main>
<section>


</section>
</template>

<style>

</style>
