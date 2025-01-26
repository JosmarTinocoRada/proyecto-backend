const { faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt');


const generateMockUsers = async (count) => {
  const mockUsers = [];

  for (let i = 0; i < count; i++) {
    const user = {
      first_name: faker.name.firstName(),
      last_name: faker.name.lastName(),
      email: faker.internet.email(),
      age: faker.datatype.number({ min: 18, max: 80 }),
      password: bcrypt.hashSync('coder123', 10), 
      role: i % 2 === 0 ? 'user' : 'admin', // Alternar entre user y admin
      pets: [],
    };

    mockUsers.push(user);
  }

  return mockUsers;
};


const generateMockPets = (count) => {
  const mockPets = [];

  for (let i = 0; i < count; i++) {
    const pet = {
      name: faker.animal.dog(),
      breed: faker.animal.type(),
      age: faker.datatype.number({ min: 1, max: 15 }),
      owner: faker.name.fullName(),
    };

    mockPets.push(pet);
  }

  return mockPets;
};

module.exports = { generateMockUsers, generateMockPets };
