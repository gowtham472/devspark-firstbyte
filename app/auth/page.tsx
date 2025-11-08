"use client";

import { Suspense } from "react";
import { AuthForm } from "@/components/auth";
import { Layout } from "@/components/layout/Layout";

function AuthFormWrapper() {
  return <AuthForm />;
}

export default function AuthPage() {
  return (
    <Layout>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            Loading...
          </div>
        }
      >
        <AuthFormWrapper />
      </Suspense>
    </Layout>
  );
}
