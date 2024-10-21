import { useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom"; // 경로 수정
import { AuthContext } from "../context/AuthProvider";

function Logout() {
  const { auth, setAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    localStorage.removeItem("bbs_access_token");
    localStorage.removeItem("id");
    setAuth(null);
    alert(`${auth}님, 성공적으로 로그아웃 됐습니다 🔒`);
    navigate("/login");
  }, [auth, setAuth, navigate]);

  useEffect(() => {
    handleLogout();
  }, [handleLogout]);

  return null; 
}

export default Logout;