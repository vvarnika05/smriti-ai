import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Brain, Star } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="fixed w-full top-0 z-50 backdrop-blur-md bg-background/50 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/#" className="flex items-center cursor-pointer hover:opacity-90 transition-all duration-300 group">
              <Brain className="me-[5px] h-5 w-5 text-green-500 group-hover:text-emerald-400 transition-colors duration-300" />
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent group-hover:from-green-600 group-hover:to-emerald-500 transition-all duration-300">
                Smriti AI
              </span>
            </Link>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center gap-4">
            {/* Contact Link */}
            <Link href="/contact" className="hidden md:block cursor-pointer">
              <Button 
                variant="ghost" 
                className="rounded-full cursor-pointer hover:bg-green-50 dark:hover:bg-green-950/30 hover:text-green-600 dark:hover:text-green-400 transition-all duration-300 hover:scale-105"
              >
                Contact
              </Button>
            </Link>

            {/* GitHub Star Button */}
            <a
              href="https://github.com/vatsal-bhakodia/smriti-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer"
            >
              <Button
                variant="outline"
                className="rounded-full flex items-center gap-2 cursor-pointer border-green-500/30 text-green-600 hover:bg-gradient-to-r hover:from-green-500 hover:to-emerald-500 hover:text-white hover:border-green-400 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/25"
              >
                <Star className="h-4 w-4" />
                Star
              </Button>
            </a>

            <SignedOut>
              <Link href="/sign-in" className="hidden md:block cursor-pointer">
                <Button 
                  variant="outline" 
                  className="rounded-full cursor-pointer border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-950/30 hover:text-green-600 dark:hover:text-green-400 hover:border-green-300 dark:hover:border-green-600 transition-all duration-300 hover:scale-105"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up" className="cursor-pointer">
                <Button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full cursor-pointer hover:from-green-600 hover:to-emerald-600 hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300 hover:scale-105 border-0">
                  Sign Up
                </Button>
              </Link>
            </SignedOut>

            <SignedIn>
              <div className="cursor-pointer">
                <UserButton />
              </div>
            </SignedIn>
          </div>
        </div>
      </div>
    </nav>
  );
}