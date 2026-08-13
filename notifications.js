import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
});

// A credentials-free local-notification example. Physical devices are required for full testing.
export async function scheduleDemoInsight() {
  const permissions = await Notifications.getPermissionsAsync();
  let status = permissions.status;
  if (status !== 'granted') status = (await Notifications.requestPermissionsAsync()).status;
  if (status !== 'granted') return { ok: false, reason: 'Permission not granted' };
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('gentle-insights', {
      name: 'Gentle insights', importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  await Notifications.scheduleNotificationAsync({
    content: { title: 'Northstar', body: 'One steady step is enough for today.' },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 8, repeats: false, channelId: 'gentle-insights' },
  });
  return { ok: true };
}
