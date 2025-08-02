// lib/controlWords.ts

/**
 * Control word mappings for each instruction and T-state.
 * These represent the micro-operations that activate control lines in SAP-1.
 */
export const controlWords: Record<string, Record<string, string[]>> = {
    LDA: {
      T0: ['Ep', 'Lm'],   // PC → MAR
      T1: ['Ce', 'Li'],   // Increment PC, load IR
      T2: ['Ep', 'Lm'],   // Operand (from IR) → MAR
      T3: ['Ce', 'La'],   // Memory → Register A
    },

    ADD: {
      T0: ['Ep', 'Lm'],
      T1: ['Ce', 'Li'],
      T2: ['Ep', 'Lm'],
      T3: ['Ce', 'Lb'],   // Memory → Register B
      T4: ['Eu', 'La'],   // A ← A + B (via ALU)
    },

    SUB: {
      T0: ['Ep', 'Lm'],
      T1: ['Ce', 'Li'],
      T2: ['Ep', 'Lm'],
      T3: ['Ce', 'Lb'],
      T4: ['Su', 'La'],   // A ← A - B (via ALU subtract)
    },

    OUT: {
      T0: ['Ep', 'Lm'],
      T1: ['Ce', 'Li'],
      T2: ['Ea', 'Lo'],   // A → Output Register
    },

    HLT: {
      T0: ['Ep', 'Lm'],
      T1: ['Ce', 'Li'],
      T2: [],             // No action; halt immediately
    },
  };
