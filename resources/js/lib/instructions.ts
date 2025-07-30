export const instructionSet = [
    { name: 'LDA', binary: '0000', description: 'Load A ← M[addr]' },
    { name: 'ADD', binary: '0001', description: 'A ← A + M[addr]' },
    { name: 'SUB', binary: '0010', description: 'A ← A - M[addr]' },
    { name: 'OUT', binary: '1110', description: 'Output ← A' },
    { name: 'HLT', binary: '1111', description: 'Halt execution' },
  ]
