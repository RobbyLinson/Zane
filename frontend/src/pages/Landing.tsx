import React from "react";
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
} from "lucide-react";

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--primary-700)] to-[var(--secondary-700)]">
      {/* Top Navigation Bar */}
      <div className="container mx-auto px-4 pt-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Zane</h2>
          <div className="flex gap-3">
            <Button
              asChild
              variant="outline"
              size="default"
              className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm"
            >
              <Link to="/auth/login">Login</Link>
            </Button>
            <Button
              asChild
              size="default"
              className="bg-[var(--accent-500)] hover:bg-[var(--accent-600)] text-white"
            >
              <Link to="/auth/register/creator">
                Sign Up <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-10">
        <div className="text-center text-white mb-16">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            Real Views. Fair Pay.
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
            The CPM network that replaces flat-fee guesswork with fraud-proof
            views for brands, and creators earn more, faster.
          </p>
        </div>

        {/* Features Grid */}
        <div className="mt-10 grid md:grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Brands Column */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardTitle className="text-3xl md:text-4xl text-white mb-6 font-semibold py-4 px-4">
              Why Promote on Zane?
            </CardTitle>
            <div className="grid grid-cols-1 gap-6 mb-5 px-4">
              <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/15 transition-all">
                <CardHeader>
                  <div className="w-12 h-12 bg-[var(--primary-500)] rounded-lg flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle>Quality, Vetted Network</CardTitle>
                  <CardDescription className="text-white/70">
                    Access a curated community of creators focused on
                    performance.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/15 transition-all">
                <CardHeader>
                  <div className="w-12 h-12 bg-[var(--secondary-200)] rounded-lg flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle>Fraud-Protected Views</CardTitle>
                  <CardDescription className="text-white/70">
                    Our multi-lawyer verification ensures you only pay for
                    genuine, human views.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/15 transition-all">
                <CardHeader>
                  <div className="w-12 h-12 bg-[var(--text-500)] rounded-lg flex items-center justify-center mb-4">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle>Guaranteed CPM Pricing</CardTitle>
                  <CardDescription className="text-white/70">
                    Set your exact cost per 1,000 views. No surprises, no-flat
                    fee guesswork.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </Card>

          {/* Creators Column */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardTitle className="text-3xl md:text-4xl text-white mb-6 font-semibold py-4 px-4">
              Why Create for Zane?
            </CardTitle>
            <div className="grid grid-cols-1 gap-6 mb-5 px-4">
              <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/15 transition-all">
                <CardHeader>
                  <div className="w-12 h-12 bg-[var(--primary-500)] rounded-lg flex items-center justify-center mb-4">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle>Earn More, Faster</CardTitle>
                  <CardDescription className="text-white/70">
                    Your income scales directly with your content’s real reach.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/15 transition-all">
                <CardHeader>
                  <div className="w-12 h-12 bg-[var(--secondary-200)] rounded-lg flex items-center justify-center mb-4">
                    <Cog className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle>Automated and Transparent</CardTitle>
                  <CardDescription className="text-white/70">
                    See earnings update in real-time and get paid instantly.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/15 transition-all">
                <CardHeader>
                  <div className="w-12 h-12 bg-[var(--text-500)] rounded-lg flex items-center justify-center mb-4">
                    <Lightbulb className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle>Focus on Creativity</CardTitle>
                  <CardDescription className="text-white/70">
                    No negotiations. Just create great content and get paid
                    fairly for its reach.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-8 mt-10 text-center text-white">
          <div className="p-8">
            <div className="text-5xl font-bold mb-2">&lt;48 hrs</div>
            <div className="text-xl text-white/80">Time to First Payout</div>
          </div>
          <div className="p-8">
            <div className="text-5xl font-bold mb-2">&gt;99%</div>
            <div className="text-xl text-white/80">Views Verified as Human</div>
          </div>
          <div className="p-8">
            <div className="text-5xl font-bold mb-2">€5.50+</div>
            <div className="text-xl text-white/80">Average CPM on Zane</div>
          </div>
        </div>

        <Card className="mt-10 bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="grid grid-cols-1 gap-6 pb-8 md:grid-cols-2 mt-10">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white mb-3">
                Brands: Get guaranteed, fraud proof-views.
              </h3>
              <Button
                asChild
                size="lg"
                className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/15 transition-all mt-5"
              >
                <Link to="/auth/register/brand">
                  Start a Campaign or Get a Demo
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white mb-3">
                Creators: Get paid for every 1,000 real views. Automatically.
              </h3>
              <Button
                asChild
                size="lg"
                className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/15 transition-all mt-5"
              >
                <Link to="/auth/register/creator">
                  Join the Network <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
