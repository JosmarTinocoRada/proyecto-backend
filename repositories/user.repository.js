const UserDAO = require('../daos/user.dao');
const UserDTO = require('../dtos/user.dto');

class UserRepository {
  async findUserById(id) {
    const user = await UserDAO.getUserById(id);
    return user ? new UserDTO(user) : null;
  }

  async findUserByEmail(email) {
    const user = await UserDAO.getUserByEmail(email);
    return user ? new UserDTO(user) : null;
  }

  async createUser(userData) {
    const user = await UserDAO.createUser(userData);
    return new UserDTO(user);
  }

  async updateUser(id, updates) {
    const user = await UserDAO.updateUser(id, updates);
    return user ? new UserDTO(user) : null;
  }

  async deleteUser(id) {
    return await UserDAO.deleteUser(id);
  }
}

module.exports = new UserRepository();
