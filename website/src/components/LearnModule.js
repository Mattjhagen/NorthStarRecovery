import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './LearnModule.css';

const LEARN_MODULES = [
  { 
    id: 1, 
    title: 'Foundations', 
    copy: 'A kind introduction to taking the next right step.', 
    steps: ['Set your intention','Name one support','Practice a pause'], 
    content: [
      "Recovery begins with a single decision: to try. It does not demand perfection, nor does it require you to have all the answers mapped out. In Crystal Meth Anonymous, the foundation of recovery is built on the simple willingness to show up for yourself today. This module helps you understand what that first step looks like, and how to build a gentle, forgiving foundation without the pressure of forever.",
      "The early days of recovery can feel overwhelming, characterized by a mix of hope, fear, and profound physical fatigue. Methamphetamine heavily impacts the brain's dopamine pathways, meaning that in the beginning, joy and motivation may be difficult to find. This is a normal, expected part of the healing process. Your brain is simply recalibrating, and time is its most vital medicine.",
      "Building a foundation means focusing on the 'next right thing.' Rather than looking months or years down the road, which can provoke anxiety, we practice narrowing our focus to the next hour or the next day. Did you drink water? Did you rest? Did you attend a meeting? These seemingly small victories are the mortar holding your new life together.",
      "It is crucial during this phase to practice radical self-compassion. Many of us enter recovery carrying immense shame about our past actions or the state of our lives. We learn in CMA that shame is a heavy burden that keeps us sick. By acknowledging our humanity and treating ourselves with the same kindness we would offer a sick friend, we begin to chip away at that shame.",
      "Your only job right now is to stay sober today. Set a small intention each morning, identify at least one person or group (like CMA) you can lean on, and practice pausing before reacting to strong emotions. These three foundational steps will carry you safely through the turbulence of early recovery."
    ]
  },
  { 
    id: 2, 
    title: 'Your first meeting', 
    copy: 'Know what to expect before you walk in or join.', 
    steps: ['Choose a format','Arrive your way','Reflect after'], 
    content: [
      "Attending your first CMA meeting—whether in person or online—can be deeply intimidating. It is normal to feel nervous, out of place, or even skeptical. However, taking this step is often the turning point in a person's recovery journey. Meetings take away the mystery of recovery by showing you a room full of people who have been exactly where you are and have found a way out.",
      "If you are attending an online meeting via Zoom, you have complete control over your boundaries. You can leave your camera off, keep yourself muted, and simply listen. There is no requirement to share. If you are asked to introduce yourself, it is perfectly acceptable to say, 'I am just listening today.' The goal is simply to absorb the atmosphere and hear the message.",
      "In a meeting, you will hear individuals share their 'experience, strength, and hope.' They will talk about what it was like during their active addiction, what happened to bring them to recovery, and what their lives look like today. You may not relate to every detail of someone's story, but the core feelings of isolation, fear, and eventually hope, are universal.",
      "Anonymity is a spiritual foundation of CMA. What is said in the room stays in the room. This principle ensures that meetings remain a safe, judgement-free zone where members can be radically honest about their struggles without fear of repercussion in their personal or professional lives. You can trust the space.",
      "After the meeting, take a moment to reflect. Did you hear something that resonated with you? Did someone's story bring you comfort? Many members suggest 'looking for the similarities, not the differences.' By arriving your way, listening openly, and reflecting afterward, you have already completed one of the hardest parts of recovery: showing up."
    ]
  },
  { 
    id: 3, 
    title: 'Managing cravings', 
    copy: 'Understand your cravings and learn to move through them.', 
    steps: ['Name the trigger','Ride the wave (urge surfing)','Use HALT to check in'], 
    content: [
      "Cravings are a physiological and psychological reality of early recovery, particularly with crystal meth. They are the brain's learned response to seeking dopamine, and they can strike suddenly and with intense force. The most important thing to remember is that a craving is not a sign of failure—it is simply a symptom of the disease of addiction.",
      "A highly effective technique for managing these moments is 'urge surfing.' Instead of fighting the craving or panicking about it, urge surfing involves imagining the craving as an ocean wave. It starts small, crests, and eventually breaks and dissipates. By observing the craving without judgment and riding it out, you teach your brain that the urge will pass whether you act on it or not. They always pass.",
      "When a craving hits, the HALT method is one of the most practical tools at your disposal. HALT stands for Hungry, Angry, Lonely, Tired. Often, what feels like an intense craving for meth is actually your body desperately signaling a basic need. Are you hungry? Have you slept? Are you feeling isolated? Addressing the underlying physical or emotional need often drastically reduces the craving's intensity.",
      "Identifying your triggers is also crucial. Triggers can be people, places, things, or even specific emotional states that your brain associates with drug use. By naming the trigger—'I am feeling stressed from work, and that is making me crave'—you take away its subconscious power. You move the craving from the emotional center of your brain to the logical center.",
      "Recovery teaches us that we do not have to act on every thought or feeling we have. You can acknowledge a craving, feel it fully, and still choose to stay sober. Build a toolkit: call another member, get to a meeting, take a shower, or simply practice the HALT check-in. Every time you successfully ride out a craving, the neural pathways of addiction weaken, and your recovery grows stronger."
    ]
  },
  { 
    id: 4, 
    title: 'Stress & anxiety', 
    copy: 'Simple tools for when everything feels like too much.', 
    steps: ['5-4-3-2-1 grounding','Box breathing',"Name what's real vs. what's fear"], 
    content: [
      "Stress is a normal part of the human experience, but for someone in early recovery, anxiety can feel overwhelming and unmanageable. Crystal meth artificially elevates the body's fight-or-flight response, and once the drug is removed, the nervous system can remain in a state of high alert. This is often referred to as Post-Acute Withdrawal Syndrome (PAWS), and it is temporary.",
      "When anxiety spikes, your mind may race into the future, catastrophizing about what might happen. The antidote to anxiety is presence. Grounding techniques, such as the 5-4-3-2-1 method, pull your focus out of your thoughts and back into your physical environment. By naming five things you can see, four you can touch, three you can hear, two you can smell, and one you can taste, you signal to your nervous system that you are safe in the present moment.",
      "Box breathing is another incredibly powerful, immediate tool for emotional regulation. Inhale deeply for a count of four, hold the breath for four, exhale for four, and hold empty for four. This rhythmic breathing stimulates the vagus nerve, which acts as a physiological brake pedal for your body's stress response, physically slowing your heart rate and calming your mind.",
      "In moments of high stress, our brains often lie to us. It is vital to learn how to separate reality from fear. We practice asking ourselves: 'Is this an actual crisis happening right now, or is this my anxiety predicting a disaster?' By naming what is real versus what is fear-based projection, we can approach our problems with logic rather than panic.",
      "Remember that learning to sit with discomfort is a muscle that must be built over time. In active addiction, we used drugs to immediately escape any uncomfortable feeling. In recovery, we learn that we are capable of experiencing stress and anxiety without shattering. These simple grounding tools ensure that when life feels like too much, you have a safe, sober way to cope."
    ]
  },
  { 
    id: 5, 
    title: 'Rebuilding your sleep', 
    copy: 'Recovery and rest are deeply connected.', 
    steps: ['Understand your circadian rhythm','Build a wind-down routine','Protect your morning'], 
    content: [
      "There is perhaps no physical system more disrupted by methamphetamine use than your sleep architecture. Meth forces the brain to stay awake, overriding the natural circadian rhythm and exhausting the body's reserves. In early recovery, you may experience extreme hypersomnia (sleeping too much) or agonizing insomnia. Both are normal as your brain attempts to heal.",
      "Sleep is not just a luxury; it is a foundational pillar of recovery. During deep sleep, the brain literally washes away toxins and consolidates memories and emotional regulation. When we are sleep-deprived, our impulse control drops, our emotional volatility spikes, and our vulnerability to cravings increases drastically. Protecting your sleep is protecting your sobriety.",
      "To rebuild a healthy circadian rhythm, consistency is key. The body thrives on predictability. Try to wake up and go to sleep at the same time every day, even on weekends. Exposure to natural sunlight first thing in the morning halts the production of melatonin and helps reset your internal clock, signaling to your brain that it is time to be alert.",
      "A purposeful wind-down routine is essential for someone whose brain is accustomed to high stimulation. At least an hour before bed, begin lowering the lights and disconnecting from screens. Engage in calming activities like reading, taking a warm shower, or listening to a Northstar soundscape. This routine acts as a psychological bridge between the stress of the day and the rest of the night.",
      "Finally, be patient with yourself. Healing a deeply disrupted sleep cycle takes time. If you cannot sleep, do not panic or toss and turn in frustration. Get up, do a quiet activity under dim light, and return to bed when you feel drowsy. By consistently prioritizing your rest, you give your brain the optimal environment it needs to repair the damage of addiction."
    ]
  },
  { 
    id: 6, 
    title: 'Building your circle', 
    copy: 'Small, consistent connections make a difference.', 
    steps: ['Map your people','Send a check-in','Plan the week'], 
    content: [
      "Addiction is a disease of isolation. It thrives in secrecy and loneliness, convincing us that no one understands us and that we are better off alone. Recovery, therefore, must be rooted in connection. Building a healthy, sober circle of support is one of the most critical actions you can take to safeguard your long-term sobriety.",
      "The fellowship of CMA provides a ready-made circle of individuals who understand exactly what you are going through. However, building a circle requires action. It means getting phone numbers at meetings, joining group chats, and, most importantly, actually reaching out when things are good, so that it feels natural to reach out when things are bad.",
      "Mapping your people involves taking inventory of who in your life supports your recovery. This might include CMA peers, a sponsor, supportive family members, or a therapist. It also requires setting firm boundaries with individuals who are still actively using or who jeopardize your peace of mind. Your recovery must come first, even if it means changing your social landscape.",
      "The practice of sending a small check-in text to another person in recovery is deceptively powerful. It pulls you out of your own head and builds a reciprocal safety net. When you ask someone else, 'How is your day going?' you are practicing service and strengthening a bond that may one day save your life.",
      "Plan your week to include intentional connection. Isolation often happens by accident, slipping into our schedules when we aren't looking. By actively planning to attend specific meetings, scheduling a coffee date with a fellow member, or committing to a regular phone call, you build a fortress of community around your recovery that addiction cannot easily penetrate."
    ]
  },
  { 
    id: 7, 
    title: 'Nourishing your body', 
    copy: 'What you eat shapes how you feel in recovery.', 
    steps: ['Blood sugar & mood','Gut-brain connection','Hydration as healing'], 
    content: [
      "During active addiction, basic bodily needs like nutrition and hydration are often entirely ignored. The body is treated as an afterthought. In recovery, learning to nourish your body is an act of profound self-respect. Nutrition plays a direct, immediate role in your mood, your energy levels, and your ability to manage cravings.",
      "Blood sugar regulation is incredibly important in early recovery. When you go too long without eating, your blood sugar drops, which can trigger feelings of anxiety, irritability, and exhaustion—feelings that the brain often misinterprets as cravings for drugs. Eating small, regular meals with complex carbohydrates and protein keeps your blood sugar stable and your mood grounded.",
      "The gut-brain connection is a rapidly growing field of science that is highly relevant to recovery. A significant portion of your body's serotonin (the 'feel-good' neurotransmitter) is produced in the digestive tract. By eating nutrient-dense foods, you are literally giving your body the building blocks it needs to repair your depleted neurotransmitters and stabilize your mental health.",
      "Hydration is often the simplest and most overlooked tool for healing. Dehydration causes fatigue, brain fog, and headaches. Committing to drinking enough water every day flushes toxins from your system, improves cognitive function, and helps your organs recover from the stress of active addiction. It is a small, daily promise you make to your body.",
      "You do not need to adopt a perfect or restrictive diet. The goal is simply to shift from a state of physical neglect to a state of gentle nourishment. Listen to your body. When it is hungry, feed it. When it is thirsty, hydrate it. By meeting these fundamental needs, you remove the physical stress that often paves the way for emotional relapse."
    ]
  },
  { 
    id: 8, 
    title: 'Service & purpose', 
    copy: 'Giving back is part of getting better.', 
    steps: ['What service means in Step 12','Find your way to give','One small act this week'], 
    content: [
      "Step 12 of the CMA program states: 'Having had a spiritual awakening as the result of these steps, we tried to carry this message to crystal meth addicts, and to practice these principles in all our affairs.' Service is not a chore or an obligation; it is the lifeblood of long-term recovery. It shifts our focus outward, breaking the self-centered nature of addiction.",
      "Service does not have to mean sponsoring a dozen people or speaking on large panels. It can be as simple as making coffee at a meeting, welcoming a newcomer at the door, or staying late to help put away chairs. These small acts of commitment tether you to the fellowship and give you a sense of belonging and purpose.",
      "When we help another person in recovery, we receive as much as we give. It reminds us of where we came from, keeping the memory of our active addiction green, which protects us from complacency. Seeing the spark of hope in a newcomer's eyes reignites our own gratitude for the progress we have made.",
      "Beyond the rooms of CMA, practicing these principles in all our affairs means being of service in our daily lives. It means showing up as a reliable friend, a present family member, and a helpful coworker. It is about rebuilding your self-esteem by becoming a person of integrity—someone who leaves situations better than they found them.",
      "Commit to one small act of service this week. Send an encouraging text to someone struggling, volunteer for a commitment at your home group, or simply listen deeply to a friend without interrupting. In moments when you feel lost or anxious, being of service to someone else is the fastest way to get out of your own head and reconnect with your higher purpose."
    ]
  },
  { 
    id: 9, 
    title: 'Relapse prevention', 
    copy: 'Preparation and self-compassion, together.', 
    steps: ['Know your warning signs','Make your plan','If it happens: next right step'], 
    content: [
      "Relapse is not a sudden, unexplainable event; it is a process that often begins long before a drug is actually used. Understanding this process is the core of relapse prevention. It involves recognizing the subtle emotional and behavioral shifts—like isolating, skipping meetings, or nursing resentments—that indicate your recovery is becoming unstable.",
      "Knowing your personal early warning signs allows you to intervene before a craving ever materializes. Are you suddenly irritable with everyone? Are you romanticizing your past use? Are you feeling overwhelmed and refusing to ask for help? When you spot these red flags, it is time to double down on your foundational tools: meetings, sponsorship, and connection.",
      "Having a concrete action plan is essential. When you are standing on the edge of a craving, your logical brain shuts down. You cannot rely on willpower in that moment. Your plan should be simple and actionable: 'If I feel like using, I will immediately call my sponsor, I will leave the environment I am in, and I will go to a meeting.' Write it down. Keep it accessible.",
      "If a relapse does happen, it is critical to reframe it not as a moral failure, but as data. Shame will tell you that all your hard work is ruined and you might as well keep using. Compassion will tell you that you made a mistake, that your recovery foundation had a crack in it, and that you can return to the rooms immediately to figure out what went wrong.",
      "The next right step after a slip is always honesty. Come back to a meeting, raise your hand, and tell the truth. Your experience will serve as a powerful reminder to others, and the fellowship will welcome you back without judgment. Relapse does not erase the lessons you learned while sober; it simply highlights where you need to grow next."
    ]
  }
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
          {module.content.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
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
