import React, { useState, useEffect } from 'react'
import styles from './Dashboard.module.css'
import { useNavigate } from 'react-router-dom'
import { getAllQuizzes } from '../../APIs/quiz';
import Eye from '../../Assets/Eye.svg';


function Dashboard() {
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState([]);

  const fetchAllQuizzes = async () => {
    const response = await getAllQuizzes();
    console.log(response.data);
    setQuizData(response.data);
    response.data.forEach(quiz => {
      console.log('quizId:', quiz._id);
    });
  };

  useEffect(() => {
    fetchAllQuizzes();
  });

  const getFormattedDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month}, ${year}`;
  };

  const totalQuestions = quizData.reduce((total, quiz) => total + quiz.questions.length, 0);
  const totalQuizAttempts = quizData.reduce((total, quiz) => total + quiz.quizAttempts, 0);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/register')
  }
  return (
    <div className={styles.body} >
      <div className={styles.left} >
        <h1 className={styles.heading} >Quizzie</h1>
        <button className={styles.dashboard} >Dashboard</button>
        <button className={styles.analytics} onClick={() => { navigate('/analytics') }} >Analytics</button>
        <button className={styles.createquiz} onClick={() => { navigate('/create') }} >Create Quiz</button>
        <hr className={styles.separator} />
        <button className={styles.logout} onClick={handleLogout} >Logout</button>
      </div>
      <div className={styles.right} >

        <div className={styles.row} >
          <div className={styles.first} >
            <div className={styles.top1} >
              <p className={styles.quizlength} >{quizData.length} </p>
              <p className={styles.quiz} > Quiz </p>
            </div>
            <p className={styles.created1} >Created</p>
          </div>

          <div className={styles.second} >
            <div className={styles.top2} >
              <p className={styles.questionlength} >{totalQuestions} </p>
              <p className={styles.quiz1} > Questions </p>
            </div>
            <p className={styles.created2} >Created</p>
          </div>


          <div className={styles.third}>
            <div className={styles.top3}>
              <p className={styles.quizattempts}>{totalQuizAttempts}</p>
              <p className={styles.total}>Total</p>
            </div>
            <p className={styles.created3}>Impressions</p>
          </div>
        </div>

        <p className={styles.trending} >Trending Quizs</p>

        <div className={styles.data} >

          <div className={styles.quizData}>
            {quizData.map((quiz, index) => (
              quiz.quizAttempts > 10 && (
                <div key={index} className={styles.quizData}>
                  <div className={styles.quizItem}>
                    <div className={styles.line1}>
                      <p className={styles.quizname}>{quiz.quizName}</p>
                      <p className={styles.attempt}>{quiz.quizAttempts}</p>
                      <img className={styles.eye} src={Eye} alt="Eye Icon" />
                    </div>
                    <p className={styles.createdAt}>Created on: {getFormattedDate(quiz.createdAt)}</p>
                  </div>
                </div>
              )
            ))}

          </div>


        </div>

      </div>
    </div>
  )
}

export default Dashboard