import { ShieldAlert, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import useAuth from "../hooks/useAuth";
import { userAuthReducer } from "../features/Auth/UserAuth";

const COOLDOWN_SECONDS = 60;
const STORAGE_KEY = "not_admin_cooldown_until";

const NotAdmin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [cooldown, setCooldown] = useState(0);

  // ✅ Redirect if ADMIN
  useEffect(() => {
    if (user?.role === "ADMIN") {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  // ✅ Load cooldown from localStorage
  useEffect(() => {
    const until = localStorage.getItem(STORAGE_KEY);
    if (until) {
      const remaining = Math.ceil((+until - Date.now()) / 1000);
      if (remaining > 0) {
        setCooldown(remaining);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // ✅ Countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          localStorage.removeItem(STORAGE_KEY);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const recheckAccess = () => {
    if (cooldown > 0) return;

    dispatch(userAuthReducer());

    const until = Date.now() + COOLDOWN_SECONDS * 1000;
    localStorage.setItem(STORAGE_KEY, until.toString());
    setCooldown(COOLDOWN_SECONDS);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-10 max-w-md w-full text-center border border-gray-200">

        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <ShieldAlert className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Access Restricted
        </h1>

        <p className="text-gray-600 mb-6">
          This section is available to <strong>Administrators only</strong>.
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800 mb-6">
          Your account is under review.
          <br />
          Please wait for admin approval.
        </div>

        <button
          onClick={recheckAccess}
          disabled={cooldown > 0}
          className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition
            ${
              cooldown > 0
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-gray-900 text-white hover:bg-gray-800"
            }`}
        >
          <RefreshCcw className="w-4 h-4" />
          {cooldown > 0
            ? `Try again in ${cooldown}s`
            : "Check Access Again"}
        </button>

      </div>
    </div>
  );
};

export default NotAdmin;
