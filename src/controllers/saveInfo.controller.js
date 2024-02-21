const Raffle = require('../models/tickets.js')

const controller = {}

// ----- Save Ticket -----
controller.regTicket = async (req, res) => {
  try {
    const { tickets } = req.body

    const filterTicket = Object.keys(tickets)

    if (filterTicket.length > 0) {
      const verify = await Raffle.verifyTicket(tickets)
      
      const regTickets = verify.info.regTicket
      const ticketsExists = verify.info.soldTickets

      let registeredTickets = []
      let existingTickets = []

      if (regTickets.length > 0) {
        const userTicket = await Raffle.regTicketsClient(regTickets)

        const registeredTickets = userTicket.completed.flatMap(ticket => ticket.ticket);
        const existingTickets = ticketsExists.flatMap(ticket => ticket.tickets);
        
        res.status(userTicket.code).json({
          message: "Registration process completed",
          status: true,
          code: userTicket.code,
          registeredTickets: registeredTickets,
          existingTickets: existingTickets.filter(ticket => !registeredTickets.includes(ticket)),
          notRegisteredTickets: userTicket.notCompleted
        });
        
        
      } 
      else {
        res.status(500).json({ message: "All tickets are already registered", status: false, code: 500 })
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
    const { payments } = req.body

    const filterTicket = Object.keys(payments)

    if (filterTicket.length > 0) {
      const verify = await Raffle.verifyPayment(payments)

      const regPayments = verify.info.regPayment
      
      if (regPayments.length > 0) {
        const ticketPayment = await Raffle.regTicketsPayment(regPayments)

        res.status(ticketPayment.code).json(ticketPayment);
        
        
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
