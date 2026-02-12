import nodemailer from 'nodemailer';

let transporter;

// Initialize transporter with error handling
try {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
} catch (error) {
  console.warn('Email service not configured');
}

export const EmailService = {
  async sendVerificationEmail(email, token) {
    if (!transporter) {
      console.warn('Email service not available');
      return null;
    }

    const verificationUrl = `${process.env.REACT_APP_APP_URL || 'http://localhost:3000'}/verify-email/${token}`;
    
    return transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Email Doğrulama - HomeRate',
      html: `
        <h2>Email Doğrulama</h2>
        <p>Hesabınızı doğrulamak için aşağıdaki bağlantıya tıklayın:</p>
        <a href="${verificationUrl}">${verificationUrl}</a>
        <p>Bu bağlantı 24 saat geçerlidir.</p>
      `
    });
  },

  async sendPasswordReset(email, token) {
    if (!transporter) {
      console.warn('Email service not available');
      return null;
    }

    const resetUrl = `${process.env.REACT_APP_APP_URL || 'http://localhost:3000'}/reset-password/${token}`;
    
    return transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Şifre Sıfırlama - HomeRate',
      html: `
        <h2>Şifre Sıfırlama</h2>
        <p>Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>Bu bağlantı 1 saat geçerlidir.</p>
      `
    });
  },

  async sendTransactionNotification(email, transaction) {
    if (!transporter) {
      console.warn('Email service not available');
      return null;
    }

    return transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: `İşlem Onayı - ${transaction.type.toUpperCase()}`,
      html: `
        <h2>İşlem Onayı</h2>
        <p><strong>Tür:</strong> ${transaction.type}</p>
        <p><strong>Tutar:</strong> ${transaction.fromAmount} ${transaction.fromSymbol}</p>
        <p><strong>Durum:</strong> ${transaction.status}</p>
        <p><strong>Tarih:</strong> ${new Date(transaction.createdAt).toLocaleString('tr-TR')}</p>
      `
    });
  },

  async sendWelcomeEmail(email, username) {
    if (!transporter) {
      console.warn('Email service not available');
      return null;
    }

    return transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'HomeRate\'a Hoş Geldiniz',
      html: `
        <h2>HomeRate\'a Hoş Geldiniz!</h2>
        <p>Merhaba ${username},</p>
        <p>Sentetik emtia borsámıza kayıt olduğunuz için teşekkür ederiz.</p>
        <p>Hesabınızı kullanmaya başlamak için cüzданınızı bağlayın ve ilk işleminizi yapın.</p>
      `
    });
  }
};
