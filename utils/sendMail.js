import { createTransport } from "nodemailer";

export const sendMail = async (email, subject, message) => {
  const transport = createTransport({
    host: process.env.SMTP_Host, // here we use mail service that is 'mailtrap , gmail'
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
  transport
    .verify()
    .then(console.log("success from sendmail file "))
    .catch((err) => {
      console.log(`error recived fomr sendMail file ${err}`);
    });

  await transport
    .sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject,
      text: message,
    })
    .then((msg) => {
      console.log(`suceess msg from sendmail1${msg}`);
    })
    .catch((err) => {
      console.log(`error from sendmail1 ${err}`);
    });
};
