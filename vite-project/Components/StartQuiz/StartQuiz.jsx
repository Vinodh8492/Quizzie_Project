import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

import Win from '../../Assets/Win.svg';
import styles from './StartQuiz.module.css';
import { getQuizzesById, updateOptionCount } from '../../APIs/quiz';
import { postIncrementQuizAttempts, incrementLinkOpenCount } from '../../APIs/quiz';

function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch (error) {
        return false;
    }
}

function StartQuiz() {
    const { quizName } = useParams();
    const [quizData, setQuizData] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [questionSelections, setQuestionSelections] = useState([]);
    const [optionSelectionCounts, setOptionSelectionCounts] = useState([]);
    const [quizAttempts, setQuizAttempts] = useState(0);
    const [timer, setTimer] = useState(null);
    const timerRef = useRef(null);

    const fetchQuizzesById = async (requiredId) => {
        if (!requiredId) return console.log("quiz id not found");
        const response = await getQuizzesById(requiredId);
        setQuizData(response.data);

        if (response.data.timer !== null) {
            setTimer(response.data.timer);
            console.log('Initial timer set to:', response.data.timer);
        }
    };

    useEffect(() => {
        incrementLinkOpenCount(quizName);
    }, [quizName]);

    useEffect(() => {
        fetchQuizzesById(quizName);
    }, [quizName]);

    useEffect(() => {
        if (timer !== null && timer > 0) {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            timerRef.current = setInterval(() => {
                setTimer((prev) => {
                    if (prev === 1) {
                        handleNextQuestion(true);
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timerRef.current);
        }
    }, [timer]);

    const handleOptionSelect = async (optionIndex) => {
        const updatedSelections = [...questionSelections];
        updatedSelections[currentQuestionIndex] = optionIndex;
        setQuestionSelections(updatedSelections);
        setSelectedOptionIndex(optionIndex);

        const updatedCounts = [...optionSelectionCounts];
        updatedCounts[currentQuestionIndex] = {
            ...updatedCounts[currentQuestionIndex],
            [optionIndex]: (updatedCounts[currentQuestionIndex]?.[optionIndex] || 0) + 1,
        };
        setOptionSelectionCounts(updatedCounts);

        try {
            await updateOptionCount(quizData._id, currentQuestionIndex, optionIndex);
        } catch (error) {
            console.error('Failed to update option count', error);
        }
    };

    const calculateScore = () => {
        if (!quizData || !quizData.questions) return null;
        const totalQuestions = quizData.questions.length;
        let correctAnswers = 0;
        for (let i = 0; i < totalQuestions; i++) {
            const correctOptionIndex = quizData.questions[i].correctOption;
            const selectedOptionIndex = questionSelections[i];
            if (correctOptionIndex === selectedOptionIndex) {
                correctAnswers++;
            }
        }
        return `${correctAnswers.toString().padStart(2, '0')}/${totalQuestions.toString().padStart(2, '0')}`;
    };

    const handleNextQuestion = async (isTimeout = false) => {
        if (selectedOptionIndex !== null || isTimeout) {
            if (isTimeout && selectedOptionIndex === null) {
                const updatedSelections = [...questionSelections];
                updatedSelections[currentQuestionIndex] = -1;
                setQuestionSelections(updatedSelections);
            }
            if (currentQuestionIndex < quizData.questions.length - 1) {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
                setSelectedOptionIndex(null);
                if (quizData.timer !== null) {
                    setTimer(quizData.timer);
                    console.log('Timer reset to:', quizData.timer);
                }
            } else {
                setQuizCompleted(true);
                setQuizAttempts(quizAttempts + 1);
                await postIncrementQuizAttempts(quizData._id);
            }
        } else {
            console.log("Please select an option before moving to the next question.");
        }
    };

    const formatTimer = (time) => {
        const minutes = Math.floor(time / 60).toString().padStart(2, '0');
        const seconds = (time % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    };

    return (
        <div className={styles.home}>
            <div className={styles.content}>
                <div className={styles.contents}>
                    {quizData ? (
                        <div>
                            {quizData.questions && !quizCompleted && (
                                <h1 className={styles.number}>{currentQuestionIndex + 1}/{quizData.questions.length}</h1>
                            )}
                            {!quizCompleted && (
                                <div>
                                    {quizData.questions && (
                                        <div>
                                            <p className={styles.question}>{quizData.questions[currentQuestionIndex].question}</p>
                                            <div className={styles.buttons}>
                                                {quizData.questions[currentQuestionIndex].options.map((option, idx) => {
                                                    const hasTextAndImage = option.entity1 && isValidUrl(option.entity2);
                                                    const isImageOption = isValidUrl(option.entity1);

                                                    return (
                                                        <button
                                                            key={idx}
                                                            className={`${styles.optionButton} ${selectedOptionIndex === idx ? styles.selectedOption : ''} ${hasTextAndImage ? styles.textAndImageOption : ''}`}
                                                            onClick={() => handleOptionSelect(idx)}
                                                        >
                                                            {isImageOption ? (
                                                                <img src={option.entity1} alt="Option" className={styles.optionImage} />
                                                            ) : (
                                                                <span className={styles.optionText}>{option.entity1}</span>
                                                            )}

                                                            {isValidUrl(option.entity2) && (
                                                                <img src={option.entity2} alt="Option" className={styles.optionImage2} />
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            {quizData.timer !== null && quizData.timer !== 0 && (
                                                <div className={styles.timer}>
                                                    <p>{formatTimer(timer)}s</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                            {!quizCompleted && (
                                <button className={styles.nextButton} onClick={() => handleNextQuestion(false)}>Next</button>
                            )}
                            {quizCompleted && quizData.quizType === 'Q&A' && (
                                <div className={styles.success}>
                                    <p className={styles.successmessage}>Congrats! Quiz completed</p>
                                    <img src={Win} className={styles.win} alt="Win" />
                                    <p className={styles.score}> Your score is <span style={{ color: 'green', marginLeft: '1.5vw' }}>{calculateScore()}</span></p>
                                </div>
                            )}

                            {quizCompleted && quizData.quizType === 'Poll' && (
                                <div className={styles.poll}>
                                    <p className={styles.pollmessage1}>Thank you </p>
                                    <p className={styles.pollmessage2}>for participating in</p>
                                    <p className={styles.pollmessage3}>the poll</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p>Loading quiz...</p>
                    )}
                </div>

            </div>
        </div>
    );
}

export default StartQuiz;
