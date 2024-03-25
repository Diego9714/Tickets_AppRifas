const { GET_TICKETS , GET_PAYMENTS , REGISTER_TICKET , REGISTER_PAYMENT , ACTIVATE_TICKET , ACTIVATE_PAYMENT , DETAILED_TICKET , GENERATE_REPORT} = require('../global/_var.js')

// Dependencies
const express = require('express')
const router = express.Router()

// Controllers
const dataController = require('../controllers/getInfo.controller.js')
const saveController = require('../controllers/saveInfo.controller.js')

// Routes
router.get(GET_TICKETS , dataController.getTickets)
router.get(DETAILED_TICKET , dataController.detailedTicket)

router.post(REGISTER_TICKET , saveController.regTicket)
router.post(ACTIVATE_TICKET , saveController.activateTicket)

router.get(GET_PAYMENTS , dataController.getPayments)
router.post(REGISTER_PAYMENT , saveController.regPayment)
router.post(ACTIVATE_PAYMENT , saveController.activatePayment)

router.post(GENERATE_REPORT , dataController.getReport)

module.exports = router
