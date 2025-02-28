import React, { useEffect } from 'react';
import { loginUser } from '../../APIs/user';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Login() {
  const [formData, setFormData] = useState({ password: '', email: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    if (!formData.password || !formData.email) {
      toast.error("Fields can't be empty");
      return;
    }
    const response = await loginUser({ ...formData });
    console.log("response is :", response)
    if (response?.message) {

      toast.info(response.message);

    }
    if (response?.token) {
      localStorage.setItem("token", response.token);
      localStorage.setItem("name", response.name);
      localStorage.setItem("userEmail", response.email);
      navigate('/');
    } else {
      console.error("Token not received in the response:", response);
    }
  };


  return (
    <div className={styles.body}>
      <ToastContainer />
      <p className={styles.heading} >Quizzie</p>
      <div className={styles.top} >
        <button className={styles.signup} onClick={() => { navigate('/register') }} > Sign Up </button>
        <button className={styles.login}  > Log In </button>
      </div>
      <div className={styles.middle} >
        <div> <span className={styles.email} > Email </span> <input name='email' type="email" placeholder='Enter Email' onChange={handleChange} value={formData.email} className={styles.input} /> </div>
        <div> <span className={styles.password} > Password </span> <input name='password' type="text" placeholder='Enter Password' onChange={handleChange} value={formData.password} className={styles.input} /> </div>
      </div>
      <button onClick={handleSubmit} className={styles.bottom} > Log In </button>
    </div>
  )
}

export default Login