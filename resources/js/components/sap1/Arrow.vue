<script setup lang="ts">
const props = defineProps<{
  from: { row: number; col: number }
  to: { row: number; col: number }
  label?: string
  offsetX?: number
  offsetY?: number
  thickness?: number
  headSize?: number
  direction?: 'left' | 'right' | 'up' | 'down'
}>()

// Set default values
const thickness = props.thickness ?? 10
const headSize = props.headSize ?? 12
const offsetX = props.offsetX ?? 0
const offsetY = props.offsetY ?? 0

// Grid-based alignment
const width = Math.abs(props.from.col - props.to.col) * 45
const height = Math.abs(props.from.row - props.to.row) * 48

const top = (Math.min(props.from.row, props.to.row) - 1) * 48 + offsetY
const left = (Math.min(props.from.col, props.to.col) - 1) * 45 + offsetX

// Direction auto-detection (if not explicitly given)
const finalDirection = props.direction ?? (
  props.from.col < props.to.col ? 'right' :
  props.from.col > props.to.col ? 'left' :
  props.from.row < props.to.row ? 'down' : 'up'
)

// Flags for shape logic
const isHorizontal = props.from.row === props.to.row
const isVertical = props.from.col === props.to.col
</script>

<template>
  <div
    class="absolute z-20"
    :style="{
      // 🔼 fix vertical arrow body for 'up' by shifting top
      top: `${top - (finalDirection === 'up' ? headSize : 0)}px`,
      left: `${left + (finalDirection === 'left' ? headSize : 0)}px`,
      width: isHorizontal ? `${width - headSize}px` : `${thickness}px`,
      height: isVertical
  ? `${height - (finalDirection === 'up' || finalDirection === 'down' ? headSize : 0)}px`
  : `${thickness}px`,

      backgroundColor: '#000',
      borderRadius: '2px',
      overflow: 'visible'
    }"
  >
   <!-- 🔼 Arrowhead -->
<div
  class="absolute"
  :style="{
    top:
      finalDirection === 'down'
        ? `${height - headSize}px`
        : finalDirection === 'up'
        ? `-${headSize}px`
        : '50%',
    left:
      finalDirection === 'right'
        ? `${width - headSize}px`
        : finalDirection === 'left'
        ? `-${headSize}px`
        : '50%',
    transform:
      finalDirection === 'left' || finalDirection === 'right'
        ? 'translateY(-50%)'
        : 'translateX(-50%)',
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderWidth:
      finalDirection === 'right'
        ? `${headSize / 2}px 0 ${headSize / 2}px ${headSize}px`
        : finalDirection === 'left'
        ? `${headSize / 2}px ${headSize}px ${headSize / 2}px 0`
        : finalDirection === 'down'
        ? `${headSize}px ${headSize / 2}px 0 ${headSize / 2}px`
        : /* 👇 UP arrow (flip of down) */
          `0 ${headSize / 2}px ${headSize}px ${headSize / 2}px`,
    borderColor:
      finalDirection === 'right'
        ? 'transparent transparent transparent black'
        : finalDirection === 'left'
        ? 'transparent black transparent transparent'
        : finalDirection === 'down'
        ? 'black transparent transparent transparent'
        : /* 👆 UP arrow */
          'transparent transparent black transparent'
  }"
/>

    <!-- 🔤 Label (optional) -->
    <div
      v-if="props.label"
      class="absolute text-[10px] text-white px-1 rounded bg-black"
      :style="{
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      }"
    >
      {{ props.label }}
    </div>
  </div>
</template>
