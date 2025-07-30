
export const  arrows = [

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
    from: { row: 7, col: 5 },
    to: { row: 8, col: 5 },
    label: '4',
    offsetX: -55,   // reduce X shift
    offsetY: -10,    // pull label down slightly
    thickness: 24,  // thinner body to match others
    headSize: 34,
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
  from: { row: 4, col: 13 },
  to: { row: 5, col: 13 },
  label: '8',
  offsetX: 0,  // ✅ move it right to avoid overlap
  offsetY: -15,
  thickness: 24,  // optional: reduce slightly if needed
  headSize: 34,
  direction: 'down'
},
{
  id: 'instruction-register-to-control-unit',
  from: { row: 13, col: 5 },  // below IR
  to: { row: 14, col: 5 },    // pointing to Control Unit
  label: '4',
  offsetX: -55,
  offsetY: -5,
  thickness: 24,
  headSize: 34,
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
  offsetX: 0,                   // slight nudge to center
  offsetY: -5,
  thickness: 24,
  headSize: 34,
  direction: 'down'
}




]
