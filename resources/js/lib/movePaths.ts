export const ldaPaths = {
    moveFromPcToMar: [
      { x: 109, y: 107 },
      { x: 109, y: 73 },
      { x: 316, y: 73 },
      { x: 316, y: 215 },
      { x: 109, y: 215 },
      { x: 109, y: 225 }
    ],

    moveFromPromToIr: [
      { x: 109, y: 365 },
      { x: 316, y: 365 },
      { x: 316, y: 497 },
      { x: 109, y: 497 },
      { x: 109, y: 510 },
    ],

  moveFromIrToMar: [
    { x: 109, y: 530 },
    { x: 109, y: 559 },
    { x: 316, y: 559 },
    { x: 316, y: 215 },
    { x: 109, y: 215 },
    { x: 109, y: 225 }
  ],

  moveFromPromToA: [
    { x: 109, y: 365 },   // PROM output
    { x: 316, y: 365 },
    { x: 316, y: 54 },    // A Register row
    { x: 525, y: 54 },
    { x: 525, y: 90 }
  ],



  }
  export const addPaths = {
    moveFromPcToMar: [
      { x: 109, y: 107 },
      { x: 109, y: 73 },
      { x: 316, y: 73 },
      { x: 316, y: 215 },
      { x: 109, y: 215 },
      { x: 109, y: 225 }
    ],
    moveFromPromToIr: [
      { x: 109, y: 365 },
      { x: 316, y: 365 },
      { x: 316, y: 497 },
      { x: 109, y: 497 },
      { x: 109, y: 510 }
    ],
    moveFromIrToMar: [
      { x: 109, y: 530 },
      { x: 109, y: 559 },
      { x: 316, y: 559 },
      { x: 316, y: 215 },
      { x: 109, y: 215 },
      { x: 109, y: 225 }
    ],
    moveFromPromToB: [
      { x: 109, y: 365 },
      { x: 316, y: 365 },
      { x: 525, y: 365 },
      { x: 525, y: 380 }
    ],
    moveFromBToAlu: [
      { x: 525, y: 375 },

      { x: 525, y: 215 },



    ],
    moveFromAToAlu: [
      { x: 525, y: 90 },
      { x: 525, y: 225 },
      { x: 525, y: 230 },


    ],
    moveFromAluToA: [
      { x: 610, y: 280 },
      { x: 610, y: 90 },
      { x: 525, y: 90 }
    ]
  }


  export const subPaths = {
    moveFromBToAlu: [
      { x: 316, y: 559 },
      { x: 316, y: 215 },
      { x: 109, y: 215 },
      { x: 109, y: 225 }
    ],

    moveFromAToAlu: [
      { x: 109, y: 530 },
      { x: 109, y: 559 },
      { x: 316, y: 559 },
      { x: 316, y: 215 },
      { x: 109, y: 215 },
      { x: 109, y: 225 }
    ],

    moveFromAluToA: [
      { x: 109, y: 530 },
      { x: 109, y: 559 },
      { x: 316, y: 559 },
      { x: 316, y: 215 },
      { x: 109, y: 215 },
      { x: 109, y: 225 }
    ]
  }

  export const outPaths = {
    moveFromAToOut: [
      { x: 109, y: 530 },
      { x: 109, y: 559 },
      { x: 316, y: 559 },
      { x: 316, y: 215 },
      { x: 109, y: 215 },
      { x: 109, y: 225 }
    ]
  }

  export const hltPaths = {
    moveFromAToOut: [
      { x: 109, y: 530 },
      { x: 109, y: 559 },
      { x: 316, y: 559 },
      { x: 316, y: 215 },
      { x: 109, y: 215 },
      { x: 109, y: 225 }
    ]
  }
