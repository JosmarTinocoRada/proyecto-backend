const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../../utils/authentication');
const Product = require('../../models/modelproduct');
const Cart = require('../../models/modelcart');

let io;

// Inicializar Socket.IO
const initSocket = (socketIO) => {
  io = socketIO;
};

/*  Obtener todos los productos (GET) */
router.get('/', async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;

    const options = {
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      sort: sort ? { price: sort === 'asc' ? 1 : -1 } : {}
    };

    const searchQuery = query ? { category: query } : {};
    const products = await Product.find(searchQuery, null, options);
    const totalProducts = await Product.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalProducts / limit);

    res.json({
      status: 'success',
      payload: products,
      totalPages,
      page: parseInt(page),
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages,
      prevLink: page > 1 ? `/api/products?page=${page - 1}` : null,
      nextLink: page < totalPages ? `/api/products?page=${page + 1}` : null
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los productos' });
  }
});

/*  Obtener un producto por ID (GET) */
router.get('/:pid', async (req, res) => {
  try {
    const product = await Product.findById(req.params.pid);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el producto' });
  }
});

/*  Crear producto (solo admin) — (POST) */
router.post('/', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { name, description, code, price, stock, category, thumbnails } = req.body;

    if (!name || !description || !code || !price || !stock || !category) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios excepto thumbnails' });
    }

    const newProduct = new Product({
      name,
      description,
      code,
      price,
      stock,
      category,
      thumbnails: thumbnails || []
    });

    const savedProduct = await newProduct.save();

    if (io) io.emit('newProduct', savedProduct);

    res.status(201).json({ message: 'Producto creado correctamente', product: savedProduct });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el producto' });
  }
});

/*  Actualizar producto (solo admin) — (PUT) */
router.put('/:pid', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.pid,
      req.body,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    if (io) io.emit('updateProduct', updatedProduct);

    res.status(200).json({ message: 'Producto actualizado', product: updatedProduct });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el producto' });
  }
});

/* Eliminar producto (solo admin) — (DELETE) */
router.delete('/:pid', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.pid);

    if (!deletedProduct) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    if (io) io.emit('deleteProduct', req.params.pid);

    res.status(200).json({ message: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el producto' });
  }
});

/*  Agregar producto al carrito (usuario común) — (POST) */
router.post('/:pid/cart', isAuthenticated, async (req, res) => {
  try {
    const { pid } = req.params;
    const userId = req.user.id;

    const product = await Product.findById(pid);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, products: [] });
    }

    const existingProduct = cart.products.find(p => p.product.toString() === pid);
    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      cart.products.push({ product: pid, quantity: 1 });
    }

    await cart.save();

    if (io) io.emit('cartUpdated', { userId, cart });

    res.status(200).json({ message: 'Producto agregado al carrito', cart });
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar producto al carrito' });
  }
});

/* Eliminar producto del carrito (usuario común) — (DELETE) */
router.delete('/:pid/cart', isAuthenticated, async (req, res) => {
  try {
    const { pid } = req.params;
    const userId = req.user.id;

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    const productIndex = cart.products.findIndex(p => p.product.toString() === pid);
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Producto no encontrado en el carrito' });
    }

    // Eliminar el producto del carrito
    cart.products.splice(productIndex, 1);
    await cart.save();

    if (io) io.emit('cartUpdated', { userId, cart });

    res.status(200).json({ message: 'Producto eliminado del carrito', cart });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el producto del carrito' });
  }
});

// ✅ Exportar router e initSocket
module.exports = { router, initSocket };
