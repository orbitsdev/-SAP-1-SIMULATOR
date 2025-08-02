// lib/controlWords.ts

/**
 * Control word mappings for each instruction and T-state.
 * These represent the micro-operations that activate control lines in SAP-1.
 */
export const controlWords: Record<string, Record<string, string[]>> = {
    LDA: {
      T0: ['Ep', 'Lm'],   // PC → MAR
      T1: ['Ce', 'Li'],   // Increment PC, load IR
    T2: ['Ei', 'Lm'], // Ei = IR → Bus, then Lm = MAR ← Bus
   // Operand (from IR) → MAR
      T3: ['Ce', 'La'],   // Memory → Register A
    },

    ADD: {
      T0: ['Ep', 'Lm'],
      T1: ['Ce', 'Li'],
      T2: ['Ei', 'Lm'], // Ei = IR → Bus, then Lm = MAR ← Bus

      T3: ['Ce', 'Lb'],   // Memory → Register B
      T4: ['Ea', 'Eu', 'Lu'] // ← Show A to ALU, calculate, then ALU to A

    },

    SUB: {
      T0: ['Ep', 'Lm'],
      T1: ['Ce', 'Li'],
      T2: ['Ei', 'Lm'], // Ei = IR → Bus, then Lm = MAR ← Bus

      T3: ['Ce', 'Lb'],
      T4: ['Ea', 'Su', 'Lu'] // ← Show A to ALU, subtract, then ALU to A


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
