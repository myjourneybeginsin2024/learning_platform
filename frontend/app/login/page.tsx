"use client";
import { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import LoginForm from "@/templates/default/components/auth/LoginForm";
import Image from "next/image";

function LoginContent() {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (user) {
            if (user.role === "super admin") router.push("/superadmin");
            else if (user.role === "admin") router.push("/admin");
            else router.push("/user");
        }
    }, [user, router]);

    if (user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-xl p-8 sm:p-12">
                <div className="mb-6 flex flex-col items-center">
                    <div className="relative h-12 w-40 mb-4">
                        <Image
                            src="/assets/logo-dark.jpg"
                            alt="Noleij Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <h2 className="text-2xl font-bold mb-3 text-black text-center">
                        Sign in to your account
                    </h2>
                </div>
                <LoginForm
                    onRegisterClick={() => router.push('/register')}
                    onForgotPassword={() => { }}
                />
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginContent />
        </Suspense>
    );
}
