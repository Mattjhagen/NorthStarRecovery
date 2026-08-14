import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import PublicSite from './components/PublicSite';
import PrivacyPolicy from './components/PrivacyPolicy';
import './App.css';

export default function App() {
  return <BrowserRouter><div className="App"><Routes>
    <Route path="/" element={<PublicSite />} />
    <Route path="/privacy" element={<PrivacyPolicy />} />
  </Routes></div></BrowserRouter>;
}
