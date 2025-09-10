import { generateMetadataUtil } from "@/utils/generateMetadata";
import SignUpForm from "@/components/auth/SignUpForm";

export const metadata = generateMetadataUtil({
  title: "Sign Up",
  description: "Create your free Smriti AI account and start learning smarter with AI-powered study tools, personalized learning paths, and intelligent flashcards.",
  keywords: [
    "Smriti AI signup",
    "create account",
    "free registration",
    "AI study tools",
    "join Smriti AI",
    "learning platform signup",
    "AI flashcards",
    "personalized learning",
    "smart studying"
  ],
  url: "https://www.smriti.live/sign-up",
});

export default function SignUpPage() {
  return <SignUpForm />;
}