// controlWords.ts

export const controlWords = {
    LDA: {
      T3: ['Lm', 'Ei'],
      T4: ['Er', 'La'],
      T5: []
    },
    ADD: {
      T3: ['Lm', 'Ei'],
      T4: ['Er', 'Lb'],
      T5: ['La', 'Eu']
    },
    SUB: {
      T3: ['Lm', 'Ei'],
      T4: ['Er', 'Lb'],
      T5: ['La', 'Su', 'Eu']
    },
    OUT: {
      T3: ['Ea', 'Lo'],
      T4: [],
      T5: []
    },
    HLT: {
      T3: ['HLT'],
      T4: [],
      T5: []
    },
    COMMON: {
      T0: ['Ep', 'Lm'],
      T1: ['Er', 'Li'],
      T2: ['Cp']
    }
  }

// Export a function to get control words for a specific instruction and T-state
export function getControlWords(instruction: string, tState: number): string[] {
  // Get the opcode (first 4 bits)
  const opcode = instruction.slice(0, 4);

  // Map opcode to instruction name
  const instructionMap: {[key: string]: string} = {
    '0000': 'LDA',
    '0001': 'ADD',
    '0010': 'SUB',
    '1110': 'OUT',
    '1111': 'HLT'
  };

  const instructionName = instructionMap[opcode];

  // Return common control words for T0-T2
  if (tState >= 0 && tState <= 2) {
    return controlWords.COMMON[`T${tState}` as keyof typeof controlWords.COMMON] || [];
  }

  // Return instruction-specific control words for T3-T5
  if (instructionName && tState >= 3 && tState <= 5) {
    return controlWords[instructionName as keyof typeof controlWords][`T${tState}` as keyof typeof controlWords[keyof typeof controlWords]] || [];
  }

  return [];
}
