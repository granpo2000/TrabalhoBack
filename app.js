require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

app.use(express.json());

const User = require('./models/User');
const checkToken = require('./middlewares/checkToken');
const saleRoutes = require('./routes/saleRoutes');


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ msg: 'Algo deu errado!', error: err.message });
});

app.get('/', (req, res) => {
    res.status(200).json({ msg: 'Bem-vindo' });
});

app.get('/user/:id', checkToken, async (req, res, next) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id, '-password');

        if (!user) {
            return res.status(404).json({ msg: 'Usuário não encontrado' });
        }
        res.status(200).json({ user });
    } catch (error) {
        next(error);
    }
});

app.post('/auth/register', async (req, res, next) => {
    try {
        const { name, email, password, confirmpassword } = req.body;

        if (!name) {
            return res.status(422).json({ msg: 'O nome é obrigatório' });
        }

        if (!email) {
            return res.status(422).json({ msg: 'O email é obrigatório' });
        }

        if (!password) {
            return res.status(422).json({ msg: 'A senha é obrigatória' });
        }

        if (password !== confirmpassword) {
            return res.status(422).json({ msg: 'A senha não confere' });
        }

        const userExists = await User.findOne({ email: email });

        if (userExists) {
            return res.status(422).json({ msg: 'Utilize outro email' });
        }

        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(password, salt);

        const user = new User({
            name,
            email,
            password: passwordHash,
        });

        await user.save();
        res.status(201).json({ msg: 'Usuário criado com sucesso' });
    } catch (error) {
        next(error);
    }
});

app.post('/auth/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email) {
            return res.status(422).json({ msg: 'O email é obrigatório' });
        }

        if (!password) {
            return res.status(422).json({ msg: 'A senha é obrigatória' });
        }

        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(404).json({ msg: 'Usuário não encontrado' });
        }

        const checkPassword = await bcrypt.compare(password, user.password);

        if (!checkPassword) {
            return res.status(422).json({ msg: 'Senha inválida' });
        }

        const secret = process.env.SECRET;
        const token = jwt.sign(
            {
                id: user._id,
            },
            secret
        );

        res.status(200).json({ msg: 'Autenticação feita com sucesso', token });
    } catch (error) {
        next(error);
    }
});


app.use('/', saleRoutes);

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
