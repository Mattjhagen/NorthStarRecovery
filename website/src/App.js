import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import PublicSite from './components/PublicSite';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import LearnModule from './components/LearnModule';
import AdminPortal from './components/AdminPortal';
import './App.css';

export default function App() {
  return <BrowserRouter><div className="App"><Routes>
    <Route path="/" element={<PublicSite />} />
    <Route path="/privacy" element={<PrivacyPolicy />} />
    <Route path="/terms" element={<TermsOfService />} />
    <Route path="/modules/:id" element={<LearnModule />} />
    <Route path="/admin" element={<AdminPortal />} />
    <Route path="*" element={<PublicSite />} />
  </Routes></div></BrowserRouter>;
}

