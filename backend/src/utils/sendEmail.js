import nodemailer from "nodemailer";

export const sendWelcomeEmail = async (email, name) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: `"ArtWall" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Welcome to ArtWall! 🎨",
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #6366f1;">Welcome to the Wall, ${name}!</h2>
                    <p>We're thrilled to have you join our community of artists and art lovers.</p>
                    <p>Start exploring, sharing your masterpieces, and connecting with others.</p>
                    <a href="http://localhost:3000" style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">Go to ArtWall</a>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #777;">If you have any questions, feel free to reply to this email.</p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`📧 Welcome email sent to ${email}`);
    } catch (error) {
        console.error("❌ Email error:", error);
    }
};
