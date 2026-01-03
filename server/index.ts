import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import { initDatabase, getDatabase, saveDatabase } from './database'
import { generateOTP, sendOTP, sendEmailOTP } from './otpService'

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json({ limit: '10mb' }))

// Initialize database on server start
let dbReady = false
initDatabase().then(() => {
  dbReady = true
  console.log('Database initialized')
}).catch(err => {
  console.error('Database initialization error:', err)
})

// Middleware to ensure database is ready
const ensureDbReady = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!dbReady) {
    return res.status(503).json({ error: 'Database not ready' })
  }
  next()
}

// Signup endpoint
app.post('/api/signup', ensureDbReady, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      city,
      country,
      description,
      profilePicture
    } = req.body

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !phoneNumber || !city || !country) {
      return res.status(400).json({ error: 'All required fields must be provided' })
    }

    const db = getDatabase()

    // Check if user already exists
    const checkStmt = db.prepare('SELECT id FROM users WHERE email = ?')
    checkStmt.bind([email])
    const existingUser = checkStmt.step() ? checkStmt.getAsObject() : null
    checkStmt.free()

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Insert user
    const stmt = db.prepare(`
      INSERT INTO users (first_name, last_name, email, password, phone_number, city, country, description, profile_picture)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    stmt.run([
      firstName,
      lastName,
      email,
      hashedPassword,
      phoneNumber,
      city,
      country,
      description || null,
      profilePicture || null
    ])
    stmt.free()
    saveDatabase()

    res.status(201).json({
      message: 'User created successfully'
    })
  } catch (error) {
    console.error('Signup error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Login endpoint
app.post('/api/login', ensureDbReady, async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const db = getDatabase()

    // Find user
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?')
    stmt.bind([email])
    const user = stmt.step() ? stmt.getAsObject() as any : null
    stmt.free()

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password as string)
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user
    res.json({
      message: 'Login successful',
      user: userWithoutPassword
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get user by email endpoint (for displaying profile picture)
app.get('/api/user/:email', ensureDbReady, (req, res) => {
  try {
    const { email } = req.params
    const db = getDatabase()

    const stmt = db.prepare('SELECT id, email, profile_picture FROM users WHERE email = ?')
    stmt.bind([email])
    const user = stmt.step() ? stmt.getAsObject() as any : null
    stmt.free()

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({ profilePicture: user.profile_picture })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Validate phone number format
function isValidPhoneNumber(phone: string): boolean {
  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '')
  // Check if it has 10-15 digits (international format)
  return digitsOnly.length >= 10 && digitsOnly.length <= 15
}

// Send OTP to phone number
app.post('/api/send-phone-otp', ensureDbReady, async (req, res) => {
  try {
    const { phoneNumber } = req.body

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' })
    }

    // Validate phone number format
    if (!isValidPhoneNumber(phoneNumber)) {
      return res.status(400).json({ error: 'Invalid phone number format' })
    }

    const db = getDatabase()
    
    // Generate OTP
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now

    // Delete old OTPs for this phone number
    const deleteStmt = db.prepare('DELETE FROM otps WHERE phone_number = ? AND type = ?')
    deleteStmt.run([phoneNumber, 'phone'])
    deleteStmt.free()

    // Store OTP
    const stmt = db.prepare(`
      INSERT INTO otps (phone_number, otp_code, type, expires_at)
      VALUES (?, ?, ?, ?)
    `)
    stmt.run([phoneNumber, otp, 'phone', expiresAt.toISOString()])
    stmt.free()
    saveDatabase()

    // Send OTP via SMS
    await sendOTP(phoneNumber, otp)

    res.json({
      message: 'OTP sent successfully',
      // In development, return OTP for testing (remove in production)
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    })
  } catch (error) {
    console.error('Send OTP error:', error)
    res.status(500).json({ error: 'Failed to send OTP' })
  }
})

// Verify phone OTP
app.post('/api/verify-phone-otp', ensureDbReady, async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body

    if (!phoneNumber || !otp) {
      return res.status(400).json({ error: 'Phone number and OTP are required' })
    }

    const db = getDatabase()

    // Find valid OTP
    const stmt = db.prepare(`
      SELECT * FROM otps 
      WHERE phone_number = ? AND otp_code = ? AND type = ? AND verified = 0
      ORDER BY created_at DESC LIMIT 1
    `)
    stmt.bind([phoneNumber, otp, 'phone'])
    const otpRecord = stmt.step() ? stmt.getAsObject() as any : null
    stmt.free()

    if (!otpRecord) {
      return res.status(400).json({ error: 'Invalid or expired OTP' })
    }

    // Check if OTP is expired
    const expiresAt = new Date(otpRecord.expires_at)
    if (expiresAt < new Date()) {
      return res.status(400).json({ error: 'OTP has expired' })
    }

    // Mark OTP as verified
    const updateStmt = db.prepare('UPDATE otps SET verified = 1 WHERE id = ?')
    updateStmt.run([otpRecord.id])
    updateStmt.free()
    saveDatabase()

    res.json({
      message: 'Phone number verified successfully',
      verified: true
    })
  } catch (error) {
    console.error('Verify OTP error:', error)
    res.status(500).json({ error: 'Failed to verify OTP' })
  }
})

// Send email verification OTP
app.post('/api/send-email-otp', ensureDbReady, async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: 'Email is required' })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    const db = getDatabase()
    
    // Generate OTP
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Delete old OTPs for this email
    const deleteStmt = db.prepare('DELETE FROM otps WHERE email = ? AND type = ?')
    deleteStmt.run([email, 'email'])
    deleteStmt.free()

    // Store OTP
    const stmt = db.prepare(`
      INSERT INTO otps (email, otp_code, type, expires_at)
      VALUES (?, ?, ?, ?)
    `)
    stmt.run([email, otp, 'email', expiresAt.toISOString()])
    stmt.free()
    saveDatabase()

    // Send OTP via email
    await sendEmailOTP(email, otp)

    res.json({
      message: 'Verification code sent to email',
      // In development, return OTP for testing
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    })
  } catch (error) {
    console.error('Send email OTP error:', error)
    res.status(500).json({ error: 'Failed to send verification code' })
  }
})

// Verify email OTP
app.post('/api/verify-email-otp', ensureDbReady, async (req, res) => {
  try {
    const { email, otp } = req.body

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' })
    }

    const db = getDatabase()

    // Find valid OTP
    const stmt = db.prepare(`
      SELECT * FROM otps 
      WHERE email = ? AND otp_code = ? AND type = ? AND verified = 0
      ORDER BY created_at DESC LIMIT 1
    `)
    stmt.bind([email, otp, 'email'])
    const otpRecord = stmt.step() ? stmt.getAsObject() as any : null
    stmt.free()

    if (!otpRecord) {
      return res.status(400).json({ error: 'Invalid or expired verification code' })
    }

    // Check if OTP is expired
    const expiresAt = new Date(otpRecord.expires_at)
    if (expiresAt < new Date()) {
      return res.status(400).json({ error: 'Verification code has expired' })
    }

    // Mark OTP as verified
    const updateStmt = db.prepare('UPDATE otps SET verified = 1 WHERE id = ?')
    updateStmt.run([otpRecord.id])
    updateStmt.free()
    saveDatabase()

    res.json({
      message: 'Email verified successfully',
      verified: true
    })
  } catch (error) {
    console.error('Verify email OTP error:', error)
    res.status(500).json({ error: 'Failed to verify email' })
  }
})

// Update signup endpoint to require verified phone and email
app.post('/api/signup', ensureDbReady, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      city,
      country,
      description,
      profilePicture,
      phoneVerified,
      emailVerified
    } = req.body

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !phoneNumber || !city || !country) {
      return res.status(400).json({ error: 'All required fields must be provided' })
    }

    // Check if phone and email are verified
    if (!phoneVerified) {
      return res.status(400).json({ error: 'Phone number must be verified' })
    }
    if (!emailVerified) {
      return res.status(400).json({ error: 'Email must be verified' })
    }

    const db = getDatabase()

    // Check if user already exists
    const checkStmt = db.prepare('SELECT id FROM users WHERE email = ?')
    checkStmt.bind([email])
    const existingUser = checkStmt.step() ? checkStmt.getAsObject() : null
    checkStmt.free()

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Insert user with verified status
    const stmt = db.prepare(`
      INSERT INTO users (first_name, last_name, email, password, phone_number, city, country, description, profile_picture, email_verified, phone_verified)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1)
    `)
    stmt.run([
      firstName,
      lastName,
      email,
      hashedPassword,
      phoneNumber,
      city,
      country,
      description || null,
      profilePicture || null
    ])
    stmt.free()
    saveDatabase()

    res.status(201).json({
      message: 'User created successfully'
    })
  } catch (error) {
    console.error('Signup error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
