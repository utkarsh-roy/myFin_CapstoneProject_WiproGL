const fs = require('fs').promises

async function copyFile() {
    try {
        const data = await fs.readFile('input.txt', 'utf8')
        await new Promise((res) => setTimeout(res, 1000))
        await fs.writeFile('output.txt', data)
        console.log('File copied successfully!')
    } catch (err) {
        console.error(err)
    }
}

copyFile()
