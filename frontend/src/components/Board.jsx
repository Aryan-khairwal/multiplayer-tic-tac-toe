import React, { useState, useEffect, useMemo } from "react"
import Square from "./Square"
import { io } from "socket.io-client"

const Board = () => {
  const socket = useMemo(
    () => io("https://multiplayer-tic-tac-toe-8ypq.onrender.com"),
    []
  )
  const [state, setState] = useState(Array(9).fill(null))
  const [roomID, setRoomID] = useState("")
  const [joinedRoom, setJoinedRoom] = useState(false)
  const [mySymbol, setMySymbol] = useState(null)
  const [isMyTurn, setIsMyTurn] = useState(false)
  const [inputRoomID, setInputRoomID] = useState("")

  useEffect(() => {
    socket.on("room-created", (room) => {
      setRoomID(room)
      setJoinedRoom(true)
    })

    socket.on("start-game", (room) => {
      setRoomID(room)
      setJoinedRoom(true)
    })

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

    socket.on("room-error", (msg) => {
      alert(msg)
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
    if (!isMyTurn || state[index] !== null || !joinedRoom) return
    updateState(index, mySymbol)
    socket.emit("make-move", { roomID, data: { index, symbol: mySymbol } })
    setIsMyTurn(false)
  }

  const createRoom = () => {
    socket.emit("create-room")
  }

  const joinRoom = () => {
    if (inputRoomID.trim()) {
      socket.emit("join-room", inputRoomID.trim())
    }
  }

  const playAgain = () => {
    setState(Array(9).fill(null))
    setIsMyTurn(mySymbol === "✖️")
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

  const checkDraw = () => state.every((cell) => cell !== null)

  const winner = checkWinner()
  const draw = checkDraw()

  if (!joinedRoom) {
    return (
      <div className='flex flex-col items-center gap-4 mt-10'>
        <button
          onClick={createRoom}
          className='bg-green-600 text-white px-6 py-2 rounded-lg'
        >
          Create Room
        </button>
        <div className='flex items-center gap-2 justify-evenly'>
          <input
            type='text'
            placeholder='Enter Room ID'
            value={inputRoomID}
            onChange={(e) => setInputRoomID(e.target.value)}
            className='border w-1/2 text-gray-800 px-4 py-2 rounded mx-2'
          />
          <button
            onClick={joinRoom}
            className='bg-blue-600 text-white px-6 py-2 rounded-lg'
          >
            Join Room
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='flex flex-col-reverse justify-evenly sm:w-3/4 sm:flex-row-reverse'>
      <div className='flex flex-col'>
        <div className='flex justify-between mb-2'>
          <span className='text-xl'>You are {mySymbol}</span>
          {isMyTurn && <span className='text-xl text-gray-500'>Your Turn</span>}
        </div>
        <div className='grid grid-cols-3 gap-2'>
          {state.map((val, idx) => (
            <Square key={idx} value={val} onClick={() => handleClick(idx)} />
          ))}
        </div>
      </div>
      <div className='flex flex-col items-center justify-center'>
        <p className='mt-4 text-sm text-gray-500'>Room ID: {roomID}</p>

        {draw && (
          <>
            <h1 className='text-3xl text-center'>Game Draw</h1>
            <button
              className='bg-slate-900 border border-white rounded-lg p-3 m-8'
              onClick={playAgain}
            >
              Play Again
            </button>
          </>
        )}
        {winner && (
          <>
            <h1 className='text-3xl'>{winner} Won!</h1>
            <button
              className='bg-slate-900 border border-white rounded-lg p-3 m-8'
              onClick={playAgain}
            >
              Play Again
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default Board
