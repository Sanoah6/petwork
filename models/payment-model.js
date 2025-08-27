require('dotenv').config();
const pool = require('../config/db');

const topUpBalance = async (amount, userId) => {
  try{
    const result = await pool.query(`UPDATE "users" SET u_balance = u_balance + $1 WHERE u_id = $2`, [amount, userId]);
    return result
  } catch (error) {
    console.log(error)
  }
}

const withdrawBalance = async (amount, userId) => {
  try{
    const result = await pool.query(`UPDATE "users" SET u_balance = u_balance - $1 WHERE u_id = $2`, [amount, userId]);
    return result
  } catch (error) {
    console.log(error)
  }
}


module.exports = { topUpBalance, withdrawBalance }