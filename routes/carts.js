const express = require('express');
const { isAuthenticated, isUser } = require('../utils/authentication');
const router = express.Router();
const PurchaseService = require('../services/purchase.service');

let carts = [];

const generateId = () => {
    return carts.length > 0 ? carts[carts.length - 1].id + 1 : 1;
};


router.post('/', (req, res) => {
    const newCart = {
        id: generateId(),
        products: []
    };

    carts.push(newCart);
    res.status(201).json(newCart);
});


router.get('/:cid', (req, res) => {
    const cartId = parseInt(req.params.cid);
    const cart = carts.find(c => c.id === cartId);

    if (cart) {
        res.json(cart.products);
    } else {
        res.status(404).json({ error: 'Carrito no encontrado' });
    }
});


router.post('/:cid/product/:pid', (req, res) => {
    const cartId = parseInt(req.params.cid);
    const productId = parseInt(req.params.pid);

    const cart = carts.find(c => c.id === cartId);

    if (cart) {
        const existingProduct = cart.products.find(p => p.product === productId);

        if (existingProduct) {
            existingProduct.quantity += 1;
        } else {
            cart.products.push({ product: productId, quantity: 1 });
        }

        res.status(200).json(cart);
    } else {
        res.status(404).json({ error: 'Carrito no encontrado' });
    }
});

// Agregar producto al carrito (solo usuario)
router.post('/:cartId/products/:productId', isAuthenticated, isUser, async (req, res) => {
    
    res.status(200).json({ message: 'Product added to cart successfully' });
  });

router.delete('/:cid/products/:pid', async (req, res) => {
    const { cid, pid } = req.params;
    const cart = await Cart.findById(cid);

    if (!cart) {
        return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    // Eliminar el producto del carrito
    cart.products = cart.products.filter(product => product.product != pid);
    await cart.save();
    res.json(cart);
});

router.put('/:cid/products/:pid', async (req, res) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body;
    const cart = await Cart.findById(cid);

    if (!cart) {
        return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    const product = cart.products.find(p => p.product == pid);
    if (product) {
        product.quantity = quantity;
    } else {
        return res.status(404).json({ error: 'Producto no encontrado en el carrito' });
    }

    await cart.save();
    res.json(cart);
});

router.delete('/:cid', async (req, res) => {
    const { cid } = req.params;
    const cart = await Cart.findById(cid);

    if (!cart) {
        return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    cart.products = [];
    await cart.save();
    res.json(cart);
});

// Ruta para formalizar una compra
router.post('/:cartId/purchase', isAuthenticated, async (req, res) => {
    const { cartId } = req.params;
    const { email } = req.user; 
  
    try {
      const ticket = await PurchaseService.processPurchase(cartId, email);
      res.status(200).json({
        message: 'Purchase completed successfully',
        ticket,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  

module.exports = router;
