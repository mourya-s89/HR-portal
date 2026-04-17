export const getResetPasswordEmailHtml = (resetUrl: string, userName: string) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f7f9;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
          }
          .header {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            padding: 40px 20px;
            text-align: center;
          }
          .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: -0.5px;
          }
          .content {
            padding: 40px;
            color: #334155;
            line-height: 1.6;
          }
          .content h2 {
            font-size: 20px;
            font-weight: 600;
            margin-top: 0;
            color: #1e293b;
          }
          .button-container {
            text-align: center;
            margin: 35px 0;
          }
          .button {
            background-color: #4f46e5;
            color: #ffffff !important;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            display: inline-block;
            transition: background-color 0.3s ease;
          }
          .footer {
            padding: 24px;
            text-align: center;
            font-size: 13px;
            color: #94a3b8;
            background-color: #f8fafc;
          }
          .footer p {
            margin: 5px 0;
          }
          .link {
            color: #4f46e5;
            word-break: break-all;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>HR Portal</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName},</h2>
            <p>We received a request to reset your password for your HR Portal account. No changes have been made to your account yet.</p>
            <p>You can reset your password by clicking the button below:</p>
            <div class="button-container">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
            <p>This link will expire in 1 hour.</p>
            <p>Best regards,<br>The HR Portal Team</p>
          </div>
          <div class="footer">
            <p>If the button above doesn't work, copy and paste this link into your browser:</p>
            <p><a href="${resetUrl}" class="link">${resetUrl}</a></p>
            <p>&copy; ${new Date().getFullYear()} HR Portal. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};
