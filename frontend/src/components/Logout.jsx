import { useNavigate } from "react-router-dom";
import api from '../api/axios';
import { Button } from "./ui/button";

export default function LogoutButton() {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await api.post("/logout", {}, { withCredentials: true });
    } catch (e) {
      console.log(e);
    }
    navigate("/login");
  };

  return <Button variant={"destructive"} onClick={logout}>Logout</Button>;
}