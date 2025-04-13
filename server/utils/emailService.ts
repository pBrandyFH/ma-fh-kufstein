import { createTransport } from "nodemailer";
import { RoleType } from "../permissions/types";

// Configure nodemailer
const transporter = createTransport({
  host: process.env.EMAIL_HOST || "smtp.example.com",
  port: Number.parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER || "user@example.com",
    pass: process.env.EMAIL_PASS || "password",
  },
});

// Send invite email
export const sendInviteEmail = async (
  email: string,
  firstName: string,
  lastName: string,
  inviteCode: string,
  role: RoleType
) => {
  const registrationUrl = `${
    process.env.FRONTEND_URL || "http://localhost:3000"
  }/register?inviteCode=${inviteCode}&email=${encodeURIComponent(email)}`;

  const getRoleName = (role: RoleType): string => {
    switch (role) {
      case "ATHLETE":
        return "Athlete";
      case "CLUB_ADMIN":
        return "Club Administrator";
      case "FEDERATION_ADMIN":
        return "Federation Administrator";
      case "SUPERADMIN":
        return "Super Administrator";
      default:
        return role;
    }
  };

  const subject = "Invitation to join GoodLift";
  const html = `
    <h1>Welcome to GoodLift!</h1>
    <p>Hello ${firstName} ${lastName},</p>
    <p>You have been invited to join GoodLift as a ${getRoleName(role)}.</p>
    <p>Please click the link below to complete your registration:</p>
    <p><a href="${registrationUrl}">Complete Registration</a></p>
    <p>Or use the following invite code during registration: <strong>${inviteCode}</strong></p>
    <p>This invite will expire in 7 days.</p>
    <p>Best regards,<br>The GoodLift Team</p>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || "noreply@goodlift.org",
      to: email,
      subject,
      html,
    });

    console.log(`Invite email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Error sending invite email:", error);
    throw error;
  }
};
