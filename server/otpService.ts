// OTP Service for sending OTP via SMS
// For production, replace this with Twilio or another SMS service

export function generateOTP(): string {
  // Generate a 6-digit OTP
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function sendOTP(phoneNumber: string, otp: string): Promise<boolean> {
  // Mock SMS service - logs to console
  // In production, replace with actual SMS service like Twilio
  console.log(`\n📱 SMS OTP sent to ${phoneNumber}`)
  console.log(`   OTP Code: ${otp}`)
  console.log(`   (This is a mock service. In production, use Twilio or similar)\n`)
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // For development, always return true
  // In production, return the actual result from SMS service
  return true
}

// Email OTP service
export async function sendEmailOTP(email: string, otp: string): Promise<boolean> {
  // Mock email service - logs to console
  // In production, replace with actual email service like Nodemailer
  console.log(`\n📧 Email OTP sent to ${email}`)
  console.log(`   OTP Code: ${otp}`)
  console.log(`   (This is a mock service. In production, use Nodemailer or similar)\n`)
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  return true
}

