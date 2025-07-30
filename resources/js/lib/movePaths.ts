export const movePaths = {
    moveFromPcToMar: [
      { x: 109, y: 107 },
      { x: 109, y: 73 },
      { x: 316, y: 73 },
      { x: 316, y: 215 },
      { x: 109, y: 215 },
      { x: 109, y: 225 }
    ],

    moveFromPromToIr: [
      { x: 109, y: 365 },
      { x: 316, y: 365 },
      { x: 316, y: 497 },
      { x: 109, y: 497 },
      { x: 109, y: 510 },
    ],

  moveFromIrToMar: [
    { x: 109, y: 530 },
    { x: 109, y: 559 },
    { x: 316, y: 559 },
    { x: 316, y: 215 },
    { x: 109, y: 215 },
    { x: 109, y: 225 }
  ],

  moveFromPromToA: [
    { x: 109, y: 365 },   // PROM output
    { x: 316, y: 365 },
    { x: 316, y: 54 },    // A Register row
    { x: 525, y: 54 },
    { x: 525, y: 90 }
  ],

  moveFromAToOut: [
    { x: 525, y: 90 },    // A Register center
    { x: 525, y: 54 },    // Up to bus
    { x: 316, y: 54 },    // ← to left bus
    { x: 316, y: 508 },   // ↓ to Output row
    { x: 525, y: 508 },
    { x: 525, y: 550 }    // Final position at Output Register
  ],
  moveFromPromToB: [
    { x: 109, y: 365 },
    { x: 316, y: 365 },
    { x: 525, y: 365 },
    { x: 525, y: 380 }   // center of B Register
  ],

  moveFromAluToA: [
    { x: 525, y: 218 },  // From ALU
    { x: 316, y: 218 },  // ← Left into bus
    { x: 316, y: 54 },   // ↑ Up to A Register row
    { x: 525, y: 54 },   // → Right to A column
    { x: 525, y: 90 }    // ↓ Into A Register center
  ]



    // 🟡 Add more later: MAR to PROM, IR to A, A to B, B to ALU, etc.
  }
