import { Button } from "./ui/button";

export default function LogoutButton() {
  const logout = async () => {
    await api.post("/logout", {
      withCredentials: true,
    });
    window.location.href = "/login";
  };

  return <Button variant={"destructive"} onClick={logout}>Logout</Button>;
}