// fakeMemory.ts

// 16 memory addresses: 0000 to 1111 (binary 0 to 15 decimal)
// Each memory location contains an 8-bit value
// First 4 bits = opcode, Last 4 bits = operand
// Opcodes: 0000 (LDA), 0001 (ADD), 0010 (SUB), 1110 (OUT), 1111 (HLT)

export const memory: Record<string, string> = {
  '0000': '00001000', // LDA from address 8
  '0001': '00011001', // ADD from address 9
  '0010': '00101010', // SUB from address 10
  '0011': '11100000', // OUT (no operand needed)
  '0100': '11110000', // HLT (no operand needed)
  '0101': '00001011', // LDA from address 11
  '0110': '00011100', // ADD from address 12
  '0111': '00101101', // SUB from address 13
  '1000': '00001010', // Value 10 (data, not instruction)
  '1001': '00000101', // Value 5 (data, not instruction)
  '1010': '00000011', // Value 3 (data, not instruction)
  '1011': '00001111', // Value 15 (data, not instruction)
  '1100': '00000111', // Value 7 (data, not instruction)
  '1101': '00000010', // Value 2 (data, not instruction)
  '1110': '00001001', // Value 9 (data, not instruction)
  '1111': '00000000'  // Value 0 (data, not instruction)
};
