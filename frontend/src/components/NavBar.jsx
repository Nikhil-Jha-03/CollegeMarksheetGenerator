import { NavLink } from "react-router-dom";

export default function NavBar() {
  return (
    <nav className="bg-gray-900 text-white px-6 py-4 ">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        
        {/* Logo */}
        <h1 className="text-xl font-bold poppins-black">MarkSheet</h1>

        {/* Menu */}
        <ul className="hidden md:flex gap-6 text-sm poppins-semibold">
          <NavLink to={"/"} className="hover:text-gray-300 cursor-pointer">Home</NavLink>
          <NavLink to={"/createmarksheet"} className="hover:text-gray-300 cursor-pointer">Create Mark Sheet</NavLink>
          <NavLink to={"/allmarksheet"} className="hover:text-gray-300 cursor-pointer">All Marksheet</NavLink>
        </ul>

        {/* Mobile Menu Icon */}
        <button className="md:hidden">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>
      </div>
    </nav>
  );
}
