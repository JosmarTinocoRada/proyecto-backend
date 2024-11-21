const express = require('express');
const router = express.Router();
const Product = require('../models/Product');  // Importar el modelo de productos

let io;

const initSocket = (socketIO) => {
    io = socketIO;
};

// Obtener todos los productos con paginación
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
            prevPage: page > 1 ? page - 1 : null,
            nextPage: page < totalPages ? page + 1 : null,
            page: parseInt(page),
            hasPrevPage: page > 1,
            hasNextPage: page < totalPages,
            prevLink: page > 1 ? `/api/products?limit=${limit}&page=${page - 1}&sort=${sort}&query=${query}` : null,
            nextLink: page < totalPages ? `/api/products?limit=${limit}&page=${page + 1}&sort=${sort}&query=${query}` : null
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
});

// Obtener un producto por ID
router.get('/:pid', async (req, res) => {
    try {
        const product = await Product.findById(req.params.pid);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ error: 'Producto no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el producto' });
    }
});

// Crear un nuevo producto
router.post('/', async (req, res) => {
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

        if (io) {
            io.emit('newProduct', savedProduct);
        }

        res.status(201).json(savedProduct);
    } catch (error) {
        res.status(400).json({ error: 'Error al crear el producto' });
    }
});

// Actualizar un producto
router.put('/:pid', async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.pid, req.body, { new: true });
        if (updatedProduct) {
            res.json(updatedProduct);
        } else {
            res.status(404).json({ error: 'Producto no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el producto' });
    }
});

// Eliminar un producto
router.delete('/:pid', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.pid);
        if (product) {
            if (io) {
                io.emit('deleteProduct', req.params.pid);
            }
            res.status(204).send(); 
        } else {
            res.status(404).json({ error: 'Producto no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el producto' });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', async () => {
            const productId = button.getAttribute('data-id');
            await fetch(`/api/carts/add`, { method: 'POST', body: JSON.stringify({ productId }) });
            alert('Producto añadido al carrito');
        });
    });

    document.querySelectorAll('.remove-from-cart').forEach(button => {
        button.addEventListener('click', async () => {
            const productId = button.getAttribute('data-id');
            await fetch(`/api/carts/remove`, { method: 'DELETE', body: JSON.stringify({ productId }) });
            alert('Producto eliminado del carrito');
            location.reload();
        });
    });

    document.querySelector('.clear-cart')?.addEventListener('click', async () => {
        await fetch(`/api/carts/clear`, { method: 'DELETE' });
        alert('Carrito vaciado');
        location.reload();
    });
});

module.exports = { router, initSocket };
