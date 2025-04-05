import React from "react"

const X = ({ value, onClick }) => {
  return (
    <div
      onClick={onClick}
      className='h-36 w-36 flex justify-center items-center text-4xl border border-white'
    >
      {value}
    </div>
  )
}

export default X
