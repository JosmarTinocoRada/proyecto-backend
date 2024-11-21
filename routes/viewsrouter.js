const express = require('express');
const router = express.Router();
const Product = require('../views/modelos/cart'); // Asumiendo modelo de productos
const Cart = require('../views/modelos/products'); // Asumiendo modelo de carrito

let products = require('./products').products;

let io; 


const initSocket = (socketIO) => {
    io = socketIO;
};

router.get('/', (req, res) => {
    res.render('home', { products, title: 'Home', message: 'Bienvenido a la página principal'});
});


router.get('/products', (req, res) => {
    res.render('realTimeProducts', { products, title: 'Productos en Tiempo Real' });
});

router.get('/products', async (req, res) => {
    const products = await Product.find({});
    res.render('products', { products });
});

router.get('/cart', async (req, res) => {
    const cart = await Cart.findOne({}).populate('items.product');
    res.render('cart', { cart });
});

const emitProductEvents = (event, product) => {
    if (io) {
        io.emit(event, product);
    }
};

// Exportar el router y la función initSocket
module.exports = { router, initSocket };
