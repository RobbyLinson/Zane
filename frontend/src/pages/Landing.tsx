import React, { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  Users,
  TrendingUp,
  Shield,
  Target,
  Cog,
  Lightbulb,
  ChevronDown,
} from "lucide-react";

function useReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

const Reveal: React.FC<{
  children: React.ReactNode;
  delay?: number;
  className?: string;
}> = ({ children, delay = 0, className = "" }) => {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

const brandFeatures = [
  {
    icon: <Users className="h-5 w-5 text-white" />,
    color: "var(--primary-500)",
    title: "Quality, Vetted Network",
    desc: "Access a curated community of creators focused on performance.",
  },
  {
    icon: <Shield className="h-5 w-5 text-white" />,
    color: "var(--secondary-200)",
    title: "Fraud-Protected Views",
    desc: "Our multi-layer verification ensures you only pay for genuine, human views.",
  },
  {
    icon: <Target className="h-5 w-5 text-white" />,
    color: "var(--text-500)",
    title: "Guaranteed CPM Pricing",
    desc: "Set your exact cost per 1,000 views. No surprises, no flat-fee guesswork.",
  },
];

const creatorFeatures = [
  {
    icon: <TrendingUp className="h-5 w-5 text-white" />,
    color: "var(--primary-500)",
    title: "Earn More, Faster",
    desc: "Your income scales directly with your content's real reach.",
  },
  {
    icon: <Cog className="h-5 w-5 text-white" />,
    color: "var(--secondary-200)",
    title: "Automated and Transparent",
    desc: "See earnings update in real-time and get paid instantly.",
  },
  {
    icon: <Lightbulb className="h-5 w-5 text-white" />,
    color: "var(--text-500)",
    title: "Focus on Creativity",
    desc: "No negotiations. Just create great content and get paid fairly for its reach.",
  },
];

const stats = [
  { value: "<48 hrs", label: "Time to First Payout" },
  { value: ">99%", label: "Views Verified as Human" },
  { value: "€5.50+", label: "Average CPM on Zane" },
];

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--primary-700)] to-[var(--secondary-700)]">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Nav */}
      <nav className="container mx-auto px-6 pt-5 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white tracking-tight">Zane</h2>
        <div className="flex gap-3">
          <Button
            asChild
            variant="outline"
            className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm"
          >
            <Link to="/auth/login">Login</Link>
          </Button>
          <Button
            asChild
            className="bg-[var(--accent-500)] hover:bg-[var(--accent-600)] text-white"
          >
            <Link to="/auth/register/creator">
              Sign Up <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="container mx-auto px-6 pt-24 pb-20 text-center text-white">
        <h1
          className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
          style={{ animation: "fadeUp 0.6s ease 100ms both" }}
        >
          Book a creator in minutes.
        </h1>
        <p
          className="text-xl md:text-2xl mb-10 text-white/80 max-w-2xl mx-auto leading-relaxed"
          style={{ animation: "fadeUp 0.6s ease 200ms both" }}
        >
          Guaranteed fraud-proof reach for games, music, and live events. No
          flat fees. No guesswork.
        </p>
        <div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          style={{ animation: "fadeUp 0.6s ease 300ms both" }}
        >
          <Button
            asChild
            size="lg"
            className="bg-white text-[var(--primary-700)] hover:bg-white/90 font-semibold px-8"
          >
            <Link to="/auth/register/brand">
              Start a Campaign <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm px-8"
          >
            <Link to="/auth/register/creator">Join as a Creator</Link>
          </Button>
        </div>
        <div
          className="mt-16 flex justify-center"
          style={{ animation: "fadeUp 0.6s ease 500ms both" }}
        >
          <ChevronDown className="h-6 w-6 text-white/40 animate-bounce" />
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-t border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-center text-white">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 100}>
              <div className="p-4">
                <div className="text-4xl md:text-5xl font-bold mb-1">
                  {stat.value}
                </div>
                <div className="text-base text-white/70">{stat.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-10">
          {/* Brands */}
          <div>
            <Reveal>
              <h2 className="text-2xl font-semibold text-white mb-6 pb-3 border-b border-white/20">
                Why Promote on Zane?
              </h2>
            </Reveal>
            <div className="flex flex-col gap-4">
              {brandFeatures.map((f, i) => (
                <Reveal key={f.title} delay={i * 100}>
                  <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/15 transition-all">
                    <CardHeader className="flex flex-row items-start gap-4 py-4">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: f.color }}
                      >
                        {f.icon}
                      </div>
                      <div>
                        <CardTitle className="text-base mb-1">
                          {f.title}
                        </CardTitle>
                        <CardDescription className="text-white/70 text-sm leading-relaxed">
                          {f.desc}
                        </CardDescription>
                      </div>
                    </CardHeader>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Creators */}
          <div>
            <Reveal>
              <h2 className="text-2xl font-semibold text-white mb-6 pb-3 border-b border-white/20">
                Why Create for Zane?
              </h2>
            </Reveal>
            <div className="flex flex-col gap-4">
              {creatorFeatures.map((f, i) => (
                <Reveal key={f.title} delay={i * 100}>
                  <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/15 transition-all">
                    <CardHeader className="flex flex-row items-start gap-4 py-4">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: f.color }}
                      >
                        {f.icon}
                      </div>
                      <div>
                        <CardTitle className="text-base mb-1">
                          {f.title}
                        </CardTitle>
                        <CardDescription className="text-white/70 text-sm leading-relaxed">
                          {f.desc}
                        </CardDescription>
                      </div>
                    </CardHeader>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="container mx-auto px-6 pb-20">
        <Reveal>
          <Card className="bg-white/10 backdrop-blur-md border-white/20 overflow-hidden">
            <CardContent className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10 p-0">
              <div className="flex flex-col items-center justify-center p-10 text-center gap-3">
                <h3 className="text-xl font-semibold text-white">For Brands</h3>
                <p className="text-white/70 text-sm max-w-xs leading-relaxed">
                  Get guaranteed, fraud-proof views. Set your CPM and only pay
                  for results.
                </p>
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-[var(--primary-700)] hover:bg-white/90 mt-2"
                >
                  <Link to="/auth/register/brand">
                    Start a Campaign or Get a Demo{" "}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="flex flex-col items-center justify-center p-10 text-center gap-3">
                <h3 className="text-xl font-semibold text-white">
                  For Creators
                </h3>
                <p className="text-white/70 text-sm max-w-xs leading-relaxed">
                  Get paid for every 1,000 real views. Automatically. No
                  negotiations needed.
                </p>
               <Button
                  asChild
                  size="lg"
                  className="bg-white text-[var(--primary-700)] hover:bg-white/90 mt-2"
                >
                  <Link to="/auth/register/creator">
                    Join the Network <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </Reveal>
      </section>
    </div>
  );
};
