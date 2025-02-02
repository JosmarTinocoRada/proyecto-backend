const express = require('express');
const { isAuthenticated } = require('../../utils/authentication');
const UserRepository = require('../../repositories/user.repository');

const router = express.Router();


router.get('/current', isAuthenticated, async (req, res) => {
  try {
    const userDTO = await UserRepository.findUserById(req.user._id);
    if (!userDTO) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(userDTO);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving user', error: err.message });
  }
});

module.exports = router;
