<!-- Arrow.vue -->
<script setup lang="ts">
interface Props {
  from: { row: number; col: number }
  to: { row: number; col: number }
  label?: string
  cellWidth?: number
  cellHeight?: number
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  cellWidth: 45,
  cellHeight: 48,
})

// Calculate exact pixel positions
const startX = (props.from.col - 0.5) * props.cellWidth
const startY = (props.from.row - 0.5) * props.cellHeight
const endX = (props.to.col - 0.5) * props.cellWidth
const endY = (props.to.row - 0.5) * props.cellHeight
</script>

<template>
  <svg
    class="absolute z-20 pointer-events-none"
    :style="{ left: 0, top: 0, width: '100%', height: '100%' }"
  >

    <defs>
      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#333" />
      </marker>
    </defs>
    <line
      :x1="startX"
      :y1="startY"
      :x2="endX"
      :y2="endY"
      stroke="#333"
      stroke-width="2"
      marker-end="url(#arrowhead)"
    />
    <!-- Optional label -->
    <text
      v-if="label"
      :x="(startX + endX) / 2"
      :y="(startY + endY) / 2"
      text-anchor="middle"
      dominant-baseline="middle"
      font-size="12"
      fill="#333"
    >
      {{ label }}
    </text>
  </svg>
</template>
