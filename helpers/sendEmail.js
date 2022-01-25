const sgMail = require("@sendgrid/mail");

const { SENDGRID_API_KEY } = process.env;

sgMail.setApiKey(SENDGRID_API_KEY);

// const data = {
//   to: "cyber-pasha.bigmir.net",
//   subject: "Verifying new email GoIT-HW",
//   html: "<p>Please confirm your email</p>",
// };

const sendEmail = async (data) => {
  try {
    const email = { ...data, from: "prykhodko.p@gmail.com" };
    await sgMail.send(email);
    return true;
  } catch (error) {
    return error;
  }
};

module.exports = sendEmail;
