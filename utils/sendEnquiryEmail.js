require("dotenv").config();
const sgMail = require("@sendgrid/mail");

// Set SendGrid API key from environment variable
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Sends an enquiry email using a dynamic SendGrid template.
 *
 * @param {string} to - Recipient email address.
 * @param {Object} dynamicData - Data to be injected into the SendGrid dynamic template.
 * @returns {Promise<void>} - Resolves when email is sent, logs error otherwise.
 */
async function sendEnquiryEmail(to, dynamicData) {
  const msg = {
    to,
    from: "anjumbackup21@gmail.com", // Must be a verified sender in SendGrid
    templateId: process.env.SENDGRID_TEMPLATE_ID,
    dynamic_template_data: dynamicData,
  };

  return sgMail
    .send(msg)
    .then(() => console.log("Email sent to", to))
    .catch((error) => {
      console.error("SendGrid Error:", error.response?.body || error.message);
    });
}

module.exports = { sendEnquiryEmail };
