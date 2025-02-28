import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Analytics.module.css';
import Share from '../../Assets/Share.svg';
import Delete from '../../Assets/Delete.svg';
import Edit from '../../Assets/Edit.svg';
import Link_Copied from '../../Assets/Link_Copied.svg';
import { deleteQuiz, getAllQuizzes } from '../../APIs/quiz';

function Analytics() {
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [deletingQuizId, setDeletingQuizId] = useState('');
  const [showLinkCopied, setShowLinkCopied] = useState(false);
  const [showAnalysisOverlay, setShowAnalysisOverlay] = useState(false);
  const [analysisQuizName, setAnalysisQuizName] = useState('');

  const currentUserEmail = localStorage.getItem('userEmail');
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
    const interval = setInterval(() => {
      fetchAllQuizzes();
    }, 1000); 

    return () => clearInterval(interval);
  }, []);

  const handleDeleteConfirmation = async () => {
    try {
      setShowConfirmation(false);
      console.log('Deleting quiz:', deletingQuizId);

      const response = await deleteQuiz(deletingQuizId);
      if (response && !response.error) {
        setQuizData((prevData) => prevData.filter((quiz) => quiz._id !== deletingQuizId));
      } else {
        console.error('Failed to delete quiz');
      }
    } catch (error) {
      console.error('Error deleting quiz:', error);
    }
  };

  const handleDeleteQuiz = (quizId) => {
    setShowConfirmation(true);
    setDeletingQuizId(quizId);
  };

  const handleCancelDelete = () => {
    setShowConfirmation(false);
  };



  const handleShareQuiz = (quizId) => {
    const generatedURL = `${window.location.origin}/start-quiz/${quizId}`;
    navigator.clipboard.writeText(generatedURL);

    setShowLinkCopied(true);
    setTimeout(() => {
      setShowLinkCopied(false);
    }, 3000);
  };

  const handleAnalysis = (quizName) => {
    setShowAnalysisOverlay(true);
    setAnalysisQuizName(quizName);
  };

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

  const handleLogout = () => {
    localStorage.clear();
    navigate('/register')
  }

  return (
    <div className={styles.body}>
      <div className={styles.left}>
        <h1 className={styles.heading}>Quizzie</h1>
        <button className={styles.dashboard} onClick={() => { navigate('/'); }}>Dashboard</button>
        <button className={styles.analytics}>Analytics</button>
        <button className={styles.createquiz} onClick={() => { navigate('/create'); }}>Create Quiz</button>
        <hr className={styles.separator} />
        <button className={styles.logout} onClick={handleLogout}>Logout</button>
      </div>
      <div className={styles.right}>
        <p className={styles.back}>Quiz Analysis</p>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Quiz Name</th>
              <th>Created On</th>
              <th>Impressions</th>
              <th>Actions</th>
              <th>Analysis</th>
            </tr>
          </thead>
          <tbody>
            {quizData.map((quiz, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{quiz.quizName}</td>
                <td>{getFormattedDate(quiz.createdAt)}</td>
                <td>{quiz. linkOpenCount}</td>
                <td>
                  <div className={styles.actions}>
                    {currentUserEmail && currentUserEmail === quiz.creatorEmail && (
                      <img
                        src={Edit}
                        className={styles.edit}
                        onClick={() => {
                          navigate("/create", {
                            state: {
                              id: quiz._id,
                              quizData: quiz,
                              edit: true,
                            },
                          });
                        }}
                      />
                    )}
                    <img
                      src={Delete}
                      className={styles.delete}
                      alt="Delete"
                      onClick={() => handleDeleteQuiz(quiz._id)}
                    />
                    <img
                      src={Share}
                      className={styles.share}
                      alt="Share"
                      onClick={() => handleShareQuiz(quiz._id)}
                    />
                  </div>
                </td>
                <td
                  className={styles.analysisOption}
                  onClick={() => handleAnalysis(quiz.quizName)}
                >
                  Question wise analysis
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showConfirmation && (
        <div className={styles.overlay}>
          <div className={styles.confirmationBox}>
            <p className={styles.confirm}>Are you sure you want to delete?</p>
            <div className={styles.delbuttons}>
              <button className={styles.yes} onClick={handleDeleteConfirmation}>Confirm Delete</button>
              <button className={styles.no} onClick={handleCancelDelete}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {showLinkCopied && (
        <img src={Link_Copied} className={styles.linkCopied} alt="Link Copied" />
      )}
      {showAnalysisOverlay && (
        <div className={styles.overlay2}>
          <div className={styles.analysisBox}>
            <div className={styles.titleContainer}>
              <p className={styles.analysisTitle}>{analysisQuizName} Question Analysis</p>
              {quizData.map((quiz, index) => {
                if (quiz.quizName === analysisQuizName) {
                  return (
                    <div key={index}>
                      <div className={styles.header} >
                        <p className={styles.create} >Creation On : {getFormattedDate(quiz.createdAt)}</p>
                        <p className={styles.impress}>Impressions: {quiz. linkOpenCount}</p>
                      </div>
                      {quiz.quizType === 'Q&A' && (
                        <div className={styles.question} key={index}>
                          {quiz.questions.map((question, qIndex) => {
                            const correctCount = question.userAnswers.filter(answer => answer === question.correctOption).length;
                            const wrongCount = question.userAnswers.length - correctCount;

                            return (
                              <div key={qIndex}>
                                <p>{qIndex + 1}. {question.question}</p>
                                <div className={styles.questionanalysis}>
                                  <div className={styles.paras}>
                                    <p className={styles.count}>{quiz.quizAttempts}</p>
                                    <p className={styles.p1}>people Attempted the question</p>
                                  </div>
                                  <div className={styles.paras}>
                                    <p className={styles.count}>{correctCount}</p>
                                    <p className={styles.p1}>people Answered correctly</p>
                                  </div>
                                  <div className={styles.paras}>
                                    <p className={styles.count}>{wrongCount}</p>
                                    <p className={styles.p1}>people Answered wrongly</p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {quiz.quizType === 'Poll' && (
                        <div className={styles.question} key={index}>
                          {quiz.questions.map((question, qIndex) => (
                            <div key={qIndex}>
                              <p>{qIndex + 1}. {question.question}</p>
                              <div className={styles.optionfield}>
                                {question.options.map((option, oIndex) => (
                                  <p className={styles.optionItem} key={oIndex}> {option.optionCountEntity1}  <span className={styles.optionLabel}>Option{oIndex + 1}</span> </p>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              })}
            </div>
            <button className={styles.close} onClick={() => setShowAnalysisOverlay(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Analytics;
