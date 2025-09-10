import { generateMetadataUtil } from "@/utils/generateMetadata";
import SignInForm from "@/components/auth/SignInForm";

export const metadata = generateMetadataUtil({
  title: "Sign In",
  description: "Sign in to your Smriti AI account to access personalized learning tools, flashcards, mind maps, and AI-powered study materials.",
  keywords: [
    "Smriti AI login",
    "sign in",
    "user account",
    "AI learning platform",
    "study tools login",
    "flashcards access",
    "personalized learning",
    "AI study companion"
  ],
  url: "https://www.smriti.live/sign-in",
});

export default function SignInPage() {
  return <SignInForm />;
}
