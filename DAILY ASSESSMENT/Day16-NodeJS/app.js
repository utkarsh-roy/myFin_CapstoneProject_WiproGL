// Challenge 2: Understanding npm
// Uses chalk and figlet to display a colorful stylized banner

const chalk = require('chalk')
const figlet = require('figlet')

figlet('Welcome to Node.js', (err, data) => {
    if (err) {
        console.log('Something went wrong...')
        return
    }
    console.log(chalk.blue(data))
})
