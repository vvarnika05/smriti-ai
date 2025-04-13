"use client";

import { useEffect, useState, FormEvent, ReactNode } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

export default function AuthGate({ children }: { children: ReactNode }) {
  const { user, isLoaded } = useUser();

  if (!isLoaded || !user) return <div></div>;
  if (!user.publicMetadata?.onboarded) {
    return (
      <CustomSignup
        email={user?.primaryEmailAddress?.emailAddress!}
        userId={user?.id!}
      />
    );
  }

  return children;
}

function CustomSignup({ email, userId }: { email: string; userId: string }) {
  const [phone, setPhone] = useState<string>("");
  const [dob, setDob] = useState<string>(""); // Use date string
  const [username, setUsername] = useState<string>("");
  const [defaultCountry, setDefaultCountry] = useState<string>("in");
  const [isLoading, setIsLoading] = useState(false);

  // Detect country for phone input
  useEffect(() => {
    fetch("https://ipapi.co/json")
      .then((res) => res.json())
      .then((data) => {
        if (data?.country_code) {
          setDefaultCountry(data.country_code.toLowerCase());
        }
      })
      .catch(() => {
        setDefaultCountry("in");
      });
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post<{ message: string }>("/api/create-user", {
        email,
        mobile: `+${phone}`,
        dob,
        username,
      });

      if (res.status === 201) {
        toast.success(res.data.message);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center bg-black text-white min-h-screen w-full px-4">
      <header className="text-2xl font-semibold mb-2">
        Get started with Smriti AI
      </header>
      <section className="text-gray-400 mb-6 text-center max-w-md">
        Seems like you are new here. Just fill out this quick form to get
        started.
      </section>

      <form
        onSubmit={handleSubmit}
        className="bg-zinc-900 p-6 rounded-2xl shadow-md w-full max-w-md space-y-4"
      >
        {/* Username */}
        <div>
          <label className="block mb-1 text-sm font-medium">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-lg bg-zinc-800 text-white outline-none focus:ring-2 ring-primary"
          />
        </div>

        {/* Mobile number */}
        <div>
          <label className="block mb-1 text-sm font-medium">Mobile No.</label>
          <PhoneInput
            country={defaultCountry}
            value={phone}
            onChange={(phone) => setPhone(phone)}
            enableSearch
            preferredCountries={["in", "us"]}
            autoFormat
            disableDropdown={false}
            containerClass="!w-full dark-phone-input"
            inputClass="!w-full !bg-zinc-800 !text-white !px-4 !py-2 !rounded-lg !border-none focus:ring-2 focus:ring-primary"
            buttonClass="!bg-zinc-700"
            inputStyle={{ backgroundColor: "#27272a", color: "white" }}
            buttonStyle={{ backgroundColor: "#3f3f46" }}
            placeholder="Enter phone number"
          />
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block mb-1 text-sm font-medium">
            Date of Birth
          </label>
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-lg bg-zinc-800 text-white outline-none focus:ring-2 ring-primary"
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="w-full py-2 rounded-lg bg-primary text-black font-semibold hover:opacity-90 transition"
          disabled={isLoading}
        >
          {isLoading ? "Loading... Please Wait" : "Submit"}
        </button>
      </form>
    </div>
  );
}
