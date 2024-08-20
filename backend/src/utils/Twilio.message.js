// server.js
const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const app = express();

app.use(bodyParser.json());

const accountSid = 'your_account_sid';
const authToken = 'your_auth_token';
const client = new twilio(accountSid, authToken);

app.post('/api/send-otp', (req, res) => {
  const { mobile } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit OTP

  client.messages.create({
    body: `Your OTP is ${otp}`,
    from: 'your_twilio_phone_number',
    to: 9801486553
  }).then(message => {
    // Store OTP in database or memory for later verification
    res.status(200).send('OTP sent');
  }).catch(error => {
    res.status(500).send('Error sending OTP');
  });
});

app.post('/api/verify-otp', (req, res) => {
  const { mobile, otp } = req.body;
  // Verify OTP (check against stored OTP)
  res.status(200).send('OTP verified');
});

app.listen(3000, () => console.log('Server running on port 3000'));
