const fs = require('fs')

fs.readFile('data.txt', 'utf8', (err, data) => {
    if (err) {
        console.error(err)
        return
    }
    console.log(data)
    setTimeout(() => {
        console.log('Read operation completed')
    }, 1000)
})
