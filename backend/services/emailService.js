const nodemailer = require('nodemailer');

const sendOTPEmail = async (email, otp, name) => {
  console.log('\n==================================================');
  console.log(`📧 EMAIL OTP VERIFICATION SENT TO: ${email}`);
  console.log(`🔑 6-DIGIT OTP CODE: [ ${otp} ]`);
  console.log(`⏳ VALID FOR: 10 minutes`);
  console.log('==================================================\n');

  // If SMTP host is configured, attempt sending real email via Nodemailer
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      const htmlContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #020617; color: #f8fafc; border-radius: 16px; padding: 32px; border: 1px solid #1e293b;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #6366f1; font-size: 28px; margin: 0;">✨ TaskMind AI</h1>
            <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">Smart Productivity Platform</p>
          </div>
          <hr style="border: none; border-top: 1px solid #1e293b; margin: 24px 0;" />
          <h2 style="color: #ffffff; font-size: 20px;">Hello ${name || 'User'},</h2>
          <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
            Thank you for creating an account with TaskMind AI. Please use the One-Time Password (OTP) below to verify your email address:
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <div style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #ffffff; font-size: 32px; font-weight: 800; letter-spacing: 8px; padding: 16px 36px; border-radius: 12px; box-shadow: 0 10px 25px rgba(99, 102, 241, 0.3);">
              ${otp}
            </div>
            <p style="color: #ef4444; font-size: 12px; font-weight: 600; margin-top: 12px;">This code will expire in 10 minutes.</p>
          </div>
          <p style="color: #64748b; font-size: 12px; text-align: center; margin-top: 32px;">
            If you did not request this verification, please ignore this email.
          </p>
        </div>
      `;

      await transporter.sendMail({
        from: process.env.SMTP_FROM || '"TaskMind AI" <noreply@taskmind.ai>',
        to: email,
        subject: `${otp} is your TaskMind AI Verification Code`,
        html: htmlContent
      });
      console.log(`✅ Email successfully sent via SMTP to ${email}`);
    } catch (error) {
      console.warn(`⚠️ Real SMTP email sending failed: ${error.message}. (OTP code logged above)`);
    }
  }

  return true;
};

module.exports = { sendOTPEmail };
