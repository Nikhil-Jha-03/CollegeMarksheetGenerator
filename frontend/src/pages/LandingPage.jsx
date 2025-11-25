import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-300 px-4 poppins">

      <h1 className="text-3xl md:text-5xl font-bold text-gray-800 text-center">
        Create Student Marksheet
      </h1>

      <p className="text-gray-600 text-center mt-3 max-w-md">
        A simple tool for teachers to enter student details and generate a PDF marksheet instantly.
      </p>

      <button
        onClick={() => navigate("/createmarksheet")}
        className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Get Started
      </button>

    </div>
  );
}

// implement search feature