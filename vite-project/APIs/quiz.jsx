import React from "react";
import axios from 'axios'
const backendUrl = 'https://final-backend-umvj.onrender.com/quiz'

export const createQuiz = async (quizzes) => {
  try {
    const reqUrl = `${backendUrl}/create`;

    const response = await axios.post(reqUrl, quizzes);
    return response.data;
  } catch (error) {
    console.error(error);
    console.log('Failed to create quiz.');
  }
};

export const incrementLinkOpenCount = async (quizName) => {
  try {
      await axios.post(`${backendUrl}/${quizName}/open`);
      console.log('Open count incremented successfully');
  } catch (error) {
      console.error('Error incrementing open count:', error);
  }
};


export const updateQuiz = async (quizId, updatedFormData) => {
  try {
    const reqUrl = `${backendUrl}/update/${quizId}`;

    const response = await axios.put(reqUrl, updatedFormData);
    return response.data;
  } catch (error) {
    console.error('Error updatingting quiz:', error);

  }
};

export const updateOptionCount = async (quizId, questionIndex, optionIndex) => {
  try {
    await axios.post(`${backendUrl}/${quizId}/question/${questionIndex}/option/${optionIndex}`);
  } catch (error) {
    console.error('Failed to update option count', error);
  }
};

export const postIncrementQuizAttempts = async (quizId) => {
  try {
    const reqUrl = `${backendUrl}/increment-attempts/${quizId}`;
    const response = await axios.post(reqUrl);
    return response.data;
  } catch (error) {
    console.error('Error incrementing quiz attempts:', error);
  }
};

export const deleteQuiz = async (quizId) => {
  try {
    const reqUrl = `${backendUrl}/delete/${quizId}`;

    const response = await axios.delete(reqUrl);
    return response.data;
  } catch (error) {
    console.error('Error deleting quiz:', error);
    throw error;
  }
};

export const getQuizzesById = async (quizId) => {
  try {
    const reqUrl = `${backendUrl}/details/${quizId}`;
    const response = await axios.get(reqUrl);
    return response.data;
  } catch (error) {
    console.log(error);

  }
};

export const getAllQuizzes = async () => {
  try {
    const reqUrl = `${backendUrl}/all`;
    const response = await axios.get(reqUrl)
    return response.data
  } catch (error) {
    console.log(error)
  }
}






