import twilio from 'twilio';
import dotenv from 'dotenv';
dotenv.config();

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

export const sendSMS = async (to, body) => {
  return client.messages.create({
    from: process.env.TWILIO_PHONE,
    to,
    body
  });
};

export const makeCall = async (to) => {
  return client.calls.create({
    from: process.env.TWILIO_PHONE,
    to,
    url: 'http://demo.twilio.com/docs/voice.xml'
  });
};