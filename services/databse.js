const db = require('nedb-promises');
const users = db.create('./users.db');

module.exports = {users}

