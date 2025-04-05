// import React, { useState, useReducer } from "react"
// import Square from "./Square"

// const Board = () => {
//   const [state, setState] = useState(Array(9).fill(null))
//   const [xTurn, setXTurn] = useState(true)
//   const checkWinner = () => {
//     const winnerLogics = [
//       [0, 1, 2],
//       [3, 4, 5],
//       [6, 7, 8],
//       [0, 3, 6],
//       [1, 4, 7],
//       [2, 5, 8],
//       [0, 4, 8],
//       [2, 4, 6],
//     ]
//     for (let logic of winnerLogics) {
//       const [a, b, c] = logic
//       if (state[a] !== null && state[a] === state[b] && state[b] === state[c]) {
//         return state[a]
//       }
//     }

//     return null
//   }

//   const handleClick = (index) => {
//     const copyState = [...state]
//     copyState[index] = xTurn ? "✖️" : "⭕"
//     setState(copyState)
//     setXTurn((prev) => !prev)
//   }

//   const playAgain = () => {
//     setState(Array(9).fill(null))
//   }

//   const isWinner = checkWinner()
//   return (
//     <div className='flex flex-col'>
//       {isWinner ? (
//         <>
//           <h1 className='text-3xl'>{isWinner} has Won</h1>
//           <button
//             className='bg-slate-900 border border-white rounded-lg p-3 m-8'
//             onClick={playAgain}
//           >
//             Play Again!
//           </button>
//         </>
//       ) : (
//         <>
//           <div className='row flex'>
//             <Square value={state[0]} onClick={() => handleClick(0)} />
//             <Square value={state[1]} onClick={() => handleClick(1)} />
//             <Square value={state[2]} onClick={() => handleClick(2)} />
//           </div>
//           <div className='row flex'>
//             <Square value={state[3]} onClick={() => handleClick(3)} />
//             <Square value={state[4]} onClick={() => handleClick(4)} />
//             <Square value={state[5]} onClick={() => handleClick(5)} />
//           </div>
//           <div className='row flex'>
//             <Square value={state[6]} onClick={() => handleClick(6)} />
//             <Square value={state[7]} onClick={() => handleClick(7)} />
//             <Square value={state[8]} onClick={() => handleClick(8)} />
//           </div>
//         </>
//       )}
//     </div>
//   )
// }

// export default Board

import React, { useState, useEffect, useMemo } from "react"
import Square from "./Square"
import { io } from "socket.io-client"

const Board = () => {
  const socket = useMemo(
    () => io("https://multiplayer-tic-tac-toe-8ypq.onrender.com"),
    []
  )
  const [state, setState] = useState(Array(9).fill(null))
  const [xTurn, setXTurn] = useState(true)
  const [mySymbol, setMySymbol] = useState(null)
  const [isMyTurn, setIsMyTurn] = useState(false)

  useEffect(() => {
    socket.on("player-assigned", (symbol) => {
      setMySymbol(symbol)
      setIsMyTurn(symbol === "✖️")
    })

    socket.on("receive-move", ({ index, symbol }) => {
      updateState(index, symbol)
      setIsMyTurn(true)
    })

    socket.on("player-left", () => {
      alert("Other player left the game.")
      window.location.reload()
    })

    socket.on("room-full", () => {
      alert("Room is full.")
    })

    return () => {
      socket.off()
    }
  }, [])

  const updateState = (index, symbol) => {
    setState((prev) => {
      const copy = [...prev]
      copy[index] = symbol
      return copy
    })
  }

  const handleClick = (index) => {
    if (!isMyTurn || state[index] !== null) return
    updateState(index, mySymbol)
    socket.emit("make-move", { index, symbol: mySymbol })
    setIsMyTurn(false)
  }

  const checkWinner = () => {
    const winnerLogics = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ]
    for (let logic of winnerLogics) {
      const [a, b, c] = logic
      if (state[a] && state[a] === state[b] && state[b] === state[c]) {
        return state[a]
      }
    }
    return null
  }

  const playAgain = () => {
    setState(Array(9).fill(null))
    setIsMyTurn(mySymbol === "✖️")
  }

  const winner = checkWinner()

  return (
    <div className='flex flex-col'>
      {winner ? (
        <>
          <h1 className='text-3xl'>{winner} has won!</h1>
          <button
            className='bg-slate-900 border border-white rounded-lg p-3 m-8'
            onClick={playAgain}
          >
            Play Again!
          </button>
        </>
      ) : (
        <>
          <h2 className='text-xl mb-4'>You are {mySymbol}</h2>
          <div className='grid grid-cols-3 gap-2'>
            {state.map((val, idx) => (
              <Square key={idx} value={val} onClick={() => handleClick(idx)} />
            ))}
          </div>
          {!isMyTurn && (
            <p className='mt-4 text-gray-500'>Waiting for opponent...</p>
          )}
        </>
      )}
    </div>
  )
}

export default Board
