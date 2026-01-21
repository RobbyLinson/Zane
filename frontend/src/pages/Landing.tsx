import React from "react";

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[var(--primary-700)] to-[var(--secondary-700)] text-white p-4">
      <h1 className="text-4xl font-bold mb-6">Welcome to Zane</h1>
      <p className="text-lg mb-8 text-center max-w-2xl">
        Zane is your all-in-one platform for managing influencer marketing
        campaigns and brand collaborations. Whether you're a creator looking to
        monetize your content or a brand aiming to expand your reach, Zane has
        got you covered.
      </p>
      <div className="space-x-4">
        <a
          href="/auth"
          className="px-6 py-3 bg-[var(--accent-500)] hover:bg-[var(--accent-600)] rounded-lg font-semibold transition"
        >
          {" "}
          Get Started{" "}
        </a>
        <a
          href="/about"
          className="px-6 py-3 bg-[var(--background-600)] hover:bg-[var(--background-700)] rounded-lg font-semibold transition"
        >
          {" "}
          Learn More{" "}
        </a>
      </div>
    </div>
  );
};
