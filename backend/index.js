// server.js
const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const cors = require("cors")

const app = express()
app.use(cors())

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: "*", // your React app's URL
    methods: ["GET", "POST"],
  },
})

let players = 0

io.on("connection", (socket) => {
  console.log("User connected:", socket.id)

  // Assign player X or O
  if (players < 2) {
    players++
    const symbol = players === 1 ? "✖️" : "⭕"
    socket.emit("player-assigned", symbol)

    // Handle move
    socket.on("make-move", (data) => {
      socket.broadcast.emit("receive-move", data)
    })

    // Handle disconnect
    socket.on("disconnect", () => {
      players--
      socket.broadcast.emit("player-left")
    })
  } else {
    socket.emit("room-full")
    socket.disconnect()
  }
})

server.listen(3000, () => {
  console.log("Server running on port 3000")
})
