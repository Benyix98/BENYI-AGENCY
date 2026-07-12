const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'benia.json');

function load() {
  if (!fs.existsSync(DB_PATH)) {
    const initial = { leads: [], admins: [], nextLeadId: 1, nextAdminId: 1 };
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
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
