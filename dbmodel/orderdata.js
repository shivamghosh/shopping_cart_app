//model schema

const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
  
  id: {
    type: String,
    required: true
  },
  quantity: {
    type: String,
    required: true
  }

})

module.exports = mongoose.model('orderdata', orderSchema)