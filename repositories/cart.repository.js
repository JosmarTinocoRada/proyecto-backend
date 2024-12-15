const Cart = require('../models/Cart');

class CartRepository {
  async findById(cartId) {
    return await Cart.findById(cartId).populate('products.productId');
  }

  async addProductToCart(cartId, productId, quantity) {
    const cart = await Cart.findById(cartId);
    if (!cart) throw new Error('Cart not found');

    const productIndex = cart.products.findIndex(p => p.productId.toString() === productId);

    if (productIndex > -1) {
      cart.products[productIndex].quantity += quantity;
    } else {
      cart.products.push({ productId, quantity });
    }

    return await cart.save();
  }

  async emptyCart(cartId) {
    const cart = await Cart.findById(cartId);
    if (!cart) throw new Error('Cart not found');

    cart.products = [];
    return await cart.save();
  }
}

module.exports = new CartRepository();
