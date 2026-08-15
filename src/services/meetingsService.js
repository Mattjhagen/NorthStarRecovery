import { Linking, Alert } from 'react-native';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const WORLDWIDE_CMA_MEETINGS = [
  {
    id: 'cma-1',
    title: 'Morning Serenity & Meditation',
    time: '7:00 AM',
    day: 'Daily',
    format: 'Remote',
    region: 'Online · Worldwide',
    language: 'English',
    url: 'https://www.crystalmeth.org/meetings/?type=online',
    action: 'Join Zoom / Online',
    focus: 'Meditation & 11th Step',
  },
  {
    id: 'cma-2',
    title: 'The Next Right Thing',
    time: '12:00 PM',
    day: 'Daily',
    format: 'Remote',
    region: 'Online · Eastern / Central',
    language: 'English',
    url: 'https://www.crystalmeth.org/meetings/?type=online',
    action: 'Join Zoom / Online',
    focus: 'Discussion & Newcomer Welcome',
  },
  {
    id: 'cma-3',
    title: 'Candlelight Steps & Traditions',
    time: '6:30 PM',
    day: 'Mon/Wed/Fri',
    format: 'Remote',
    region: 'Online · Pacific / Mountain',
    language: 'English',
    url: 'https://www.crystalmeth.org/meetings/?type=online',
    action: 'Join Zoom / Online',
    focus: 'Step Study & Speaker',
  },
  {
    id: 'cma-4',
    title: 'Night Lanterns & Insomnia Support',
    time: '9:00 PM',
    day: 'Daily',
    format: 'Remote',
    region: 'Online · Worldwide',
    language: 'English',
    url: 'https://www.crystalmeth.org/meetings/?type=online',
    action: 'Join Zoom / Online',
    focus: 'Night Owl & Craving Defense',
  },
  {
    id: 'cma-5',
    title: 'Un Nuevo Camino (CMA en Español)',
    time: '7:00 PM',
    day: 'Tue/Thu/Sat',
    format: 'Remote',
    region: 'En Línea · Internacional',
    language: 'Español',
    url: 'https://www.crystalmeth.org/meetings/?type=online',
    action: 'Unirse a la reunión',
    focus: 'Pasos y Tradiciones',
  },
  {
    id: 'cma-6',
    title: 'West Hollywood Sunset CMA',
    time: '8:00 PM',
    day: 'Daily',
    format: 'Hybrid',
    region: 'Los Angeles, CA & Online',
    language: 'English',
    url: 'https://www.crystalmeth.org/meetings/?type=online',
    action: 'Join meeting',
    focus: 'Open Speaker / Discussion',
  },
  {
    id: 'cma-7',
    title: 'Manhattan Midnight Recovery',
    time: '11:59 PM',
    day: 'Fri/Sat',
    format: 'Remote',
    region: 'Online · Late Night Fellowship',
    language: 'English',
    url: 'https://www.crystalmeth.org/meetings/?type=online',
    action: 'Join Zoom / Online',
    focus: 'Late Night Safety Net',
  },
  {
    id: 'cma-8',
    title: 'Women & Nonbinary Fellowship',
    time: '5:30 PM',
    day: 'Sundays',
    format: 'Remote',
    region: 'Online · Safe Space',
    language: 'English',
    url: 'https://www.crystalmeth.org/meetings/?type=online',
    action: 'Join meeting',
    focus: 'Women & Nonbinary Recovery',
  },
];

export async function fetchLiveCMAMeetings() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch('https://www.crystalmeth.org/wp-json/meeting-guide/meetings', {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data
          .filter(m => m.conference_url || m.types?.some(t => ['online', 'TC', 'VM'].includes(t)))
          .slice(0, 80)
          .map((m, i) => ({
            id: m.slug || `mg-${i}`,
            title: m.name,
            time: m.time || 'Check listing',
            day: m.day !== undefined ? DAYS[m.day] : 'Daily',
            format: m.types?.includes('online') ? 'Remote' : m.types?.includes('hybrid') ? 'Hybrid' : 'In-person',
            region: m.region || m.city || 'Online',
            language: m.language || 'English',
            url: m.conference_url || 'https://www.crystalmeth.org/meetings/?type=online',
            action: 'Join meeting',
            focus: m.types?.join(', ') || 'CMA Fellowship',
          }));
      }
    }
  } catch {
    // Graceful offline/network fallback
  }
  return WORLDWIDE_CMA_MEETINGS;
}

export function calculateNextMeeting(meetings) {
  if (!meetings || meetings.length === 0) return null;
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const candidates = meetings
    .filter(m => m.format === 'Remote' || m.format === 'Hybrid')
    .map(m => {
      const match = m.time?.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!match) return null;
      let h = parseInt(match[1], 10);
      const min = parseInt(match[2], 10);
      const period = match[3].toUpperCase();
      if (period === 'PM' && h !== 12) h += 12;
      if (period === 'AM' && h === 12) h = 0;
      const meetingMinutes = h * 60 + min;
      const diff = meetingMinutes - currentMinutes;
      return diff > 0 && diff <= 300 ? { ...m, minsAway: diff } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.minsAway - b.minsAway);

  return candidates[0] || meetings[0];
}

export async function openMeetingUrl(url, meetingTitle = 'Meeting') {
  if (!url) {
    Alert.alert('No link available', 'This meeting listing does not currently include a direct join URL.');
    return;
  }

  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      await Linking.openURL(`https://www.crystalmeth.org/meetings/?type=online`);
    }
  } catch {
    Alert.alert(
      'Unable to open meeting link',
      'Please check your internet connection or open crystalmeth.org in your browser.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open crystalmeth.org', onPress: () => Linking.openURL('https://www.crystalmeth.org/meetings/?type=online') },
      ]
    );
  }
}
