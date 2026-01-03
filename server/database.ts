import initSqlJs, { Database } from 'sql.js'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

let db: Database | null = null
let SQL: any = null

const dbDir = path.join(process.cwd(), 'data')
const dbPath = path.join(dbDir, 'globe_trotter.db')

// For Node.js, we need to load sql.js from node_modules
const sqlJsPath = path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm')

export async function initDatabase() {
  if (db) return db

  // Initialize sql.js - in Node.js, we can use the default initialization
  SQL = await initSqlJs({
    locateFile: (file: string) => {
      // Try to find the wasm file locally first
      if (file.endsWith('.wasm')) {
        const localPath = path.join(process.cwd(), 'node_modules', 'sql.js', 'dist', file)
        if (existsSync(localPath)) {
          return localPath
        }
      }
      // Fallback to CDN
      return `https://sql.js.org/dist/${file}`
    }
  })

  if (existsSync(dbPath)) {
    const buffer = readFileSync(dbPath)
    db = new SQL.Database(buffer)
  } else {
    db = new SQL.Database()
    // Create users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        phone_number TEXT NOT NULL,
        city TEXT NOT NULL,
        country TEXT NOT NULL,
        description TEXT,
        profile_picture TEXT,
        email_verified INTEGER DEFAULT 0,
        phone_verified INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // Create OTP table for phone verification
    db.run(`
      CREATE TABLE IF NOT EXISTS otps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone_number TEXT NOT NULL,
        email TEXT,
        otp_code TEXT NOT NULL,
        type TEXT NOT NULL,
        expires_at DATETIME NOT NULL,
        verified INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // Create email verification tokens table
    db.run(`
      CREATE TABLE IF NOT EXISTS email_verifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        token TEXT NOT NULL,
        expires_at DATETIME NOT NULL,
        verified INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    saveDatabase()
  }

  return db
}

export function saveDatabase() {
  if (db) {
    if (!existsSync(dbDir)) {
      require('fs').mkdirSync(dbDir, { recursive: true })
    }
    const data = db.export()
    const buffer = Buffer.from(data)
    writeFileSync(dbPath, buffer)
  }
}

export function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.')
  }
  return db
}

export default getDatabase
