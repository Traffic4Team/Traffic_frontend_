import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import axiosInstance from '../../utils/axiosInstance';

function Register() {
  const [name, setName] = useState('');
  const [pw, setPw] = useState('');
  const [email, setEmail] = useState('');

  const navigate = useNavigate();

  const changeName = (event) => {
    setName(event.target.value);
  };

  const changePw = (event) => {
    setPw(event.target.value);
  };

  const changeEmail = (event) => {
    setEmail(event.target.value);
  };

  const register = async () => {
    const req = {
      name: name,
      email: email,
      pw: pw,
    };

    try {
      const resp = await axiosInstance.post('/user/register', req, {
        withCredentials: true,
      });
      console.log('[Register.js] Register() success :D');
      console.log(resp.data);

      alert(`${resp.data.name}님 회원가입을 축하드립니다 🎊`);
      navigate('/login');
    } catch (err) {
      console.log('[Register.js] Register() error :<');
      console.log(err);

      const resp = err.response;
      if (resp && resp.status === 400) {
        alert(resp.data);
      } else {
        alert('회원가입 중 오류가 발생했습니다.');
      }
    }
  };

  const goToLogin = () => {
    navigate('/login'); // 로그인 페이지로 이동
  };

  return (
    <div>
      <table className="table">
        <tbody>
          <tr>
            <th>이름</th>
            <td>
              <input
                type="text"
                value={name}
                onChange={changeName}
                size="50px"
                placeholder="이름을 입력하세요"
              />
            </td>
          </tr>

          <tr>
            <th>비밀번호</th>
            <td>
              <input
                type="password"
                value={pw}
                onChange={changePw}
                size="50px"
                placeholder="비밀번호를 입력하세요"
              />
            </td>
          </tr>

          <tr>
            <th>이메일</th>
            <td>
              <input
                type="text"
                value={email}
                onChange={changeEmail}
                size="80px"
                placeholder="이메일을 입력하세요"
              />
            </td>
          </tr>
        </tbody>
      </table>
      <br />

      <div className="my-3 d-flex justify-content-center">
        <button className="btn btn-outline-secondary" onClick={register}>
          <i className="fas fa-user-plus"></i> 회원가입
        </button>
      </div>

      <div className="my-3 d-flex justify-content-center">
        <button className="btn btn-outline-primary" onClick={goToLogin}>
          <i className="fas fa-sign-in-alt"></i>돌아가기
        </button>
      </div>
    </div>
  );
}

export default Register;
