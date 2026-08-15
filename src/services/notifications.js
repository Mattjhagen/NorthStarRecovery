import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const UPLIFTING_QUOTES = [
  'One steady step is enough for today.',
  'You are not alone in this fellowship.',
  'Recovery is possible. You are proof with every breath you take.',
  "Courage doesn't always roar. Sometimes it shows up quietly.",
  'Every moment you choose recovery, you choose yourself.',
  'Your story is still being written.',
  "Healing is not linear — and that's okay.",
  'You deserve a life you want to live.',
  'There is room for you here.',
  'Today is a brand new beginning.',
  'Small steps still move you forward.',
  "You've made it through every hard day so far.",
  'A little connection can change the shape of a whole day.',
  'Be gentle with yourself today.',
  'What you are doing takes real courage.',
  'The bravest thing you can do today is reach out for help.',
  'Rest is not giving up. Rest is part of healing.',
  "You don't have to do the whole journey today. Just this moment.",
  'Your brain is repairing itself every second you stay clean.',
  'Cravings are temporary waves. Ride them out with HALT.',
];

async function ensureChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('northstar', {
      name: 'Northstar Recovery',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#5DE0A6',
    });
  }
}

export async function requestNotificationPermissions() {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status === 'granted') return true;
    const { status: next } = await Notifications.requestPermissionsAsync();
    return next === 'granted';
  } catch {
    return false;
  }
}

export async function scheduleDailyUplift(hour = 9, minute = 0) {
  const granted = await requestNotificationPermissions();
  if (!granted) return { ok: false, reason: 'Notification permission is required.' };
  await ensureChannel();

  await cancelDailyUplift();

  const body = UPLIFTING_QUOTES[Math.floor(Math.random() * UPLIFTING_QUOTES.length)];
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Northstar Morning Reflection',
      body,
      data: { type: 'daily-uplift' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour,
      minute,
      repeats: true,
      channelId: 'northstar',
    },
  });
  return { ok: true };
}

export async function cancelDailyUplift() {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const n of scheduled) {
      if (n.content.data?.type === 'daily-uplift') {
        await Notifications.cancelScheduledNotificationAsync(n.identifier);
      }
    }
  } catch {
    // Graceful
  }
}

export async function scheduleDailyCheckin(hour = 20, minute = 0) {
  const granted = await requestNotificationPermissions();
  if (!granted) return { ok: false, reason: 'Notification permission is required.' };
  await ensureChannel();

  await cancelDailyCheckin();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Evening Check-in 🌙',
      body: 'Take a quiet moment to reflect in your journal and log how you feel today.',
      data: { type: 'daily-checkin' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour,
      minute,
      repeats: true,
      channelId: 'northstar',
    },
  });
  return { ok: true };
}

export async function cancelDailyCheckin() {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const n of scheduled) {
      if (n.content.data?.type === 'daily-checkin') {
        await Notifications.cancelScheduledNotificationAsync(n.identifier);
      }
    }
  } catch {
    // Graceful
  }
}

export async function scheduleMeetingReminder(meetingTitle, meetingDate, minutesBefore = 15) {
  const granted = await requestNotificationPermissions();
  if (!granted) return { ok: false, reason: 'Notification permission is required.' };
  await ensureChannel();

  const triggerDate = new Date(meetingDate.getTime() - minutesBefore * 60 * 1000);
  if (triggerDate <= new Date()) return { ok: false, reason: 'Meeting is starting too soon.' };

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'CMA Meeting Reminder',
      body: `"${meetingTitle}" starts in ${minutesBefore} minutes. Your chair is waiting.`,
      data: { type: 'meeting-reminder', meetingTitle },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
      channelId: 'northstar',
    },
  });
  return { ok: true };
}

export async function cancelMeetingReminders() {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const n of scheduled) {
      if (n.content.data?.type === 'meeting-reminder') {
        await Notifications.cancelScheduledNotificationAsync(n.identifier);
      }
    }
  } catch {
    // Graceful
  }
}

export async function scheduleDemoPush() {
  const granted = await requestNotificationPermissions();
  if (!granted) return { ok: false, reason: 'Notification permission not granted' };
  await ensureChannel();

  const body = UPLIFTING_QUOTES[Math.floor(Math.random() * UPLIFTING_QUOTES.length)];
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Northstar Reflection ✨',
      body,
      data: { type: 'demo-insight' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 5,
      repeats: false,
      channelId: 'northstar',
    },
  });
  return { ok: true };
}
