# SAP-1 Simulation Reference Guide

This document summarizes the execution cycle, control signals, and animation logic for SAP-1 simulation.

---

## Instruction Cycle (T0 - T5)

### Fetch Cycle
- **T0**
  - Control Signals: `Ep Lm`
  - Action: MAR ← PC
- **T1**
  - Control Signals: `Er Li`
  - Action: IR ← Memory[MAR]
- **T2**
  - Control Signals: `Cp`
  - Action: PC ← PC + 1

### Execute Cycle

#### LDA (Load Accumulator)
- **T3**: `Lm Ei` → MAR ← IR(low)
- **T4**: `Er La` → A ← Memory[MAR]
- **T5**: No operation

#### ADD (Addition)
- **T3**: `Lm Ei` → MAR ← IR(low)
- **T4**: `Er Lb` → B ← Memory[MAR]
- **T5**: `La Eu` → A ← A + B

#### SUB (Subtraction)
- **T3**: `Lm Ei` → MAR ← IR(low)
- **T4**: `Er Lb` → B ← Memory[MAR]
- **T5**: `La Su Eu` → A ← A - B

#### OUT (Output)
- **T3**: `Ea Lo` → Output ← A
- **T4, T5**: No operation

#### HLT (Halt)
- **T3**: Halt signal triggered → Stop execution

---

## Animation Logic

To clearly visualize each instruction execution:

1. **Glow Effect**  
   Highlight the active components (e.g., PC, MAR, ALU).

2. **Data Movement Animation**  
   Show animated arrows/lines representing data transfer between registers.

3. **Value Update**  
   Change the displayed register/memory values after each step.

### Example: Fetch Cycle (T0)
- PC and MAR glow.  
- Arrow shows PC → MAR.  
- MAR updates with PC’s value.

---

## Notes
- Instructions are 8 bits (`cccc oooo`), where `cccc` = opcode and `oooo` = operand.
- ALU supports addition and subtraction only.
- Control unit signals come from the **Ring Counter (T0–T5)**, **Instruction Decoder**, and **Control Matrix**.

---

## References
- SAP-1 Computer Architecture (from uploaded lecture notes)
- Custom animation logic for simulation (Vue.js + GSAP)
