// Challenge 1: Node.js Fundamentals

// 1. Node.js version
console.log('Node.js Version:', process.version)

// 2. Current file name and directory
console.log('File Name:', __filename)
console.log('Directory:', __dirname)

// 3. Welcome message every 3 seconds using setInterval
const interval = setInterval(() => {
    console.log('Welcome to Node.js!')
}, 3000)

// Bonus: Stop after 10 seconds using clearInterval
setTimeout(() => {
    clearInterval(interval)
    console.log('Timer stopped after 10 seconds.')
}, 10000)
