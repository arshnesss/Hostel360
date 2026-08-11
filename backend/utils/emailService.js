const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    // Development fallback using Nodemailer test account (Ethereal)
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log('📧 Created Ethereal Test Email Transporter (Development Mode)');
    } catch (err) {
      console.log('⚠️ Transporter creation fallback to console logging.');
    }
  }
  return transporter;
};

/**
 * Send an Urgent Emergency Alert Email for Critical Hazards
 */
const sendEmergencyAlert = async ({ toEmail, complaintTitle, block, category, aiTags }) => {
  try {
    const activeTransporter = await getTransporter();
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #fef2f2; border: 2px solid #ef4444; rounded: 10px;">
        <h2 style="color: #dc2626; margin-top: 0;">🚨 URGENT: Critical Hazard Detected</h2>
        <p style="font-size: 16px; color: #7f1d1d;">
          AI Incident Triage has flagged a high-risk emergency complaint in <strong>Block ${block}</strong>.
        </p>
        <div style="background: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #fca5a5;">
          <p><strong>Title:</strong> ${complaintTitle}</p>
          <p><strong>Category:</strong> ${category}</p>
          <p><strong>Location:</strong> Hostel Block ${block}</p>
          <p><strong>AI Diagnostic Tags:</strong> ${aiTags?.join(', ') || 'N/A'}</p>
        </div>
        <p style="color: #991b1b; font-size: 12px; margin-top: 15px;">
          Immediate site inspection and warden dispatch is required.
        </p>
      </div>
    `;

    if (activeTransporter) {
      const info = await activeTransporter.sendMail({
        from: '"Hostel360 Emergency Triage" <no-reply@hostel360.internal>',
        to: toEmail || process.env.ADMIN_EMAIL || 'admin@hostel360.com',
        subject: `🚨 [EMERGENCY ALERT] Critical Hazard in Block ${block} - ${complaintTitle}`,
        html: htmlContent,
      });

      console.log('📧 Emergency Email Sent:', nodemailer.getTestMessageUrl(info) || info.messageId);
    } else {
      console.log(`📧 [MOCK EMAIL DISPATCH] Emergency Alert to ${toEmail || 'Admin'}: Block ${block} - ${complaintTitle}`);
    }
  } catch (err) {
    console.error('⚠️ Failed to send emergency email alert:', err.message);
  }
};

/**
 * Send Resolution / Status Update Email to Student
 */
const sendStatusUpdateEmail = async ({ studentEmail, studentName, complaintTitle, status, comment }) => {
  try {
    const activeTransporter = await getTransporter();
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px;">
        <h3 style="color: #2563eb; margin-top: 0;">Hostel360 Ticket Update</h3>
        <p>Dear <strong>${studentName || 'Student'}</strong>,</p>
        <p>Your submitted grievance "<strong>${complaintTitle}</strong>" status has been updated to:</p>
        <p style="font-size: 18px; font-weight: bold; color: ${status === 'Resolved' ? '#16a34a' : '#d97706'};">
          ${status.toUpperCase()}
        </p>
        ${comment ? `<div style="background: #ffffff; padding: 12px; border-left: 4px solid #2563eb; margin: 15px 0;">
          <p style="margin: 0; font-size: 14px; color: #334155;"><strong>Warden Response:</strong> ${comment}</p>
        </div>` : ''}
        <p style="font-size: 12px; color: #64748b; margin-top: 20px;">
          Hostel Management System • Hostel360
        </p>
      </div>
    `;

    if (activeTransporter && studentEmail) {
      const info = await activeTransporter.sendMail({
        from: '"Hostel360 Support" <support@hostel360.internal>',
        to: studentEmail,
        subject: `[Hostel360 Update] Ticket "${complaintTitle}" is now ${status}`,
        html: htmlContent,
      });
      console.log('📧 Status Update Email Sent:', nodemailer.getTestMessageUrl(info) || info.messageId);
    } else {
      console.log(`📧 [MOCK EMAIL DISPATCH] Status Update to ${studentEmail || 'Student'}: ${status}`);
    }
  } catch (err) {
    console.error('⚠️ Failed to send status email:', err.message);
  }
};

module.exports = {
  sendEmergencyAlert,
  sendStatusUpdateEmail,
};
