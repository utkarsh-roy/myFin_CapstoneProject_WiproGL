

const EventEmitter = require('events')

const emitter = new EventEmitter()


emitter.on('userLoggedIn', (name) => {
    console.log(`User ${name} logged in.`)
})

emitter.on('userLoggedOut', (name) => {
    console.log(`User ${name} logged out.`)
})


emitter.on('sessionExpired', (name) => {
    console.log(`Session for ${name} has expired.`)
})


emitter.emit('userLoggedIn', 'John')
emitter.emit('userLoggedOut', 'John')


setTimeout(() => {
    emitter.emit('sessionExpired', 'John')
}, 5000)
