const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const port = process.env.PORT || 3000

const channels = {}

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

async function mockSend (socket) {
  const data = [
    { username: 'john21', message: 'Γειά σας κοπέλλια' },
    { username: 'emily', message: 'Hey john, ti kaneis?' },
    { username: 'giannis-me-to-nami', message: 'Gia sou re johnny, inta xaparka' },
    { username: 'annet8', message: 'This quarantine is never ending... :/ :/ It is so good to have you guys for a chat <3' },
    { username: 'john21', message: 'ναί, εν καλή φασή τούντο chat!' },
    { username: 'giannis-me-to-nami', message: 'Epethimisa na pame sto Treladiko na pioume ta ouzakia mas..' },
    { username: 'john21', message: 'ήντα ωραία που ήταν..' },
    { username: 'emily', message: 'ipomoni re guys, na perasi touth krisi kai ola tha ginoun.' },
    { username: 'annet8', message: 'Nai sigoura' },
    { username: 'Sally', message: 'Do you think coming here will help you not to be sad?' },
    { username: 'Harry', message: 'We were discussing you -- not me.' },
    { username: 'Sally', message: 'Does someone else believe I -- not you?' },
    { username: 'Harry', message: 'You\'re not really talking about me -- are you?' },
    { username: 'Sally', message: 'Do you sometimes wish you were not really talking about you -- are me?' },
    { username: 'Harry', message: 'Why do you think I -- are you?' },
    { username: 'Sally', message: 'Oh, I?' },
    { username: 'Harry', message: 'Do you say you for some special reason?' },
    { username: 'Sally', message: 'You\'re not really talking about me -- are you?' },
    { username: 'Harry', message: 'What makes you think I am not really talking about you -- are me?' },
  ]

  await new Promise((r) => setTimeout(() => r(), 1000))
  for (let i = 0; i < data.length; i++) {
    socket.emit('message', data[i])
    await new Promise((r) => setTimeout(() => r(), 1000 + Math.floor(Math.random() * 500)))
  }
}

io.on('connection', (socket) => {
  socket.on('join', ({ listingId, username }) => {
    if (!channels[listingId]) {
      channels[listingId] = []
    }

    socket.join(listingId)
    console.log('[%s] joined in %s', username, listingId)
    channels[listingId].push(username)
    socket.messageCount = 0
    socket.chId = listingId

    socket.on(listingId + ':message', (message) => {
      ++socket.messageCount
      if (socket.messageCount === 1) {
        socket.emit('achievement', { icon: 'icon-message', message: 'Achievement unlocked!\nCongrats on your first message!' })
      } else if (socket.messageCount === 10) {
        socket.emit('achievement', { icon: 'icon-message', message: 'Achievement unlocked!\n10 messages? Keep it up!' })
      } else if (socket.messageCount === 100) {
        socket.emit('achievement', { icon: 'icon-message', message: 'Achievement unlocked!\n100 messages! Unstoppable!' })
      }

      if (listingId === 'kafeneio-to-treladiko-130724' && !socket.mocks && message === 'hello') {
        socket.mocks = true
        mockSend(socket)
      }

      io.sockets
        .in(listingId)
        .emit('message', { username, message })
    })

    socket.on(listingId + ':username', (message) => {
      if (channels[listingId].includes(message)) {
        return
      }
      channels[listingId].splice(channels[listingId].indexOf(username), 1)
      username = message
      channels[listingId].push(username)

      socket.emit('username', username)
    })
  })

  socket.on('leave', () => {
    const i = channels[socket.chId].indexOf(socket.username)
    if (i !== -1) {
      channels[socket.chId].splice(i, 1)
    }

    socket.leaveAll()
  })
})

http.listen(port, () => console.log('Chat server listening on :' + port))
