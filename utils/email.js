const nodemailer = require('nodemailer');

// dùng web mailtrap.io để fake nhận mail, thay vì nhận qua gmail
const sendEmail = async options => {
    // Tạo transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        },
        secure: false,
    });
    
    // Tạo email options
    const mailOptions = {
        from: 'Le Si Toan DZZZ',
        to: options.email,
        subject: options.subject,
        text: options.message,
        // html:
    }

    // Gửi mail
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;