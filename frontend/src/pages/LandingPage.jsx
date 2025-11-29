import { useNavigate } from "react-router-dom";
import CollegeLogo from "../assets/CollegeLogo.png";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center bg-linear-to-br from-gray-50 via-white to-gray-100 px-4 py-10 poppins relative overflow-hidden">
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center max-w-3xl">
        
        {/* College Logo */}
        <div className="mb-6 transform transition-transform hover:scale-105">
          <img 
            src={CollegeLogo} 
            alt="College Logo" 
            className="w-32 h-32 md:w-40 md:h-40 object-contain"
          />
        </div>

        {/* College Name */}
        <div className="text-center mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
            Pragnya Educational Trust's
          </h2>
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">
            Pragnya Junior College of Arts, Commerce & Science
          </h1>
          <p className="text-sm md:text-base text-gray-600 italic">
            (Approved by Maharashtra State Board)
          </p>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Handewadi, Hadapsar, Pune
          </p>
        </div>

        {/* Divider */}
        <div className="w-24 h-1 bg-linear-to-r from-blue-500 to-purple-600 rounded-full mb-8"></div>

        {/* Main Heading */}
        <h3 className="text-3xl md:text-5xl font-bold text-gray-900 text-center mb-4">
          Create Student Marksheet
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-center text-base md:text-lg max-w-2xl mb-8">
          A simple tool for teachers to enter student details and generate a PDF marksheet instantly.
        </p>

        {/* CTA Button */}
        <button
          onClick={() => navigate("/createmarksheet")}
          className="group relative px-8 py-4 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg font-semibold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 overflow-hidden"
        >
          <div className="absolute inset-0 bg-linear-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span className="relative flex items-center gap-2">
            Get Started
            <svg 
              className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </button>

      </div>
    </div>
  );
}