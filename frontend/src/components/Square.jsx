import React from "react"

const X = ({ value, onClick }) => {
  return (
    <div
      onClick={onClick}
      className=' h-20 w-20 sm:h-36 sm:w-36 flex justify-center items-center text-4xl border border-white'
    >
      {value}
    </div>
  )
}

export default X
