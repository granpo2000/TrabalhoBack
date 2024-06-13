require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

app.use(express.json())

const User = require('./models/User')

app.get('/', (req, res) => {
    res.status(200).json({ msg: 'bem vindo' });
})

app.get("/user/:id", checktoken, async (req, res) => {
    const id = req.params.id
    const user = await User.findById(id, '-password')

    if(!User){
        return res.status(404).json({msg: 'Usuário não encontrado'})
    }
    res.status(200).json({ user })
})

function checktoken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(" ")[1]

    if(!token) {
        return res.status(401).json({msg: 'acesso negado'})
    }
    try {
        
const secret = process.env.SECRET
jwt.verify(token, secret)

next()


    } catch (error) {
        res.status(400).json({msg: 'token invalido'})
        
    }
}

app.post('/auth/register', async(req, res) => {

    const{name, email, password, confirmpassword} = req.body

    if(!name) {
        return res.status(422).json ({msg: 'o nome é obrigatório'})
    }

    if(!email) {
        return res.status(422).json ({msg: 'o email é obrigatório'})
    }
    if(!password) {
        return res.status(422).json ({msg: 'a senha é obrigatória'})
    }
    if(password !== confirmpassword) {
        return res.status(422).json ({msg: 'a senha não confere'})
    }

    const userExists = await User.findOne({ email: email})

    if(userExists){
        return res.status(422).json ({msg: 'utilize outro email'})
    }

    const salt = await bcrypt.genSalt(24)
    const passwordHash = await bcrypt.hash(password, salt)

    const user = new User({
        name,
        email,
        password: passwordHash,
    })
    try {
      await user.save()
      res.status(201).json ({msg: 'Usuário criado com sucesso'})
    } catch(error){
        console.log(error)
        res.status(500).json({msg: 'error',

        })
    }
})

app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body
    if(!email) {
        return res.status(422).json ({msg: 'o email é obrigatório'})
    }
    if(!password) {
        return res.status(422).json ({msg: 'a senha é obrigatória'})
}
const user = await User.findOne({ email: email})

    if(!user){
        return res.status(422).json ({msg: 'usuário não encontrado'})
    }

    const checkPassword = await bcrypt.compare(password, user.password)
    if(!checkPassword) {
        return res.status(422).json({msg: 'Senha inválida'})
    }
    try {
        const secret = process.env.SECRET
        const token = jwt.sign({
            id: user._id,
        }, 
        secret, 
    )

res.status(200).json({msg: 'Autenticação feita com sucesso', token})

    } catch (err) {
        console.log(error)
        res.status(500).json({msg: 'error',

        })
    }
})

const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;

const mongoUri = `mongodb+srv://${dbUser}:${dbPass}@trabalho.oits3q8.mongodb.net/?retryWrites=true&w=majority&appName=trabalho`;

mongoose
    .connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        app.listen(3000, () => {
            console.log('Servidor rodando na porta 3000 e conectado ao banco de dados');
        });
    })
    .catch((err) => console.log('Erro ao conectar ao banco de dados:', err));
