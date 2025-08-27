const { YooCheckout, Payment } = require('@a2seven/yoo-checkout');
const PaymentModel = require('../models/payment-model')
const uuid = require('uuid');

class PaymentService {
  constructor() {
    this.shopId = process.env.YOU_KASSA_SHOP_ID;
    this.secretKey = process.env.YOU_KASSA_SECRET;
    this.YouKassa = new YooCheckout({
      shopId: this.shopId,
      secretKey: this.secretKey,
    });
  }

  async createPayment (createPayload) {
    const idempotenceKey = uuid.v4()
    const result = await this.YouKassa.createPayment(createPayload, idempotenceKey)
    console.log(result)
    return result
  }

  async topUpBalance (amount, userId) {
    let formattedAmount
    if(typeof amount === 'object') {
      formattedAmount = parseInt(Number(amount.value).toFixed(2)); 
    } else {
      formattedAmount = parseInt(Number(amount).toFixed(2)); 
    }
    const result = await PaymentModel.topUpBalance(formattedAmount, userId)
    return result
  }
  async withdrawBalance (amount, userId) {
    let formattedAmount
    if(typeof amount === 'object') {
      formattedAmount = parseInt(Number(amount.value).toFixed(2)); 
    } else {
      formattedAmount = parseInt(Number(amount).toFixed(2)); 
    }
    const result = await PaymentModel.withdrawBalance(formattedAmount, userId)
    return result
  }
}


module.exports = new PaymentService();