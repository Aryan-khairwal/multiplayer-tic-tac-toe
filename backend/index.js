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
    origin: "*",
    methods: ["GET", "POST"],
  },
})

// Keep track of rooms and their players
const rooms = {}

function generateRoomID() {
  return Math.random().toString(36).substr(2, 6)
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id)

  // Create room
  socket.on("create-room", () => {
    const roomID = generateRoomID()
    rooms[roomID] = [socket.id]
    socket.join(roomID)
    socket.emit("room-created", roomID)
    console.log(`Room ${roomID} created by ${socket.id}`)
  })

  // Join room
  socket.on("join-room", (roomID) => {
    if (rooms[roomID] && rooms[roomID].length === 1) {
      rooms[roomID].push(socket.id)
      socket.join(roomID)
      console.log(`${socket.id} joined room ${roomID}`)

      // Assign symbols
      const [playerX, playerO] = rooms[roomID]
      io.to(playerX).emit("player-assigned", "✖️")
      io.to(playerO).emit("player-assigned", "⭕")

      io.to(roomID).emit("start-game", roomID)
    } else {
      socket.emit("room-error", "Room not found or full")
    }
  })

  // Handle moves
  socket.on("make-move", ({ roomID, data }) => {
    socket.to(roomID).emit("receive-move", data)
  })

  // Handle disconnects
  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id)

    for (const roomID in rooms) {
      const players = rooms[roomID]
      if (players.includes(socket.id)) {
        // Remove from room
        rooms[roomID] = players.filter((id) => id !== socket.id)

        // Notify the remaining player
        socket.to(roomID).emit("player-left")

        // Clean up empty rooms
        if (rooms[roomID].length === 0) {
          delete rooms[roomID]
        }
        break
      }
    }
  })
})

server.listen(3000, () => {
  console.log("Server running on port 3000")
})
