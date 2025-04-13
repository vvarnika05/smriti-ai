import { NextResponse } from "next/server";
import { twilioClient } from "@/lib/twilio";
import prisma from "@/lib/prisma";

const memes = [
  "https://res.cloudinary.com/dlvcibxgx/image/upload/v1744576271/WhatsApp_Image_2025-04-14_at_01.45.17_f73174b0_d3a8fs.jpg",
  "https://res.cloudinary.com/dlvcibxgx/image/upload/v1744576661/WhatsApp_Image_2025-04-14_at_02.05.00_223639b9_k7hqfo.jpg",
  "https://res.cloudinary.com/dlvcibxgx/image/upload/v1744576666/WhatsApp_Image_2025-04-14_at_02.05.43_a40fe67c_byswor.jpg",
  "https://res.cloudinary.com/dlvcibxgx/image/upload/v1744576671/WhatsApp_Image_2025-04-14_at_02.06.22_76fdc7e4_geuj3v.jpg",
];
const text = [
  "Padhai kar lo thoda ⏰",
  "Aur bhai kesi chal rahi hai revision😼",
  "Revision naam ki bhi kuch chiz hoti hai janab 🐸",
  "Lijiye jal pijiye 🍸 aur revision kijiye",
];
export async function GET() {
  const users = await prisma.user.findMany({
    select: { mobile: true },
  });

  for (const user of users) {
    const randomMeme = memes[Math.floor(Math.random() * memes.length)];
    const textMeme = text[Math.floor(Math.random() * text.length)];
    await twilioClient.messages.create({
      to: `whatsapp:${user.mobile}`,
      from: process.env.TWILIO_PHONE_NUMBER!,
      body: textMeme,
      mediaUrl: [randomMeme],
    });
  }

  return NextResponse.json({ message: "Sent" });
}
