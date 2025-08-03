# SAP-1 Simulator Documentation

## Overview

The SAP-1 (Simple As Possible - 1) Simulator is a web-based educational tool that simulates the operation of a basic 8-bit computer architecture. This simulator provides a visual representation of the SAP-1 computer's components and demonstrates how data flows between these components during program execution.

## Architecture Components

The SAP-1 architecture consists of the following components:

- **Program Counter (PC)**: Keeps track of the current instruction address
- **Memory Address Register (MAR)**: Holds the address for memory access
- **PROM (16x8)**: Represents the program memory with 16 addresses, each storing 8-bit instructions
- **Instruction Register (IR)**: Stores the current instruction being executed
- **Control Unit (CON)**: Controls the operation of all other components
- **A Register**: General-purpose register for storing data
- **B Register**: Secondary register used primarily for arithmetic operations
- **Arithmetic Logic Unit (ALU)**: Performs arithmetic operations (addition, subtraction)
- **Output Register**: Holds the output value
- **Binary Display**: Displays the final output in binary format

## File Structure

### Vue Components

#### SimulationSpace.vue
The main component that orchestrates the simulation of the SAP-1 computer. It manages the simulation state, controls the execution flow, and handles the visualization of data movement between components.

#### Box.vue
A reusable component that represents each hardware component in the SAP-1 architecture. It displays the component's title and current value, with animation effects when values change.

#### Arrow.vue
A component that visualizes data flow paths between components. It creates directional arrows with customizable properties like direction, thickness, and labels.

#### Bus.vue
Represents the data bus that connects various components in the architecture.

#### MovingLabel.vue
Visualizes data movement along the bus by displaying moving text that represents binary values.

#### UploadModal.vue
Provides an interface for uploading program files to the simulator.

### Library Files

#### animation.ts
Contains functions for visual animations in the simulator, including glowing effects for active components and animations for data movement.

#### arrows.ts
Defines the configuration for all arrows in the simulation, specifying their positions, directions, and labels.

#### components.ts
Defines the configuration for all SAP-1 components, including their positions, sizes, and initial values.

#### fakeMemory.ts
Provides predefined memory values for the simulation, representing the contents of the 16 memory addresses.

#### movePaths.ts
Defines the coordinate paths for data movement animations between components.

#### settings.ts
Contains global settings for the simulator, such as animation speed.

### Backend Files

#### web.php
Defines the routes for the application, including endpoints for program upload and loading.

#### ProgramUploadController.php
Handles the server-side logic for uploading and processing program files.

## Core Functionality

### Simulation Process

The SAP-1 simulator executes programs in a cycle of steps (T0-T5) that represent the fetch-decode-execute cycle:

1. **T0**: Transfer the Program Counter value to the Memory Address Register
2. **T1**: Fetch the instruction from memory into the Instruction Register
3. **T2**: Increment the Program Counter and transfer the operand to the Memory Address Register
4. **T3**: Fetch data from memory if required by the instruction
5. **T4**: Execute the instruction (arithmetic operations or data transfer)
6. **T5**: Complete the cycle and prepare for the next instruction

### Instruction Set

The SAP-1 simulator supports the following instructions:

- **0000**: Load value from memory to A Register (LDA)
- **0001**: Add value from memory to A Register (ADD)
- **0010**: Subtract value from memory from A Register (SUB)
- **1110**: Output value from A Register (OUT)
- **1111**: Halt the processor (HLT)

### Animation System

The simulator uses GSAP (GreenSock Animation Platform) for smooth animations that visualize:

1. Component highlighting when active
2. Data movement along the bus
3. Glowing effects to indicate active components

## Detailed Component Documentation

### SimulationSpace.vue

The central component that manages the entire simulation. It:

- Initializes the SAP-1 components and their connections
- Manages program loading and execution
- Controls the simulation flow (manual stepping, automatic execution)
- Handles error conditions and validation
- Orchestrates animations to visualize data flow

Key functions:
- `runManualStep()`: Executes a single step of the simulation
- `runAuto()`: Runs the simulation automatically
- `handleT0()` through `handleT5()`: Handle each phase of the instruction cycle
- `resetSimulation()`: Resets the simulation state

### animation.ts

Provides animation utilities for the simulator:

- `loopMultipleComponentGlows()`: Creates a pulsing glow effect for active components
- `stopSpecificGlows()` and `stopAllComponentGlows()`: Control component highlighting
- `animateMovingText()`: Animates text moving along a path to visualize data transfer
- `pauseMovingAnimation()` and `resumeMovingAnimation()`: Control animation playback
- `animateHighlightAndGlow()`: Creates a temporary highlight effect for components

### arrows.ts

Defines all the arrows that represent data paths in the simulator. Each arrow configuration includes:
- Source and destination coordinates
- Direction and label
- Visual properties like thickness and head size

### components.ts

Defines all the SAP-1 components with their:
- ID and display title
- Grid position and size
- Initial values

### fakeMemory.ts

Provides a simulated memory with predefined values:
- 16 memory locations (0000 to 1111 in binary)
- Each location contains an 8-bit value

### movePaths.ts

Defines the coordinate paths for data movement animations:
- `pcToMar`: Path from Program Counter to Memory Address Register
- `promToIr`: Path from PROM to Instruction Register
- And other paths between components

### Box.vue

A reusable component for displaying SAP-1 components with:
- Title and current value display
- Animation effects when values change
- Customizable highlighting

### Arrow.vue

Creates directional arrows with:
- Automatic direction calculation based on start and end points
- Customizable appearance (thickness, head size)
- Optional labels

## Program Execution Flow

1. **Program Loading**:
   - Programs are loaded as binary strings (8 bits per instruction)
   - Each instruction consists of a 4-bit opcode and a 4-bit operand

2. **Execution Cycle**:
   - The Program Counter points to the current instruction
   - The instruction is fetched from memory into the Instruction Register
   - The opcode determines the operation to perform
   - Data is moved between components as required by the instruction
   - The cycle repeats until a halt instruction is encountered or an error occurs

3. **Visualization**:
   - Active components glow to indicate their involvement
   - Data movement is shown with animated text moving along the bus
   - Component values update to show the current state of the simulation

## Backend Integration

The simulator integrates with a backend system for program storage and retrieval:

- `ProgramUploadController.php`: Handles program file uploads and validation
- Routes in `web.php` provide endpoints for program management

## Usage

The simulator can be used in two modes:

1. **Manual Mode**: Step through the execution cycle manually to observe each phase
2. **Automatic Mode**: Run the simulation automatically at the configured speed

Error handling is provided for invalid instructions or other issues that may arise during simulation.

## Conclusion

The SAP-1 Simulator provides an interactive, visual learning tool for understanding the basic principles of computer architecture. By simulating the fetch-decode-execute cycle with animated data flow, it helps users understand how a simple computer processes instructions and data.
