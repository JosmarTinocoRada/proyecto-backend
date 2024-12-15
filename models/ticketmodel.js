const mongoose = require('mongoose');
const { Schema } = mongoose;
const { v4: uuidv4 } = require('uuid'); 

const ticketSchema = new Schema({
  code: {
    type: String,
    unique: true,
    required: true,
    default: () => uuidv4(), 
  },
  purchase_datetime: {
    type: Date,
    default: Date.now, 
  },
  amount: {
    type: Number,
    required: true, 
  },
  purchaser: {
    type: String,
    required: true, 
  },
});

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
