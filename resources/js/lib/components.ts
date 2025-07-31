import { reactive } from "vue";

export const components = reactive([
{
id:'pc',
title: 'Program Counter (PC)',
value: '',
row: 2,        // Start at row 2
col: 3,        // Start at col 4
rowSpan: 2,    // Covers rows 2 and 3
  colSpan: 2     // Covers cols 4 and 5
},
{
    id:'mar',
  title: 'Memory Address Register (MAR)',
  value: '',
  row: 5,        // Start at row 2
  col: 3,        // Start at col 4
  rowSpan: 2,    // Covers rows 2 and 3
  colSpan: 2     // Covers cols 4 and 5
},
{
    id:'prom',
  title: '16x8 PROM',
  value: '',
  row: 8,        // Start at row 2
  col: 3,        // Start at col 4
  rowSpan: 2,    // Covers rows 2 and 3
  colSpan: 2     // Covers cols 4 and 5
},
{
    id:'ir',
  title: 'Instruction Register (IR)',
  value: '',
  row: 11,        // Start at row 2
  col: 3,        // Start at col 4
  rowSpan: 2,    // Covers rows 2 and 3
  colSpan: 2     // Covers cols 4 and 5
},

{
    id:'con',
  title: 'Control Unit CON',
  value: '',
  row: 14,        // Start at row 2
  col: 3,        // Start at col 4
  rowSpan: 2,    // Covers rows 2 and 3
  colSpan: 2     // Covers cols 4 and 5
},

{
    id:'a',
  title: 'A Register',
  value: '',
  row: 2,        // Start at row 2
  col: 12,        // Start at col 4
  rowSpan: 2,    // Covers rows 2 and 3
  colSpan: 2     // Covers cols 4 and 5
},
{
    id:'alu',
  title: 'Arithmetic Logic Unit (ALU)',
  value: '',
  row: 5,        // Start at row 2
  col: 12,        // Start at col 4
  rowSpan: 2,    // Covers rows 2 and 3
  colSpan: 2     // Covers cols 4 and 5
},

{
    id:'b',
  title: 'B Register',
  value: '',
  row: 8,        // Start at row 2
  col: 12,        // Start at col 4
  rowSpan: 2,    // Covers rows 2 and 3
  colSpan: 2     // Covers cols 4 and 5
},
{
    id:'out',
  title: 'Output Register',
  value: '',
  row: 11,        // Start at row 2
  col: 12,        // Start at col 4
  rowSpan: 2,    // Covers rows 2 and 3
  colSpan: 2     // Covers cols 4 and 5
},
{
    id:'bd',
  title: 'Binary Display',
  value: '',
  row: 14,        // Start at row 2
  col: 12,        // Start at col 4
  rowSpan: 2,    // Covers rows 2 and 3
  colSpan: 2     // Covers cols 4 and 5
},


]);
