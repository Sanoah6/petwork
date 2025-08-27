const PaymentService = require('../service/payment-service')
const ApiError = require('../exceptions/api-error');

class PaymentController{
    async createPayment(req, res, next){
        const createPayload = {
          amount: {
            value: req.body.value,
            currency: 'RUB'
          },
          payment_method_data: {
            type: 'bank_card'
          },
          confirmation: {
            type: 'redirect',
            return_url: 'http://localhost:3000/payment'
          },
          capture: true,
          metadata: {
            userId: req.body.userId,
            orderId: req.body.orderId
          }
        };

        try {
          const payment = await PaymentService.createPayment(createPayload)
          res.json({payment})
        } catch (error) {
          console.log(error)
          res.status(400).json(error.message)
        }
    }

    async paymentNotification(req, res, next) {
      try {
        const { status, amount, metadata } = req.body.object
        if(status !== 'succeeded') return
        await PaymentService.topUpBalance(amount, metadata.userId)
      } catch (error) {
        console.log(error)
      }
      console.log(req.body)
      
      res.json({status: "OK"})
    }

    async withdrawBalance(req, res, next) {
      try {
        const {amount, id} = req.body
        await PaymentService.withdrawBalance(amount, id)
        return res.json('УСПЕХ')
      } catch(error) {
        console.log(error)
      }
    }

    async topUpBalance(req, res, next) {
      try {
        const {amount, id} = req.body
        await PaymentService.topUpBalance(amount, id)
        return res.json('УСПЕХ')
      } catch(error) {
        console.log(error)
      }
    }
}

module.exports = new PaymentController();