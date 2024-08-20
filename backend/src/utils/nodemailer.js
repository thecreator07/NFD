import nodemailer from 'nodemailer';

const createTransport = () => {
    return nodemailer.createTransport({
        service: 'gmail', // Use 'gmail' instead of 'Gmail'
        host: process.env.MAIL_HOST || "smtp.gmail.com",
        // port: parseInt(process.env.MAIL_PORT, 10) || 465,
        // secure: parseInt(process.env.MAIL_PORT, 10) === 465, // Set secure based on port
        auth: {
            user: process.env.EMAIL_ID,
            pass: process.env.EMAIL_PASS, // Use environment variable for password
        },
    });
}

export const email_verification_mail = async ({ email, subject, otp }) => {
    try {
        const transporter = createTransport();

        // Verify transporter configuration
        await transporter.verify();
        console.log("transporter",transporter)
        // Send email
        const info = await transporter.sendMail({
            from: {name:"game wizard",
               address: process.env.EMAIL_ID
            }, // sender address
            to: email, // receiver address
            subject: subject, // Subject line
            text: "Hello world?", // plain text body
            html: `<b>Your OTP is ${otp}</b>`, // HTML body
        });

        console.log("Email Info:", info);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};
