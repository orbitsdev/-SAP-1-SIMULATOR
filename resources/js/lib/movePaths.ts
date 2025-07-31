const busX = 316;

export const movePaths = {
   pcToMar: [
      { x: 109, y: 107 },
      { x: 109, y: 73 },
      { x: busX, y: 73 },
      { x: busX, y: 215 },
      { x: 109, y: 215 },
      { x: 109, y: 225 }
    ],

    promToIr: [
      { x: 109, y: 365 },
      { x: busX, y: 365 },
      { x: busX, y: 497 },
      { x: 109, y: 497 },
      { x: 109, y: 510 }
    ],

    irToMar: [
      { x: 109, y: 530 },
      { x: 109, y: 559 },
      { x: busX, y: 559 },
      { x: busX, y: 215 },
      { x: 109, y: 215 },
      { x: 109, y: 225 }
    ],

    promToA: [
    { x: 109, y: 365 },
    { x: busX, y: 365 },
    { x: busX, y: 54 },
    { x: 525, y: 54 },
    { x: 525, y: 90 }
  ],

  promToB: [
      { x: 109, y: 365 },
      { x: 525, y: 365 },
      { x: 525, y: 380 }
    ],

      bToAlu: [
      { x: 525, y: 395 },
      { x: 525, y: 225 },
      { x: 525, y: 235 }
    ],
     aToAlu: [
      { x: 525, y: 90 },
      { x: 525, y: 225 },
      { x: 525, y: 230 },


    ],

    aluToA: [

        { x: 525, y: 215 },
        { x: busX, y: 215 },
        { x: busX, y: 54 },
        { x: 525, y: 54 },
        { x: 525, y: 90 },

    ],
    aToOut: [
      { x: 525, y: 90 },
      { x: busX, y: 90 },
      { x: busX, y: 509 },
      { x: 525, y: 509 },




    ],
    outToBd:[
        { x: 525, y: 509 },
        { x: 525, y: 525 },
    ]


}
