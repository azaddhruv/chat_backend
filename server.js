const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const translate = require('google-translate-api-x')
const cors = require('cors')

const app = express()
const server = http.createServer(app)
const io = require('socket.io')(server, {
  cors: {
    origin: 'http://localhost:8081',
    methods: ['GET', 'POST'],
  },
})
app.use(cors())

const PORT = 3000

app.use(express.static('public'))

io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  socket.on('translate', async (data) => {
    console.log('Translation request received:', data)

    try {
      if (!data.text || !data.from || !data.to) {
        throw new Error('Invalid data: Missing text, from, or to field')
      }

      const translation = await translate(data.text, {
        from: data.from,
        to: data.to,
      })

      socket.emit('translation', {
        success: true,
        translation: translation.text,
      })
    } catch (error) {
      console.error('Translation error:', error.message)

      socket.emit('translation', { success: false, error: error.message })
    }
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
