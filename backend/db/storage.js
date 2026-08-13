const fs = require('fs');
const path = require('path');

// Directorio de datos. En producción se apunta a un volumen persistente
// (DATA_DIR=/app/data) para que los leads y el admin sobrevivan a los
// redeploys; en local cae a esta misma carpeta.
const DATA_DIR = process.env.DATA_DIR || __dirname;
const DB_PATH = path.join(DATA_DIR, 'benia.json');

function load() {
  if (!fs.existsSync(DB_PATH)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const initial = { leads: [], admins: [], orders: [], nextLeadId: 1, nextAdminId: 1, nextOrderId: 1 };
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2));
    return initial;
  }
  const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  if (!data.orders) data.orders = [];
  if (!data.nextOrderId) data.nextOrderId = 1;
  return data;
}

function save(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

const db = {
  insertLead(company, email, goal) {
    const data = load();
    const lead = {
      id: data.nextLeadId++,
      company, email, goal,
      status: 'pendiente',
      created_at: new Date().toISOString(),
    };
    data.leads.push(lead);
    save(data);
    return lead;
  },

  getLeads() {
    const data = load();
    return data.leads.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  updateLeadStatus(id, status) {
    const data = load();
    const lead = data.leads.find(l => l.id === parseInt(id));
    if (lead) lead.status = status;
    save(data);
  },

  deleteLead(id) {
    const data = load();
    data.leads = data.leads.filter(l => l.id !== parseInt(id));
    save(data);
  },

  insertOrder({ serviceId, amount, maintenance, customerName, customerEmail,
                stripeCustomerId, stripePaymentIntentId, stripeSubscriptionId,
                stripeRefId, status }) {
    const data = load();
    const order = {
      id: data.nextOrderId++,
      serviceId, amount, maintenance: Boolean(maintenance),
      customerName, customerEmail,
      stripeCustomerId: stripeCustomerId || null,
      stripePaymentIntentId: stripePaymentIntentId || null,
      stripeSubscriptionId: stripeSubscriptionId || null,
      stripeRefId, // referencia única para idempotencia (pi_... o in_...)
      status: status || 'paid',
      created_at: new Date().toISOString(),
    };
    data.orders.push(order);
    save(data);
    return order;
  },

  getOrderByStripeRef(stripeRefId) {
    const data = load();
    return data.orders.find(o => o.stripeRefId === stripeRefId) || null;
  },

  getOrders() {
    const data = load();
    return data.orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  getAdmin(username) {
    const data = load();
    return data.admins.find(a => a.username === username) || null;
  },

  upsertAdmin(username, hashedPassword) {
    const data = load();
    const existing = data.admins.find(a => a.username === username);
    if (existing) {
      existing.password = hashedPassword;
    } else {
      data.admins.push({ id: data.nextAdminId++, username, password: hashedPassword });
    }
    save(data);
  },
};

module.exports = db;
