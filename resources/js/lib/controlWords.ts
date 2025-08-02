export type ControlStep = {
    glow: string[]
    move: string | string[] | null
    update: { componentId: string, value: 'fromOperand' | 'fromMemory' | 'pc+1' | string } | null
    note?: string
    halt?: boolean
  }

export const fetchSteps: Record<number, ControlStep> = {
    0: {
      glow: ['pc', 'mar'],
      move: 'pcToMar',
      update: { componentId: 'mar', value: 'pc' },
      note: 'T0: PC → MAR'
    },
    1: {
      glow: ['mar', 'ir'],
      move: 'promToIr',
      update: { componentId: 'ir', value: 'memory[mar]' },
      note: 'T1: PROM[MAR] → IR'
    },
    2: {
      glow: ['pc'],
      move: null,
      update: { componentId: 'pc', value: 'pc+1' },
      note: 'T2: PC increment'
    }
  }


  export const executeSteps: Record<string, Record<number, ControlStep>> = {
    LDA: {
      3: {
        glow: ['ir', 'mar'],
        move: 'irToMar',
        update: { componentId: 'mar', value: 'fromOperand' },
        note: 'T3: IR operand → MAR'
      },
      4: {
        glow: ['mar', 'a'],
        move: 'promToA',
        update: { componentId: 'a', value: 'memory[mar]' },
        note: 'T4: Load PROM[MAR] → A'
      },
      5: {
        glow: [],
        move: null,
        update: null,
        note: 'T5: No operation'
      }
    },
    ADD: {
      3: {
        glow: ['ir', 'mar'],
        move: 'irToMar',
        update: { componentId: 'mar', value: 'fromOperand' },
        note: 'T3: IR operand → MAR'
      },
      4: {
        glow: ['mar', 'b'],
        move: 'promToB',
        update: { componentId: 'b', value: 'memory[mar]' },
        note: 'T4: Load PROM[MAR] → B'
      },
      5: {
        glow: ['a', 'b', 'alu'],
        move: ['aToAlu', 'bToAlu', 'aluToA'],
        update: { componentId: 'a', value: 'a + b' },
        note: 'T5: A ← A + B'
      }
    },
    SUB: {
      3: {
        glow: ['ir', 'mar'],
        move: 'irToMar',
        update: { componentId: 'mar', value: 'fromOperand' },
        note: 'T3: IR operand → MAR'
      },
      4: {
        glow: ['mar', 'b'],
        move: 'promToB',
        update: { componentId: 'b', value: 'memory[mar]' },
        note: 'T4: Load PROM[MAR] → B'
      },
      5: {
        glow: ['a', 'b', 'alu'],
        move: ['aToAlu', 'bToAlu', 'aluToA'],
        update: { componentId: 'a', value: 'a - b' },
        note: 'T5: A ← A - B'
      }
    },
    OUT: {
      3: {
        glow: ['a', 'out'],
        move: 'aToOut',
        update: { componentId: 'out', value: 'a' },
        note: 'T3: OUT ← A'
      },
      4: { glow: [], move: null, update: null },
      5: { glow: [], move: null, update: null }
    },
    HLT: {
      3: {
        glow: ['ir'],
        move: null,
        update: null,
        note: 'T3: Halt signal',
        halt: true
      },
      4: { glow: [], move: null, update: null },
      5: { glow: [], move: null, update: null }
    }
  }
