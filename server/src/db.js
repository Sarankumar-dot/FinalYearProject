/**
 * db.js — Local JSON file storage for demo mode (no MongoDB needed)
 * Data is stored in server/data/*.json and persists across restarts.
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

// Ensure the data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function filePath(name) {
  return path.join(DATA_DIR, `${name}.json`);
}

function readStore(name) {
  const fp = filePath(name);
  if (!fs.existsSync(fp)) return {};
  try {
    return JSON.parse(fs.readFileSync(fp, 'utf8'));
  } catch (_) {
    return {};
  }
}

function writeStore(name, data) {
  fs.writeFileSync(filePath(name), JSON.stringify(data, null, 2), 'utf8');
}

/**
 * Creates a persistent key-value store backed by a JSON file.
 * Works like a Map but auto-saves to disk on every write.
 */
function createStore(name) {
  const raw = readStore(name);
  const map = new Map(Object.entries(raw));

  return {
    has: (k) => map.has(String(k)),
    get: (k) => map.get(String(k)),
    set: (k, v) => {
      map.set(String(k), v);
      writeStore(name, Object.fromEntries(map));
      return v;
    },
    delete: (k) => {
      map.delete(String(k));
      writeStore(name, Object.fromEntries(map));
    },
    values: () => map.values(),
    entries: () => map.entries(),
    keys: () => map.keys(),
    get size() { return map.size; },
    toArray: () => [...map.values()],
  };
}

/**
 * Creates a persistent array store backed by a JSON file.
 */
function createArrayStore(name) {
  const fp = filePath(name);
  let arr = [];
  if (fs.existsSync(fp)) {
    try { arr = JSON.parse(fs.readFileSync(fp, 'utf8')); } catch (_) {}
  }

  const save = () => fs.writeFileSync(fp, JSON.stringify(arr, null, 2), 'utf8');

  return {
    push: (item) => { arr.push(item); save(); },
    filter: (fn) => arr.filter(fn),
    find: (fn) => arr.find(fn),
    get length() { return arr.length; },
    toArray: () => [...arr],
  };
}

module.exports = { createStore, createArrayStore };
