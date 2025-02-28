import React from 'react';
import { Routes, Route } from 'react-router-dom';

import PrivateRoute from '../MiddleWare/Private_Route';
import Register_Page from '../Pages/Register_Page/Register_Page';
import Login_Page from '../Pages/Login_Page/Login_Page';
import Dashboard_Page from '../Pages/Dashboard_Page/Dashboard_Page';
import Analytics_Page from '../Pages/Analytics_Page/Analytics_Page';
import Create_Quiz_Page from '../Pages/Create_Quiz_Page/Create_Quiz_Page';
import StartQuiz_Page from '../Pages/StartQuiz_Page/StartQuiz_Page';

function App() {
  return (
    <div>
      <Routes>
        <Route path='/register' element={<Register_Page />} />
        <Route path='/login' element={<Login_Page />} />
        <Route path='/' element={<PrivateRoute element={<Dashboard_Page />} />} />
        <Route path='/analytics' element={<PrivateRoute element={<Analytics_Page />} />} />
        <Route path='/create' element={<PrivateRoute element={<Create_Quiz_Page />} />} />
        <Route path='/start-quiz/:quizName' element={<StartQuiz_Page />} />
      </Routes>
    </div>

  );
}

export default App;
