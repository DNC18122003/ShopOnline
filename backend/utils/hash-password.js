const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

const hashPassword = async (password_raw) => {
    const hash_password = await bcrypt.hash(password_raw, SALT_ROUNDS);
    return hash_password;
}
module.exports = hashPassword;