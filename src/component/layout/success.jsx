import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Success() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let token = params.get("token");

    if (token) {
      token = token.replace(/"/g, "");
      localStorage.setItem("token", token);
      navigate("/dashboard", { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
      <h1 className="text-xl font-semibold">Signing you in...</h1>
    </div>
  );
}
