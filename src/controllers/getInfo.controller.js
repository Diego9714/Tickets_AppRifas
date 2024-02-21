const Raffle = require('../models/tickets.js')

const controller = {}

// controller.getTickets = async (req, res) => {
//   try {
//     const data = { id_raffle } = req.params
//     const ticket  = await Raffle.getTickets(data)
//     res.status(ticket.code).json(ticket)
//   } catch (err) {
//     res.status(500).json({ error: "Error al realizar la consulta" })
//   }
// }

controller.getTickets = async (req, res) => {
  try {
    const data = { id_supervisor , type_supervisor } = req.params
    const ticket  = await Raffle.getTickets(data)
    res.status(ticket.code).json(ticket)
  } catch (err) {
    res.status(500).json({ error: "Error al realizar la consulta" })
  }
}

controller.getPayments = async (req, res) => {
    try {
      const data = { id_ticket } = req.params
      const ticket  = await Raffle.getPayments(data)
      res.status(ticket.code).json(ticket)
    } catch (err) {
      res.status(500).json({ error: "Error al realizar la consulta" })
    }
  }

module.exports = controller
