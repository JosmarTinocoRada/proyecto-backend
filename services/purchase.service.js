const Ticket = require('../models/Ticket');
const CartRepository = require('../repositories/cart.repository'); // Si tienes repositorios
const ProductRepository = require('../repositories/product.repository');
const UserRepository = require('../repositories/user.repository');

class PurchaseService {
  async processPurchase(cartId, purchaserEmail) {
    try {
      const cart = await CartRepository.findById(cartId);
      if (!cart || cart.products.length === 0) {
        throw new Error('Cart is empty or does not exist');
      }

      // Calcular el total de la compra
      let totalAmount = 0;
      for (const item of cart.products) {
        const product = await ProductRepository.findById(item.productId);
        if (product.stock >= item.quantity) {
          totalAmount += product.price * item.quantity;
          // Actualizar el stock del producto
          await ProductRepository.updateStock(product._id, product.stock - item.quantity);
        } else {
          throw new Error(`Not enough stock for product ${product.name}`);
        }
      }

      // Crear el ticket
      const ticket = await Ticket.create({
        amount: totalAmount,
        purchaser: purchaserEmail,
      });

      // Vaciar el carrito
      await CartRepository.emptyCart(cartId);

      return ticket;
    } catch (error) {
      throw new Error(`Error processing purchase: ${error.message}`);
    }
  }
}

module.exports = new PurchaseService();
