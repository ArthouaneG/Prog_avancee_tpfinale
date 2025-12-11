import nodemailer from 'nodemailer';
import { Appointment } from '@prisma/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Configuration du transporteur email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // true pour 465, false pour d'autres ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Template d'email de confirmation de rendez-vous
const getAppointmentConfirmationTemplate = (appointment: Appointment, isModification = false) => {
  const dateFormatted = format(new Date(appointment.date), 'EEEE d MMMM yyyy', { locale: fr });
  const action = isModification ? 'modifié' : 'confirmé';
  
  return {
    subject: `Rendez-vous ${action} - PneuExpress`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(to right, #3b82f6, #1e40af); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .detail-label { font-weight: bold; width: 150px; }
          .detail-value { flex: 1; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔧 PneuExpress</h1>
            <p>Votre rendez-vous a été ${action}</p>
          </div>
          <div class="content">
            <h2>Bonjour ${appointment.clientName},</h2>
            <p>Nous vous confirmons votre rendez-vous pour le changement de pneus :</p>
            
            <div class="details">
              <div class="detail-row">
                <span class="detail-label">Date :</span>
                <span class="detail-value">${dateFormatted}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Heure :</span>
                <span class="detail-value">${appointment.timeSlot}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Marque du véhicule :</span>
                <span class="detail-value">${appointment.carBrand}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Nom :</span>
                <span class="detail-value">${appointment.clientName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Email :</span>
                <span class="detail-value">${appointment.email}</span>
              </div>
            </div>

            <p><strong>Important :</strong></p>
            <ul>
              <li>Veuillez arriver 5 minutes avant l'heure prévue</li>
              <li>Apportez vos pneus si vous les possédez déjà</li>
              <li>Le service dure environ 45 minutes</li>
            </ul>

            <p>Si vous avez des questions ou souhaitez modifier votre rendez-vous, n'hésitez pas à nous contacter.</p>
            
            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/mes-rendez-vous" class="button">
                Voir mes rendez-vous
              </a>
            </div>
          </div>
          <div class="footer">
            <p>PneuExpress - Service de changement de pneus</p>
            <p>Ce courriel a été envoyé automatiquement, merci de ne pas y répondre.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Bonjour ${appointment.clientName},

Nous vous confirmons votre rendez-vous pour le changement de pneus :

Date : ${dateFormatted}
Heure : ${appointment.timeSlot}
Marque du véhicule : ${appointment.carBrand}
Nom : ${appointment.clientName}
Email : ${appointment.email}

Important :
- Veuillez arriver 5 minutes avant l'heure prévue
- Apportez vos pneus si vous les possédez déjà
- Le service dure environ 45 minutes

Si vous avez des questions ou souhaitez modifier votre rendez-vous, n'hésitez pas à nous contacter.

PneuExpress - Service de changement de pneus
    `,
  };
};

// Template d'email d'annulation
const getCancellationTemplate = (appointment: Appointment) => {
  const dateFormatted = format(new Date(appointment.date), 'EEEE d MMMM yyyy', { locale: fr });
  
  return {
    subject: 'Annulation de rendez-vous - PneuExpress',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(to right, #ef4444, #b91c1c); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔧 PneuExpress</h1>
            <p>Annulation de rendez-vous</p>
          </div>
          <div class="content">
            <h2>Bonjour ${appointment.clientName},</h2>
            <p>Votre rendez-vous suivant a été annulé :</p>
            
            <div class="details">
              <p><strong>Date :</strong> ${dateFormatted}</p>
              <p><strong>Heure :</strong> ${appointment.timeSlot}</p>
              <p><strong>Marque du véhicule :</strong> ${appointment.carBrand}</p>
            </div>

            <p>Si vous souhaitez prendre un nouveau rendez-vous, n'hésitez pas à le faire en ligne.</p>
            
            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" class="button">
                Prendre un nouveau rendez-vous
              </a>
            </div>
          </div>
          <div class="footer">
            <p>PneuExpress - Service de changement de pneus</p>
            <p>Ce courriel a été envoyé automatiquement, merci de ne pas y répondre.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Bonjour ${appointment.clientName},

Votre rendez-vous suivant a été annulé :

Date : ${dateFormatted}
Heure : ${appointment.timeSlot}
Marque du véhicule : ${appointment.carBrand}

Si vous souhaitez prendre un nouveau rendez-vous, n'hésitez pas à le faire en ligne.

PneuExpress - Service de changement de pneus
    `,
  };
};

// Fonction pour envoyer un email de confirmation
export async function sendAppointmentConfirmationEmail(appointment: Appointment, isModification = false) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('SMTP credentials not configured. Email notification skipped.');
    return { success: false, message: 'SMTP not configured' };
  }

  try {
    const emailContent = getAppointmentConfirmationTemplate(appointment, isModification);
    
    const info = await transporter.sendMail({
      from: `"PneuExpress" <${process.env.SMTP_USER}>`,
      to: appointment.email,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
    });

    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

// Fonction pour envoyer un email d'annulation
export async function sendCancellationEmail(appointment: Appointment) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('SMTP credentials not configured. Email notification skipped.');
    return { success: false, message: 'SMTP not configured' };
  }

  try {
    const emailContent = getCancellationTemplate(appointment);
    
    const info = await transporter.sendMail({
      from: `"PneuExpress" <${process.env.SMTP_USER}>`,
      to: appointment.email,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
    });

    console.log('Cancellation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending cancellation email:', error);
    return { success: false, error };
  }
}
