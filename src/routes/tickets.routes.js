const { GET_TICKETS , GET_PAYMENTS , REGISTER_TICKET , REGISTER_PAYMENT , ACTIVATE_TICKET , ACTIVATE_PAYMENT } = require('../global/_var.js')

// Dependencies
const express = require('express')
const router = express.Router()

// Controllers
const dataController = require('../controllers/getInfo.controller.js')
const saveController = require('../controllers/saveInfo.controller.js')

// Routes
router.get(GET_TICKETS , dataController.getTickets)
router.post(REGISTER_TICKET , saveController.regTicket)
router.post(ACTIVATE_TICKET , saveController.activateTicket)


router.get(GET_PAYMENTS , dataController.getPayments)
router.post(REGISTER_PAYMENT , saveController.regPayment)
router.post(ACTIVATE_PAYMENT , saveController.activatePayment)

module.exports = router
