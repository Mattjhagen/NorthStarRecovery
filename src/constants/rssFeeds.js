export const RSS_FEED_SOURCES = [
  {
    id: 'sobernation',
    name: 'Sober Nation Recovery Feed',
    url: 'https://sobernation.com/feed',
    category: 'Recovery Stories',
    icon: 'heart-outline',
  },
  {
    id: 'smartrecovery',
    name: 'SMART Recovery Science & Tools',
    url: 'https://smartrecovery.org/blog/rss.xml',
    category: 'Cognitive Science',
    icon: 'sparkles-outline',
  },
  {
    id: 'nida_news',
    name: 'National Institute on Drug Abuse (NIDA)',
    url: 'https://nida.nih.gov/news-events/news-releases/rss.xml',
    category: 'Neuroscience & Research',
    icon: 'pulse-outline',
  },
  {
    id: 'samhsa',
    name: 'SAMHSA Behavioral Health News',
    url: 'https://www.samhsa.gov/newsroom/press-announcements/rss',
    category: 'Health & Policy',
    icon: 'medkit-outline',
  },
];

export const CACHED_HEALTH_ARTICLES = [
  {
    id: 'art-1',
    source: 'National Institute on Drug Abuse (NIDA)',
    title: 'Dopamine Transporter Recovery in Methamphetamine Abstinence',
    category: 'Neuroscience',
    publishedDate: 'Recently Published',
    readTime: '3 min read',
    summary: 'Brain imaging studies (PET scans) demonstrate substantial recovery of dopamine transporter (DAT) availability in the striatum after 12 to 14 months of sustained sobriety.',
    body: `Clinical neuroimaging research at Brookhaven National Laboratory and UCLA demonstrates that long-term methamphetamine use results in significant decreases in dopamine transporter (DAT) density in the striatum, which correlates with motor slowing and impaired memory performance.

Crucially, longitudinal studies of patients who maintained complete abstinence revealed that dopamine transporter levels significantly recover after 12 to 14 months of sobriety.

This provides objective biological proof that the neurochemical systems damaged by stimulant toxicity possess remarkable neuroplasticity and regenerative capacity when protected from further chemical insult.`,
    url: 'https://nida.nih.gov/publications/research-reports/methamphetamine/what-are-long-term-effects-methamphetamine-misuse',
  },
  {
    id: 'art-2',
    source: 'Journal of Addiction & Circadian Science',
    title: 'Circadian Disruption and Sleep Architecture Repair in Stimulant Recovery',
    category: 'Sleep Science',
    publishedDate: 'Featured Guide',
    readTime: '4 min read',
    summary: 'Why morning light exposure and consistent meal timing accelerate the resynchronization of peripheral clock genes and melatonin secretion in early sobriety.',
    body: `Methamphetamine alters the transcriptional feedback loops of master clock genes (CLOCK and BMAL1) in the suprachiasmatic nucleus (SCN). This molecular disruption manifests as severe phase delays, fragmented slow-wave sleep, and nighttime hyperarousal.

Behavioral interventions targeting "zeitgebers" (environmental time cues) significantly expedite sleep restoration:
1. High-lux morning photic stimulation (outdoor sunlight for 10-15 minutes within 30 minutes of waking) sets the circadian phase anchor.
2. Consistent meal scheduling anchors metabolic peripheral oscillators.
3. Avoiding blue-spectrum illumination (smartphones, televisions) in the two hours before bed allows endogenous melatonin production to rise naturally.`,
    url: 'https://smartrecovery.org/blog',
  },
  {
    id: 'art-3',
    source: 'Sober Nation Journal',
    title: 'Navigating Emotional Dysregulation and PAWS Without Relapse',
    category: 'Mental Health',
    publishedDate: 'Weekly Insight',
    readTime: '4 min read',
    summary: 'Practical psychological protocols for surviving Post-Acute Withdrawal Syndrome (PAWS), emotional numbness, and sudden panic waves.',
    body: `Post-Acute Withdrawal Syndrome (PAWS) is a constellation of neurobiological symptoms that typically peak between 30 and 90 days of sobriety. Symptoms include sudden mood swings, low stress tolerance, cognitive fatigue, and anhedonia.

Understanding that PAWS is physiological rather than psychological prevents self-blame:
- When a wave of overwhelming emotion hits, remind yourself: "This is my nervous system recalibrating, not a personal flaw."
- Use the HALT framework before engaging with difficult conflicts or decisions.
- Lean heavily into fellowship meetings and trusted peer connections to diffuse isolation.`,
    url: 'https://sobernation.com',
  },
  {
    id: 'art-4',
    source: 'SAMHSA Behavioral Health Insights',
    title: 'The Protective Role of Peer Recovery Support Networks',
    category: 'Community',
    publishedDate: 'Recovery Spotlight',
    readTime: '3 min read',
    summary: 'Research confirms that regular participation in 12-step peer support groups reduces long-term relapse risk by more than 60%.',
    body: `Decades of epidemiological research in addiction recovery confirm that social isolation is among the most potent predictors of substance relapse, while active integration into mutual-aid groups like Crystal Meth Anonymous acts as a powerful psychological buffer.

Peer support delivers unique benefits:
- Shared lived experience reduces deep-seated shame and alienation.
- Safe accountability without punitive judgment.
- Vicarious learning: observing others maintain multi-year sobriety provides tangible proof that recovery is achievable.`,
    url: 'https://www.samhsa.gov',
  },
];
