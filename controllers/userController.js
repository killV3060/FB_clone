const User = require('../models/User')
const bcrypt = require('bcrypt')

exports.register = async ( req, res) =>{
    try {

        const {email, userName, password} = req.body;
        const hashed = await bcrypt.hash(password, 10)

        const user = await User.create({
            email, userName, password: hashed
        })
        res.status(201).json({message: "user created", user})

    } catch (err) {
        res.status(400).json({message: err.message})
    }
}