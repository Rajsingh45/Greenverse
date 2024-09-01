const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();
require('dotenv').config(); // Load environment variables from .env file

router.post('/contact', async (req, res) => {
  const { name, email, phone, message, isSignedUp } = req.body;

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
    subject: 'New Query from Contact Us Form', // Subject line
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #dddddd; border-radius: 10px; overflow: hidden;">
        <div style="background-color: #28a745; padding: 20px; text-align: center;">
          <img src="https://drive.google.com/uc?export=view&id=1dLeVpb0FHcfZwY3_K2Hh22MEEBHAzq5R" alt="Company Logo" style="width: 40px; height: 50px;" />
          <h1 style="color: #ffffff; margin: 0;">Greenverse Private Limited</h1>
        </div>
        <div style="padding: 20px; background-color: #f4f4f4;">
          <h2 style="color: #333333;"> Query </h2>
          <p style="font-size: 16px; color: #555555;">
            You have a new query from:
          </p>
          <p style="font-size: 16px; color: #555555;">
            <strong>Name:</strong> ${name}<br>
            <strong>Email:</strong> ${email}<br>
            <strong>Phone:</strong> ${phone}<br>
            <strong>Message:</strong> ${message}
          </p>
          <div style="padding: 15px; text-align: center; border: 1px solid #dddddd; background-color: #ffffff; border-radius: 5px;">
            <p style="color: #333333; margin: 0;">
              ${isSignedUp ? 'A signed-in user' : 'A visitor'} has contacted you. Click 'Reply' to respond to the user's email address.
            </p>
          </div>
        </div>
      </div>`
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
