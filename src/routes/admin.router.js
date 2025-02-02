const express = require('express');
const { isAuthenticated, isAdmin } = require('../../utils/authentication');
const Product = require('../../models/modelproduct'); // Modelo de productos
const router = express.Router();

// Panel de administración: ver productos
router.get('/panel', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const products = await Product.find();
    res.render('adminPanel', { products, admin: req.user });
  } catch (err) {
    res.status(500).json({ message: 'Error loading admin panel', error: err.message });
  }
});

module.exports = router;
