const fs = require("fs");
const path = require("path");
const { app } = require("electron");

const DEFAULT_DB = {
  idCards: [],
  templates: [],
};

function getDbPath() {
  return path.join(app.getPath("userData"), "database.json");
}

function ensureDb() {
  const dbPath = getDbPath();
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify(DEFAULT_DB, null, 2), "utf8");
  }
  return dbPath;
}

function readDb() {
  const dbPath = ensureDb();
  try {
    const raw = fs.readFileSync(dbPath, "utf8");
    const parsed = JSON.parse(raw);
    return {
      idCards: Array.isArray(parsed.idCards) ? parsed.idCards : [],
      templates: Array.isArray(parsed.templates) ? parsed.templates : [],
    };
  } catch {
    return { ...DEFAULT_DB, idCards: [], templates: [] };
  }
}

function writeDb(db) {
  const dbPath = ensureDb();
  const tmp = `${dbPath}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2), "utf8");
  fs.renameSync(tmp, dbPath);
}

function getAllIDCards() {
  return readDb().idCards;
}

function saveIDCard(card) {
  const db = readDb();
  const index = db.idCards.findIndex((c) => c.id === card.id);
  const next = {
    ...card,
    updatedAt: new Date().toISOString(),
  };

  if (index >= 0) {
    db.idCards[index] = {
      ...db.idCards[index],
      ...next,
      createdAt: db.idCards[index].createdAt,
    };
  } else {
    db.idCards.unshift(next);
  }

  writeDb(db);
  return next;
}

function deleteIDCard(id) {
  const db = readDb();
  db.idCards = db.idCards.filter((c) => c.id !== id);
  writeDb(db);
}

function getAllTemplates() {
  return readDb().templates;
}

function saveTemplate(template) {
  const db = readDb();
  const index = db.templates.findIndex((t) => t.id === template.id);

  if (index >= 0) {
    db.templates[index] = template;
  } else {
    db.templates.unshift(template);
  }

  writeDb(db);
  return template;
}

function deleteTemplate(id) {
  const db = readDb();
  db.templates = db.templates.filter((t) => t.id !== id);
  writeDb(db);
}

function getDbInfo() {
  return {
    path: getDbPath(),
    userData: app.getPath("userData"),
  };
}

module.exports = {
  getAllIDCards,
  saveIDCard,
  deleteIDCard,
  getAllTemplates,
  saveTemplate,
  deleteTemplate,
  getDbInfo,
};
