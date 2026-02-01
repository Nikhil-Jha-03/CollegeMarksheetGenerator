import { useState } from "react";
import { ArrowRight } from "lucide-react";
import CollegeLogo from "../assets/CollegeLogo.png";

const LoginPage = () => {
    const [isHovered, setIsHovered] = useState(false);

    const handleLogin = () => {
        window.location.href = `${import.meta.env.VITE_BACKEND_URL}/oauth2/authorization/google?prompt=select_account`;
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4 relative overflow-hidden">
            
            {/* Animated background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-overlay blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-overlay blur-3xl opacity-20 animate-pulse" style={{ animationDelay: "2s" }}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-200 rounded-full mix-blend-overlay blur-3xl opacity-20 animate-pulse" style={{ animationDelay: "4s" }}></div>
            </div>

            {/* Card */}
            <div className="relative bg-white backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 w-full max-w-md border border-gray-200">

                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <img
                        src={CollegeLogo}
                        alt="College Logo"
                        className="w-32 h-32 object-contain"
                    />
                </div>

                {/* Title */}
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 text-center mb-3">
                    Welcome
                </h1>
                <p className="text-gray-600 text-center mb-8">
                    Sign in to continue to your account
                </p>

                {/* Login Button */}
                <button
                    onClick={handleLogin}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className="group relative w-full py-4 px-6 bg-white hover:bg-gray-50 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gray-100 opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>

                    <div className="relative flex items-center justify-center gap-3">
                        {/* Google Logo */}
                        <svg
                            className={`w-6 h-6 transition-transform duration-300 ${isHovered ? "scale-110 rotate-12" : ""}`}
                            viewBox="0 0 24 24"
                        >
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>

                        <span className="text-lg">Continue with Google</span>

                        <ArrowRight
                            className={`w-5 h-5 transition-transform duration-300 ${isHovered ? "translate-x-1" : ""}`}
                        />
                    </div>
                </button>

                {/* Footer */}
                <p className="text-gray-500 text-xs text-center mt-6">
                    By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
