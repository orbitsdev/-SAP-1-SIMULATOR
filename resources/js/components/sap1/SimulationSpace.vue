<script setup lang="ts">
defineOptions({ inheritAttrs: false });
import Box from "./Box.vue";
import Bus from "./Bus.vue";
import Arrow from "./Arrow.vue";
import MovingLabel from "./MovingLabel.vue";
import { arrows } from "@/lib/arrows";
import { components } from "@/lib/components";
import {
  animateHighlightAndGlow,
  animateMovingText,
  loopMultipleComponentGlows,
  stopSpecificGlows,
  stopAllComponentGlows,
  pauseMovingAnimation,
  resumeMovingAnimation,
  pauseAllComponentGlows,
  resumeAllComponentGlows,
} from "@/lib/animation";
import { nextTick, reactive, onMounted, computed } from "vue";

import { movePaths } from "@/lib/movePaths";
import { memory } from "@/lib/fakeMemory";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Expose computed properties for simulation state
const simulationType = computed(() => processor.type);
const isPaused = computed(() => processor.isPaused);
const isRunning = computed(() => processor.isRunning);
const isHalted = computed(() => processor.halted);

const currentDisplayInstruction = computed(() => {
  const bin = program[processor.currentInstruction] || "";
  const opcode = bin.slice(0, 4);
  const operand = bin.slice(4);

  const opcodeNameMap: Record<string, string> = {
    "0000": "LDA",
    "0001": "ADD",
    "0010": "SUB",
    "1110": "OUT",
    "1111": "HLT",
  };

  const name = opcodeNameMap[opcode] || "???";
  return `${name} ${operand} (${bin})`;
});
const program = [
  "00000001", // LDA 01H → A ← M[01] = 2
  "00010010", // ADD 02H → A ← A + M[02] = 2 + 3 = 5
  "11100000", // OUT → Output A = 5
  "11110000", // HLT
];

// const program = [
//   "00000010", // LDA 02H → A ← M[02] = 3
//   "00100001", // SUB 01H → A ← A - M[01] = 3 - 2 = 1
//   "11100000", // OUT → Output A = 1
//   "11110000", // HLT
// ];

// const program = [
//   "00000011", // LDA 03H → A ← M[03] = 4
//   "11110000", // HLT → should stop here!
//   "00010001", // ADD 01H → this should NOT execute
//   "11100000", // OUT → should not be reached
// ];

defineExpose({
  runManualStep,
  runAuto,
  pauseSimulation,
  resumeSimulation,
  resetSimulation,
  togglePause,
  simulationType,
  isPaused,
  isRunning,
  isHalted,
});

const processor = reactive({
  type: "manual",
  isRunning: false,
  isPaused: false,
  currentStep: 0,
  currentInstruction: 0,
  instruction: "",
  highlights: [] as string[],
  movingText: "",
  intervalId: null as ReturnType<typeof setInterval> | null,
  opcode: "",
  operand: "",
  errorMessage: "",
  halted: false,
  invalidInstructionIndex: -1,
  showErrorModal: false,
  simulationDone: false,
});

const validOpcodes = ["0000", "0001", "0010", "1110", "1111"];
function isValidInstruction(bin: string): boolean {
  if (!/^[01]{8}$/.test(bin)) return false;
  const opcode = bin.slice(0, 4);
  return validOpcodes.includes(opcode);
}

function runManualStep() {
  if (isFinished()) {
    stopSimulation();
    return;
  }

  const instruction = program[processor.currentInstruction];

  if (!isValidInstruction(instruction)) {
    processor.invalidInstructionIndex = processor.currentInstruction;
    processor.showErrorModal = true;
    return;
  }

  stopAllComponentGlows();
  pauseMovingAnimation();
  processor.movingText = "";

  const step = processor.currentStep;

  const proceed = () => {
    processor.currentStep++;
    runManualStep(); // recursive skip
  };

  switch (step) {
    case 0:
      handleT0(instruction, () => processor.currentStep++);
      break;
    case 1:
      handleT1(instruction, () => processor.currentStep++);
      break;
    case 2:
      handleT2(instruction, () => processor.currentStep++);
      break;
    case 3:
      handleT3(instruction, () => processor.currentStep++);
      break;
    case 4:
      handleT4(instruction, () => {
        // auto-skip T4 if not needed
        if (["0000", "1111"].includes(processor.opcode)) proceed();
        else processor.currentStep++;
      });
      break;
   case 5:
 handleT5(instruction, () => {
  processor.currentStep = 0;

  if (!processor.halted) {
    processor.currentInstruction++;
  }
});

  break;
  }
}
function isFinished(): boolean {
  return processor.currentInstruction >= program.length || processor.halted;
}

function stopSimulation() {
  processor.isRunning = false;
  processor.isPaused = false;
  processor.halted = true;
  processor.simulationDone = true; // ✅ trigger the dialog

  stopAllComponentGlows();
  pauseMovingAnimation();

  console.log("🛑 Simulation stopped (end or manual).");
}

function advanceStep() {
  processor.currentStep++;

  if (processor.currentStep > 5) {
    processor.currentStep = 0;
    processor.currentInstruction++;
  }
}

function runAuto() {
  if (isFinished()) {
    console.log("🛑 Auto stopped: simulation is finished.");
    stopSimulation();
    return;
  }

  processor.isRunning = true;
  processor.isPaused = false;
  processor.type = "auto"; // ✅ set to auto

  const step = processor.currentStep;
  const instruction = program[processor.currentInstruction];

  if (!isValidInstruction(instruction)) {
    processor.invalidInstructionIndex = processor.currentInstruction;
    processor.showErrorModal = true;
    stopSimulation();
    return;
  }

  const proceed = () => {
    processor.currentStep++;
    runAuto(); // recursive call for next step
  };

 const finish = () => {
  if (!processor.halted) {
    processor.currentInstruction++;
    processor.currentStep = 0;
    runAuto();
  }
};


  stopAllComponentGlows();
  pauseMovingAnimation();
  processor.movingText = "";

  switch (step) {
    case 0:
      handleT0(instruction, proceed);
      break;
    case 1:
      handleT1(instruction, proceed);
      break;
    case 2:
      handleT2(instruction, proceed);
      break;
    case 3:
      handleT3(instruction, proceed);
      break;
    case 4:
      handleT4(instruction, () => {
        if (["0000", "1111"].includes(processor.opcode)) proceed();
        else processor.currentStep++, runAuto();
      });
      break;
    case 5:
      handleT5(instruction, finish);
      break;
  }
}

function pauseSimulation() {}
function resumeSimulation() {}
function resetSimulation() {
  processor.type = "manual"; // ✅ reset to default
  processor.isRunning = false;
  processor.isPaused = false;
  processor.halted = false;
  processor.currentStep = 0;
  processor.currentInstruction = 0;
  processor.opcode = "";
  processor.operand = "";
  processor.instruction = "";
  processor.movingText = "";
  processor.errorMessage = "";
  processor.invalidInstructionIndex = -1;
  processor.showErrorModal = false;
  processor.simulationDone = false;

  stopAllComponentGlows();
  pauseMovingAnimation();

  // Optional: reset all components' values
  components.forEach((c) => (c.value = ""));

  console.log("🔄 Simulation fully reset.");
}
function togglePause() {
  if (!processor.isRunning) return;

  processor.isPaused = !processor.isPaused;

  if (processor.isPaused) {
    pauseMovingAnimation();
    pauseAllComponentGlows(); // ✅ pause, not stop
    console.log("⏸ Simulation Paused");
  } else {
    resumeMovingAnimation();
    resumeAllComponentGlows(); // ✅ resume glow
    console.log("▶️ Simulation Resumed");

    if (processor.movingText === "") {
      runAuto();
    }
  }
}

// 📊 Instruction Handling
function handleT0(instruction: string, onComplete: () => void) {
  const pcValue = processor.currentInstruction.toString(2).padStart(4, "0");

  updateComponentValue("pc", pcValue);
  loopMultipleComponentGlows(["pc", "mar", "con"]);

  processor.movingText = pcValue;
  animateMovingText("moving-label", movePaths.pcToMar, pcValue, () => {
    updateComponentValue("mar", pcValue);
    stopSpecificGlows(["pc", "mar"]);
    processor.movingText = "";

    console.log("📦 T0: PC → MAR | value:", pcValue);

    onComplete(); // ✅ advance step after animation ends
  });
}

function handleT1(instruction: string, onComplete: () => void) {
  const instructionAtMar = program[processor.currentInstruction]; // 8-bit binary

  updateComponentValue("prom", instructionAtMar);
loopMultipleComponentGlows(["prom", "ir", "con"]);


  processor.movingText = instructionAtMar;
  animateMovingText("moving-label", movePaths.promToIr, instructionAtMar, () => {
    updateComponentValue("ir", instructionAtMar);
    stopSpecificGlows(["prom", "ir"]);
    processor.movingText = "";

    // Extract and store opcode + operand
    setInstruction(instructionAtMar);

    console.log("📥 T1: PROM → IR:", instructionAtMar);
    onComplete(); // ✅ go to T2 after animation
  });
}
function handleT2(instruction: string, onComplete: () => void) {
  const operand = processor.operand; // 4-bit address

  // 🟡 Increment Program Counter (the actual PC register)
  const newPcValue = (processor.currentInstruction + 1).toString(2).padStart(4, "0");
  updateComponentValue("pc", newPcValue);

  // ✨ Show PC glow and update
  loopMultipleComponentGlows(["pc"]);

  // Animate IR → MAR
 loopMultipleComponentGlows(["prom", "ir", "con"]);

  processor.movingText = operand;

  animateMovingText("moving-label", movePaths.irToMar, operand, () => {
    updateComponentValue("mar", operand);

    stopSpecificGlows(["ir", "mar", "pc"]); // Stop all glows together
    processor.movingText = "";

    console.log("📨 T2: IR(operand) → MAR | operand:", operand);
    console.log("📈 PC incremented to:", newPcValue);

    onComplete();
  });
}
function handleT3(instruction: string, onComplete: () => void) {
  const opcode = processor.opcode;
  const operand = processor.operand;

  const fakeMemoryValue = memory[operand] || "00000000"; // ✅ use memory lookup

  let target = "";
  let path;

  if (opcode === "0000") {
    target = "a";
    path = movePaths.promToA;
  } else if (opcode === "0001" || opcode === "0010") {
    target = "b";
    path = movePaths.promToB;
  } else {
    console.log("T3 skipped (no data fetch required)");
    onComplete();
    return;
  }

loopMultipleComponentGlows(["prom", target, "con"]);
  processor.movingText = fakeMemoryValue;

  animateMovingText("moving-label", path, fakeMemoryValue, () => {
    updateComponentValue(target, fakeMemoryValue);
    stopSpecificGlows(["prom", target]);
    processor.movingText = "";

    console.log(
      `📥 T3: M[${operand}] → ${target.toUpperCase()} | value:`,
      fakeMemoryValue
    );
    onComplete();
  });
}

function handleT4(instruction: string, onComplete: () => void) {
  const opcode = processor.opcode;

  if (opcode === "0001") {
    // ADD
    const aVal = getComponentValue("a");
    const bVal = getComponentValue("b");
    const result = binaryAdd(aVal, bVal);

    // 1️⃣ Glow B only (B → ALU)
loopMultipleComponentGlows(["b", "con"]);


    processor.movingText = bVal;
    animateMovingText("moving-label", movePaths.bToAlu, bVal, () => {
      stopSpecificGlows(["b"]);
      processor.movingText = "";

      // 2️⃣ Glow ALU before A → ALU
      animateHighlightAndGlow("alu");

      setTimeout(() => {
        // 3️⃣ Glow A then A → ALU
        loopMultipleComponentGlows(["a"]); // ✨ only now
        processor.movingText = aVal;
        animateMovingText("moving-label", movePaths.aToAlu, aVal, () => {
          stopSpecificGlows(["a"]);
          processor.movingText = "";

          // 4️⃣ ALU → A
          setTimeout(() => {
            processor.movingText = result;
            animateMovingText("moving-label", movePaths.aluToA, result, () => {
              stopSpecificGlows(["alu"]);
              updateComponentValue("a", result);
              animateHighlightAndGlow("a");
              processor.movingText = "";
              console.log("➕ T4: A ← A + B =", result);
              onComplete();
            });
          }, 400);
        });
      }, 300);
    });
  } else if (opcode === "0010") {
    // SUB
    const aVal = getComponentValue("a");
    const bVal = getComponentValue("b");
    const result = binarySub(aVal, bVal);

    // 1️⃣ Glow B only
  loopMultipleComponentGlows(["b", "con"]);
    processor.movingText = bVal;
    animateMovingText("moving-label", movePaths.bToAlu, bVal, () => {
      stopSpecificGlows(["b"]);
      processor.movingText = "";

      // 2️⃣ Glow ALU
      animateHighlightAndGlow("alu");

      setTimeout(() => {
        // 3️⃣ Glow A then A → ALU
        loopMultipleComponentGlows(["a"]);
        processor.movingText = aVal;
        animateMovingText("moving-label", movePaths.aToAlu, aVal, () => {
          stopSpecificGlows(["a"]);
          processor.movingText = "";

          // 4️⃣ ALU → A
          setTimeout(() => {
            processor.movingText = result;
            animateMovingText("moving-label", movePaths.aluToA, result, () => {
              stopSpecificGlows(["alu"]);
              updateComponentValue("a", result);
              animateHighlightAndGlow("a");
              processor.movingText = "";
              console.log("➖ T4: A ← A - B =", result);
              onComplete();
            });
          }, 400);
        });
      }, 300);
    });
  } else if (opcode === "1110") {
    // OUT
    const aValue = getComponentValue("a");
     loopMultipleComponentGlows(["a", "out", "con"]);
    processor.movingText = aValue;

    animateMovingText("moving-label", movePaths.aToOut, aValue, () => {
      updateComponentValue("out", aValue);
      updateComponentValue("bd", aValue); // ✅ OUT ← A
      stopSpecificGlows(["a", "out"]);
      processor.movingText = "";
      console.log("📤 T4: OUT ← A =", aValue);
      onComplete();
    });
  } else {
    onComplete();
  }
}

function getComponentValue(id: string): string {
  const c = components.find((x) => x.id === id);
  return c?.value || "00000000";
}

function binaryAdd(a: string, b: string): string {
  const sum = parseInt(a, 2) + parseInt(b, 2);
  return sum.toString(2).padStart(8, "0");
}

function binarySub(a: string, b: string): string {
  const diff = parseInt(a, 2) - parseInt(b, 2);
  return diff.toString(2).padStart(8, "0");
}
function handleT5(instruction: string, done: () => void) {
  const opcode = processor.opcode;

  if (opcode === "1111") {
    console.log("🛑 T5: HLT encountered — Halting Simulation");
    processor.halted = true;
    stopSimulation();
    return; // ✅ Do not call done() — we stop here.
  }

  console.log("✅ T5: Instruction cycle complete.");
 loopMultipleComponentGlows(["pc", "mar", "con"]);

  done(); // ✅ Let runAuto() or runManualStep() decide if they want to increment.
}


// 📊 Simulation Control

function getCurrentOpcode() {}
function getOperand() {}
function parseInstruction() {}
function binaryToDecimal() {}
function decimalToBinary() {}
function logInstructionDetails() {}

function setInstruction(bin: string) {
  if (!isValidInstruction(bin)) {
    processor.errorMessage = "Invalid instruction format.";
    return false;
  }
  processor.instruction = bin;
  processor.opcode = bin.slice(0, 4);
  processor.operand = bin.slice(4);
  return true;
}

function canAdvanceStep(): boolean {
  return !processor.isPaused && processor.isRunning;
}

//validation

function updateComponentValue(id: string, value: string) {
  const comp = components.find((c) => c.id === id);
  if (comp) comp.value = value;
}

// ✅ TEST PC → MAR
function testMovePath() {
  const binary = processor.currentInstruction.toString(2).padStart(4, "0");
  console.log("🧪 PC to MAR →", binary);

  processor.movingText = binary;
  updateComponentValue("prom", binary);

  loopMultipleComponentGlows(["out"]);

  animateMovingText("moving-label", movePaths.promToB, binary, () => {
    updateComponentValue("out", binary);
    processor.movingText = "";
    stopSpecificGlows(["out"]);
  });
}
</script>

<template>
  <div
    v-bind="$attrs"
    class="relative grid grid-cols-16 gap-px w-full h-full"
    style="grid-template-columns: repeat(16, 45px); grid-template-rows: repeat(16, 48px)"
  >
    <div
      class="absolute top-2 right-2 z-50 bg-white/90 px-4 py-2 rounded shadow text-sm font-mono"
    >
      <span class="text-gray-500">Now Running:</span>
      <span class="font-bold text-blue-700">{{ currentDisplayInstruction }}</span>
    </div>

    <!-- <div class="absolute top-2 left-2 z-50 flex flex-col gap-2 bg-white/80 p-3 rounded shadow">

     <button @click="testMovePath">Test Move Path</button>


    </div> -->

    <!-- ✨ Floating moving text -->
    <MovingLabel id="moving-label" :text="processor.movingText" />

    <!-- 🔁 Arrows -->
    <Arrow
      v-for="(arrow, index) in arrows"
      :key="index"
      :from="arrow.from"
      :to="arrow.to"
      :label="arrow.label"
      :offsetY="arrow.offsetY"
      :offsetX="arrow.offsetX"
      :thickness="arrow.thickness"
      :headSize="arrow.headSize"
    />

    <!-- 🚌 Bus in center -->
    <div
      :style="{
        gridColumnStart: 7,
        gridColumnEnd: 'span 3',
        gridRowStart: 2,
        gridRowEnd: 14,
      }"
    >
      <Bus title="8" />
    </div>

    <!-- 🧱 Components -->
    <Box
      v-for="c in components"
      :key="c.id"
      :id="c.id"
      :title="c.title"
      :value="c.value"
      :style="{
        gridColumnStart: c.col,
        gridRowStart: c.row,
        gridColumnEnd: `span ${c.colSpan}`,
        gridRowEnd: `span ${c.rowSpan}`,
      }"
    />
  </div>
  <Dialog v-model:open="processor.showErrorModal">
    <DialogContent>
      <DialogHeader>
        <DialogTitle class="text-red-600">Invalid Instruction</DialogTitle>
        <DialogDescription>
          Instruction at line {{ processor.invalidInstructionIndex + 1 }} is not valid:
          <code class="bg-gray-100 px-2 py-1 rounded text-red-500">
            {{ program[processor.invalidInstructionIndex] }}
          </code>
        </DialogDescription>
      </DialogHeader>
      <div class="flex justify-end mt-4">
        <button
          class="bg-red-600 text-white px-4 py-2 rounded"
          @click="processor.showErrorModal = false"
        >
          Close
        </button>
      </div>
    </DialogContent>
  </Dialog>

  <Dialog v-model:open="processor.simulationDone">
    <DialogContent>
      <DialogHeader>
        <DialogTitle class="text-green-700">Simulation Complete</DialogTitle>
        <DialogDescription>
          ✅ All instructions have been processed successfully.
        </DialogDescription>
      </DialogHeader>
      <div class="flex justify-end mt-4">
        <button
          class="bg-green-700 text-white px-4 py-2 rounded"
          @click="processor.simulationDone = false"
        >
          Close
        </button>
      </div>
    </DialogContent>
  </Dialog>
</template>
