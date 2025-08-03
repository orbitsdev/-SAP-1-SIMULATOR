<script setup lang="ts">
defineOptions({ inheritAttrs: false });
import { ref } from "vue";
import Box from "./Box.vue";
import Bus from "./Bus.vue";
import Arrow from "./Arrow.vue";
import MovingLabel from "./MovingLabel.vue";
import { arrows } from "@/lib/arrows";
import { components } from "@/lib/components";
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

  const instruction = program.value[processor.currentInstruction];

  if (!isValidInstruction(instruction)) {
    processor.invalidInstructionIndex = processor.currentInstruction;
    processor.showErrorModal = true;
    processor.halted = true;
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
      handleT3(instruction, () => {
        // Only proceed if not halted
        if (!processor.halted) {
          processor.currentStep++;
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
        else processor.currentStep++;
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

  stopAllComponentGlows();
  pauseMovingAnimation();
  components.forEach((c) => (c.value = ""));

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

  updateComponentValue("pc", pcValue);
  loopMultipleComponentGlows(["pc", "mar", ]);

  processor.movingText = pcValue;
  animateMovingText("moving-label", movePaths.pcToMar, pcValue, () => {
    updateComponentValue("mar", pcValue);
    stopSpecificGlows(["pc", "mar"]);
    processor.movingText = "";

    console.log("");

    onComplete();
  });
}

function handleT1(instruction: string, onComplete: () => void) {
  const instructionAtMar = program.value[processor.currentInstruction];

  const controlSignals = getControlWords(instruction, 1);
  console.log(`T1 Control Signals: ${controlSignals.join(', ')}`);

  updateComponentValue("prom", instructionAtMar);
  loopMultipleComponentGlows(["prom", "ir", ]);

  processor.movingText = instructionAtMar;
  animateMovingText("moving-label", movePaths.promToIr, instructionAtMar, () => {
    updateComponentValue("ir", instructionAtMar);
    stopSpecificGlows(["prom", "ir"]);
    processor.movingText = "";

    setInstruction(instructionAtMar);

    console.log("");
    onComplete();
  });
}


function handleT2(instruction: string, onComplete: () => void) {
  const controlSignals = getControlWords(instruction, 2);
  console.log(`T2 Control Signals: ${controlSignals.join(', ')}`);

  const newPcValue = (processor.currentInstruction + 1).toString(2).padStart(4, "0");
  updateComponentValue("pc", newPcValue);
  loopMultipleComponentGlows(["pc"]);

  // ⛔ Skip IR→MAR animation for HLT
  if (processor.opcode === "1111") {
    stopSpecificGlows(["pc", "ir", "mar"]);
    onComplete();
    return;
  }

  const operand = processor.operand;
  loopMultipleComponentGlows(["ir", "mar"]);
  processor.movingText = operand;

  animateMovingText("moving-label", movePaths.irToMar, operand, () => {
    updateComponentValue("mar", operand);
    stopSpecificGlows(["ir", "mar", "pc"]);
    processor.movingText = "";
    onComplete();
  });
}


function handleT3(instruction: string, onComplete: () => void) {
  const opcode = processor.opcode;
  const operand = processor.operand;

  const controlSignals = getControlWords(instruction, 3);
  console.log(`T3 Control Signals: ${controlSignals.join(', ')}`);

  // Check for HLT instruction first to prevent any animations
  if (opcode === "1111") {
    console.log("Halting simulation");
    processor.halted = true;

    // Stop any ongoing animations or glows
    stopAllComponentGlows();
    pauseMovingAnimation();
    processor.movingText = "";

    onComplete();
    return;
  }

  const fakeMemoryValue = memory[operand] || "00000000";

  let target = "";
  let path;

  if (opcode === "0000") {
    target = "a";
    path = movePaths.promToA;
  } else if (opcode === "0001" || opcode === "0010") {
    target = "b";
    path = movePaths.promToB;
  } else if (opcode === "1110") {
    const aValue = getComponentValue("a");
    loopMultipleComponentGlows(["a", "out", ]);
    processor.movingText = aValue;

    animateMovingText("moving-label", movePaths.aToOut, aValue, () => {
      updateComponentValue("out", aValue);
      updateComponentValue("bd", aValue);
      stopSpecificGlows(["a", "out"]);
      processor.movingText = "";
      console.log("");
      onComplete();
    });
    return;
  } else {
    console.log("T3 skipped (no data fetch required)");
    onComplete();
    return;
  }

  loopMultipleComponentGlows(["prom", target, ]);
  processor.movingText = fakeMemoryValue;

  animateMovingText("moving-label", path, fakeMemoryValue, () => {
    updateComponentValue(target, fakeMemoryValue);
    stopSpecificGlows(["prom", target]);
    processor.movingText = "";

    console.log(
      ``
    );
    onComplete();
  });
}

function handleT4(instruction: string, onComplete: () => void) {
  const opcode = processor.opcode;

  const controlSignals = getControlWords(instruction, 4);
  console.log(`T4 Control Signals: ${controlSignals.join(', ')}`);

  if (opcode === "0001") {
    const aVal = getComponentValue("a");
    const bVal = getComponentValue("b");
    const result = binaryAdd(aVal, bVal);

    loopMultipleComponentGlows(["b", ]);

    processor.movingText = bVal;
    animateMovingText("moving-label", movePaths.bToAlu, bVal, () => {
      stopSpecificGlows(["b"]);
      processor.movingText = "";

      animateHighlightAndGlow("alu");

      setTimeout(() => {
        loopMultipleComponentGlows(["a"]);
        processor.movingText = aVal;
        animateMovingText("moving-label", movePaths.aToAlu, aVal, () => {
          stopSpecificGlows(["a"]);
          processor.movingText = "";

          setTimeout(() => {
            processor.movingText = result;
            animateMovingText("moving-label", movePaths.aluToA, result, () => {
              stopSpecificGlows(["alu"]);
              updateComponentValue("a", result);
              animateHighlightAndGlow("a");
              processor.movingText = "";
              console.log("=");
              onComplete();
            });
          }, 400);
        });
      }, 300);
    });
  } else if (opcode === "0010") {
    const aVal = getComponentValue("a");
    const bVal = getComponentValue("b");
    const result = binarySub(aVal, bVal);

    loopMultipleComponentGlows(["b", ]);
    processor.movingText = bVal;
    animateMovingText("moving-label", movePaths.bToAlu, bVal, () => {
      stopSpecificGlows(["b"]);
      processor.movingText = "";

      animateHighlightAndGlow("alu");

      setTimeout(() => {
        loopMultipleComponentGlows(["a"]);
        processor.movingText = aVal;
        animateMovingText("moving-label", movePaths.aToAlu, aVal, () => {
          stopSpecificGlows(["a"]);
          processor.movingText = "";

          setTimeout(() => {
            processor.movingText = result;
            animateMovingText("moving-label", movePaths.aluToA, result, () => {
              stopSpecificGlows(["alu"]);
              updateComponentValue("a", result);
              animateHighlightAndGlow("a");
              processor.movingText = "";
              console.log("-");
              onComplete();
            });
          }, 400);
        });
      }, 300);
    });
  } else {
    onComplete();
  }
}

function handleT5(instruction: string, done: () => void) {
  const opcode = processor.opcode;

  const controlSignals = getControlWords(instruction, 5);
  console.log(`T5 Control Signals: ${controlSignals.join(', ')}`);

  if (opcode === "1111") {
    console.log("");
    processor.halted = true;
    stopSimulation();
    return;
  }

  console.log("");
  loopMultipleComponentGlows(["pc", "mar", ]);

  done();
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
  if (comp) comp.value = value;
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
  currentInstruction: computed(() => processor.currentInstruction)
});

</script>

<template>
  <div
    v-bind="$attrs"
    class="relative grid grid-cols-16 gap-px w-full h-full"
    style="grid-template-columns: repeat(16, 45px); grid-template-rows: repeat(16, 48px)"
  >
    <!-- <div
      class="absolute top-2 right-2 z-50 bg-white/90 px-4 py-2 rounded shadow text-sm font-mono"
    >
      <span class="text-gray-500">Now Running:</span>
      <span class="font-bold text-blue-700">{{ processor.instruction }}</span>
    </div> -->

    <!-- <div class="absolute top-2 left-2 z-50 flex flex-col gap-2 bg-white/80 p-3 rounded shadow">

     <button @click="testMovePath">Test Move Path</button>


    </div> -->

    <!--  -->
    <MovingLabel id="moving-label" :text="processor.movingText" />

    <!--  -->
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

    <!--  -->
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

    <!--  -->
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
