import React, { useState } from "react"
import Board from "./components/Board"
import Waiting from "./components/Waiting"

const App = () => {
  const [isLoading, setIsLoading] = useState(false)
  return (
    <div className='main min-h-screen bg-slate-800  text-white flex flex-col items-center'>
      <h1 className='text-4xl font-bold  p-5'> Tic Tac Toe</h1>
      {isLoading ? <Waiting /> : <Board />}
    </div>
  )
}

export default App
