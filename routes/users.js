const mongoose = require('mongoose')
const plm = require('passport-local-mongoose')

mongoose.connect('mongodb://0.0.0.0/miniwhatsapp')

const userSchema = mongoose.Schema({
  username:String,
  password:String,
  email:String,
  profileImage:{
    type:String,
  },
  socketId:String,
  friends:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'user'
  }]
})

userSchema.plugin(plm)

module.exports = mongoose.model('user', userSchema);