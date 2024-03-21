const pool = require('../utils/mysql.connect.js') 

// ----- Verify Ticket -----
const verifyTicket = async ({ ticket }) => {
  try {
    let msg = {
      status: false,
      message: "Ticket already exists",
      code: 500
    };

    const connection = await pool.getConnection()

    const sql = `SELECT tickets_sold FROM raffles WHERE id_raffle = ? ;`;
    const [rows] = await connection.execute(sql, [id_raffle])

    if (rows.length > 0) {
      const ticketSold = JSON.parse(rows[0].tickets_sold)

      if (ticketSold.length === 0) {
        msg = {
          status: true,
          message: "New tickets for registration",
          registerTickets: tickets_request,
          code: 200
        };
      } else {
        const newTickets =  tickets_request.filter(ticket => !ticketSold.includes(ticket))

        if (newTickets.length > 0) {
          msg = {
            status: false,
            message: "Tickets for registration",
            code: 200,
            registerTickets: newTickets
          };
        }
      }
    }

    connection.release()

    return msg;
  } catch (err) {
    console.error("Error:", err);
    return {
      status: false,
      message: "Something went wrong...",
      code: 500,
      error: err
    }
  }
}

// ----- Save Ticket -----
const regTicketsClient = async ({ticket}, regTickets) => {
  try {
    let msg = {
      status: false,
      message: "Ticket not Registered",
      code: 500
    }

    let status_ticket = 0

    if (type_payment === "A cuotas") {
      status_ticket = 2
    } else if (type_payment === "Al contado") {
      status_ticket = 1
    } else if (type_payment === "Apartado") {
      status_ticket = 3
    }

    const fechaActual = new Date()
    const date_created = fechaActual.toISOString().split('T')[0]

    const connection = await pool.getConnection()

    let sql0 = `SELECT tickets_sold FROM raffles WHERE id_raffle = ? ;`
    const [rows] = await connection.execute(sql0, [id_raffle])

    let combinedArray = JSON.parse(rows[0].tickets_sold)
    
    let sql = `INSERT INTO tickets (id_raffle, id_supervisor, type_supervisor, id_client, tickets_sold, amount_paid, amount_total, status_ticket, date_created) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`;
    const [result] = await connection.execute(sql, [id_raffle, id_supervisor, type_supervisor, id_client, JSON.stringify(regTickets), amount_paid, amount_total, status_ticket, date_created]);
    
    let lastInsertId = result.insertId;
    
    if (result.affectedRows > 0) {
      combinedArray = combinedArray.concat(regTickets)

      let sql0 = `INSERT INTO payments (id_ticket, type_payment, type_currency, banck, banck_reference, amount_paid, status_payment, date_payment) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`
      await connection.execute(sql0, [lastInsertId, type_payment, type_currency, banck, banck_reference, amount_paid, 1, date_created]);

      sql = 'UPDATE raffles SET tickets_sold = ? WHERE id_raffle = ?';
      await connection.execute(sql, [JSON.stringify(combinedArray), id_raffle]); 

      msg = {
        status: true,
        message: "Ticket registered successfully",
        code: 200
      }
    }

    connection.release()
    
    return msg

  } catch (err) {
    console.log(err)
    let msg = {
      status: false,
      message: "Something went wrong...",
      code: 500,
      error: err,
    }
    return msg
  }
}

// Ver Tickets
const getTickets = async (id_raffle) => {
  try {
    let msg = {
      status: false,
      message: "Tickets not found",
      code: 404
    }

    const connection = await pool.getConnection()

    let searchCant = `SELECT cant_tickets  FROM raffles WHERE id_raffle = ?`;
    let [numbers] = await connection.execute(searchCant, [id_raffle]);

    let searchSold = `SELECT tickets_sold FROM tickets WHERE status_ticket = 1 AND id_raffle = ?;`;
    let [sold] = await connection.execute(searchSold, [id_raffle]);

    let searchSubs = `SELECT tickets_sold FROM tickets WHERE status_ticket = 2 AND id_raffle = ?;`;
    let [subs] = await connection.execute(searchSubs, [id_raffle]);

    let searchApart = `SELECT tickets_sold FROM tickets WHERE status_ticket = 3 AND id_raffle = ?;`;
    let [apart] = await connection.execute(searchApart, [id_raffle]);

    // Tickets Vendidos
    let ticketSold = sold.length > 0 ? sold.flatMap(obj => JSON.parse(obj.tickets_sold)) : [];
    // Tickets Abonados
    let ticketSubscribed = subs.length > 0 ? subs.flatMap(obj => JSON.parse(obj.tickets_sold)) : [];
    // Tickets Apartados
    let ticketApart = apart.length > 0 ? apart.flatMap(obj => JSON.parse(obj.tickets_sold)) : [];

    if (numbers.length > 0) {
        msg = {
            status: true,
            message: "Tickets found",
            numbers_raffle: numbers[0].cant_tickets,
            soldTickets: ticketSold,
            subsTickets: ticketSubscribed,
            apartTickets: ticketApart,
            code: 200
        };
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

// Ver Detalles Ticket
const getDetailedTickets = async (id_raffle , number_ticket) => {
  try {
    let msg = {
      status: false,
      message: "Tickets not found",
      code: 404
    }

    const connection = await pool.getConnection()

    let sql = `
      SELECT tickets.id_raffle , tickets.id_ticket, clients.id_client, clients.fullname AS client_fullname, clients.address , clients.sector , clients.state , clients.direction , tickets.tickets_sold, tickets.amount_paid, tickets.amount_total, tickets.status_ticket, tickets.date_created 
      FROM tickets
      INNER JOIN clients ON tickets.id_client = clients.id_client
      WHERE tickets.id_raffle = ? AND FIND_IN_SET(?, REPLACE(REPLACE(tickets.tickets_sold, '[', ''), ']', ''))
    `;
    let [matchingTickets] = await connection.execute(sql, [id_raffle ,number_ticket])

    if (matchingTickets.length > 0) {
      msg = {
        status: true,
        message: "Tickets found",
        info : matchingTickets,
        code: 200
      }
    }
  
    connection.release()

    return msg
  } catch (err) {
    console.log(err)
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
    }else if(montoAbonado == 0){
      status_ticket = 3
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
const verifyPayment = async ({payments}) => {
  try {
    let msg = {
      status: false,
      message: "Payment already exists",
      code: 500
    }

    const connection = await pool.getConnection()

    let sql = `SELECT amount_paid , amount_total , status_ticket FROM tickets WHERE id_ticket = ? ;`
    const [rows] = await connection.execute(sql, [id_ticket])

    if (rows.length > 0) {
      
      let monto_a_pagar = rows[0].amount_paid
      let montoPagado = rows[0].amount_total
      let status = rows[0].status_ticket

      if(montoPagado >= monto_a_pagar && status == 2){
        msg = {
          status: true,
          message: "Payment for register",
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

// ----- Save Payment -----
const regTicketsPayment = async ({payments}) => {
  try {
    let msg = {
      status: false,
      message: "Payment not registered successfully",
      code: 500
    }

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

      msg = {
        status: false,
        message: "Payment registered successfully",
        code: 200
      }
    }
  

    connection.release();



    return msg

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

  getDetailedTickets,

  verifyPayment,
  regTicketsPayment,

  getTickets,
  getPayments,

  activationTicket,
  activationPayment
}
