// Challenge 3: Creating a Simple Node Application

const moment = require('moment')

// Accept name from command line using process.argv
const name = process.argv[2]

if (!name) {
    console.log('Usage: node greet.js [Name]')
    process.exit(1)
}

// Bonus: Format date/time using moment package
const dateTime = moment().format('ddd MMM D YYYY, hh:mm A')

// Display greeting
console.log(`Hello, ${name}! Today is ${dateTime}.`)
