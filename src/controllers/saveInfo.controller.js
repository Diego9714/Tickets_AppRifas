const Raffle = require('../models/tickets.js')

const controller = {}

// ----- Save Ticket -----
controller.regTicket = async (req, res) => {
  try {
    const ticket = { id_raffle, id_supervisor, type_supervisor, id_client, tickets_request, amount_total, type_payment, type_currency, banck, banck_reference, amount_paid } = req.body

    const filterTicket = Object.keys(ticket)

    if (filterTicket.length > 0) {
      const verify = await Raffle.verifyTicket(ticket)
      
      if (verify.code == 200) {
        const regTickets = verify.registerTickets

        const processReg = await Raffle.regTicketsClient(ticket , regTickets)
        console.log(processReg)

        return res.status(processReg.code).json(processReg)
      } 
      else {
        return res.status(verify.code).json(verify)
      }

    } else {
      res.status(400).json({ message: "No tickets provided in the request", status: false, code: 400 })
    }

  } catch (error) {
    res.status(500).json({ error: "Error al realizar la consulta" })
  }
}

// ----- Save Payment -----
controller.regPayment = async (req, res) => {
  try {
    const payments = { id_ticket,type_payment,type_currency,banck,banck_reference,amount_paid } = req.body

    console.log(payments)

    const filterTicket = Object.keys(payments)

    if (filterTicket.length > 0) {
      const verify = await Raffle.verifyPayment(payments)

      console.log(verify)

      if (verify.code == 200) {
        const ticketPayment = await Raffle.regTicketsPayment(payments)
       
        console.log(ticketPayment)

        res.status(ticketPayment.code).json(ticketPayment)        
      } 
      else {
        res.status(500).json({ message: "All payments are already registered", status: false, code: 500 })
      }

    } else {
      res.status(400).json({ message: "No payments provided in the request", status: false, code: 400 })
    }

  } catch (error) {
    res.status(500).json({ error: "Error al realizar la consulta" })
  }
}

// ----- Activation Ticket -----
controller.activateTicket = async (req, res) => {
  try {
    const data = {id_ticket , activation_status} = req.params

    tickets = await Raffle.activationTicket(data)
    
    res.status(tickets.code).json(tickets)
  
  } catch (error) {
    res.status(500).json({ error: "Error al realizar la consulta" })
  }
}

// ----- Activation Payment -----
controller.activatePayment = async (req, res) => {
  try {
    const data = {id_payment , activation_status} = req.params

    tickets = await Raffle.activationPayment(data)
    
    res.status(tickets.code).json(tickets)
  
  } catch (error) {
    res.status(500).json({ error: "Error al realizar la consulta" })
  }
}


module.exports = controller
