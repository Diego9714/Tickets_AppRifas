const pool = require('../utils/mysql.connect.js') 

// ----- Verify Ticket -----
const verifyTicket = async (tickets) => {
  try {
    const connection = await pool.getConnection()

    const regTicket = []
    const soldTickets = []

    for (const info of tickets) {
      const { id_raffle , id_supervisor, type_supervisor, id_client, tickets_request , amount_total , type_payment , type_currency , banck , banck_reference , amount_paid } = info

      let sql = `SELECT tickets_sold FROM raffles WHERE id_raffle = ? ;`
      const [rows] = await connection.execute(sql, [id_raffle])

      if (rows.length > 0) {
        const ticketSold = JSON.parse(rows[0].tickets_sold)

        if (ticketSold == []) {
          // No hay boletos vendidos, todos los solicitados son nuevos
          regTicket.push({
            id_raffle,
            id_supervisor,
            type_supervisor,
            id_client,
            tickets: tickets_request,
            amount_total,
            type_payment,
            type_currency,
            banck,
            banck_reference,
            amount_paid
          })
        } else {

          const newTickets = tickets_request.filter(ticket => !ticketSold.includes(ticket))
          const registeredTickets = tickets_request.filter(ticket => ticketSold.includes(ticket))

          if (newTickets.length > 0) {
            // Agregar solo los nuevos boletos que no están vendidos
            regTicket.push({
              id_raffle,
              id_supervisor,
              type_supervisor,
              id_client,
              tickets: newTickets,
              amount_total,
              type_payment,
              type_currency,
              banck,
              banck_reference,
              amount_paid
            })
          }

          if (registeredTickets.length > 0) {
            // Agregar los boletos ya registrados
            soldTickets.push({
              id_raffle,
              id_supervisor,
              type_supervisor,
              id_client,
              tickets: registeredTickets,
              amount_total,
              type_payment,
              type_currency,
              banck,
              banck_reference,
              amount_paid
            })
          }
        }
      }
    }

    const msg = {
      status: true,
      message: regTicket.length > 0 ? "New tickets found" : "All tickets already sold",
      code: regTicket.length > 0 ? 200 : 404,
      info: {
        regTicket,
        soldTickets
      }
    }

    connection.release()

    return msg
  } catch (err) {
    let msg = {
      status: false,
      message: "Something went wrong...",
      code: 500,
      error: err,
    }
    return msg
  }
}

// ----- Save Ticket -----
const regTicketsClient = async (regTickets) => {
  try {
    const Ticketscompleted = []
    const TicketsnotCompleted = []

    for(const info of regTickets){
      const { id_raffle , id_supervisor, type_supervisor, id_client , tickets , amount_total , type_payment , type_currency , banck , banck_reference , amount_paid } = info

      let status_ticket = 0

      if( type_payment === "A cuotas" ){
        status_ticket = 2
      } else if( type_payment === "Al contado" ){
        status_ticket = 1
      }

      const fechaActual = new Date()
      const date_created = fechaActual.toISOString().split('T')[0]

      const connection = await pool.getConnection()

      let sql0 = `SELECT tickets_sold FROM raffles WHERE id_raffle = ? ;`
      const [rows] = await connection.execute(sql0, [id_raffle])

      let sql = `INSERT INTO tickets (id_raffle, id_supervisor, type_supervisor, id_client, tickets_sold, amount_paid , amount_total, status_ticket, date_created) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`
      const [result] = await connection.execute(sql, [id_raffle, id_supervisor, type_supervisor, id_client, tickets, amount_paid , amount_total, status_ticket, date_created])

      if (result.affectedRows > 0) {

        // Limpiar la cadena eliminando los corchetes al inicio y al final
        let arrayTicket = rows[0].tickets_sold.replace(/^\[|\]$/g, '').split(',').map(Number);

        let combinedArray = arrayTicket.concat(tickets);

        const lastInsertId = result.insertId

        let sql0 = `INSERT INTO payments (	 id_ticket,	type_payment,	type_currency,	banck,	banck_reference,	amount_paid,	status_payment,	date_payment) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?);`
        await connection.execute(sql0, [ lastInsertId ,	type_payment,	type_currency,	banck,	banck_reference , amount_paid,1 ,	date_created])

        sql = 'UPDATE raffles SET tickets_sold = ? WHERE id_raffle = ?';
        await connection.execute(sql, [combinedArray , id_raffle]); 

        Ticketscompleted.push({
          status: true,
          message: "Ticket registered successfully",
          ticket: tickets 
        })
      } else {
        TicketsnotCompleted.push({
          status: false,
          message: "Ticket not registered successfully",
          ticket: tickets 
        })
      }

      connection.release()
    
    }

    const msg = {
      status: true,
      message: "Ticket registration process completed",
      code: 200,
      completed: Ticketscompleted,
      notCompleted: TicketsnotCompleted
    }

    return msg

  } catch (err) {
    let msg = {
      status: false,
      message: "Something went wrong...",
      code: 500,
      error: err,
    }
    return msg
  }
}

// // ----- Get Tickets -----
// const getTickets = async ({ data }) => {
//   try {
//     let msg = {
//       status: false,
//       message: "Tickets not found",
//       code: 404
//     }

//     const connection = await pool.getConnection()

//     let sql = `SELECT id_ticket, id_raffle, id_supervisor, type_supervisor, id_client , tickets_sold,amount_paid, amount_total, status_ticket, date_created FROM tickets WHERE id_raffle = ? ;`
//     let [raffle] = await connection.execute(sql,[id_raffle])

//     if (raffle.length > 0) {
//       msg = {
//         status: true,
//         message: "Tickets found",
//         data: raffle,
//         code: 200
//       }
//     }
    

//     connection.release()

//     return msg
//   } catch (err) {
//     let msg = {
//       status: false,
//       message: "Something went wrong...",
//       code: 500,
//       error: err,
//     }
//     return msg
//   }
// }

// ----- Get Tickets -----
const getTickets = async ({ data }) => {
  try {
    let msg = {
      status: false,
      message: "Tickets not found",
      code: 404
    }

    const connection = await pool.getConnection()

    if(type_supervisor == "ADM"){
      let sql = `SELECT tickets.id_ticket, chiefs.id_boss, chiefs.fullname, raffles.id_raffle, raffles.name_raffle, clients.id_client, clients.fullname, clients.address, tickets.tickets_sold, tickets.amount_paid, tickets.amount_total, tickets.status_ticket , tickets.date_created 
      FROM tickets
      INNER JOIN chiefs ON tickets.id_supervisor = chiefs.id_boss
      INNER JOIN raffles ON tickets.id_raffle = raffles.id_raffle
      INNER JOIN clients ON tickets.id_client = clients.id_client
      WHERE tickets.id_supervisor = ? AND tickets.type_supervisor = ?;`
      let [raffle] = await connection.execute(sql,[id_supervisor , type_supervisor])
  
      if (raffle.length > 0) {
        msg = {
          status: true,
          message: "Tickets found",
          data: raffle,
          code: 200
        }
      }
    }else if(type_supervisor == "VED"){
      let sql = `SELECT tickets.id_ticket, sellers.id_seller, sellers.fullname, raffles.id_raffle, raffles.name_raffle, clients.id_client, clients.fullname, clients.address, tickets.tickets_sold, tickets.amount_paid, tickets.amount_total, tickets.status_ticket, tickets.date_created 
      FROM tickets
      INNER JOIN sellers ON tickets.id_supervisor = sellers.id_seller
      INNER JOIN raffles ON tickets.id_raffle = raffles.id_raffle
      INNER JOIN clients ON tickets.id_client = clients.id_client
      WHERE tickets.id_supervisor = ? AND tickets.type_supervisor = ?;`
      let [raffle] = await connection.execute(sql,[id_supervisor , type_supervisor])
  
      if (raffle.length > 0) {
        msg = {
          status: true,
          message: "Tickets found",
          data: raffle,
          code: 200
        }
      }
    }

    connection.release()

    return msg
  } catch (err) {
    let msg = {
      status: false,
      message: "Something went wrong...",
      code: 500,
      error: err,
    }
    return msg
  }
}

// Activation/desabled Tickets
const activationTicket = async ({ data }) => {
  try {
    let msg = {
      status: false,
      message: "Client not activated",
      code: 500
    }

    const connection = await pool.getConnection();

    let sqlTicket = `SELECT id_raffle , tickets_sold , amount_paid , amount_total FROM tickets WHERE id_ticket = ? ;`;
    let [ticket] = await connection.execute(sqlTicket, [id_ticket]);

    let montoAbonado = ticket[0].amount_paid;
    let montoPagado = ticket[0].amount_total;
    let status_ticket = 0

    if(montoAbonado < montoPagado){
      status_ticket = 2
    }

    let idRaffle = ticket[0].id_raffle

    let sqlRaffle = `SELECT tickets_sold FROM raffles WHERE id_raffle = ? ;`;
    let [raffle] = await connection.execute(sqlRaffle, [idRaffle]);

    if (ticket.length > 0 && raffle.length > 0) {

      if(activation_status == 0){
        
        let nrosTicketString = ticket[0].tickets_sold;
        let nrosRaffleString = raffle[0].tickets_sold;
  
        let nrosTicket = JSON.parse(nrosTicketString)
        let nrosRaffle = JSON.parse(nrosRaffleString)
  
        let nrosRestantes = nrosTicket.filter(num => !nrosRaffle.includes(num));
  
        let updateSql = `UPDATE raffles SET tickets_sold = ? WHERE id_raffle = ?;`;
        const [raffles] = await connection.execute(updateSql, [nrosRestantes, idRaffle]);
  
        let updateSql0 = `UPDATE tickets SET status_ticket = ? WHERE id_ticket = ?;`;
        const [tickets] = await connection.execute(updateSql0, [0 , id_ticket]);

        let updateSql1 = `UPDATE payments SET status_payment = ? WHERE id_ticket = ?;`;
        const [payments] = await connection.execute(updateSql1, [0 , id_ticket]);
  
        if (raffles.affectedRows > 0 && tickets.affectedRows > 0 && payments.affectedRows > 0) {
          msg = {
            status: true,
            message: "Ticket Disabled successfully",
            code: 200
          };
        }
      }
      else if(activation_status == 1){
        
        let nrosTicketString = ticket[0].tickets_sold;
        let nrosRaffleString = raffle[0].tickets_sold;

        let nrosTicket = JSON.parse(nrosTicketString);
        let nrosRaffle = JSON.parse(nrosRaffleString);

        let nrosRestantes = [...nrosRaffle, ...nrosTicket];

        let updateSql = `UPDATE raffles SET tickets_sold = ? WHERE id_raffle = ?;`;
        const [raffles] = await connection.execute(updateSql, [nrosRestantes, idRaffle]);
  
        let updateSql0 = `UPDATE tickets SET status_ticket = ? WHERE id_ticket = ?;`;
        const [tickets] = await connection.execute(updateSql0, [status_ticket , id_ticket]);
 
        let updateSql1 = `UPDATE payments SET status_payment = ? WHERE id_ticket = ?;`;
        const [payments] = await connection.execute(updateSql1, [1 , id_ticket]);
  
        if (raffles.affectedRows > 0 && tickets.affectedRows > 0 && payments.affectedRows > 0) {
          msg = {
            status: true,
            message: "Ticket Activated successfully",
            code: 200
          };
        }
      }

    }

    connection.release();
    return msg
  } catch (err) {
    console.log(err);
    let msg = {
      status: false,
      message: "Something went wrong...",
      code: 500,
      error: err,
    };
    return msg;
  }
}



// ----- Verify Payment -----
const verifyPayment = async (payments) => {
  try {
    const connection = await pool.getConnection()

    const regPayment = []
    const soldPayments = []

    for (const info of payments) {
      const { id_ticket , type_payment , type_currency , banck , banck_reference , amount_paid } = info

      let sql = `SELECT amount_paid , amount_total , status_ticket FROM tickets WHERE id_ticket = ? ;`
      const [rows] = await connection.execute(sql, [id_ticket])

      if (rows.length > 0) {
        
        let montoPagado = rows[0].amount_paid
        let monto_a_pagar = rows[0].amount_total
        let status = rows[0].status_ticket

        if(monto_a_pagar >= montoPagado && status == 2){
          regPayment.push(info)
        }
      }
    }

    const msg = {
      status: true,
      message: regPayment.length > 0 ? "New payment found" : "These tickets have already been paidAll tickets already sold",
      code: regPayment.length > 0 ? 200 : 404,
      info: {
        regPayment
      }
    }

    connection.release()

    return msg
  } catch (err) {
    let msg = {
      status: false,
      message: "Something went wrong...",
      code: 500,
      error: err,
    }
    return msg
  }
}

// ----- Save Payment -----
const regTicketsPayment = async (regPayments) => {
  try {
    const Paymentscompleted = [];
    const PaymentsnotCompleted = [];

    for (const info of regPayments) {
      const { id_ticket, type_payment, type_currency, banck, banck_reference, amount_paid } = info;

      const fechaActual = new Date();
      const date_created = fechaActual.toISOString().split('T')[0];

      const connection = await pool.getConnection();

      let sql0 = `SELECT amount_paid , amount_total FROM tickets WHERE id_ticket = ?;`;
      const [rows] = await connection.execute(sql0, [id_ticket]);

      let montoAbonado = rows[0].amount_paid;
      let montoPagado = rows[0].amount_total;

      let nuevoMontoRecibido = montoAbonado + amount_paid;

      if( type_payment === "A cuotas" && nuevoMontoRecibido == montoPagado){
        status_ticket = 1
      }
      else if( type_payment === "A cuotas" ){
        status_ticket = 2
      } else if( type_payment === "Al contado" ){
        status_ticket = 1
      }

      let sql = `INSERT INTO payments (id_ticket, type_payment, type_currency, banck, banck_reference, amount_paid, status_payment, date_payment) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`;
      const [result] = await connection.execute(sql, [id_ticket, type_payment, type_currency, banck, banck_reference, amount_paid, 1, date_created]);

      if (result.affectedRows > 0) {

        sql = 'UPDATE tickets SET amount_paid = ? , status_ticket = ? WHERE id_ticket = ?;';
        await connection.execute(sql, [nuevoMontoRecibido, status_ticket , id_ticket]);

        Paymentscompleted.push({
          status: true,
          message: "Payment registered successfully",
          amount: amount_paid
        });
      } else {
        PaymentsnotCompleted.push({
          status: false,
          message: "Payment not registered successfully",
          amount: amount_paid
        });
      }
    

      connection.release();

    }

    const msg = {
      status: true,
      message: "Payment registration process completed",
      code: 200,
      completed: Paymentscompleted
    };

    return msg;

  } catch (err) {
    let msg = {
      status: false,
      message: "Something went wrong...",
      code: 500,
      error: err,
    };
    return msg;
  }
};


// ----- Get Payments -----
const getPayments = async ({ data }) => {
  try {
    let msg = {
      status: false,
      message: "Payments not found",
      code: 404
    }

    const connection = await pool.getConnection()

    let sql = `SELECT id_payment, id_ticket, type_payment, type_currency, banck, banck_reference, amount_paid, status_payment, date_payment	FROM payments WHERE id_ticket = ? ;`
    let [raffle] = await connection.execute(sql,[id_ticket])

    if (raffle.length > 0) {
      msg = {
        status: true,
        message: "Payments found",
        data: raffle,
        code: 200
      }
    }
    

    connection.release()

    return msg
  } catch (err) {
    let msg = {
      status: false,
      message: "Something went wrong...",
      code: 500,
      error: err,
    }
    return msg
  }
}

// Activation/desabled Payments
const activationPayment = async ({ data }) => {
  try {
    let msg = {
      status: false,
      message: "Payment not activated",
      code: 500
    }

    const connection = await pool.getConnection();

    // Pago
    let sqlPayment = `SELECT id_ticket , amount_paid FROM payments WHERE id_payment = ? ;`;
    let [payment] = await connection.execute(sqlPayment, [id_payment]);

    let idTicket = payment[0].id_ticket
    let montoPagado = payment[0].amount_paid

    // Ticket
    let sqlTicket = `SELECT amount_paid  FROM tickets WHERE id_ticket = ? ;`;
    let [ticket] = await connection.execute(sqlTicket, [idTicket]);

    let montoPagadoTicket = ticket[0].amount_paid

    if (payment.length > 0 && ticket.length > 0) {

      if(activation_status == 0){
  
        let newAmount = montoPagadoTicket - montoPagado

        let updateSql0 = `UPDATE tickets SET amount_paid = ? WHERE id_ticket = ?;`;
        const [tickets] = await connection.execute(updateSql0, [newAmount , idTicket]);

        let updateSql1 = `UPDATE payments SET status_payment = ? WHERE id_ticket = ?;`;
        const [payments] = await connection.execute(updateSql1, [ 0 , idTicket]);
  
        if (tickets.affectedRows > 0 && payments.affectedRows > 0) {
          msg = {
            status: true,
            message: "Ticket Disabled successfully",
            code: 200
          };
        }
      }
      else if(activation_status == 1){
        
        let newAmount = montoPagadoTicket + montoPagado

        let updateSql0 = `UPDATE tickets SET amount_paid = ? WHERE id_ticket = ?;`;
        const [tickets] = await connection.execute(updateSql0, [newAmount , idTicket]);

        let updateSql1 = `UPDATE payments SET status_payment = ? WHERE id_ticket = ?;`;
        const [payments] = await connection.execute(updateSql1, [ 1 , idTicket]);
  
        if (tickets.affectedRows > 0 && payments.affectedRows > 0) {
          msg = {
            status: true,
            message: "Ticket Activated successfully",
            code: 200
          };
        }
      }

    }

    connection.release();
    return msg
  } catch (err) {
    console.log(err);
    let msg = {
      status: false,
      message: "Something went wrong...",
      code: 500,
      error: err,
    };
    return msg;
  }
}



module.exports = {
  verifyTicket,
  regTicketsClient,

  verifyPayment,
  regTicketsPayment,

  getTickets,
  getPayments,

  activationTicket,
  activationPayment
}
