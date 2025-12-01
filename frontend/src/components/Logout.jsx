import axios from "axios";
import { Button } from "./ui/button";

export default function LogoutButton() {
  const logout = async () => {
    await axios.get("/logout", {
      withCredentials: true,
    });
    window.location.href = "/login";
  };

  return <Button variant={"destructive"} onClick={logout}>Logout</Button>;
}