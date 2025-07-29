<script setup lang="ts">
// Generate array of rows and columns for the grid
const rows = Array.from({ length: 12 }, (_, i) => i + 1);
const cols = Array.from({ length: 16 }, (_, i) => i + 1);

// Calculate opacity for grid cells
const cellOpacity = 0.3; // 30% opacity
</script>

<template>
    <div class="w-full overflow-auto">
        <div class="grid" style="grid-template-columns: repeat(16, minmax(45px, 1fr)); gap: 1px;">
            <!-- Column headers -->
            <div v-for="col in cols" :key="'header-'+col" class="h-5 flex items-center justify-center text-xs font-mono text-gray-500">
                {{ col }}
            </div>

            <!-- Grid with row headers -->
            <template v-for="row in rows" :key="'row-'+row">
                <!-- Row header -->
                <div class="h-12 flex items-center justify-center text-xs font-mono text-gray-500">
                    {{ row }}
                </div>

                <!-- Grid cells -->
                <div v-for="col in cols.slice(0, cols.length-1)" :key="'cell-'+row+'-'+col"
                    class="w-full h-12 bg-blue-200 border border-blue-300 rounded-sm p-0.5 text-xs flex flex-col items-center justify-center relative group hover:bg-blue-200/80 transition-colors duration-200"
                    :style="`opacity: ${cellOpacity}`">
                    <span class="text-blue-800 text-[8px] font-mono">{{row}},{{col}}</span>
                    <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <span class="bg-white/80 px-1 py-0.5 rounded-sm text-[8px] text-blue-800 font-mono">{{row}},{{col}}</span>
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>

<style scoped>
/* Add any additional styling here if needed */
</style>
