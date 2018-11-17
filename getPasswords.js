const fs = require('fs')

const stripepassword = process.env.STRIPE_PUBLIC_KEY
const githubusername = process.env.GITHUB_USERNAME
const githubpassword = process.env.GITHUB_PASSWORD

const passwordfile = `
const STRIPE_PUBLIC_KEY =  \`` + stripepassword + `\`
const GITHUB_USERNAME = \`` + githubusername + `\`
const GITHUB_PASSWORD = \`` + githubpassword + `\`
` + "\nmodule.exports={STRIPE_PUBLIC_KEY,GITHUB_USERNAME,GITHUB_PASSWORD}"
fs.writeFileSync('./src/PUBLIC_KEY.js',passwordfile)