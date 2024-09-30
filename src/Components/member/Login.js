import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './Login.css';

function Login() {
  const { auth, tokens, updateAuth, clearAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [userInfo, setUserInfo] = useState(null);

  const changeEmail = (event) => setEmail(event.target.value);
  const changePw = (event) => setPw(event.target.value);
  const changeAuthEmail = (event) => setAuthEmail(event.target.value);

  const handleJoinClick = () => {
    navigate('/register'); // 회원가입 페이지로 이동
  };

  const handleUserClick = () => navigate('/user');

  const login = async (event) => {
    event.preventDefault(); // Prevent default form submission
    const req = { email, pw };

    try {
      const resp = await axios.post('http://ec2-43-203-192-225.ap-northeast-2.compute.amazonaws.com:8080/user/signIn', req, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      });

      if (resp.status === 200) {
        const data = resp.data.data;

        if (data) {
          const { userId, accessToken, refreshToken } = data;
          updateAuth(userId, accessToken, refreshToken);
          navigate('/user'); // User 페이지로 이동하도록 변경
        } else {
          setError('로그인 실패: 응답 데이터가 유효하지 않습니다.');
        }
      } else {
        setError('로그인 실패: 이메일 또는 비밀번호가 올바르지 않습니다.');
      }
    } catch (err) {
      console.error('Error during login:', err);
      setError('⚠️ 로그인 중 오류가 발생했습니다.');
    }
  };

  const sendAuthEmail = async () => {
    try {
      await axios.get('http://ec2-43-203-192-225.ap-northeast-2.compute.amazonaws.com:8080/user/email/send-email', {
        params: { email: authEmail },
        headers: { 'Content-Type': 'application/json' },
      });
      alert('인증 이메일이 전송되었습니다.');
    } catch (err) {
      alert('인증 이메일 전송 중 오류가 발생했습니다.');
    }
  };

  const logout = () => {
    clearAuth();
    alert(`${auth}님, 성공적으로 로그아웃 됐습니다 🔒`);
    navigate("/");
  };

  useEffect(() => {
    if ( tokens.accessToken) {
      navigate('/user'); // 토큰이 존재하면 /user 페이지로 이동
    }
  }, [tokens.accessToken, navigate]); // tokens, navigate 의존성 추가

  useEffect(() => {
    const fetchUserInfo = async () => {
      const userId = localStorage.getItem('userId');
      if (userId) {
        try {
          const response = await axios.get(`http://ec2-43-203-192-225.ap-northeast-2.compute.amazonaws.com:8080/user/${userId}`);
          if (response.status === 200) {
            setUserInfo(response.data.data);
          } else {
            setError('유저 정보 조회 실패');
          }
        } catch (error) {
          console.error('Error fetching user info:', error);
          setError('유저 정보 조회 중 오류가 발생했습니다.');
        }
      }
    };

    if (auth) {
      fetchUserInfo();
    } else {
      setUserInfo(null);
    }
  }, [auth]);

  return (
    <section className="login">
      <div className="login_box">  
        <div className="left">
          <div className="top_link"><a href="#"><img src="https://drive.google.com/u/0/uc?id=16U__U5dJdaTfNGobB_OpwAJ73vM50rPV&export=download" alt="" />Return home</a></div>
          <div className="contact">
            <form onSubmit={login}>
              <h3>SIGN IN</h3>
              {error && <p className="error">{error}</p>}
              <input
                type="text"
                placeholder="E-Mail"
                value={email}
                onChange={changeEmail}
                required
              />
              <input
                type="password"
                placeholder="PASSWORD"
                value={pw}
                onChange={changePw}
                required
              />
              <button 
                type="button" 
                className="submit" 
                onClick={handleJoinClick}
              >
                회원가입
              </button>
              <button 
                type="submit" 
                className="submit"
              >
                로그인
              </button>
              <button 
                type="button" 
                className="submit" 
                onClick={sendAuthEmail}
              >
                인증 이메일 전송
              </button>
            </form>
          </div>
        </div>
        <div className="right">
          <div className="right-text">
            <h2>Hello, Friend</h2>
            <h5>Enter your personal details and start journey with us</h5>
          </div>
          <div className="right-inductor">
            <img src="https://res.cloudinary.com/dci1eujqw/image/upload/v1616769558/Codepen/waldemar-brandt-aThdSdgx0YM-unsplash_cnq4sb.jpg" alt="" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Login;
