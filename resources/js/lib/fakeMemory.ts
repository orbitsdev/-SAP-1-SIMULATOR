// fakeMemory.ts

// 16 memory addresses: 0000 to 1111 (binary 0 to 15 decimal)
// Memory addresses are displayed in decimal format in the UI
// Each memory location contains an 8-bit value

export const memory: Record<string, string> = {
  // Memory contents exactly matching the screenshot
  '1000': '00001000', // LDA instruction (address 8 in decimal)
  '1001': '00011001', // ADD instruction (address 9 in decimal)
  '1010': '00101010', // SUB instruction (address 10 in decimal)
  '1011': '11100000', // OUT instruction (address 11 in decimal)
  '1100': '11110000', // HLT instruction (address 12 in decimal)
  '1101': '00001101', // Data value 13 (address 13 in decimal)
  '1110': '00001110', // Data value 14 (address 14 in decimal)
  '1111': '00001111', // Data value 15 (address 15 in decimal)
  '0000': '00001001', // Data value 9 (address 0 in decimal)
  '0001': '00001010', // Data value 10 (address 1 in decimal)
  '0010': '00000011', // Data value 3 (address 2 in decimal)
  '0011': '00000100', // Data value 4 (address 3 in decimal)
  '0100': '00000101', // Data value 5 (address 4 in decimal)
  '0101': '00000110', // Data value 6 (address 5 in decimal)
  '0110': '00000111', // Data value 7 (address 6 in decimal)
  '0111': '00001000'  // Data value 8 (address 7 in decimal)
};
