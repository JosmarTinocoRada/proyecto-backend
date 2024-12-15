const Product = require('../models/Product');

class ProductRepository {
  async findById(productId) {
    return await Product.findById(productId);
  }

  async updateStock(productId, newStock) {
    return await Product.findByIdAndUpdate(productId, { stock: newStock }, { new: true });
  }

  async createProduct(productData) {
    const product = new Product(productData);
    return await product.save();
  }

  async deleteProduct(productId) {
    return await Product.findByIdAndDelete(productId);
  }
}

module.exports = new ProductRepository();
