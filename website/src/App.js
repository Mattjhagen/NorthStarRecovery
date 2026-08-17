import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import PublicSite from './components/PublicSite';
import PrivacyPolicy from './components/PrivacyPolicy';
import LearnModule from './components/LearnModule';
import './App.css';

export default function App() {
  return <BrowserRouter><div className="App"><Routes>
    <Route path="/" element={<PublicSite />} />
    <Route path="/privacy" element={<PrivacyPolicy />} />
    <Route path="/modules/:id" element={<LearnModule />} />
  </Routes></div></BrowserRouter>;
}
