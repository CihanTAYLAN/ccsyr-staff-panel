import nodemailer from "nodemailer";

// Mail servisinin yapılandırılması
export const transporter = nodemailer.createTransport({
	host: process.env.MAIL_HOST,
	port: Number(process.env.MAIL_PORT) || 587,
	auth: {
		user: process.env.MAIL_USER,
		pass: process.env.MAIL_PASSWORD,
	},
	secure: Boolean(process.env.MAIL_SECURE) || false,
});

// Şifre sıfırlama e-postası gönderme
export const sendPasswordResetEmail = async (email: string, resetToken: string, newPassword: string) => {
	const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;

	const mailOptions = {
		from: `"${process.env.MAIL_FROM_NAME || "CCSYR Staff Panel"}" <${process.env.MAIL_FROM_ADDRESS || process.env.MAIL_USER}>`,
		to: email,
		subject: "Password Reset - CCSYR Staff Panel",
		html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset</h2>
        <p>You requested a password reset for your CCSYR Staff Panel account.</p>
        <p>Your temporary password is: <strong>${newPassword}</strong></p>
        <p>You will be asked to change this password on your next login.</p>
        <p>You can login using the link below:</p>
        <p>
          <a href="${process.env.NEXTAUTH_URL}/auth/login" style="background-color: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block;">Go to Login</a>
        </p>
        <p>If you didn't request this password reset, please contact your administrator immediately.</p>
        <p>Thank you,<br>CCSYR Staff Panel Team</p>
      </div>
    `,
	};

	await transporter.sendMail(mailOptions);
};

// Test email fonksiyonu
export const sendTestEmail = async (to: string) => {
	const mailOptions = {
		from: `"${process.env.MAIL_FROM_NAME || "CCSYR Staff Panel"}" <${process.env.MAIL_FROM_ADDRESS || process.env.MAIL_USER}>`,
		to,
		subject: "Test Email - CCSYR Staff Panel",
		html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Test Email</h2>
        <p>This is a test email from CCSYR Staff Panel.</p>
        <p>If you received this email, your email settings are configured correctly.</p>
        <p>Thank you,<br>CCSYR Staff Panel Team</p>
      </div>
    `,
	};

	await transporter.sendMail(mailOptions);
};
