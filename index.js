// import http from 'http'
// import * as obj from './feature.js'
// import fs from 'fs'

// const home = fs.readFileSync('./index.html')


// // const http = require('http');
// // const gfname = require('./feature');

// console.log(obj.default)
// console.log(obj.func())

// const app = http.createServer((req, res) => {

//     console.log(req.method)

//     if(req.url === '/'){
//         res.end(`<h1>LOVE IS ${obj.func()}</h1>`)
//     }
//     else if(req.url === '/about'){
//         res.end(home)
//     }
//     else if(req.url === '/contact'){
//         res.end('<h1>Contact</h1>')
//     }
//     else{
//         res.end('<h1>Page Not Found</h1>')
//     }
// })

// app.listen(2000, () => {
//     console.log('Server is Working')
// })

//////EXPRESS//////

import { render } from 'ejs'
import express from 'express'
import path from 'path'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

mongoose
    .connect('mongodb://127.0.0.1:27017')
    .then(() => console.log('Database Connected'))
    .catch((e) => console.log(e))

// const messageSchema = new mongoose.Schema({
//     name: String,
//     email: String,
// })

// const Msg = mongoose.model('Message', messageSchema)

const userSchema = mongoose.Schema({
    name: String,
    email: String,
    password: String,
})

const User = mongoose.model('Users', userSchema)

const app = express()

// const userdata = []

// Using MiddleWare
app.use(express.static(path.join(path.resolve(), 'public')))
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())

// Setting Up View Engine
app.set('view engine', 'ejs')

const isAuthenticated = async (req, res, next) => {
    const {token} = req.cookies
    if(token){
        const decoded = jwt.verify(token, 'abcde')
        console.log(decoded)
        req.user = await User.findById(decoded._id)
        next()
    }
    else res.render('login')
}

app.get('/', isAuthenticated, (req, res) => {
    // res.render('index', {name: 'Ghaziabad'})
    // console.log(req.cookies)
    // const {token} = req.cookies
    // if(token) res.render('logout')
    // else res.render('login')
    console.log(req.user)
    res.render('logout')
})

app.get('/register', (req, res) => {
    res.render('register')
})

app.post('/login', async(req, res) => {
    const {email, password} = req.body

    const check = await User.findOne({email})
    console.log(check)

    if(!check){
        return res.redirect('/register')
    }
    const match = await bcrypt.compare(password, check.password)
    if(!match){
        return res.render('login', {email: email, message: 'Invalid Credentials'})
        // return res.redirect('/')
    }

    
    const token = jwt.sign({_id: check._id}, 'abcde')

    res.cookie('token', token, {
        httpOnly: true,
        expires: new Date(Date.now() + 60000),
    })

    res.render('logout', {name: check.name})
})

app.post('/register', async (req, res) => {
    // res.cookie('Place', 'Naughty Ghaziabad',{
    //     httpOnly: true,
    //     expires: new Date(Date.now() + 60000)
    // })
    const {name, email, password} = req.body

    let person = await User.findOne({email})
    if(person){
        if(person.name === name && person.email === email) {
            return res.render('register', {msg: 'Account already exists.'})
            // return res.redirect('/')
        }
    }

    const hashPassword = await bcrypt.hash(password, 10)

    const user = await User.create({name, email, password: hashPassword})

    // const token = jwt.sign({_id: user._id}, 'abcde')
    // // console.log(token)

    // res.cookie('token', token, {
    //     httpOnly: true,
    //     expires: new Date(Date.now() + 60000)
    // })
    
    // res.render('logout', {name: user.name})
    // res.render('logout')
    res.render('register', {msg: 'New Account Created!'})
})

app.get('/logout', (req, res) => {
    res.cookie('token', null,{
        httpOnly: true,
        expires: new Date(Date.now())
    })
    res.redirect('/')
})

// app.post('/contact', async (req, res) => {
//     // console.log(req.body)
//     // userdata.push({userName: req.body.name, userEmail: req.body.email})
//     const {name, email} = req.body
//     await Msg.create({name, email})

//     res.redirect('/success')
// })

// app.get('/success', (req, res) => {
//     res.render('success')
// })

// app.get('/users', (req, res) => {
//     res.json({
//         userdata,
//     })
// })

// app.get('/add', async (req, res) => {

//     await Msg.create({name: 'abc', email: 'abc@gmail.com'})
//     res.send('Nice')
// })

app.listen(2000, () => {
    console.log('Server is Working!')
})