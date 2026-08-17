import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: false }),
});

export async function requestNotificationPermissions() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleDailyUplift(hour = 9, minute = 0) {
  try {
    const granted = await requestNotificationPermissions();
    if (!granted) return { ok: false, reason: 'Notification permission not granted. Enable it in Settings.' };
    await Notifications.cancelScheduledNotificationAsync('daily-uplift').catch(() => {});
    await Notifications.scheduleNotificationAsync({
      identifier: 'daily-uplift',
      content: {
        title: 'Northstar',
        body: UPLIFTS[Math.floor(Math.random() * UPLIFTS.length)],
        sound: true,
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute },
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e.message || 'Could not schedule notification.' };
  }
}

export async function cancelDailyUplift() {
  await Notifications.cancelScheduledNotificationAsync('daily-uplift').catch(() => {});
}

export async function scheduleDailyCheckin(hour = 20, minute = 0) {
  try {
    const granted = await requestNotificationPermissions();
    if (!granted) return { ok: false, reason: 'Notification permission not granted.' };
    await Notifications.cancelScheduledNotificationAsync('daily-checkin').catch(() => {});
    await Notifications.scheduleNotificationAsync({
      identifier: 'daily-checkin',
      content: {
        title: 'How are you doing?',
        body: 'Take a moment to check in with yourself. Your journal is waiting.',
        sound: true,
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute },
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e.message || 'Could not schedule check-in reminder.' };
  }
}

export async function cancelDailyCheckin() {
  await Notifications.cancelScheduledNotificationAsync('daily-checkin').catch(() => {});
}

export async function scheduleMeetingReminder(title, date, minutesBefore = 10) {
  try {
    const granted = await requestNotificationPermissions();
    if (!granted) return { ok: false, reason: 'Notification permission not granted.' };
    const fireDate = new Date(date.getTime() - minutesBefore * 60 * 1000);
    if (fireDate <= new Date()) return { ok: false, reason: 'Meeting is too soon to set a reminder.' };
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Meeting starting soon',
        body: `"${title}" begins in ${minutesBefore} minutes.`,
        sound: true,
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fireDate },
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e.message || 'Could not schedule reminder.' };
  }
}

export async function scheduleRecurringMeetingReminder(id, title, rawDay, rawTime, minutesBefore = 10) {
  try {
    const granted = await requestNotificationPermissions();
    if (!granted) return { ok: false };
    const [h, m] = (rawTime || '12:00:00').split(':').map(Number);
    let hour = h, minute = m - minutesBefore;
    if (minute < 0) { minute += 60; hour -= 1; }
    if (hour < 0) { hour += 24; }

    let trigger = { hour, minute };
    if (rawDay !== undefined && rawDay !== null) {
      trigger.type = Notifications.SchedulableTriggerInputTypes.WEEKLY;
      trigger.weekday = rawDay + 1; // Expo weekday 1=Sunday
    } else {
      trigger.type = Notifications.SchedulableTriggerInputTypes.DAILY;
    }

    await Notifications.scheduleNotificationAsync({
      identifier: `meeting-${id}`,
      content: { title: 'Meeting starting soon', body: `"${title}" begins in ${minutesBefore} minutes.`, sound: true },
      trigger,
    });
    return { ok: true };
  } catch { return { ok: false }; }
}

export async function cancelSpecificMeetingReminder(id) {
  await Notifications.cancelScheduledNotificationAsync(`meeting-${id}`).catch(()=>{});
}

export async function cancelMeetingReminders() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter(n => n.content.title === 'Meeting starting soon')
      .map(n => Notifications.cancelScheduledNotificationAsync(n.identifier))
  );
}

export async function scheduleDemoInsight() {
  try {
    const granted = await requestNotificationPermissions();
    if (!granted) return { ok: false, reason: 'Notification permission not granted.' };
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Northstar',
        body: UPLIFTS[Math.floor(Math.random() * UPLIFTS.length)],
        sound: true,
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 8 },
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e.message || 'Could not schedule demo notification.' };
  }
}

export async function sendLocalNotification(title, body) {
  try {
    const granted = await requestNotificationPermissions();
    if (!granted) return;
    await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 1 },
    });
  } catch {}
}

const UPLIFTS = [
  'You are not alone in this.',
  'Every step forward counts, no matter how small.',
  "Courage doesn't always roar. Sometimes it shows up quietly.",
  'Today is a new beginning.',
  'Your story is still being written.',
  "Healing is not linear — and that's okay.",
  'You deserve a life you want to live.',
  'One day at a time is enough.',
  'There is room for you here.',
  'Recovery is possible. You are proof.',
  'The hardest part is showing up. You already did that.',
  "What you're doing takes real strength.",
  'Small, honest steps change everything.',
  'You are worth the effort of recovery.',
  "It's okay to ask for help today.",
  'Progress, not perfection.',
  'Your feelings are valid. Your recovery is real.',
  "You've made it through hard days before.",
  'Rest is part of recovery too.',
  'One more day. One more reason.',
];

// Fires when the member taps a push notification (e.g. a DM alert), including
// from a cold start. Returns an unsubscribe function.
export function addNotificationTapListener(callback) {
  const sub = Notifications.addNotificationResponseReceivedListener(callback);
  return () => sub.remove();
}

// Remote push: register this device's Expo token so the backend can reach it
// (used for DM notifications). Best-effort; returns the token or null.
export async function getRemotePushToken(projectId) {
  try {
    const granted = await requestNotificationPermissions();
    if (!granted) return null;
    const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
    return data || null;
  } catch {
    return null;
  }
}
