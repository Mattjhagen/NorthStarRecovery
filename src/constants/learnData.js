export const RECOVERY_LEVELS = [
  { level: 1, title: 'Seeker', minXP: 0, maxXP: 300, icon: 'compass-outline', badge: '🌱 First Light' },
  { level: 2, title: 'Pathfinder', minXP: 300, maxXP: 750, icon: 'trail-sign-outline', badge: '🧭 Grounded Path' },
  { level: 3, title: 'Wayfarer', minXP: 750, maxXP: 1400, icon: 'sparkles-outline', badge: '⭐ Steady Horizon' },
  { level: 4, title: 'Northstar Guardian', minXP: 1400, maxXP: 9999, icon: 'shield-checkmark-outline', badge: '✨ Beacon of Hope' },
];

export function getLevelForXP(xp = 0) {
  for (let i = RECOVERY_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= RECOVERY_LEVELS[i].minXP) {
      const current = RECOVERY_LEVELS[i];
      const next = RECOVERY_LEVELS[i + 1] || null;
      const progress = next
        ? (xp - current.minXP) / (next.minXP - current.minXP)
        : 1.0;
      return { ...current, progress: Math.min(1.0, Math.max(0, progress)), nextLevel: next };
    }
  }
  return { ...RECOVERY_LEVELS[0], progress: 0, nextLevel: RECOVERY_LEVELS[1] };
}

export const LEARN_MODULES = [
  {
    id: 1,
    title: 'Foundations & The Gentle Pause',
    category: 'Mindset',
    xp: 80,
    icon: 'compass-outline',
    summary: 'A quiet introduction to taking the next right step without perfectionism.',
    detail:
      'Recovery does not require solving the rest of your life today. It only requires making one gentle, honest choice in this present moment. When overwhelming feelings arrive, the power of a deliberate 60-second pause creates space between impulse and action.',
    steps: [
      'Name your one reason for choosing recovery right now.',
      'Practice the 60-second physical pause before responding to any stressor.',
      'Acknowledge that showing up imperfectly is still showing up.',
    ],
    keyInsight: 'You do not have to conquer the whole journey today. Just this moment.',
  },
  {
    id: 2,
    title: 'Your First Meeting: What to Expect',
    category: 'Fellowship',
    xp: 120,
    icon: 'people-outline',
    summary: 'Demystify CMA and 12-step meetings so you feel completely at ease.',
    detail:
      'Walking into a room or clicking an online meeting link can feel terrifying. Knowing the structure eliminates the unknown: readings are read, speakers share honest experience, and there is never any obligation to speak, turn your camera on, or identify until you are ready.',
    steps: [
      'Choose a meeting format (Camera off or audio-only is 100% welcome).',
      'Listen for the feelings and struggles that resonate with your own experience.',
      'Stay for 5 minutes after the closing to hear phone numbers or ask a quick question.',
    ],
    keyInsight: 'Everyone in that room was once attending their very first meeting too.',
  },
  {
    id: 3,
    title: 'Managing Cravings & Urge Surfing',
    category: 'Neuroscience',
    xp: 160,
    icon: 'pulse-outline',
    summary: 'The science of cravings, the 15-minute rule, and the HALT check-in.',
    detail:
      'Cravings are physiological neurochemical waves that peak at 10 to 15 minutes and naturally subside if not fed. Using "Urge Surfing", you observe the craving like an ocean wave without fighting it. Apply HALT immediately: are you Hungry, Angry, Lonely, or Tired?',
    steps: [
      'Apply the 15-Minute Rule: set a timer and do not act on an impulse until 15 minutes pass.',
      'Run the HALT scan: drink cold water, eat protein, or lie down for 10 minutes.',
      'Change your physical environment immediately (walk outside, change rooms, splash cold water on face).',
      'Call or text your sponsor or trusted contact before the timer expires.',
    ],
    keyInsight: 'A craving is an uncomfortable sensation, not an order you have to obey.',
  },
  {
    id: 4,
    title: 'Rebuilding Sleep & Circadian Rhythms',
    category: 'Body & Brain',
    xp: 180,
    icon: 'moon-outline',
    summary: 'How stimulant recovery disrupts sleep architecture and how to restore deep rest.',
    detail:
      'Methamphetamine severely alters dopamine receptors and disrupts REM and slow-wave sleep cycles. In early recovery, you may experience either insomnia or extreme hypersomnia. Restoring your biological circadian rhythm is critical: morning sunlight, regular waking times, and blue-light blocking signal your pineal gland to resume natural melatonin production.',
    steps: [
      'Get 10 minutes of natural outdoor sunlight within 45 minutes of waking.',
      'Keep a consistent wake-up time every day, even after poor sleep.',
      'Eliminate phone screens 45 minutes before bed; use NorthStar soundscapes or breathing.',
      'Understand that sleep will feel irregular for weeks — your brain is actively repairing.',
    ],
    keyInsight: 'Lying still with eyes closed still provides 70% of physical cellular restoration.',
  },
  {
    id: 5,
    title: 'How Your Body Adapts to Sobriety',
    category: 'Neuroscience',
    xp: 200,
    icon: 'fitness-outline',
    summary: 'The biological timeline of dopamine receptor upregulation and physical healing.',
    detail:
      'During active stimulant use, dopamine receptors (D2/D3) are down-regulated to protect against overstimulation. In early recovery, this causes "anhedonia" (difficulty feeling pleasure from ordinary activities). This is not permanent depression — it is your brain actively regrowing receptor density. Between 30, 90, and 180 days, dopamine sensitivity steadily returns.',
    steps: [
      'Recognize anhedonia as physical proof that your brain is healing, not broken.',
      'Engage in low-dopamine, steady micro-pleasures (warm tea, walking, showers, sunlight).',
      'Track small sensory milestones (tasting food again, sleeping naturally, morning calm).',
    ],
    keyInsight: 'The discomfort you feel is neuroplasticity in action — your brain is rebuilding.',
  },
  {
    id: 6,
    title: 'Stress, Panic & Somatic Grounding',
    category: 'Regulation',
    xp: 160,
    icon: 'leaf-outline',
    summary: 'Quick somatic tools (5-4-3-2-1, Box Breathing, Vagus nerve reset) when overwhelmed.',
    detail:
      'When your nervous system goes into fight-or-flight, cognitive reasoning shuts down. Somatic techniques communicate safety directly to the amygdala through the vagus nerve. By lengthening exhalations and engaging physical senses, you trigger the parasympathetic rest-and-digest response in under 2 minutes.',
    steps: [
      'Perform 5-4-3-2-1 Grounding: Name 5 things you see, 4 you feel, 3 you hear, 2 you smell, 1 you taste.',
      'Practice Box Breathing: Inhale 4s, Hold 4s, Exhale 4s, Hold 4s for 4 cycles.',
      'Stimulate the vagus nerve: splash icy cold water on your forehead or hum softly on exhalations.',
    ],
    keyInsight: 'You cannot think your way out of a nervous system panic; you must ground through the body.',
  },
  {
    id: 7,
    title: 'Nourishing the Brain & Blood Sugar',
    category: 'Body & Brain',
    xp: 180,
    icon: 'nutrition-outline',
    summary: 'Why blood sugar crashes mimic cravings and how simple nutrition restores mood.',
    detail:
      'Hypoglycemia (blood sugar drops) triggers cortisol and adrenaline spikes that feel identical to acute cravings and panic. Eating balanced protein, complex carbohydrates, amino acids (L-Tyrosine precursors), and staying hydrated eliminates more than 50% of sudden afternoon mood swings and cravings.',
    steps: [
      'Eat protein within 90 minutes of waking (eggs, nuts, protein smoothie, oatmeal).',
      'Keep healthy portable snacks (almonds, fruit, cheese) to prevent emergency blood sugar drops.',
      'Drink a large glass of water with electrolytes before diagnosing an emotional crisis.',
    ],
    keyInsight: 'Feed your body before you try to fix your feelings.',
  },
  {
    id: 8,
    title: 'Boundary Setting & Sober Circles',
    category: 'Relationships',
    xp: 200,
    icon: 'git-network-outline',
    summary: 'Protecting your peace: changing people, places, and learning to say no.',
    detail:
      'Early recovery requires radical boundary setting. Old user contacts, enabling dynamics, and high-risk environments will trigger subconscious memory networks. Saying "no" without elaborate justification is a life-saving skill that protects your recovery space.',
    steps: [
      'Delete and block phone numbers and social connections tied to active use.',
      'Practice the simple boundary phrase: "That does not work for me right now."',
      'Identify two safe recovery friends you can contact whenever a boundary feels hard to hold.',
    ],
    keyInsight: 'You do not owe anyone an explanation for protecting your life and sobriety.',
  },
  {
    id: 9,
    title: 'Service & The 12th Step Purpose',
    category: 'Fellowship',
    xp: 220,
    icon: 'heart-outline',
    summary: 'Why helping another person in recovery is the most powerful antidote to relapse.',
    detail:
      'Addiction thrives in self-centered isolation. Step 12 states: "Having had a spiritual awakening as the result of these steps, we tried to carry this message to addicts." Setting up meeting chairs, making coffee, welcoming a newcomer, or simply listening gets you outside your own head and reinforces your own sobriety.',
    steps: [
      'Greet one newcomer or member who is sitting alone in a meeting.',
      'Volunteer for a small service position (chat greeter, literature reader, room host).',
      'Share an honest 2-minute check-in that might help someone else feel less alone.',
    ],
    keyInsight: 'You cannot transmit what you do not have, and you cannot keep what you do not give away.',
  },
  {
    id: 10,
    title: 'Relapse Prevention & Compassionate Restart',
    category: 'Safety',
    xp: 240,
    icon: 'shield-checkmark-outline',
    summary: 'Recognizing emotional relapse weeks before physical use, and responding with care.',
    detail:
      'Relapse rarely happens suddenly. It begins as "Emotional Relapse" (isolating, missing meetings, bottling up feelings), progresses to "Mental Relapse" (glamorizing the past, bargaining), before leading to "Physical Relapse". Having a written emergency plan and knowing that a slip does not erase your learned growth removes shame and saves lives.',
    steps: [
      'Write down your top 3 warning signs (e.g. stopping calls, feeling resentful, secret-keeping).',
      'Store your Sponsor and crisis numbers in speed dial on your phone.',
      'If a slip occurs: stop immediately, call for help, and go to a meeting within 24 hours. Compassion, not shame.',
    ],
    keyInsight: 'Relapse is not a failure; it is vital data showing where your recovery plan needed more support.',
  },
];

export const RECOVERY_STORIES = [
  {
    id: 'story-1',
    author: 'David M.',
    cleanTime: '2 years clean',
    title: 'The First 14 Days: Waiting for the Fog to Lift',
    category: 'Early Recovery',
    readTime: '4 min read',
    quote: 'I thought the exhaustion would never end. But on day 10, I smelled coffee and heard birds, and I cried because I was finally alive.',
    body: `When I stopped using methamphetamine, I slept for almost five days straight. When I woke up, my brain felt like wet concrete. I couldn't finish sentences, and I felt this terrifying emptiness where my feelings used to be.

My sponsor told me: "David, your brain is doing heavy construction work right now. Don't inspect the building while the scaffolding is still up."

That phrase saved me. I stopped expecting myself to be happy or productive. I focused entirely on three tasks every day:
1. Drink three glasses of water and eat something with protein.
2. Attend one online CMA meeting, even with my camera off and laying in bed.
3. Don't pick up the pipe, no matter how uncomfortable the hour felt.

Around day 18, I went outside and the morning air actually felt crisp and clear. The fog didn't vanish overnight — it lifted in slow, gentle layers. If you are in your first two weeks, just hold on. Your brain is repairing itself every second you stay clean.`,
  },
  {
    id: 'story-2',
    author: 'Elena R.',
    cleanTime: '18 months clean',
    title: 'Learning to Sleep Again Without Chemicals',
    category: 'Sleep & Healing',
    readTime: '5 min read',
    quote: 'Insomnia used to send me straight back to the dealer. Once I accepted that quiet resting is healing too, the fear left.',
    body: `For six years, sleep was something that happened only when my body physically collapsed from exhaustion. So when I got clean, lying in a dark room sober filled me with overwhelming panic. My heart would pound and my mind raced with every regret of the last decade.

The breakthrough came when a doctor in recovery told me: "Elena, even if you do not fall into deep sleep, resting your body quietly in the dark with slow breathing provides 70% of the physical restoration your cells need."

I stopped fighting insomnia. I built a nightly sanctuary:
- I turned off all screens at 9:30 PM.
- I put on rain soundscapes in NorthStar and did 4-7-8 breathing.
- If my mind started racing, I whispered: "It's okay. You are safe in your bed. Nothing has to be solved tonight."

Within six weeks, natural 11 PM sleep returned. Waking up from genuine REM sleep without nausea or racing thoughts is the greatest gift sobriety has given me.`,
  },
  {
    id: 'story-3',
    author: 'Marcus T.',
    cleanTime: '3 years clean',
    title: 'The Day I Deleted Every Number in My Phone',
    category: 'Boundaries',
    readTime: '4 min read',
    quote: 'I realized my old friends loved the party, but they did not care if I survived it.',
    body: `For my first three attempts at getting clean, I kept a "secret backup phone" with all my old contacts. I told myself it was for emergencies, or that I owed money to people, or that I didn't want to be rude.

Every single time, on day 15 or day 30, a single text would pull me right back into a 4-day run.

On June 4th, sitting in a parking lot after a meeting, I handed my phone to my sponsor. Together, we deleted 47 phone numbers, changed my SIM card, and closed my old social accounts.

I felt naked and terrified. But what replaced that void was a room full of people in CMA who actually remembered my name, asked how my job interview went, and picked up the phone at 2 AM without asking for anything in return. Radical boundaries aren't a punishment — they are the fence that protects your life.`,
  },
  {
    id: 'story-4',
    author: 'Chloe S.',
    cleanTime: '1 year clean',
    title: 'Overcoming the Shame of a Relapse',
    category: 'Compassion & Restart',
    readTime: '5 min read',
    quote: 'Counting days used to destroy me when I lost a streak. Now I count moments of honesty.',
    body: `I had 9 months clean when I picked up again. The sheer weight of shame was suffocating. I didn't want to walk back into the meeting and admit I had to reset my chip. I felt like a fraud who let everyone down.

For two weeks I stayed out, getting sicker, because I couldn't bear the thought of going back to "Day One."

Finally, my friend from the fellowship texted: "Chloe, you didn't lose those 9 months of healing. Your body still rebuilt liver tissue, your brain still made new neural pathways, and your heart still learned how to love. Come home."

I walked back into CMA that night. Nobody judged me. Three people hugged me and said: "Welcome back, we saved your chair."

If you slipped or feel anxious about your clean count, remember: sobriety is not a high score in a video game. It is a daily relationship with yourself. Today is the only day that counts.`,
  },
];
