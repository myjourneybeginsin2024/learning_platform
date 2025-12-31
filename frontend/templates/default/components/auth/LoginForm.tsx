'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface LoginFormProps {
    onRegisterClick?: () => void;
    onForgotPassword?: () => void;
    onSuccess?: () => void;
}

export default function LoginForm({ onRegisterClick, onForgotPassword, onSuccess }: LoginFormProps) {
    const { loginUser } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await loginUser(email, password);

            // Role-based redirection
            if (user.role === 'super admin') {
                router.push('/superadmin');
            } else if (user.role === 'admin') {
                router.push('/admin');
            } else {
                router.push('/user');
            }

            if (onSuccess) {
                onSuccess();
            }
        } catch (err: any) {
            console.error("Login failed", err);
            if (err.response?.status === 401) {
                setError("Invalid email or password");
            } else {
                setError(err.message || "An error occurred during login");
            }
        } finally {
            setLoading(false);
        }
    };

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    return (
        <div className="space-y-3">
            {/* Social Login Buttons */}
            <a href={`${apiUrl}/auth/google`} className="w-full py-2.5 border border-gray-200 rounded-full hover:bg-blue-50 hover:border-blue-200 transition-all flex items-center justify-center gap-2 font-bold text-sm text-gray-700 relative group">
                <span className="absolute left-4 w-5 h-5 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                </span>
                Continue with Google
            </a>
            <a href={`${apiUrl}/auth/microsoft`} className="w-full py-2.5 border border-gray-200 rounded-full hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2 font-bold text-sm text-gray-700 relative">
                <span className="absolute left-4 w-5 h-5 flex items-center justify-center">
                    <svg viewBox="0 0 384 512" className="w-5 h-5"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 52.3-11.4 69.5-34.3z" /></svg>
                </span>
                Continue with Microsoft
            </a>

            <div className="flex items-center gap-4 my-8">
                <div className="h-px bg-gray-200 flex-1"></div>
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">OR</span>
                <div className="h-px bg-gray-200 flex-1"></div>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="relative group">
                    <input
                        type="text"
                        className="peer w-full pt-6 pb-2 px-4 border border-transparent rounded-[18px] bg-gray-100 hover:bg-white hover:border-gray-200 focus:bg-white focus:border-blue-500 outline-none transition-all placeholder-transparent shadow-inner-sm text-black"
                        placeholder="Email or username"
                        id="login-username"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <label htmlFor="login-username" className="absolute left-4 top-4 text-xs text-gray-500 font-bold uppercase pointer-events-none transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-xs peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-gray-400 peer-[&:not(:placeholder-shown)]:top-1.5 peer-[&:not(:placeholder-shown)]:text-[10px]">
                        Email or username <span className="text-red-500">*</span>
                    </label>
                </div>
                <div className="relative group">
                    <input
                        type="password"
                        className="peer w-full pt-6 pb-2 px-4 border border-transparent rounded-[18px] bg-gray-100 hover:bg-white hover:border-gray-200 focus:bg-white focus:border-blue-500 outline-none transition-all placeholder-transparent shadow-inner-sm text-black"
                        placeholder="Password"
                        id="login-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <label htmlFor="login-password" className="absolute left-4 top-4 text-xs text-gray-500 font-bold uppercase pointer-events-none transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-xs peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-gray-400 peer-[&:not(:placeholder-shown)]:top-1.5 peer-[&:not(:placeholder-shown)]:text-[10px]">
                        Password <span className="text-red-500">*</span>
                    </label>
                </div>

                {error && <div className="text-red-500 text-sm font-bold bg-red-50 p-2 rounded">{error}</div>}

                <div className="text-sm font-bold">
                    <button type="button" onClick={onForgotPassword} className="text-blue-600 hover:underline">Forgot password?</button>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-reddit-blue hover:bg-reddit-blue-hover text-white font-bold rounded-full transition-colors shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Logging in...' : 'Log In'}
                    </button>

                    <p className="text-sm mt-4 text-black">
                        New to Reddit? <button type="button" onClick={onRegisterClick} className="text-blue-600 font-bold hover:underline">Sign Up</button>
                    </p>
                </div>
            </form>
        </div>
    );
}
