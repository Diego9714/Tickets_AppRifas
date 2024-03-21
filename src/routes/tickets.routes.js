<<<<<<< HEAD
const { GET_TICKETS , GET_PAYMENTS , REGISTER_TICKET , REGISTER_PAYMENT , ACTIVATE_TICKET , ACTIVATE_PAYMENT , DETAILED_TICKET } = require('../global/_var.js')
=======
const { GET_TICKETS , GET_PAYMENTS , REGISTER_TICKET , REGISTER_PAYMENT , ACTIVATE_TICKET , ACTIVATE_PAYMENT , GET_TICKETS_SELLERS , GET_TICKETS_CLIENTS } = require('../global/_var.js')
>>>>>>> 75cd8af633595637d32b95e6ba8135e373a5c232

// Dependencies
const express = require('express')
const router = express.Router()

// Controllers
const dataController = require('../controllers/getInfo.controller.js')
const saveController = require('../controllers/saveInfo.controller.js')

// Routes
router.get(GET_TICKETS , dataController.getTickets)
<<<<<<< HEAD
router.get(DETAILED_TICKET , dataController.detailedTicket)

=======
router.get(GET_TICKETS_SELLERS , dataController.getTicketSeller)
router.get(GET_TICKETS_CLIENTS , dataController.getTicketClient)
>>>>>>> 75cd8af633595637d32b95e6ba8135e373a5c232
router.post(REGISTER_TICKET , saveController.regTicket)
router.post(ACTIVATE_TICKET , saveController.activateTicket)

router.get(GET_PAYMENTS , dataController.getPayments)
router.post(REGISTER_PAYMENT , saveController.regPayment)
router.post(ACTIVATE_PAYMENT , saveController.activatePayment)

module.exports = router
