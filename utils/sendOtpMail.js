const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Sends a simple OTP email to the user using SendGrid.
 *
 * @param {string} to - Recipient's email address.
 * @param {string} otp - One-Time Password to be sent in the email.
 * @returns {Promise<void>} - Resolves when the email is sent.
 */
const SendOtpEmail = async (to, otp) => {
  await sgMail.send({
    to,
    from: "anjumbackup21@gmail.com",
    subject: "Your OTP Code",
    text: `Your OTP is: ${otp}`,
  });
};

module.exports = SendOtpEmail;
