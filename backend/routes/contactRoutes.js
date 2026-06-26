import { Router } from 'express';
import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';

const router = Router();

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const isEmail = (value = '') => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const createTransport = () => {
  const missing = [
    ['SMTP_HOST', env.SMTP_HOST],
    ['SMTP_USER', env.SMTP_USER],
    ['SMTP_PASS', env.SMTP_PASS],
    ['CONTACT_FROM_EMAIL', env.CONTACT_FROM_EMAIL],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missing.length > 0) {
    throw new AppError(
      `Email service is not configured. Missing: ${missing.join(', ')}.`,
      503,
    );
  }

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
};

const buildEmail = ({ fullName, email, company, fleetSize, message }) => {
  const safe = {
    fullName: escapeHtml(fullName),
    email: escapeHtml(email),
    company: escapeHtml(company),
    fleetSize: escapeHtml(fleetSize),
    message: escapeHtml(message || 'No message provided.').replace(/\n/g, '<br />'),
  };

  const subject = `New demo request from ${company}`;

  const text = [
    'New ULSS demo request',
    '',
    `Full Name: ${fullName}`,
    `Work Email: ${email}`,
    `Company: ${company}`,
    `Fleet Size: ${fleetSize}`,
    '',
    'Message:',
    message || 'No message provided.',
  ].join('\n');

  const html = `
    <div style="margin:0;padding:0;background:#f5f5f2;font-family:Arial,Helvetica,sans-serif;color:#171717;">
      <div style="max-width:680px;margin:0 auto;padding:32px 18px;">
        <div style="background:#0b0b0b;border:1px solid #d4af37;border-radius:12px;overflow:hidden;">
          <div style="padding:28px 30px;border-bottom:1px solid rgba(212,175,55,0.25);">
            <p style="margin:0 0 8px;color:#d4af37;font-size:12px;letter-spacing:1.8px;text-transform:uppercase;">ULSS Inventories</p>
            <h1 style="margin:0;color:#ffffff;font-size:24px;line-height:1.3;">New Demo Request</h1>
            <p style="margin:10px 0 0;color:rgba(255,255,255,0.62);font-size:14px;">A visitor submitted the Elevate Your Operations form.</p>
          </div>
          <div style="padding:28px 30px;background:#111111;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
              <tr>
                <td style="padding:12px 0;color:rgba(255,255,255,0.48);font-size:12px;text-transform:uppercase;letter-spacing:1px;width:150px;">Full Name</td>
                <td style="padding:12px 0;color:#ffffff;font-size:15px;">${safe.fullName}</td>
              </tr>
              <tr>
                <td style="padding:12px 0;color:rgba(255,255,255,0.48);font-size:12px;text-transform:uppercase;letter-spacing:1px;">Work Email</td>
                <td style="padding:12px 0;color:#ffffff;font-size:15px;"><a href="mailto:${safe.email}" style="color:#d4af37;text-decoration:none;">${safe.email}</a></td>
              </tr>
              <tr>
                <td style="padding:12px 0;color:rgba(255,255,255,0.48);font-size:12px;text-transform:uppercase;letter-spacing:1px;">Company</td>
                <td style="padding:12px 0;color:#ffffff;font-size:15px;">${safe.company}</td>
              </tr>
              <tr>
                <td style="padding:12px 0;color:rgba(255,255,255,0.48);font-size:12px;text-transform:uppercase;letter-spacing:1px;">Fleet Size</td>
                <td style="padding:12px 0;color:#ffffff;font-size:15px;">${safe.fleetSize}</td>
              </tr>
            </table>
            <div style="margin-top:24px;padding:18px;border:1px solid rgba(212,175,55,0.18);border-radius:10px;background:rgba(255,255,255,0.035);">
              <p style="margin:0 0 8px;color:#d4af37;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Message</p>
              <p style="margin:0;color:rgba(255,255,255,0.78);font-size:15px;line-height:1.7;">${safe.message}</p>
            </div>
          </div>
          <div style="padding:18px 30px;background:#0b0b0b;color:rgba(255,255,255,0.42);font-size:12px;">
            Reply directly to this email to contact the requester.
          </div>
        </div>
      </div>
    </div>
  `;

  return { subject, text, html };
};

router.post('/demo-request', asyncHandler(async (req, res, next) => {
  const { fullName, email, company, fleetSize, message = '' } = req.body;

  if (!fullName || !email || !company || !fleetSize) {
    return next(new AppError('Full name, email, company, and fleet size are required.', 400));
  }

  if (!isEmail(email)) {
    return next(new AppError('Please provide a valid email address.', 400));
  }

  const transporter = createTransport();
  const emailContent = buildEmail({ fullName, email, company, fleetSize, message });

  try {
    await transporter.sendMail({
      from: `"${env.CONTACT_FROM_NAME}" <${env.CONTACT_FROM_EMAIL}>`,
      to: env.CONTACT_TO_EMAIL,
      replyTo: `"${fullName}" <${email}>`,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
    });
  } catch (error) {
    console.error('Email delivery failed:', error.message);
    return next(new AppError('Email delivery failed. Please check SMTP settings and app password.', 502));
  }

  res.json({ success: true, message: 'Demo request sent successfully.' });
}));

export const contactRoutes = router;
