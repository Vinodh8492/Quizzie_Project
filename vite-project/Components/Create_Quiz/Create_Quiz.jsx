import React, { useState, useEffect } from 'react';
import styles from './Create_Quiz.module.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { createQuiz, updateQuiz } from '../../APIs/quiz';
import Add from '../../Assets/Add.svg';
import deleteIcon from '../../Assets/Delete.svg';
import cancelledIcon from '../../Assets/Cancelled.svg';
import Link_Copied from '../../Assets/Link_Copied.svg';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Create_Quiz() {
  const { state } = useLocation();
  const [stateData] = useState(state?.quizData)
  const [isEditing, setIsEditing] = useState(!!state?.edit);
  const [quizOptionType, setQuizOptionType] = useState('Text');

  const navigate = useNavigate();
  const [isOverlayVisible, setIsOverlayVisible] = useState(true);
  const [selectedType, setSelectedType] = useState(null);
  const [showContinueOverlay, setShowContinueOverlay] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedTimer, setSelectedTimer] = useState(stateData?.timer || null);
  const [quizURL, setQuizURL] = useState('');
  const [quizData, setQuizData] = useState({
    quizName: stateData?.quizName || '',
    quizAttempts: stateData?.quizAttempts || 0,
    quizType: stateData?.quizType || '',
    timer: stateData?.timer || null,
    questions: stateData?.questions || [
      {
        question: '',
        options: [
          { entity1: '', entity2: '' },
          { entity1: '', entity2: '' },
          { entity1: '', entity2: '' },
          { entity1: '', entity2: '' },
        ],
        optionType: 'Text',
        correctOption: null,
      },
    ],
    creatorEmail: localStorage.getItem('userEmail'),
  });

  useEffect(() => {
    if (state?.quizData) {
      setSelectedType(state.quizData.quizType);
      setSelectedTimer(state.quizData.timer);

    }
    setIsEditing(!!state?.edit);
  }, [state]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setQuizData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };


  const handleQuestionChange = (index, value) => {
    const updatedQuestions = [...quizData.questions];
    updatedQuestions[index].question = value;
    setQuizData((prevState) => ({
      ...prevState,
      questions: updatedQuestions,
    }));
  };


  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...quizData.questions];
    const currentQuestion = updatedQuestions[questionIndex];


    const updatedOptions = currentQuestion.options.map((option, idx) => {
      if (idx === optionIndex) {
        return { ...option, ...value };
      }
      return option;
    });

    updatedQuestions[questionIndex] = { ...currentQuestion, options: updatedOptions };


    setQuizData((prevState) => ({
      ...prevState,
      questions: updatedQuestions,
    }));
  };

  const handleAddQuestion = () => {
    setQuizData((prevState) => ({
      ...prevState,
      questions: [
        ...prevState.questions,
        { question: '', options: [{ entity1: '', entity2: '' }, { entity1: '', entity2: '' }, { entity1: '', entity2: '' }, { entity1: '', entity2: '' }], optionType: 'Text', correctOption: null },
      ],
    }));
    setCurrentQuestionIndex(quizData.questions.length);
  };

  const handleDeleteLastQuestion = () => {
    const updatedQuestions = [...quizData.questions];
    if (updatedQuestions.length > 1) {
      updatedQuestions.pop();
      setQuizData((prevState) => ({
        ...prevState,
        questions: updatedQuestions,
      }));
      setCurrentQuestionIndex(updatedQuestions.length - 1);
    }
  };

  const handleAddOption = (questionIndex) => {
    const updatedQuestions = [...quizData.questions];
    if (updatedQuestions[questionIndex].options.length < 4) {
      updatedQuestions[questionIndex].options.push({ entity1: '', entity2: '' });
      setQuizData((prevState) => ({
        ...prevState,
        questions: updatedQuestions,
      }));
    }
  };

  const handleDeleteOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...quizData.questions];
    updatedQuestions[questionIndex].options.splice(optionIndex, 1);
    setQuizData((prevState) => ({
      ...prevState,
      questions: updatedQuestions,
    }));
  };

  const closeOverlay = () => {
    setIsOverlayVisible(false);
  };



  const handleTypeSelection = (type) => {
    setSelectedType(type);
    setQuizData((prevData) => ({
      ...prevData,
      quizType: type,
      optionType: quizOptionType,
    }));
  };


  const handleContinue = () => {
    if (!quizData.quizName || !selectedType) {
      toast.error('Please enter quiz name and select quiz type.');
      return;
    }

    setShowContinueOverlay(true);
  };

  const handleOptionTypeChange = (questionIndex, optionType) => {
    const updatedQuestions = [...quizData.questions];
    updatedQuestions[questionIndex].optionType = optionType;

    if (optionType === 'Text' || optionType === 'Image') {
      updatedQuestions[questionIndex].options = updatedQuestions[questionIndex].options.map(option => ({
        entity1: option.entity1,
        entity2: null,
      }));
    } else if (optionType === 'Text & Image') {
      updatedQuestions[questionIndex].options = updatedQuestions[questionIndex].options.map(option => ({
        entity1: option.entity1,
        entity2: option.entity2,
      }));
    }

    setQuizData((prevState) => ({
      ...prevState,
      questions: updatedQuestions,
    }));
  };


  const handleCorrectOptionChange = (questionIndex, optionIndex) => {
    const updatedQuestions = [...quizData.questions];
    updatedQuestions[questionIndex].correctOption = optionIndex;
    setQuizData((prevState) => ({
      ...prevState,
      questions: updatedQuestions,
    }));
  };

  const handleTimerSelection = (timer) => {
    if (timer === null) {
      setSelectedTimer(0);
    } else {
      setSelectedTimer(timer);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/register')
  }

  function isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  }

  const handleSubmit = async () => {
    try {
      if (!quizData.quizName || !selectedType) {
        toast.error('Please enter quiz name and select quiz type.');
        return;
      }

      if (selectedTimer === null) {
        toast.error('Please select a timer value.');
        return;
      }


      let isValid = true;
      quizData.questions.forEach((question, questionIndex) => {
        if (!question.question) {
          isValid = false;
          return;
        }
        question.options.forEach((option, optionIndex) => {
          if (!option.entity1 || (question.optionType === 'Text & Image' && !option.entity2)) {
            isValid = false;
            return;
          }
          if (question.optionType === 'Image' && !isValidUrl(option.entity1)) {
            isValid = false;
            return;
          }
          if (question.optionType === 'Text & Image' && !isValidUrl(option.entity2)) {
            isValid = false;
            return;
          }
        });
      });


      if (!isValid) {
        toast.error('Please enter valid image URLs.');
        return;
      }

      let timerValue = selectedTimer;


      const updatedQuizData = { ...quizData, quizType: selectedType, timer: timerValue };

      const isQAndA = updatedQuizData.quizType === 'Q&A';

      if (updatedQuizData.questions.some((q) => !q.question || q.options.some((o) => !o.entity1))) {
        toast.error('Please fill out all questions and options.');
        return;
      }

      if (isQAndA && updatedQuizData.questions.some((q) => q.correctOption === null)) {
        toast.error('Please select the correct option for all questions in Q&A quiz.');
        return;
      }

      if (!isQAndA) {
        updatedQuizData.questions.forEach((q) => {
          q.correctOption = undefined;
        });
      }

      console.log('Submitting quiz data:', updatedQuizData);

      if (isEditing) {


        await updateQuiz(stateData._id, updatedQuizData);
        console.log('Quiz updated:', updatedQuizData);
        alert('Quiz updated successfully');
        navigate('/analytics');


      } else {
        const response = await createQuiz(updatedQuizData);
        console.log('Quiz created:', response);

        if (response?.message === "Quiz with the same name already exists.") {
          toast.error(response.message);
          return;
        }

        if (response?.message) {
          const generatedURL = `${window.location.origin}/start-quiz/${response.quiz._id}`;
          console.log('Generated quiz URL:', generatedURL);
          setQuizURL(generatedURL);
          setShowSuccessOverlay(true);
        }

        setQuizData({
          quizName: '',
          questions: [
            {
              question: '',
              options: [
                { entity1: '', entity2: '', optionCountEntity1: 0, optionCountEntity2: 0 },
                { entity1: '', entity2: '', optionCountEntity1: 0, optionCountEntity2: 0 },
              ],
              optionType: 'Text',
              correctOption: null,
            },
          ],
        });
        setCurrentQuestionIndex(0);
      }
    } catch (error) {
      console.error('Failed to create quiz:', error);
    }
  };




  return (
    <div className={styles.body}>
      <ToastContainer />
      <div className={styles.left}>
        <h1 className={styles.heading}>Quizzie</h1>
        <button className={styles.dashboard} onClick={() => navigate('/')}>
          Dashboard
        </button>
        <button className={styles.analytics} onClick={() => navigate('/analytics')}>
          Analytics
        </button>
        <button className={styles.createquiz} onClick={() => setShowSuccessOverlay(true)}>
          Create Quiz
        </button>
        <hr className={styles.separator} />

        <button className={styles.logout} onClick={handleLogout}>
          Logout
        </button>
      </div>
      <div className={styles.right}>
        {isOverlayVisible && !showContinueOverlay && (
          <Overlay
            onClose={closeOverlay}
            selectedType={selectedType}
            onSelectType={handleTypeSelection}
            onContinue={handleContinue}
            quizName={quizData.quizName}
            handleChange={handleChange}
            quizData={quizData}
            setQuizData={setQuizData}
          />
        )}
        {showContinueOverlay && (
          <ContinueOverlay
            onClose={() => setShowContinueOverlay(false)}
            quizData={quizData}
            currentQuestionIndex={currentQuestionIndex}
            setCurrentQuestionIndex={setCurrentQuestionIndex}
            handleQuestionChange={handleQuestionChange}
            handleOptionChange={handleOptionChange}
            handleAddOption={handleAddOption}
            handleDeleteOption={handleDeleteOption}
            handleOptionTypeChange={handleOptionTypeChange}
            handleSubmit={handleSubmit}
            handleAddQuestion={handleAddQuestion}
            handleDeleteLastQuestion={handleDeleteLastQuestion}
            handleCorrectOptionChange={handleCorrectOptionChange}
            selectedType={selectedType}
            selectedTimer={selectedTimer}
            handleTimerSelection={handleTimerSelection}

          />
        )}
        {showSuccessOverlay && (
          <SuccessOverlay onClose={() => setShowSuccessOverlay(false)} quizURL={quizURL} />
        )}


      </div>
    </div>
  );
}

function SuccessOverlay({ onClose, quizURL }) {
  const [showShareImage, setShowShareImage] = useState(false);
  const navigate = useNavigate();

  const handleShareClick = () => {
    setShowShareImage(true);

    navigator.clipboard.writeText(quizURL)
      .then(() => {
        toast.success('Quiz Link copied to clipboard!');
      })
      .catch((err) => {
        toast.error('Failed to copy URL');
        console.error('Could not copy text: ', err);
      });
    setTimeout(() => {
      setShowShareImage(false);
    }, 3000);
  };

  const handleCancel = () => {
    navigate('/')
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.overlayContent}>
        <div className={styles.success}>
          <img src={cancelledIcon} className={styles.successcancel} onClick={handleCancel} />
          {showShareImage && <img src={Link_Copied} className={styles.linkcopied} alt="Share" />}
          <p className={styles.overtext1}>Congrats your Quiz is</p>
          <p className={styles.overtext2}>Published</p>
          <a href={quizURL} target="_blank" rel="noopener noreferrer" className={styles.quizLink}>
            {quizURL}
          </a>
          <button className={styles.successshare} onClick={handleShareClick}>
            Share
          </button>
        </div>
      </div>
    </div>
  );
}



function Overlay({ onClose, selectedType, onSelectType, onContinue, quizName, handleChange, quizData, setQuizData }) {
  const [selectedQuizType, setSelectedQuizType] = useState(quizData.quizType);

  const handleSelectType = (type) => {
    setSelectedQuizType(type);
    setQuizData((prevState) => ({
      ...prevState,
      quizType: type,
    }));
  };

  const navigate = useNavigate();
  const handleCancel = () => {
    navigate('/')
  }

  useEffect(() => {
    setSelectedQuizType(quizData.quizType);

  }, [quizData.quizType]);

  return (
    <div className={styles.overlay}>
      <div className={styles.overlayContent}>
        <h2 className={styles.head}>Create a New Quiz</h2>
        <input
          type="text"
          placeholder="Quiz Name"
          className={styles.input}
          name="quizName"
          value={quizData.quizName}
          onChange={handleChange}
          maxLength={10}
        />
        <br />
        <div className={styles.middle}>
          Quiz Type
          <button
            className={`${styles.question} ${selectedType === 'Q&A' ? styles.selected : ''}`}
            onClick={() => {
              onSelectType('Q&A');
              setQuizData((prevData) => ({ ...prevData, quizType: 'Q&A' }));
            }}
          >
            Q & A
          </button>

          <button
            className={`${styles.poll} ${selectedType === 'Poll' ? styles.selected : ''}`}
            onClick={() => {
              onSelectType('Poll');
              setQuizData((prevData) => ({ ...prevData, quizType: 'Poll' }));
            }}
          >
            Poll Type
          </button>

        </div>
        <div className={styles.last}>
          <button className={styles.cancel} onClick={handleCancel}>
            Cancel
          </button>
          <button className={styles.continue} onClick={onContinue}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

function ContinueOverlay({
  onClose,
  quizData,
  currentQuestionIndex,
  setCurrentQuestionIndex,
  handleQuestionChange,
  handleOptionChange,
  handleAddOption,
  handleDeleteOption,
  handleOptionTypeChange,
  handleSubmit,
  handleAddQuestion,
  handleDeleteLastQuestion,
  handleCorrectOptionChange,
  selectedTimer,
  handleTimerSelection,
}) {
  const question = quizData.questions[currentQuestionIndex] || { question: '', options: [], optionType: 'Text', correctOption: null };

  const [quizOptionType, setQuizOptionType] = useState('Text');

  const handleOptionSelect = (index) => {
    handleCorrectOptionChange(currentQuestionIndex, index);

  };

  useEffect(() => {
    setQuizOptionType(quizData.optionType || 'Text');
  }, [quizData.optionType]);

  return (
    <div className={styles.overlay1}>
      <div className={styles.overlayContent1}>
        <div className={styles.header}>
          {quizData.questions.map((_, index) => (
            <div key={index} className={styles.questionContainer}>
              <button
                className={`${styles.para} ${currentQuestionIndex === index ? styles.activeQuestion : ''}`}
                onClick={() => setCurrentQuestionIndex(index)}
              >
                {index + 1}
              </button>
              {index === quizData.questions.length - 1 && quizData.questions.length > 1 && (
                <img
                  src={cancelledIcon}
                  alt="Cancel"
                  className={styles.cancelledIcon}
                  onClick={handleDeleteLastQuestion}
                />
              )}
            </div>
          ))}
          {quizData.questions.length < 5 && (
            <img src={Add} alt="Add" className={styles.add} onClick={handleAddQuestion} />
          )}
        </div>
        <input
          type="text"
          placeholder={quizData.quizType === 'Q&A' ? 'Quiz Question' : 'Poll Question'}
          className={styles.input02}
          name="question"
          value={question.question}
          onChange={(e) => handleQuestionChange(currentQuestionIndex, e.target.value)}
          maxLength={40}
        />
        <br />
        <div className={styles.options}>
          <div className={styles.type}>Option Type</div>
          <div>
            <input
              type="radio"
              id={`textOption-${currentQuestionIndex}`}
              value="Text"
              checked={quizOptionType === 'Text'}
              onChange={() => {
                setQuizOptionType('Text');
                handleOptionTypeChange(currentQuestionIndex, 'Text');
              }}
            />
            <label className={styles.text} htmlFor={`textOption-${currentQuestionIndex}`}>
              Text
            </label>
          </div>
          <div>
            <input
              type="radio"
              id={`imageOption-${currentQuestionIndex}`}
              value="Image"
              checked={quizOptionType === 'Image'}
              onChange={() => {
                setQuizOptionType('Image');
                handleOptionTypeChange(currentQuestionIndex, 'Image');
              }}
            />
            <label className={styles.text} htmlFor={`imageOption-${currentQuestionIndex}`}>
              Image
            </label>
          </div>
          <div>
            <input
              type="radio"
              id={`textImageOption-${currentQuestionIndex}`}
              value="Text & Image"
              checked={quizOptionType === 'Text & Image'}
              onChange={() => {
                setQuizOptionType('Text & Image');
                handleOptionTypeChange(currentQuestionIndex, 'Text & Image');
              }}
            />
            <label className={styles.text} htmlFor={`textImageOption-${currentQuestionIndex}`}>
              Text & Image URL
            </label>
          </div>
        </div>
        <div className={styles.middlepart}>
          <div className={styles.mid}>
            {question.options.map((option, index) => (
              <div key={index} className={styles.optioninput}>
                {quizData.quizType === 'Q&A' && (
                  <input
                    type="radio"
                    name={`correctOption-${currentQuestionIndex}`}
                    checked={question.correctOption === index}
                    onChange={() => handleOptionSelect(index)}
                    className={styles.radio}
                  />
                )}

                {quizOptionType === 'Text & Image' ? (
                  <div className={styles.horizontalInputs}>
                    <input
                      type="text"
                      placeholder="Text"
                      value={option.entity1 || ''}
                      onChange={(e) => handleOptionChange(currentQuestionIndex, index, { entity1: e.target.value })}
                      className={`${styles.input2} ${question.correctOption === index && quizData.quizType === 'Q&A' ? styles.greenInput : ''}`}
                      maxLength={20}
                    />
                    <input
                      type="text"
                      placeholder="Image URL"
                      value={option.entity2 || ''}
                      onChange={(e) => handleOptionChange(currentQuestionIndex, index, { entity2: e.target.value })}
                      className={`${styles.input2} ${question.correctOption === index && quizData.quizType === 'Q&A' ? styles.greenInput : ''}`}
                    />
                  </div>
                ) : (
                  <input
                    type="text"
                    placeholder="Option"
                    value={option.entity1 || ''}
                    onChange={(e) => handleOptionChange(currentQuestionIndex, index, { entity1: e.target.value })}
                    className={`${styles.input2} ${question.correctOption === index && quizData.quizType === 'Q&A' ? styles.greenInput : ''}`}
                    maxLength={quizOptionType === 'Text' ? 50 : undefined}
                  />
                )}

                {index > 1 && (
                  <img
                    src={deleteIcon}
                    alt="Delete"
                    className={styles.deleteIcon}
                    onClick={() => handleDeleteOption(currentQuestionIndex, index)}
                  />
                )}
              </div>
            ))}
            {question.options.length < 4 && (
              <button className={styles.addoption} onClick={() => handleAddOption(currentQuestionIndex)}>
                Add Option
              </button>
            )}
          </div>

          <div className={styles.timer}>
            <p className={styles.time}>Timer</p>
            <button
              className={`${styles.timebuttons} ${selectedTimer === 0 ? styles.selectedTimer : ''}`}
              onClick={() => handleTimerSelection(0)}
            >
              OFF
            </button>
            <button
              className={`${styles.timebuttons} ${selectedTimer === 5 ? styles.selectedTimer : ''}`}
              onClick={() => handleTimerSelection(5)}
            >
              5 Sec
            </button>
            <button
              className={`${styles.timebuttons} ${selectedTimer === 10 ? styles.selectedTimer : ''}`}
              onClick={() => handleTimerSelection(10)}
            >
              10 Sec
            </button>
          </div>
        </div>
        <div className={styles.last1}>
          <button className={styles.cancel1} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.created} onClick={handleSubmit}>
            Create Quiz
          </button>
        </div>
      </div>
    </div>
  );
}


export default Create_Quiz;
