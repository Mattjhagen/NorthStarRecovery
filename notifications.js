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

const UPLIFTING = [
  'One steady step is enough for today.',
  'You are not alone in this.',
  'Recovery is possible. You are proof.',
  "Courage doesn't always roar. Sometimes it shows up quietly.",
  'Every moment you choose recovery, you choose yourself.',
  'Your story is still being written.',
  "Healing is not linear — and that's okay.",
  'You deserve a life you want to live.',
  'There is room for you here.',
  'Today is a new beginning.',
  'Small steps still move you forward.',
  "You've made it through every hard day so far.",
  'A little connection can change the shape of a whole day.',
  'Be gentle with yourself today.',
  'What you are doing takes real courage.',
  "The bravest thing you can do today is ask for help.",
  "Rest is not giving up. Rest is part of healing.",
  "You don't have to do the whole journey today. Just this moment.",
];

async function ensureChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('northstar', {
      name: 'Northstar',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

export async function requestNotificationPermissions() {
  const { status } = await Notifications.getPermissionsAsync();
  if (status === 'granted') return true;
  const { status: next } = await Notifications.requestPermissionsAsync();
  return next === 'granted';
}

export async function scheduleDailyUplift(hour = 9, minute = 0) {
  const granted = await requestNotificationPermissions();
  if (!granted) return { ok: false, reason: 'Permission not granted' };
  await ensureChannel();
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of scheduled) {
    if (n.content.data?.type === 'daily-uplift') {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }
  const body = UPLIFTING[Math.floor(Math.random() * UPLIFTING.length)];
  await Notifications.scheduleNotificationAsync({
    content: { title: 'Northstar', body, data: { type: 'daily-uplift' } },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour, minute, repeats: true,
      channelId: 'northstar',
    },
  });
  return { ok: true };
}

export async function cancelDailyUplift() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of scheduled) {
    if (n.content.data?.type === 'daily-uplift') {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }
}

export async function scheduleMeetingReminder(meetingTitle, meetingDate, minutesBefore = 15) {
  const granted = await requestNotificationPermissions();
  if (!granted) return { ok: false, reason: 'Permission not granted' };
  await ensureChannel();
  const triggerDate = new Date(meetingDate.getTime() - minutesBefore * 60 * 1000);
  if (triggerDate <= new Date()) return { ok: false, reason: 'Meeting is too soon' };
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Meeting reminder',
      body: `${meetingTitle} starts in ${minutesBefore} minutes.`,
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
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of scheduled) {
    if (n.content.data?.type === 'meeting-reminder') {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }
}

export async function scheduleDemoInsight() {
  const granted = await requestNotificationPermissions();
  if (!granted) return { ok: false, reason: 'Permission not granted' };
  await ensureChannel();
  const body = UPLIFTING[Math.floor(Math.random() * UPLIFTING.length)];
  await Notifications.scheduleNotificationAsync({
    content: { title: 'Northstar', body },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 8,
      repeats: false,
      channelId: 'northstar',
    },
  });
  return { ok: true };
}
