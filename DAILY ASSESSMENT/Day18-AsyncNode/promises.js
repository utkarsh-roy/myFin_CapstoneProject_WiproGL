const fs = require('fs').promises

fs.readFile('input.txt', 'utf8')
    .then((data) => {
        return fs.writeFile('output.txt', data)
    })
    .then(() => {
        console.log('File copied successfully!')
    })
    .catch((err) => {
        console.error(err)
    })
