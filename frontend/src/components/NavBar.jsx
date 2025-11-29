import { useState } from "react";
import { NavLink } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import LogoutButton from "./Logout";
import CollegeLogo from "../assets/CollegeLogo.png";

export default function NavBar() {
  const { isAuthenticated, user } = useAuth();
  const [openMenu, setOpenMenu] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <img
            src={CollegeLogo}
            alt="College Logo"
            className="w-10 h-10 object-contain"
          />
          <h1 className="text-xl font-bold poppins-black text-gray-900">
            MarkSheet
          </h1>
        </div>

        {/* Desktop Menu */}
        <ul className="hidden md:flex gap-6 text-sm poppins-semibold items-center">
          <NavLink
            to={"/"}
            className={({ isActive }) =>
              `hover:text-blue-600 cursor-pointer transition-colors ${
                isActive ? "text-blue-600 font-bold" : "text-gray-700"
              }`
            }
          >
            Home
          </NavLink>

          <NavLink
            to={"/createmarksheet"}
            className={({ isActive }) =>
              `hover:text-blue-600 cursor-pointer transition-colors ${
                isActive ? "text-blue-600 font-bold" : "text-gray-700"
              }`
            }
          >
            Create Mark Sheet
          </NavLink>

          <NavLink
            to={"/allstudent"}
            className={({ isActive }) =>
              `hover:text-blue-600 cursor-pointer transition-colors ${
                isActive ? "text-blue-600 font-bold" : "text-gray-700"
              }`
            }
          >
            All Marksheet
          </NavLink>

          {isAuthenticated && (
            <>
              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-300">
                <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <p className="text-gray-700">Welcome, {user?.name}</p>
              </div>

              <LogoutButton />
            </>
          )}
        </ul>

        {/* Mobile Menu Icon */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setOpenMenu(!openMenu)}
        >
          {/* Hamburger + Close */}
          {openMenu ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-7 h-7"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-7 h-7"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/>
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {openMenu && (
        <div className="md:hidden mt-3 bg-gray-50 border rounded-lg py-3 px-4 space-y-4">

          <NavLink
            to={"/"}
            onClick={() => setOpenMenu(false)}
            className="block text-gray-800 font-medium hover:text-blue-600"
          >
            Home
          </NavLink>

          <NavLink
            to={"/createmarksheet"}
            onClick={() => setOpenMenu(false)}
            className="block text-gray-800 font-medium hover:text-blue-600"
          >
            Create Mark Sheet
          </NavLink>

          <NavLink
            to={"/allstudent"}
            onClick={() => setOpenMenu(false)}
            className="block text-gray-800 font-medium hover:text-blue-600"
          >
            All Marksheet
          </NavLink>

          {isAuthenticated && (
            <>
              {/* User Info */}
              <div className="flex items-center gap-3 pt-2">
                <div className="w-9 h-9 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <p className="text-gray-800 font-medium">
                  {user?.name}
                </p>
              </div>

              {/* Logout */}
              <LogoutButton />
            </>
          )}
        </div>
      )}
    </nav>
  );
}
