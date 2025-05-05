import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


// Import your components
import HomePage from './components/HomePage'; // Home page
import Login from "./components/Login";


function App() {
  return (
  
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
        
        </Routes>
      </Router>
    
  );
}

export default App;
