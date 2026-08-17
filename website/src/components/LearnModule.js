import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './LearnModule.css';

const LEARN_MODULES = [
  { id:1, title:'Foundations', copy:'A kind introduction to taking the next right step.', steps:['Set your intention','Name one support','Practice a pause'], detail:"Recovery begins with a single decision: to try. This module helps you understand what that first step looks like, and how to build a gentle foundation without pressure." },
  { id:2, title:'Your first meeting', copy:'Know what to expect before you walk in or join.', steps:['Choose a format','Arrive your way','Reflect after'], detail:"Meetings can feel intimidating. This module takes away the mystery so you can show up in whatever way feels safe — whether that's camera off, muted, or just listening." },
  { id:3, title:'Managing cravings', copy:'Understand your cravings and learn to move through them.', steps:['Name the trigger','Ride the wave (urge surfing)','Use HALT to check in'], detail:"Cravings are temporary — even when they don't feel that way. The HALT check (Hungry, Angry, Lonely, Tired) is one of the most practical tools in early recovery." },
  { id:4, title:'Stress & anxiety', copy:'Simple tools for when everything feels like too much.', steps:['5-4-3-2-1 grounding','Box breathing','Name what\\'s real vs. what\\'s fear'], detail:"Stress is normal. Anxiety in early recovery is extremely common. This module gives you grounding techniques that work in real moments — at home, at work, anywhere." },
  { id:5, title:'Rebuilding your sleep', copy:'Recovery and rest are deeply connected.', steps:['Understand your circadian rhythm','Build a wind-down routine','Protect your morning'], detail:"Methamphetamine severely disrupts sleep architecture. This module explains what's happening in your body and gives practical steps to rebuild healthy, restorative sleep." },
  { id:6, title:'Building your circle', copy:'Small, consistent connections make a difference.', steps:['Map your people','Send a check-in','Plan the week'], detail:"Isolation is one of the biggest risk factors in recovery. This module helps you identify the relationships worth nurturing and practice reaching out before you need to." },
  { id:7, title:'Nourishing your body', copy:'What you eat shapes how you feel in recovery.', steps:['Blood sugar & mood','Gut-brain connection','Hydration as healing'], detail:"Nutrition is often overlooked in recovery. Stable blood sugar, protein, and hydration directly affect mood, cravings, and mental clarity. Small changes here matter." },
  { id:8, title:'Service & purpose', copy:'Giving back is part of getting better.', steps:['What service means in Step 12','Find your way to give','One small act this week'], detail:"Step 12 is about carrying the message. This module explores what service looks like in daily life — and why helping others is one of the most powerful tools for your own recovery." },
  { id:9, title:'Relapse prevention', copy:'Preparation and self-compassion, together.', steps:['Know your warning signs','Make your plan','If it happens: next right step'], detail:"Relapse is not failure — it's data. This module helps you identify your early warning signs and build a compassionate, practical response plan before you need it." },
];

export default function LearnModule() {
  const { id } = useParams();
  const module = LEARN_MODULES.find(m => m.id === parseInt(id));

  if (!module) {
    return (
      <main className="ns-site ns-module-page">
        <div className="ns-module-content">
          <h1>Module not found</h1>
          <Link to="/" className="ns-back-link"><ArrowLeft size={16} /> Back to home</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="ns-site ns-module-page">
      <div className="ns-module-header">
        <Link to="/" className="ns-back-link"><ArrowLeft size={16} /> Northstar / CMA Meet</Link>
      </div>
      <article className="ns-module-content">
        <span className="ns-module-number">Module {module.id}</span>
        <h1 className="ns-module-title">{module.title}</h1>
        <p className="ns-module-copy">{module.copy}</p>
        
        <div className="ns-module-detail">
          <p>{module.detail}</p>
        </div>

        <div className="ns-module-steps">
          <h2>Core Concepts</h2>
          <ul>
            {module.steps.map((step, index) => (
              <li key={index}>
                <span className="ns-step-bullet">✦</span> {step}
              </li>
            ))}
          </ul>
        </div>
      </article>
    </main>
  );
}
