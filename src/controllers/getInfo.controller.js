const Raffle = require('../models/tickets.js')

const controller = {}

controller.getTickets = async (req, res) => {
  try {
    const { id_raffle } = req.params
    const ticket  = await Raffle.getTickets(id_raffle)
    res.status(ticket.code).json(ticket)
  } catch (err) {
    res.status(500).json({ error: "Error al realizar la consulta" })
  }
}

controller.detailedTicket = async (req, res) => {
  try {
    const { id_raffle , number_ticket } = req.params
    const ticket  = await Raffle.getDetailedTickets(id_raffle , number_ticket)
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
    console.log(err)
    res.status(500).json({ error: "Error al realizar la consulta" })
  }
}

controller.getReport = async (req, res) => {
  try {
    const data = { id_ticket } = req.params
    const report  = await Raffle.getReports(data)
    res.status(report.code).json(report)
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: "Error al realizar la consulta" })
  }
}


module.exports = controller
