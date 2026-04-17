import { NextResponse } from "next/server";
import crypto from "crypto";
import connectToDatabase from "@/lib/db";
import { User } from "@/models/User";
import { sendEmail } from "@/lib/email";
import { getResetPasswordEmailHtml } from "@/lib/templates/resetPassword";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findOne({ email });

    if (!user) {
      // For security, don't reveal if user exists or not
      return NextResponse.json({ message: "If an account exists with that email, a reset link has been sent." });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour from now

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpires = resetPasswordExpires;
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;

    // FOR DEVELOPMENT: Log the reset URL so you can test without an email server
    console.log("-----------------------------------------");
    console.log("PASSWORD RESET URL:", resetUrl);
    console.log("-----------------------------------------");

    // Send email
    const emailHtml = getResetPasswordEmailHtml(resetUrl, user.name);
    const emailResult = await sendEmail({
      to: user.email,
      subject: "Password Reset Request - HR Portal",
      html: emailHtml,
    });

    if (!emailResult.success) {
      // In development, we might still want to proceed if we see the URL in console
      if (process.env.NODE_ENV === "development") {
        return NextResponse.json({ 
          message: "If an account exists with that email, a reset link has been sent.",
          debug: "Dev Mode: Check your terminal for the reset link!" 
        });
      }
      return NextResponse.json({ error: "Failed to send email. Please try again later." }, { status: 500 });
    }

    return NextResponse.json({ message: "If an account exists with that email, a reset link has been sent." });
  } catch (error: any) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json({ error: "An error occurred. Please try again." }, { status: 500 });
  }
}
