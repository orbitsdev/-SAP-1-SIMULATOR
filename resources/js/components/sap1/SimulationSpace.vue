<script setup lang="ts">
import Box from './Box.vue'
import Bus from './Bus.vue'
import Arrow from './Arrow.vue';

const arrows = [

//arrow for pc
  {
    id:'program-counter-in',
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
  id: 'memory-address-register-in',
  from: { row: 5, col: 7 },  // starting at the right (near bus)
  to: { row: 5, col: 5 },    // pointing back to MAR
  label: '4',
  offsetX:5,
  offsetY: 30,
  thickness: 24,
  headSize: 34,
  direction: 'left'
},
{
  id: 'memory-address-register-to-prom',
  from: { row: 6, col: 5 },   // bottom of MAR (row 5 + rowSpan 2 → row 6)
  to: { row: 8, col: 5 },     // top of PROM
  label: '4',
  offsetX: -50,
  offsetY: 0,
  thickness: 20,
  headSize: 28,
  direction: 'down'
}
,
  //affprw for prom
  {
    id:'prom-in',
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
  id: 'instruction-register-in',
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
  id: 'instruction-register-out',
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
  id: 'register-a-in',
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
  id: 'register-a-out',
  from: { row: 2, col: 12 },
  to: { row: 2, col: 10 },
  label: '8',
  offsetY: 70, // slight difference so it doesn't overlap perfectly
  offsetX:10,
  thickness: 24,
  headSize: 34,
  direction: 'left'
},
{
  id: 'register-a-to-alu',
  from: { row: 3, col: 13 },
  to: { row: 5, col: 13 },
  label: '8',
  offsetX: 0,  // ✅ move it right to avoid overlap
  offsetY: 8,
  thickness: 20,  // optional: reduce slightly if needed
  headSize: 28,
  direction: 'down'
},
{
  id: 'instruction-register-to-control-unit',
  from: { row: 13, col: 5 },  // below IR
  to: { row: 14, col: 5 },    // pointing to Control Unit
  label: '4',
  offsetX: -50,
  offsetY: 0,
  thickness: 16,
  headSize: 28,
  direction: 'down'
},

// ALU ←
{
    id:'arithmetic-logic-unit-in',
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
    id:'register-b-in',
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
    id:'output-register-in',
  from: { row: 11, col: 10 },
  to: { row: 11, col: 12 },
  label: '8',
  offsetY: 30,
  offsetX:10,
  thickness: 24,
  headSize: 34,
  direction: 'right'
},

{
  id: 'output-register-to-binary-display',
  from: { row: 13, col: 13 },   // below Output Register
  to: { row: 14, col: 13 },     // top of Binary Display
  label: '8',
  offsetX: 5,                   // slight nudge to center
  offsetY: 0,
  thickness: 20,
  headSize: 30,
  direction: 'down'
}




]



const components = [
{
    id:'program-counter',
  title: 'Program Counter (PC)',
  value: '0000',
  row: 2,        // Start at row 2
  col: 3,        // Start at col 4
  rowSpan: 2,    // Covers rows 2 and 3
  colSpan: 2     // Covers cols 4 and 5
},
{
    id:'memory-address-register',
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
    id:'instruction-register',
  title: 'Instruction Register (IR)',
  value: '0000',
  row: 11,        // Start at row 2
  col: 3,        // Start at col 4
  rowSpan: 2,    // Covers rows 2 and 3
  colSpan: 2     // Covers cols 4 and 5
},

{
    id:'control-unit',
  title: 'Control Unit CON',
  value: '0000',
  row: 14,        // Start at row 2
  col: 3,        // Start at col 4
  rowSpan: 2,    // Covers rows 2 and 3
  colSpan: 2     // Covers cols 4 and 5
},

{
    id:'register-a',
  title: 'A Register',
  value: '0000',
  row: 2,        // Start at row 2
  col: 12,        // Start at col 4
  rowSpan: 2,    // Covers rows 2 and 3
  colSpan: 2     // Covers cols 4 and 5
},
{
    id:'arithmetic-logic-unit',
  title: 'Arithmetic Logic Unit (ALU)',
  value: '0000',
  row: 5,        // Start at row 2
  col: 12,        // Start at col 4
  rowSpan: 2,    // Covers rows 2 and 3
  colSpan: 2     // Covers cols 4 and 5
},

{
    id:'register-b',
  title: 'B Register',
  value: '0000',
  row: 8,        // Start at row 2
  col: 12,        // Start at col 4
  rowSpan: 2,    // Covers rows 2 and 3
  colSpan: 2     // Covers cols 4 and 5
},
{
    id:'output-register',
  title: 'Output Register',
  value: '0000',
  row: 11,        // Start at row 2
  col: 12,        // Start at col 4
  rowSpan: 2,    // Covers rows 2 and 3
  colSpan: 2     // Covers cols 4 and 5
},
{
    id:'binary-display',
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
