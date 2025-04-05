import React from "react"
import loading from "../assets/balls.gif"

const Waiting = () => {
  return (
    <div className='flex flex-col items-center'>
      <img className='w-20' src={loading} alt='Loading....' />
      <h3>Waiting for another player to join...</h3>
    </div>
  )
}

export default Waiting
