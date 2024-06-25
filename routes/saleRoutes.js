const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const checkToken = require('../middlewares/checkToken');


router.post('/sales', checkToken, async (req, res) => {
    const { product, quantity, price } = req.body;
    const userId = req.userId;

    if (!product || !quantity || !price) {
        return res.status(422).json({ msg: 'Todos os campos são obrigatórios' });
    }

    const sale = new Sale({
        product,
        quantity,
        price,
        userId
    });

    try {
        await sale.save();
        res.status(201).json({ msg: 'Venda registrada com sucesso', sale });
    } catch (error) {
        res.status(500).json({ msg: 'Erro ao registrar venda', error });
    }
});


router.get('/sales', checkToken, async (req, res) => {
    const userId = req.userId;

    try {
        const sales = await Sale.find({ userId: userId });
        res.status(200).json({ sales });
    } catch (error) {
        res.status(500).json({ msg: 'Erro ao buscar vendas', error });
    }
});


router.put('/sales/:id', checkToken, async (req, res) => {
    const { id } = req.params;
    const { product, quantity, price } = req.body;
    const userId = req.userId;

    try {
        const sale = await Sale.findOne({ _id: id, userId: userId });

        if (!sale) {
            return res.status(404).json({ msg: 'Venda não encontrada' });
        }

        if (product) sale.product = product;
        if (quantity) sale.quantity = quantity;
        if (price) sale.price = price;

        await sale.save();
        res.status(200).json({ msg: 'Venda atualizada com sucesso', sale });
    } catch (error) {
        res.status(500).json({ msg: 'Erro ao atualizar venda', error });
    }
});


router.delete('/sales/:id', checkToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;

    try {
        const sale = await Sale.findOne({ _id: id, userId: userId });

        if (!sale) {
            return res.status(404).json({ msg: 'Venda não encontrada' });
        }

        await Sale.deleteOne({ _id: id, userId: userId });
        res.status(200).json({ msg: 'Venda deletada com sucesso' });
    } catch (error) {
        res.status(500).json({ msg: 'Erro ao deletar venda', error });
    }
});

module.exports = router;
