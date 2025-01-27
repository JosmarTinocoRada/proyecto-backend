const express = require('express');
const { generateMockUsers, generateMockPets } = require('../utils/mocking');
const User = require('../models/user.model'); 
const Pet = require('../models/pet'); 

const router = express.Router();



router.post('/generateData', async (req, res) => {
  const { users, pets } = req.body;

  // Validar que los parámetros sean números positivos
  if (!users || !pets || users < 0 || pets < 0) {
    return res.status(400).json({ error: 'Debe proporcionar números válidos para users y pets.' });
  }

  try {
    
    const mockUsers = await generateMockUsers(users);
    const mockPets = generateMockPets(pets);

    
    await User.insertMany(mockUsers);
    await Pet.insertMany(mockPets);

    res.status(201).json({
      message: 'Datos generados e insertados exitosamente.',
      usersInserted: users,
      petsInserted: pets,
    });
  } catch (error) {
    console.error('Error al generar o insertar datos:', error);
    res.status(500).json({ error: 'Ocurrió un error al generar o insertar los datos.' });
  }
});

module.exports = router;
