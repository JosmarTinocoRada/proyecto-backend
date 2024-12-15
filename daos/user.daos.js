const User = require('../models/user');

class UserDAO {
  async getUserById(id) {
    return await User.findById(id);
  }

  async getUserByEmail(email) {
    return await User.findOne({ email });
  }

  async createUser(userData) {
    const user = new User(userData);
    return await user.save();
  }

  async updateUser(id, updates) {
    return await User.findByIdAndUpdate(id, updates, { new: true });
  }

  async deleteUser(id) {
    return await User.findByIdAndDelete(id);
  }
}

module.exports = new UserDAO();