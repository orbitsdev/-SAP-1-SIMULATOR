# SAP-1 Simulator Documentation (Comprehensive Version)

## 🧠 Overview

This documentation explains the architecture, instruction cycle, control signals, animation system, and backend integration of the SAP-1 (Simple As Possible Computer) Simulator. The simulator visually demonstrates how a basic 8-bit computer executes a program using binary instructions.

---

## ⚙️ SAP-1 Architecture

| Component              | Purpose                                                      |
|------------------------|--------------------------------------------------------------|
| Program Counter (PC)   | Holds address of next instruction (4-bit)                    |
| Memory Address Reg.    | Stores memory address (MAR)                                  |
| PROM (16x8)            | Read-only memory containing 8-bit instructions               |
| Instruction Register   | Holds fetched instruction (IR)                               |
| Control Unit           | Generates control signals based on opcode and T-state        |
| A Register             | Main register for storing data (accumulator)                 |
| B Register             | Secondary register for arithmetic operations                 |
| ALU                    | Performs arithmetic: ADD, SUB                                |
| Output Register        | Stores value to be shown on display                          |
| Binary Display         | Displays 8-bit binary output                                 |

---

## 📦 Instruction Format

Each instruction is 8 bits:

- `cccc oooo`
  - `cccc` = 4-bit opcode
  - `oooo` = 4-bit operand (memory address)

### Supported Instructions

| Mnemonic | Opcode | Action                            |
|----------|--------|-----------------------------------|
| LDA      | 0000   | A ← M[oooo]                       |
| ADD      | 0001   | A ← A + M[oooo]                   |
| SUB      | 0010   | A ← A - M[oooo]                   |
| OUT      | 1110   | Output ← A                        |
| HLT      | 1111   | Halt the simulation               |

---

## 🔁 Instruction Cycle (T0 to T5)

### General Flow

| T-State | Description                             | Control Signals |
|---------|-----------------------------------------|-----------------|
| T0      | PC → MAR                                | Ep, Lm          |
| T1      | PROM[MAR] → IR                          | Er, Li          |
| T2      | Increment PC                            | Cp              |
| T3–T5   | Execute based on instruction            | See below       |

### Control Signal Matrix

| Instruction | T3         | T4         | T5            |
|-------------|------------|------------|---------------|
| LDA         | Lm, Ei     | Er, La     | (No-op)       |
| ADD         | Lm, Ei     | Er, Lb     | La, Eu        |
| SUB         | Lm, Ei     | Er, Lb     | La, Su, Eu    |
| OUT         | Ea, Lo     | (No-op)    | (No-op)       |
| HLT         | (No-op)    | (No-op)    | HLT           |

---

## 📄 Example Program

### Memory Setup

```
R0: 00001001 → LDA R9
R1: 00011010 → ADD RA
R2: 00101100 → SUB RC
R3: 11100000 → OUT
R4: 11110000 → HLT
R9: 00010000 → Value = 16
RA: 00010100 → Value = 20
RC: 00011100 → Value = 28
```

### Execution Result

```
Step 1: LDA 09  → A = 16
Step 2: ADD 0A  → A = 16 + 20 = 36
Step 3: SUB 0C  → A = 36 - 28 = 8
Step 4: OUT     → Output = 8
Step 5: HLT     → Stop
```

---

## 🧪 File Upload Format

- Filename: `program_instructions.txt`
- Format: 8-bit binary strings, one instruction per line

Example:
```
00001001
00011010
00101100
11100000
11110000
```

---

## 🎞️ Animation System (GSAP)

Animations help visualize the internal state transitions and data movements:

- **Glowing effects**: active components using `loopMultipleComponentGlows()`
- **Moving labels**: values shown moving across arrows via `animateMovingText()`
- **Pause/Resume**: animations can be paused and resumed with `pauseMovingAnimation()` / `resumeMovingAnimation()`

---

## 🧩 Vue Components

| File               | Purpose                                 |
|--------------------|-----------------------------------------|
| `SimulationSpace`  | Main logic, T-state control             |
| `Box`              | Component display unit                  |
| `Arrow`            | Directional paths for movement          |
| `Bus`              | Visual connection between components    |
| `MovingLabel`      | Floating binary value text              |
| `UploadModal`      | File upload dialog                      |

---

## 🖥️ Backend Integration (Laravel)

| File                      | Purpose                                |
|---------------------------|----------------------------------------|
| `web.php`                 | Route definitions                      |
| `ProgramUploadController`| File upload validation & processing    |

---

## 🧭 Simulator Modes

| Mode    | Description                                  |
|---------|----------------------------------------------|
| Manual  | Click-based step-by-step (T0 to T5)          |
| Auto    | Automatically loops through all instructions |

---

## ✅ Summary

The SAP-1 simulator mimics a simple 8-bit computer capable of executing binary programs. It teaches the fetch-decode-execute cycle visually using GSAP animation and component interaction in Vue, with Laravel backend support.