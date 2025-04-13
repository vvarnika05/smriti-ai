import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Brain } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="fixed w-full top-0 z-50 backdrop-blur-md bg-background/50 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center">
              <Brain className="me-[5px] h-5 w-5 text-primary" />
              <span className="text-xl font-bold">Smriti AI</span>
            </Link>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center gap-4">
            <SignedOut>
              <Link href="/sign-in">
                <Button variant="outline" className="rounded-full">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button className="bg-primary rounded-full">Sign Up</Button>
              </Link>
            </SignedOut>

            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </div>
    </nav>
  );
}
