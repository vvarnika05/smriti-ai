import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <SignIn
        appearance={{
          variables: {
            colorBackground: "#111",
            colorPrimary: "#a3ff19",      // Neon green 
            colorPrimaryForeground: "#222", // Button text 
            colorForeground: "#fff",        // Normal text 
            colorInput: "#111",             // Input background
            colorBorder: "#222",            // Borders
          },
          elements: {
            card: { backgroundColor: "#111" }, // Sign-in card color

            formButtonPrimary: {
              background: "#a3ff19",
              color: "#222",
              border: "none",
              boxShadow: "0 0 10px #39FF14, 0 0 20px #39FF14",
              fontWeight: 700
            },

            formFieldInput: {
              backgroundColor: "#111",
              color: "#fff",
              border: "1px solid #222"
            },
            formFieldLabel: { color: "#eee" },

            socialButtonsBlockButton__google: {
              backgroundColor: "#111",
              transition: "all 0.2s",
              width: "300px",
              margin: "0 auto",
            },
            socialButtonsBlockButtonText: {
              color: "#fff",
            }
          }
        }}
      />

    </main>
  );
}
