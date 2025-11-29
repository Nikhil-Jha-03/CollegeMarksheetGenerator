import React, { useState } from 'react';
import { Lock, LogOut, ArrowRight, Sparkles } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import CollegeLogo from "../assets/CollegeLogo.png"


const LoginPage = () => {
    const { user } = useAuth();
    const [isHovered, setIsHovered] = useState(false);

    const handleLogin = () => {
        window.location.href = `${import.meta.env.VITE_BACKEND_URL}oauth2/authorization/google?prompt=select_account`;
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-200 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
            </div>

            {/* Main card */}
            <div className="relative bg-white backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 w-full max-w-md border border-gray-200">
                {/* College Logo */}
                <div className="flex justify-center mb-8">
                    <div className="relative transform transition-transform hover:scale-105">
                        <img 
                            src={CollegeLogo} 
                            alt="College Logo" 
                            className="w-32 h-32 object-contain "
                        />
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 text-center mb-3">
                    Welcome
                </h1>
                <p className="text-gray-600 text-center mb-8">
                    {user ? 'You are logged in' : 'Sign in to continue to your account'}
                </p>

                {/* User info or login button */}
                {user ? (
                    <div className="space-y-4">
                        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
                            <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                {user?.name?.charAt(0)?.toUpperCase() || 'B'}

                            </div>
                            <p className="text-gray-900 font-medium text-lg">{user?.name}</p>
                            <p className="text-gray-500 text-sm mt-1">Logged in successfully</p>
                        </div>
                        <button
                            onClick={() => window.location.href = `${import.meta.env.VITE_BACKEND_URL}logout`}
                            className="w-full py-4 px-6 bg-gray-900 hover:bg-gray-800 border border-gray-900 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            <LogOut className="w-5 h-5" />
                            Sign Out
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleLogin}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        className="group relative w-full py-4 px-6 bg-white hover:bg-gray-50 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gray-100 opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                        
                        <div className="relative flex items-center justify-center gap-3">
                            {/* Google Logo */}
                            <svg className={`w-6 h-6 transition-transform duration-300 ${isHovered ? 'scale-110 rotate-12' : ''}`} viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            
                            <span className="text-lg">Continue with Google</span>
                            
                            {/* Arrow animation */}
                            <ArrowRight 
                                className={`w-5 h-5 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`}
                            />
                        </div>
                    </button>
                )}

                {/* Footer text */}
                <p className="text-gray-500 text-xs text-center mt-6">
                    By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
            </div>

            {/* Floating particles effect */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default LoginPage;