import { useSelector } from "react-redux";

export default function useAuth() {
  const { user, loading, error, isAuthenticated } = useSelector(
    (state) => state.userAuth
  );

  return { user, loading, error, isAuthenticated };
}