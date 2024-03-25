require('dotenv').config()

/* ----------- SERVER ----------- */
const PORT                        = process.env.PORT

/* ----------- DATABASE ----------- */
const PG_HOST                     = process.env._HOST
const PG_USER                     = process.env._USER
const PG_PASS                     = process.env._PASS
const PG_NAME                     = process.env._NAME

/* ----------- ROUTES ----------- */

// Users
const GET_TICKETS                 = process.env.GET_TICKETS
const GET_PAYMENTS                = process.env.GET_PAYMENTS

const DETAILED_TICKET             = process.env.DETAILED_TICKET
const GENERATE_REPORT             = process.env.GENERATE_REPORT

const REGISTER_TICKET             = process.env.REGISTER_TICKET
const REGISTER_PAYMENT            = process.env.REGISTER_PAYMENT

const ACTIVATE_TICKET             = process.env.ACTIVATE_TICKET
const ACTIVATE_PAYMENT            = process.env.ACTIVATE_PAYMENT


module.exports = {
	// Server
  PORT,
  // Database
  PG_HOST, PG_USER, PG_PASS, PG_NAME,
  // Clients
  GET_TICKETS, GET_PAYMENTS, REGISTER_TICKET , REGISTER_PAYMENT , ACTIVATE_TICKET, ACTIVATE_PAYMENT , DETAILED_TICKET, GENERATE_REPORT
 }
