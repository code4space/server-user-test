const bcrypt = require('bcryptjs')

const hashPassword = (password) => bcrypt.hashSync(password, 10)
const comparePassword = (password, hashingPassword) => bcrypt.compareSync(password, hashingPassword)

module.exports = {hashPassword, comparePassword}