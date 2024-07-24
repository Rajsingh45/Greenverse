// backend/routes/contactRoutes.js
const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();
require('dotenv').config(); // Load environment variables from .env file

router.post('/contact', async (req, res) => {
  const { name, email, phone, message } = req.body;

  // Create a transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER, // Use environment variable
      pass: process.env.EMAIL_PASS,  // Use app password environment variable
    },
  });

  // Setup email data with unicode symbols
  let mailOptions = {
    from: `"Contact Us Form" <${process.env.EMAIL_USER}>`, // sender address
    to: `${process.env.EMAIL_USER}`, // replace with your company email address
    replyTo: email,
    subject: 'New Contact Us Form Submission', // Subject line
    text: `You have a new contact form submission from:
         Name: ${name}
         Email: ${email}
         Phone: ${phone}
         Message: ${message}`,
  html: `<p>You have a new contact form submission from:</p>
         <p>Name: ${name}<br>
         Email: ${email}<br>
         Phone: ${phone}<br>
         Message: ${message}</p>
         <p style="color: red; font-weight: bold;">Note: Click 'Reply' to respond to the user's email address. Remember to remove this note before sending your reply.</p>`,
  };

  // Send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).send(error.toString());
    }
    res.status(200).send('Your query has been submitted successfully.');
  });
});

module.exports = router;
