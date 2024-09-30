import { useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router";
import { AuthContext } from "../context/AuthProvider";

function Logout() {
  const { auth, setAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  const logout = useCallback(() => {
    localStorage.removeItem("bbs_access_token");
    localStorage.removeItem("id");

    alert(auth + "님, 성공적으로 로그아웃 됐습니다 🔒");
    setAuth(null);
    
    navigate("/");
  }, [auth, setAuth, navigate]); // auth, setAuth, navigate를 종속성 배열에 추가

  useEffect(() => {
    logout();
  }, [logout]); // logout을 종속성으로 포함

}

export default Logout;