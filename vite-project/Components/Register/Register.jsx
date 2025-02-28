import React from 'react'
import { registerUser } from '../../APIs/user'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Register.module.css'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Register() {

  const [formData, setFormData] = useState({ name: '', password: '', email: '', confirmpassword: '' });
  const navigate = useNavigate();
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    if (!formData.password || !formData.name || !formData.email || !formData.confirmpassword) {
      toast.error("Fields can't be empty");
      localStorage.clear()
      return;
    }
    const response = await registerUser({ ...formData });

    if (response?.message == "user already exists, try another Email") {
      toast.error(response.message);
      localStorage.clear()
      return
    }

    if (response?.message == "Passwords do not match") {
      toast.error(response.message);
      localStorage.clear()
      return
    }
    toast.info(response.message);
    setFormData({ name: '', password: '', email: '', confirmpassword: '' });
    localStorage.clear()
  };

  return (
    <div className={styles.body} >
      <ToastContainer />
      <p className={styles.heading} >Quizzie</p>
      <div className={styles.top} >
        <button className={styles.signup} > Sign Up </button>
        <button className={styles.login} onClick={() => { navigate('/login') }} > Log In </button>
      </div>
      <div className={styles.middle} >
        <div> <span className={styles.name}  > Name </span> <input name='name' type="text" placeholder='Enter Name' onChange={handleChange} value={formData.name} className={styles.input} /> </div>
        <div> <span className={styles.email} > Email </span> <input name='email' type="email" placeholder='Enter Email' onChange={handleChange} value={formData.email} className={styles.input} /> </div>
        <div> <span className={styles.password} > Password </span> <input name='password' type="text" placeholder='Enter Password' onChange={handleChange} value={formData.password} className={styles.input} /> </div>
        <div> <span className={styles.confirmpassword} > Confirm Password </span> <input name='confirmpassword' type="text" placeholder='Re-enter Password' onChange={handleChange} value={formData.confirmpassword} className={styles.input} /> </div>
      </div>
      <button onClick={handleSubmit} className={styles.bottom} > Sign-Up </button>
    </div>
  )
}

export default Register