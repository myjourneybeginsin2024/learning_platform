'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';

interface AuthModalProps {
    initialView?: 'login' | 'register';
    onClose?: () => void; // Optional if used in a real modal
}

export function AuthModal({ initialView = 'login', onClose }: AuthModalProps) {
    const [view, setView] = useState<'login' | 'register'>(initialView);
    const router = useRouter();

    const handleClose = () => {
        if (onClose) {
            onClose();
        } else {
            router.push('/');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 pt-8 md:pt-12 animate-in fade-in duration-200 overflow-y-auto">
            <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-xl overflow-hidden relative animate-in zoom-in-95 duration-200">
                {/* Close Button */}
                <button onClick={handleClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 hover:bg-gray-100 p-2 rounded-full transition-colors z-10">
                    <X size={20} />
                </button>

                <div className="p-8 sm:p-12">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold mb-3 text-black">
                            {view === 'login' ? 'Log In' : 'Sign Up'}
                        </h1>
                        <p className="text-xs text-black leading-relaxed">
                            By continuing, you agree to our <a href="#" className="text-blue-600 hover:underline">User Agreement</a> and acknowledge that you understand the <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
                        </p>
                    </div>

                    {view === 'login' ? (
                        <LoginForm
                            onRegisterClick={() => setView('register')}
                            onForgotPassword={() => {/* TODO: Implement Forgot Password logic or modal */ }}
                            onSuccess={handleClose}
                        />
                    ) : (
                        <SignUpForm
                            onLoginClick={() => setView('login')}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
