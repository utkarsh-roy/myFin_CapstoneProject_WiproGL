

const fs = require('fs').promises

const content = 'Node.js is awesome!'

async function run() {

    await fs.writeFile('feedback.txt', content)
    console.log('Data written successfully.')


    console.log('Reading file...')
    const data = await fs.readFile('feedback.txt', 'utf8')
    console.log(data)
}

run()
