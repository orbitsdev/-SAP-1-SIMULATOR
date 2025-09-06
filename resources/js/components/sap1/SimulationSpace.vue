<script setup lang="ts">
defineOptions({ inheritAttrs: false });
import { ref } from "vue";
import Box from "./Box.vue";
import Bus from "./Bus.vue";
import Arrow from "./Arrow.vue";
import MovingLabel from "./MovingLabel.vue";
import { arrows } from "@/lib/arrows";
import { components } from "@/lib/components";
import { instructionSet } from "@/lib/instructions";
import axios from 'axios'
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
import { reactive, onMounted, computed } from "vue";

import { movePaths } from "@/lib/movePaths";
import { memory } from "@/lib/fakeMemory";
import { getControlWords } from "@/lib/controlWords";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const program = ref<string[]>([])
const hasProgram = ref(false)

function loadProgramFromFile(lines: string[]) {
  program.value = lines.filter((l: string) => /^[01]{8}$/.test(l.trim()))
  resetSimulation()
}



onMounted(async () => {
  try {
    const res = await axios.get('/program-load')
    if (res.data.exists) {
      program.value = res.data.lines.filter((l: string) => /^[01]{8}$/.test(l.trim()))
      hasProgram.value = true
      console.log('Loaded program instructions:', program.value)
    } else {
      hasProgram.value = false
    }
  } catch (e) {
    console.error('Failed to load program:', e)
    hasProgram.value = false
  }
})

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
  executionLogs: [] as string[],
  activeMemoryAddress: "", // Track which memory address is currently being accessed
  tempMemoryValue: "", // Temporary storage for memory value between T3 and T4
  tempMemoryDisplay: "" // Temporary storage for memory display value between T3 and T4
});

const validOpcodes = ["0000", "0001", "0010", "1110", "1111"];
function isValidInstruction(bin: string): boolean {
  if (!/^[01]{8}$/.test(bin)) return false;
  const opcode = bin.slice(0, 4);
  return validOpcodes.includes(opcode);
}

// Function to get instruction name from opcode
function getInstructionName(opcode: string): string {
  const instruction = instructionSet.find((ins) => ins.binary === opcode);
  return instruction ? instruction.name : 'UNKNOWN';
}

function runManualStep() {
  if (isFinished()) {
    stopSimulation();
    return;
  }

  // Set isRunning to true for manual mode as well
  processor.isRunning = true;
  processor.type = "manual";

  const instruction = program.value[processor.currentInstruction];

  if (!isValidInstruction(instruction)) {
    processor.invalidInstructionIndex = processor.currentInstruction;
    processor.showErrorModal = true;
    processor.halted = true;
    // Debug logging to show exact characters in the invalid instruction
    console.log('Invalid instruction detected:', instruction);
    console.log('Character codes:', [...instruction].map(c => c.charCodeAt(0)));
    console.log('Length:', instruction.length);
    stopSimulation();
    return;
  }

  stopAllComponentGlows();
  pauseMovingAnimation();
  processor.movingText = "";

  const step = processor.currentStep;

  const proceed = () => {
    processor.currentStep++;
    runManualStep();
  };

  // Function to complete the manual step and reset isRunning
  const completeManualStep = () => {
    // Reset isRunning to false after the step is complete
    // This allows switching between manual and auto modes
    processor.isRunning = false;
  };

  switch (step) {
    case 0:
      handleT0(instruction, () => {
        processor.currentStep++;
        completeManualStep();
      });
      break;
    case 1:
      handleT1(instruction, () => {
        processor.currentStep++;
        completeManualStep();
      });
      break;
    case 2:
      handleT2(instruction, () => {
        processor.currentStep++;
        completeManualStep();
      });
      break;
    case 3:
      handleT3(instruction, () => {
        // Only proceed if not halted
        if (!processor.halted) {
          processor.currentStep++;
        } else {
          stopSimulation();
        }
        completeManualStep();
      });
      break;
    case 4:
      // Check if processor is halted before proceeding to T4
      if (processor.halted) {
        stopSimulation();
        return;
      }
      handleT4(instruction, () => {
        if (["0000", "1111"].includes(processor.opcode)) {
          proceed();
        } else {
          processor.currentStep++;
          completeManualStep();
        }
      });
      break;
   case 5:
      // Check if processor is halted before proceeding to T5
      if (processor.halted) {
        stopSimulation();
        return;
      }
      handleT5(instruction, () => {
        processor.currentStep = 0;

        if (!processor.halted) {
          processor.currentInstruction++;
        }
        completeManualStep();
      });
      break;
  }
}
function isFinished(): boolean {
  return processor.currentInstruction >= program.value.length || processor.halted;
}

function stopSimulation() {
  processor.isRunning = false;
  processor.isPaused = false;
  processor.halted = true;
  processor.simulationDone = true;

  stopAllComponentGlows();
  pauseMovingAnimation();

  console.log("");
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
    console.log("");
    stopSimulation();
    return;
  }

  processor.isRunning = true;
  processor.isPaused = false;
  processor.type = "auto";

  const step = processor.currentStep;
  const instruction = program.value[processor.currentInstruction];

  if (!isValidInstruction(instruction)) {
    processor.invalidInstructionIndex = processor.currentInstruction;
    processor.showErrorModal = true;
    stopSimulation();
    return;
  }

  const proceed = () => {
    processor.currentStep++;
    runAuto();
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
      handleT3(instruction, () => {
        // Only proceed if not halted
        if (!processor.halted) {
          processor.currentStep++;
          runAuto();
        } else {
          stopSimulation();
        }
      });
      break;
    case 4:
      // Check if processor is halted before proceeding to T4
      if (processor.halted) {
        stopSimulation();
        return;
      }
      handleT4(instruction, () => {
        if (["0000", "1111"].includes(processor.opcode)) proceed();
        else processor.currentStep++, runAuto();
      });
      break;
    case 5:
      // Check if processor is halted before proceeding to T5
      if (processor.halted) {
        stopSimulation();
        return;
      }
      handleT5(instruction, finish);
      break;
  }
}

function resetSimulation() {
  processor.type = "manual";
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
  processor.tempMemoryValue = "";
  processor.tempMemoryDisplay = "";

  stopAllComponentGlows();
  pauseMovingAnimation();
  components.forEach((c) => (c.value = ""));
  processor.executionLogs = [];

  console.log("");
}
function togglePause() {
  if (!processor.isRunning) return;

  processor.isPaused = !processor.isPaused;

  if (processor.isPaused) {
    pauseMovingAnimation();
    pauseAllComponentGlows();
    console.log("");
  } else {
    resumeMovingAnimation();
    resumeAllComponentGlows();
    console.log("");

    if (processor.movingText === "") {
      runAuto();
    }
  }
}

function handleT0(instruction: string, onComplete: () => void) {
  const pcValue = processor.currentInstruction.toString(2).padStart(4, "0");

  const controlSignals = getControlWords(instruction, 0);
  console.log(`T0 Control Signals: ${controlSignals.join(', ')}`);

  // Add execution log with instruction name
  const instructionName = getInstructionName(instruction.slice(0, 4));
  processor.executionLogs.push(`T0: [${controlSignals.join(', ')}] — ${instructionName}: PC (${pcValue}) → MAR`);

  updateComponentValue("pc", pcValue);
  loopMultipleComponentGlows(["con", "pc", "mar"]);

  processor.movingText = pcValue;
  animateMovingText("moving-label", movePaths.pcToMar, pcValue, () => {
    updateComponentValue("mar", pcValue);
    stopSpecificGlows(["con", "pc", "mar"]);
    processor.movingText = "";

    console.log("");

    onComplete();
});
}

function handleT1(instruction: string, onComplete: () => void) {
  const instructionAtMar = program.value[processor.currentInstruction];

  console.log('Current program:', program.value);
  console.log('Current instruction index:', processor.currentInstruction);
  console.log('Current instruction value:', instructionAtMar);

  const controlSignals = getControlWords(instruction, 1);
  console.log(`T1 Control Signals: ${controlSignals.join(', ')}`);

  // Check if this is a HLT instruction for better logging
  const isHltInstruction = instructionAtMar.slice(0, 4) === "1111";
  const instructionType = isHltInstruction ? "HLT" : instructionAtMar;

  // Add execution log for T1 with instruction name
  const instructionName = getInstructionName(instructionAtMar.slice(0, 4));
  processor.executionLogs.push(`T1: [${controlSignals.join(', ')}] — ${instructionName}: Memory[MAR] (${instructionType}) → IR`);

  updateComponentValue("prom", instructionAtMar);
  loopMultipleComponentGlows(["con", "prom", "ir"]);

  processor.movingText = instructionAtMar;
  animateMovingText("moving-label", movePaths.promToIr, instructionAtMar, () => {
    updateComponentValue("ir", instructionAtMar);
    stopSpecificGlows(["con", "prom", "ir"]);
    processor.movingText = "";

    setInstruction(instructionAtMar);

    // Add additional log for HLT instruction decode
    if (isHltInstruction) {
      console.log("HLT instruction detected in IR");
    }

    console.log("");
    onComplete();
  });
}


function handleT2(instruction: string, onComplete: () => void) {
  const controlSignals = getControlWords(instruction, 2);
  console.log(`T2 Control Signals: ${controlSignals.join(', ')}`);

  const newPcValue = (processor.currentInstruction + 1).toString(2).padStart(4, "0");
  updateComponentValue("pc", newPcValue);
  loopMultipleComponentGlows(["con", "pc"]);

  // Check if this is a HLT instruction for better logging
  const isHltInstruction = processor.opcode === "1111";
  const instructionType = isHltInstruction ? "HLT" : instruction;

  // Add execution log for PC increment with instruction name
  const pcIncrementSignals = ['Cp'];
  const instructionName = getInstructionName(processor.opcode);
  if (isHltInstruction) {
    processor.executionLogs.push(`T2: [${pcIncrementSignals.join(', ')}] — ${instructionName}: PC incremented to ${newPcValue}`);
  } else {
    processor.executionLogs.push(`T2: [${pcIncrementSignals.join(', ')}] — ${instructionName}: PC incremented to ${newPcValue}`);
  }

  // No operand movement in T2 according to the diagram, just PC increment
  // Wait a short time to show the PC glow, then complete
  setTimeout(() => {
    stopSpecificGlows(["con", "pc"]);
    onComplete();
  }, 500);
}


function handleT3(instruction: string, onComplete: () => void) {
  const opcode = processor.opcode;
  const operand = processor.operand;

  // Get control signals for this instruction and T-state
  const controlSignals = getControlWords(opcode, 3);
  console.log(`T3 Control Signals: ${controlSignals.join(', ')}`);

  // If HLT instruction, halt the processor immediately
  if (opcode === "1111") {
    console.log("HLT instruction detected in T3, halting processor");
    processor.isRunning = false;
    processor.halted = true;

    // Add execution log for HLT with proper control signal
    const hltControlSignals = ['HLT'];
    const instructionName = getInstructionName(opcode);
    processor.executionLogs.push(`T3: [${hltControlSignals.join(', ')}] — ${instructionName}: Processor halted`);

    // Highlight control unit to show HLT signal
    loopMultipleComponentGlows(["con"]);
    setTimeout(() => {
      // Stop any ongoing animations or glows
      stopAllComponentGlows();
      pauseMovingAnimation();
      processor.movingText = "";

      // Clear activeMemoryAddress
      processor.activeMemoryAddress = "";

      onComplete();
    }, 500);
    return;
  } else if (opcode === "1110") {
    // OUT instruction - directly move from A to Output
    const aValue = getComponentValue("a");
    loopMultipleComponentGlows(["con", "a", "out"]);
    processor.movingText = aValue;

    // Add execution log for OUT with correct control signals from diagram
    const outControlSignals = ['EaLo'];
    const instructionName = getInstructionName(opcode);
    processor.executionLogs.push(`T3: [${outControlSignals.join(', ')}] — ${instructionName}: A (${aValue}) → Output`);

    animateMovingText("moving-label", movePaths.aToOut, aValue, () => {
      updateComponentValue("out", aValue);
      updateComponentValue("bd", aValue);
      stopSpecificGlows(["con", "a", "out"]);
      processor.movingText = "";
      onComplete();
    });
    return;
  }

  // For LDA, ADD, SUB instructions
  // According to the diagram, T3 sets MAR from operand and accesses memory
  loopMultipleComponentGlows(["con", "ir", "mar"]); // Added IR to the glow components

  // Set MAR and highlight memory address
  updateComponentValue("mar", operand);
  processor.activeMemoryAddress = operand;

  // Add execution log for MAR setting with correct control signals from diagram
  const marControlSignals = ['LmEi'];
  const instructionName = getInstructionName(opcode);
  processor.executionLogs.push(`T3: [${marControlSignals.join(', ')}] — ${instructionName}: MAR set to ${operand}`);

  // Get memory value
  const memoryExists = operand in memory;
  const fakeMemoryValue = memoryExists ? memory[operand] : "00000000";
  const memoryValueDisplay = memoryExists ? fakeMemoryValue : `${fakeMemoryValue} (default)`;

  // Now handle the specific instruction type
  if (opcode === "0000") { // LDA
    // For LDA, in T3 we only set MAR and prepare for memory access in T4
    // Debug logs for LDA
    console.log("DEBUG LDA:");
    console.log("Operand:", operand);
    console.log("Resolved Memory Value:", fakeMemoryValue);

    // Store memory value for T4 to use
    processor.tempMemoryValue = fakeMemoryValue;
    processor.tempMemoryDisplay = memoryValueDisplay;

    // Add a visual delay to match other instructions
    // Show data movement from IR to MAR
    processor.movingText = operand;
    animateMovingText("moving-label", movePaths.irToMar, operand, () => {
      processor.movingText = "";

      // Clear activeMemoryAddress after animation completes
      setTimeout(() => {
        processor.activeMemoryAddress = "";
        stopSpecificGlows(["con", "ir", "mar"]);
        onComplete();
      }, 300);
    });

  } else if (opcode === "0001" || opcode === "0010") { // ADD or SUB
    // For ADD/SUB, T3 only sets MAR with operand (no data movement to B yet)
    const operation = opcode === "0001" ? "ADD" : "SUB";

    // Store memory value for T4 to use
    processor.tempMemoryValue = fakeMemoryValue;
    processor.tempMemoryDisplay = memoryValueDisplay;

    // Clear activeMemoryAddress after a short delay
    setTimeout(() => {
      processor.activeMemoryAddress = "";
      stopSpecificGlows(["con", "ir", "mar"]); // Stop glowing after delay
    }, 500);

    onComplete();
  } else {
    // For any other instructions
    console.log("T3 skipped (no data fetch required)");
    const instructionName = getInstructionName(opcode);
    processor.executionLogs.push(`T3: [None] — ${instructionName}: No operation`);
    stopSpecificGlows(["con", "ir", "mar"]);
    onComplete();
  }
}


function handleT4(instruction: string, onComplete: () => void) {
  const opcode = processor.opcode;

  const controlSignals = getControlWords(instruction, 4);
  console.log(`T4 Control Signals: ${controlSignals.join(', ')}`);

  if (opcode === "0000") { // LDA
    // For LDA, T4 is when memory value is loaded into A register
    const memoryValue = processor.tempMemoryValue || "00000000";
    const memoryDisplay = processor.tempMemoryDisplay || memoryValue;

    // Add execution log for memory access
    const ldaControlSignals = ['ErLa'];
    const instructionName = getInstructionName(opcode);
    processor.executionLogs.push(`T4: [${ldaControlSignals.join(', ')}] — ${instructionName}: Memory[MAR] (${memoryDisplay}) → A`);

    loopMultipleComponentGlows(["con", "prom", "a"]);
    processor.movingText = memoryValue;

    animateMovingText("moving-label", movePaths.promToA, memoryValue, () => {
      updateComponentValue("a", memoryValue);
      stopSpecificGlows(["con", "prom", "a"]);
      processor.movingText = "";
      onComplete();
    });
  } else if (opcode === "0001") {
    // For ADD, T4 is when memory value is loaded into B register
    const memoryValue = processor.tempMemoryValue || "00000000";
    const memoryDisplay = processor.tempMemoryDisplay || memoryValue;

    // Add execution log for memory access to B register
    const addControlSignals = ['ErLb'];
    const instructionName = getInstructionName(opcode);
    processor.executionLogs.push(`T4: [${addControlSignals.join(', ')}] — ${instructionName}: Memory[MAR] (${memoryDisplay}) → B`);

    loopMultipleComponentGlows(["con", "prom", "b"]);
    processor.movingText = memoryValue;

    animateMovingText("moving-label", movePaths.promToB, memoryValue, () => {
      updateComponentValue("b", memoryValue);
      stopSpecificGlows(["con", "prom", "b"]);
      processor.movingText = "";
      onComplete();
    });

  } else if (opcode === "0010") {
    // For SUB, T4 is when memory value is loaded into B register
    const memoryValue = processor.tempMemoryValue || "00000000";
    const memoryDisplay = processor.tempMemoryDisplay || memoryValue;

    // Add execution log for memory access to B register
    const subControlSignals = ['ErLb'];
    const instructionName = getInstructionName(opcode);
    processor.executionLogs.push(`T4: [${subControlSignals.join(', ')}] — ${instructionName}: Memory[MAR] (${memoryDisplay}) → B`);

    loopMultipleComponentGlows(["con", "prom", "b"]);
    processor.movingText = memoryValue;

    animateMovingText("moving-label", movePaths.promToB, memoryValue, () => {
      updateComponentValue("b", memoryValue);
      stopSpecificGlows(["con", "prom", "b"]);
      processor.movingText = "";
      onComplete();
    });
  } else {
    // Add execution log for no operation
    const instructionName = getInstructionName(opcode);
    processor.executionLogs.push(`T4: [None] — ${instructionName}: No operation`);
    // Stop con glow for no-op case
    stopSpecificGlows(["con"]);
    onComplete();
  }
}

function handleT5(instruction: string, done: () => void) {
  const opcode = processor.opcode;

  const controlSignals = getControlWords(instruction, 5);
  console.log(`T5 Control Signals: ${controlSignals.join(', ')}`);

  // This code should never be reached for HLT instruction
  // as it should halt at T3, but keeping as a safety check
  if (opcode === "1111") {
    console.log("HLT instruction reached T5 (should have halted at T3)");
    processor.halted = true;
    stopSimulation();
    return;
  }

  if (opcode === "0001") {
    // For ADD, T5 performs the ALU operation
    const aVal = getComponentValue("a");
    const bVal = getComponentValue("b");
    const result = binaryAdd(aVal, bVal);

    // Add execution log for ADD with correct control signals
    const addControlSignals = ['LaEu'];
    const instructionName = getInstructionName(opcode);
    processor.executionLogs.push(`T5: [${addControlSignals.join(', ')}] — ${instructionName}: A (${aVal}) + B (${bVal}) = ${result}`);

    loopMultipleComponentGlows(["con", "a", "b", "alu"]);

    // Animate data flow from A and B to ALU
    processor.movingText = aVal;
    animateMovingText("moving-label", movePaths.aToAlu, aVal, () => {
      processor.movingText = bVal;
      animateMovingText("moving-label", movePaths.bToAlu, bVal, () => {
        // Animate result from ALU to A
        processor.movingText = result;
        animateMovingText("moving-label", movePaths.aluToA, result, () => {
          updateComponentValue("a", result);
          stopSpecificGlows(["con", "a", "b", "alu"]);
          processor.movingText = "";
          done();
        });
      });
    });
  } else if (opcode === "0010") {
    // For SUB, T5 performs the ALU operation
    const aVal = getComponentValue("a");
    const bVal = getComponentValue("b");
    const result = binarySub(aVal, bVal);

    // Add execution log for SUB with correct control signals
    const subControlSignals = ['LaSuEu'];
    const instructionName = getInstructionName(opcode);
    processor.executionLogs.push(`T5: [${subControlSignals.join(', ')}] — ${instructionName}: A (${aVal}) - B (${bVal}) = ${result}`);

    loopMultipleComponentGlows(["con", "a", "b", "alu"]);

    // Animate data flow from A and B to ALU
    processor.movingText = aVal;
    animateMovingText("moving-label", movePaths.aToAlu, aVal, () => {
      processor.movingText = bVal;
      animateMovingText("moving-label", movePaths.bToAlu, bVal, () => {
        // Animate result from ALU to A
        processor.movingText = result;
        animateMovingText("moving-label", movePaths.aluToA, result, () => {
          updateComponentValue("a", result);
          stopSpecificGlows(["con", "a", "b", "alu"]);
          processor.movingText = "";
          done();
        });
      });
    });
  } else {
    // Add execution log for other instructions
    const instructionName = getInstructionName(opcode);
    processor.executionLogs.push(`T5: [${controlSignals.join(', ')}] — ${instructionName}: Instruction cycle complete`);

    console.log("");
    loopMultipleComponentGlows(["con"]);

    setTimeout(() => {
      stopSpecificGlows(["con"]);
      done();
    }, 500);
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

// function binarySub(a: string, b: string): string {
//   const diff = parseInt(a, 2) - parseInt(b, 2);
//   return diff.toString(2).padStart(8, "0");
// }

function binarySub(a: string, b: string): string {
  // Wrap result to 8 bits like real hardware
  const diff = ((parseInt(a, 2) - parseInt(b, 2) + 256) % 256);
  return diff.toString(2).padStart(8, "0");
}


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

function updateComponentValue(id: string, value: string) {
  const comp = components.find((c) => c.id === id);
  if (comp) {
    if (id === 'out' || id === 'bd') {
      // For output register and binary display, show binary and decimal
      const decimalValue = parseInt(value || '0', 2);
      comp.value = `${value} (#${decimalValue})`;
    } else {
      comp.value = value;
    }
  }
}

function testMovePath() {
  const binary = processor.currentInstruction.toString(2).padStart(4, "0");
  console.log("");

  processor.movingText = binary;
  updateComponentValue("prom", binary);

  loopMultipleComponentGlows(["out"]);

  animateMovingText("moving-label", movePaths.promToB, binary, () => {
    updateComponentValue("out", binary);
    processor.movingText = "";
    stopSpecificGlows(["out"]);
  });
}

const simulationType = computed(() => processor.type);
const isPaused = computed(() => processor.isPaused);
const isRunning = computed(() => processor.isRunning);
const isHalted = computed(() => processor.halted);

defineExpose({
  loadProgramFromFile,
  runManualStep,
  runAuto,
  resetSimulation,
  togglePause,
  simulationType,
  isPaused,
  isRunning,
  isHalted,
  currentInstruction: computed(() => processor.currentInstruction),
  currentStep: computed(() => processor.currentStep),
  executionLogs: computed(() => processor.executionLogs),
  activeMemoryAddress: computed(() => processor.activeMemoryAddress),
});

</script>

<template>
  <div
    v-bind="$attrs"
    class="relative grid grid-cols-16 gap-px w-full h-full"
    style="grid-template-columns: repeat(16, 45px); grid-template-rows: repeat(16, 48px)"
  >

    <MovingLabel id="moving-label" :text="processor.movingText" />


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
          All instructions have been processed successfully.
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
