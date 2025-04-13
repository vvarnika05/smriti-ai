// lib/twilio.ts
import { Twilio } from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;

if (!accountSid || !authToken) {
    throw new Error("Twilio credentials missing in env variables");
  }
  
export const twilioClient = new Twilio(accountSid, authToken);
