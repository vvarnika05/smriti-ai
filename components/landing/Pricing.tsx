import { Check } from "lucide-react";

const pricingPlans = [
  {
    title: "Starter",
    price: "$0",
    description:
      "Perfect for students or personal use. Start your learning journey with AI assistance.",
    features: [
      "Limited Access to Mindmaps",
      "Basic MCQs Generator",
      "Link storage up to 1GB",
    ],
    cta: "Get Started",
    highlight: false,
  },
  {
    title: "Pro",
    price: "$9/mo",
    description:
      "Best for regular learners. Boost your revision game with advanced AI tools.",
    features: [
      "Unlimited mindmaps",
      "Daily MCQs & Recaps",
      "Storage up to 10GB",
      "Early access to new features",
    ],
    cta: "Upgrade to Pro",
    highlight: true,
  },
  {
    title: "SmritiX",
    price: "$29/mo",
    description:
      "Built for teams, coaching institutes & educators to manage multiple learners.",
    features: [
      "Team access & dashboards",
      "50GB cloud link vault",
      "Advanced analytics & reminders",
      "Priority support",
    ],
    cta: "Talk to Sales",
    highlight: false,
  },
];

export const Pricing = () => {
  return (
    <section
      id="pricing"
      className="w-full text-white px-6 md:px-20 py-24 relative"
    >
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight pb-1">
          Simple,
          <span className="text-primary"> Transparent </span>
          Price
        </h2>
        <p className="text-gray-400 text-lg">
          Choose the plan that fits your learning style and boost your retention
          with Smriti AI.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-7xl mx-auto relative z-[1]">
        {pricingPlans.map((plan) => (
          <div
            key={plan.title}
            className={`rounded-xl px-8 py-10 shadow-lg backdrop-blur-md transition bg-white/5 hover:scale-[1.02] ${
              plan.highlight
                ? "border border-primary/70"
                : "text-white border border-white/10"
            }`}
          >
            <h3 className="text-2xl font-extrabold mb-2 text-primary">
              {plan.title}
            </h3>
            <p className="text-3xl font-extrabold mb-4">{plan.price}</p>
            <p className="text-gray-400 mb-6">{plan.description}</p>
            <ul className="space-y-3 mb-6 text-sm text-gray-300">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <Check className="text-primary" /> {feature}
                </li>
              ))}
            </ul>
            <button
              className={`w-full text-center py-3 rounded-xl font-semibold transition ${
                plan.highlight
                  ? "bg-white text-black hover:bg-gray-200"
                  : "bg-transparent border border-white/20 hover:bg-white/10"
              }`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      <div className="absolute bottom-0 left-1/2 w-[180px] h-[180px] bg-primary opacity-80 blur-[200px] transform -translate-x-1/2 -translate-y-1/2"></div>
    </section>
  );
};
