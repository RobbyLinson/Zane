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
import { ArrowRight, Users, TrendingUp, Shield, Zap } from "lucide-react";

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
              <Link to="/auth">Login</Link>
            </Button>
            <Button
              asChild
              size="default"
              className="bg-[var(--accent-500)] hover:bg-[var(--accent-600)] text-white"
            >
              <Link to="/auth">
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
            Welcome to Zane
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
            The all-in-one platform connecting creators and brands for
            authentic, data-driven influencer marketing campaigns
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/15 transition-all">
            <CardHeader>
              <div className="w-12 h-12 border bg-[var(--accent-500)] rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Creator Network</CardTitle>
              <CardDescription className="text-white/70">
                Connect with thousands of verified influencers across all major
                platforms
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/15 transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-[var(--primary-500)] rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Real-Time Analytics</CardTitle>
              <CardDescription className="text-white/70">
                Track campaign performance with live metrics and detailed
                insights
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/15 transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-[var(--secondary-200)] rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Secure Payments</CardTitle>
              <CardDescription className="text-white/70">
                Automated payouts and transparent earnings tracking for creators
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/15 transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-[var(--text-500)] rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Smart Matching</CardTitle>
              <CardDescription className="text-white/70">
                AI-powered creator recommendations for your brand campaigns
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-8 mt-10 text-center text-white">
          <div className="p-8">
            <div className="text-5xl font-bold mb-2">10K+</div>
            <div className="text-xl text-white/80">Active Creators</div>
          </div>
          <div className="p-8">
            <div className="text-5xl font-bold mb-2">500+</div>
            <div className="text-xl text-white/80">Brand Partners</div>
          </div>
          <div className="p-8">
            <div className="text-5xl font-bold mb-2">€2M+</div>
            <div className="text-xl text-white/80">Creator Earnings</div>
          </div>
        </div>

        {/* CTA Section */}
        <Card className="mt-20 bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl md:text-4xl text-white mb-4">
              Ready to Transform Your Influence?
            </CardTitle>
            <CardDescription className="text-xl text-white/80 mb-6">
              Join thousands of creators and brands building authentic
              partnerships on Zane
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-8">
            <Button
              asChild
              size="lg"
              className="bg-[var(--accent-500)] hover:bg-[var(--accent-600)] text-white px-12 py-6 text-lg"
            >
              <Link to="/auth">
                Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
