<script setup lang="ts">
import Box from './Box.vue'
import Bus from './Bus.vue'
import Arrow from './Arrow.vue';

const arrows = [

//arrow for pc
  {
    id:'pc',
    from: { row: 2, col: 5 },
    to: { row: 2, col: 7 },
    label: '4',
    offsetX:5,
    offsetY: 30,       // shift vertically (default: center)
    thickness: 24,     // make body thicker
    headSize: 34       // arrowhead size
  },

  //affor for mar
  {
  id: 'mar',
  from: { row: 5, col: 7 },  // starting at the right (near bus)
  to: { row: 5, col: 5 },    // pointing back to MAR
  label: '4',
  offsetX:5,
  offsetY: 30,
  thickness: 24,
  headSize: 34,
  direction: 'left'
},

  //affprw for prom
  {
    id:'prom',
    from: { row: 8, col: 5 },
    to: { row: 8, col: 7 },
    label: '8',
    offsetX:5,
    offsetY: 30,       // slightly lower than center
    thickness: 24,
    headSize: 34
  },
  //insturction register
  {
  id: 'ir-in',
  from: { row: 11, col: 5 },
  to: { row: 11, col: 7 },
  label: '8',
  offsetX: 5,     // nudge left
  offsetY: 80,     // lower arrow
  thickness: 24,
  headSize: 34,
  direction: 'left'
},
{
  id: 'ir-out',
  from: { row: 11, col: 7 },
  to: { row: 11, col: 5 },
  label: '8',
  offsetX:5,      // nudge right
  offsetY: 20,     // upper arrow
  thickness: 24,
  headSize: 34,
  direction: 'right'
}
,

// A Register → (from Bus to A Register)
{
  id: 'ar-in',
  from: { row: 2, col: 10 },
  to: { row: 2, col: 12 },
  label: '8',
  offsetY:10,
  offsetX:10,

  thickness: 24,
  headSize: 34,
  direction: 'right'
},

// A Register ← (from A Register to Bus)
{
  id: 'ar-out',
  from: { row: 2, col: 12 },
  to: { row: 2, col: 10 },
  label: '8',
  offsetY: 70, // slight difference so it doesn't overlap perfectly
  offsetX:10,
  thickness: 24,
  headSize: 34,
  direction: 'left'
},


// ALU ←
{
    id:'alu',
  from: { row: 5, col: 12 },
  to: { row: 5, col: 10 },
  label: '8',
  offsetY: 30,
  offsetX:10,
  thickness: 24,
  headSize: 34,
  direction: 'left'
},

// B Register ←
{
    id:'br',
  from: { row: 8, col: 10 },
  to: { row: 8, col: 12 },
  label: '8',
  offsetY: 30,
  offsetX:10,
  thickness: 24,
  headSize: 34,
  direction: 'right'
},
//arrow for output
{
    id:'or',
  from: { row: 11, col: 10 },
  to: { row: 11, col: 12 },
  label: '8',
  offsetY: 30,
  offsetX:10,
  thickness: 24,
  headSize: 34,
  direction: 'right'
},




]



const components = [
{
    id:'pc',
  title: 'Program Counter (PC)',
  value: '0000',
  row: 2,        // Start at row 2
  col: 3,        // Start at col 4
  rowSpan: 2,    // Covers rows 2 and 3
  colSpan: 2     // Covers cols 4 and 5
},
{
    id:'mar',
  title: 'Memory Address Register (MAR)',
  value: '0000',
  row: 5,        // Start at row 2
  col: 3,        // Start at col 4
  rowSpan: 2,    // Covers rows 2 and 3
  colSpan: 2     // Covers cols 4 and 5
},
{
    id:'prom',
  title: '16x8 PROM',
  value: '0000',
  row: 8,        // Start at row 2
  col: 3,        // Start at col 4
  rowSpan: 2,    // Covers rows 2 and 3
  colSpan: 2     // Covers cols 4 and 5
},
{
    id:'ir',
  title: 'Instruction Register (IR)',
  value: '0000',
  row: 11,        // Start at row 2
  col: 3,        // Start at col 4
  rowSpan: 2,    // Covers rows 2 and 3
  colSpan: 2     // Covers cols 4 and 5
},

{
    id:'con',
  title: 'Control Unit CON',
  value: '0000',
  row: 14,        // Start at row 2
  col: 3,        // Start at col 4
  rowSpan: 2,    // Covers rows 2 and 3
  colSpan: 2     // Covers cols 4 and 5
},

{
    id:'ar',
  title: 'A Register',
  value: '0000',
  row: 2,        // Start at row 2
  col: 12,        // Start at col 4
  rowSpan: 2,    // Covers rows 2 and 3
  colSpan: 2     // Covers cols 4 and 5
},
{
    id:'alu',
  title: 'Arithmetic Logic Unit (ALU)',
  value: '0000',
  row: 5,        // Start at row 2
  col: 12,        // Start at col 4
  rowSpan: 2,    // Covers rows 2 and 3
  colSpan: 2     // Covers cols 4 and 5
},
{
    id:'br',
  title: 'B Register',
  value: '0000',
  row: 8,        // Start at row 2
  col: 12,        // Start at col 4
  rowSpan: 2,    // Covers rows 2 and 3
  colSpan: 2     // Covers cols 4 and 5
},
{
    id:'or',
  title: 'Output Register',
  value: '0000',
  row: 11,        // Start at row 2
  col: 12,        // Start at col 4
  rowSpan: 2,    // Covers rows 2 and 3
  colSpan: 2     // Covers cols 4 and 5
},
{
    id:'bd',
  title: 'Binary Display',
  value: '0000',
  row: 14,        // Start at row 2
  col: 12,        // Start at col 4
  rowSpan: 2,    // Covers rows 2 and 3
  colSpan: 2     // Covers cols 4 and 5
},

]
</script>

<template>
<div class="grid grid-cols-16 gap-px w-full h-full" style="grid-template-columns: repeat(16, 45px); grid-template-rows: repeat(16, 48px);">
    <Arrow
  v-for="(arrow, index) in arrows"
  :key="index"
  :from="arrow.from"
  :to="arrow.to"
  :label="arrow.label"
  :offsetY="arrow.offsetY"
  :offsetX="arrow.offsetX"
  :thickness="arrow.thickness"
  :headSize="arrow.headSize"
/>


 <div
      :style="{
        gridColumnStart: 7,
        gridColumnEnd: 'span 3',
        gridRowStart: 2,
        gridRowEnd: 14
      }"
    >
      <Bus title="8"/>
    </div>


  <Box
    v-for="c in components"
    :key="c.id"
    :title="c.title"
    :value="c.value"
    :style="{
      gridColumnStart: c.col,
      gridRowStart: c.row,
      gridColumnEnd: `span ${c.colSpan}`,
      gridRowEnd: `span ${c.rowSpan}`
    }"
  />
</div>

</template>
