// Generates a 6-digit OTP and sends it by SMS.
// If TWILIO_* env vars aren't set (or the twilio package isn't installed),
// it falls back to logging the OTP to the server console so you can still
// test locally without paying for SMS — add real Twilio credentials
// (and `npm install twilio`) when you're ready to send real texts.

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000)); // always 6 digits
}

async function sendOtpSms(phone, otp) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (sid && token && from) {
    try {
      // eslint-disable-next-line global-require
      const twilioClient = require('twilio')(sid, token);
      await twilioClient.messages.create({
        body: `Your MealMap verification code is ${otp}. It expires in 5 minutes.`,
        from,
        to: phone,
      });
      return true;
    } catch (err) {
      console.error('Twilio SMS failed, falling back to console log:', err.message);
    }
  }

  console.log(`[MealMap OTP] ${phone} -> ${otp} (no SMS provider configured — set TWILIO_* env vars to send real texts)`);
  return false;
}

module.exports = { generateOtp, sendOtpSms };
