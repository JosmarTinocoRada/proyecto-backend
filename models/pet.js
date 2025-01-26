const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  breed: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  owner: {
    type: String,
    required: false,
  },
});

const Pet = mongoose.model('Pet', petSchema);

module.exports = Pet;
