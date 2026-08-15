import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const KEYS = {
  PROFILE: 'northstar_profile_v2',
  JOURNAL: 'northstar_journal_v2',
  SAFETY_NETWORK: 'northstar_safety_network_v2',
  LEARN_PROGRESS: 'northstar_learn_progress_v2',
  COMMUNITY_POSTS: 'northstar_community_posts_v2',
  COMMUNITY_CIRCLES: 'northstar_community_circles_v2',
  FRIENDS: 'northstar_friends_v2',
  FOLLOWING: 'northstar_following_v2',
  DIRECT_MESSAGES: 'northstar_direct_messages_v2',
  NOTIF_PREFS: 'northstar_notif_prefs_v2',
  SAVED_MEETINGS: 'northstar_saved_meetings_v2',
  RSS_CACHE: 'northstar_rss_cache_v2',
};

const DEFAULT_PROFILE = {
  pseudonym: '',
  bio: '',
  photo: '',
  dob: '',
  gender: '',
  groupPreference: 'All groups',
  sobrietyDate: '',
  blurSobrietyDays: false,
  isAnonymous: false,
};

const DEFAULT_SAFETY_NETWORK = {
  sponsor: {
    name: '',
    phone: '',
    notes: '',
  },
  trustedContacts: [],
};

const DEFAULT_LEARN_PROGRESS = {
  xp: 0,
  completedModules: [],
  earnedBadges: ['🌱 First Light'],
  readStories: [],
};

const DEFAULT_NOTIF_PREFS = {
  meetingReminders: true,
  dailyCheckin: true,
  checkinTime: '09:00',
  dailyUplift: true,
  dmNotifications: true,
  circleNotifications: true,
};

export const INITIAL_CIRCLES = [
  {
    id: 'circle-early',
    name: 'Day 1 to 90: Early Steps',
    description: 'A compassionate space for those navigating the raw, tender first ninety days.',
    category: 'Early Recovery',
    membersCount: 1420,
    distanceKm: 2,
    locationName: 'Local & Worldwide',
    icon: 'sparkles-outline',
    isOfficial: true,
  },
  {
    id: 'circle-sleep',
    name: 'Night Owls & Sleep Restoration',
    description: 'Support, nighttime soundscapes, and coping when insomnia strikes.',
    category: 'Wellness & Sleep',
    membersCount: 890,
    distanceKm: 8,
    locationName: 'Regional Hub',
    icon: 'moon-outline',
    isOfficial: false,
  },
  {
    id: 'circle-cravings',
    name: 'Craving Defense & Urge Surfing',
    description: 'Real-time check-ins and practical tools when cravings or triggers flare up.',
    category: 'Intervention',
    membersCount: 2150,
    distanceKm: 1,
    locationName: 'Active Emergency Support',
    icon: 'pulse-outline',
    isOfficial: true,
  },
  {
    id: 'circle-lgbtq',
    name: 'LGBTQ+ CMA Community',
    description: 'Safe, affirming fellowship and queer recovery stories.',
    category: 'Identity & Fellowship',
    membersCount: 1680,
    distanceKm: 14,
    locationName: 'Metro & Global',
    icon: 'heart-outline',
    isOfficial: false,
  },
  {
    id: 'circle-steps',
    name: 'Working the 12 Steps with a Sponsor',
    description: 'Sharing insights, literature reflections, and Step inventory milestones.',
    category: 'Step Work',
    membersCount: 1210,
    distanceKm: 5,
    locationName: 'Worldwide CMA',
    icon: 'list-outline',
    isOfficial: true,
  },
  {
    id: 'circle-creatives',
    name: 'Sober Artists & Creatives',
    description: 'Rediscovering passion, music, writing, and art with a clear mind.',
    category: 'Lifestyle',
    membersCount: 640,
    distanceKm: 25,
    locationName: 'Global Community',
    icon: 'color-palette-outline',
    isOfficial: false,
  },
];

export const storageService = {
  async getProfile() {
    try {
      const data = await AsyncStorage.getItem(KEYS.PROFILE);
      return data ? { ...DEFAULT_PROFILE, ...JSON.parse(data) } : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  },

  async saveProfile(profile) {
    try {
      await AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
      return true;
    } catch {
      return false;
    }
  },

  async getSafetyNetwork() {
    try {
      const data = await AsyncStorage.getItem(KEYS.SAFETY_NETWORK);
      return data ? { ...DEFAULT_SAFETY_NETWORK, ...JSON.parse(data) } : DEFAULT_SAFETY_NETWORK;
    } catch {
      return DEFAULT_SAFETY_NETWORK;
    }
  },

  async saveSafetyNetwork(safetyData) {
    try {
      await AsyncStorage.setItem(KEYS.SAFETY_NETWORK, JSON.stringify(safetyData));
      return true;
    } catch {
      return false;
    }
  },

  async getJournalEntries() {
    try {
      const data = await AsyncStorage.getItem(KEYS.JOURNAL);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async saveJournalEntries(entries) {
    try {
      await AsyncStorage.setItem(KEYS.JOURNAL, JSON.stringify(entries));
      return true;
    } catch {
      return false;
    }
  },

  async addJournalEntry(entry) {
    try {
      const current = await this.getJournalEntries();
      const next = [entry, ...current];
      await this.saveJournalEntries(next);
      return next;
    } catch {
      return [];
    }
  },

  async getLearnProgress() {
    try {
      const data = await AsyncStorage.getItem(KEYS.LEARN_PROGRESS);
      return data ? { ...DEFAULT_LEARN_PROGRESS, ...JSON.parse(data) } : DEFAULT_LEARN_PROGRESS;
    } catch {
      return DEFAULT_LEARN_PROGRESS;
    }
  },

  async saveLearnProgress(progress) {
    try {
      await AsyncStorage.setItem(KEYS.LEARN_PROGRESS, JSON.stringify(progress));
      return true;
    } catch {
      return false;
    }
  },

  async awardXP(amount, moduleId = null) {
    try {
      const current = await this.getLearnProgress();
      const nextXP = current.xp + amount;
      const completed = moduleId && !current.completedModules.includes(moduleId)
        ? [...current.completedModules, moduleId]
        : current.completedModules;
      const updated = { ...current, xp: nextXP, completedModules: completed };
      await this.saveLearnProgress(updated);
      return updated;
    } catch {
      return null;
    }
  },

  async getCircles() {
    try {
      const data = await AsyncStorage.getItem(KEYS.COMMUNITY_CIRCLES);
      return data ? JSON.parse(data) : INITIAL_CIRCLES;
    } catch {
      return INITIAL_CIRCLES;
    }
  },

  async saveCircles(circles) {
    try {
      await AsyncStorage.setItem(KEYS.COMMUNITY_CIRCLES, JSON.stringify(circles));
      return true;
    } catch {
      return false;
    }
  },

  async getCommunityPosts() {
    try {
      const data = await AsyncStorage.getItem(KEYS.COMMUNITY_POSTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async saveCommunityPosts(posts) {
    try {
      await AsyncStorage.setItem(KEYS.COMMUNITY_POSTS, JSON.stringify(posts));
      return true;
    } catch {
      return false;
    }
  },

  async addCommunityPost(post) {
    try {
      const current = await this.getCommunityPosts();
      const next = [post, ...current];
      await this.saveCommunityPosts(next);
      return next;
    } catch {
      return [];
    }
  },

  async addCommentToPost(postId, comment) {
    try {
      const posts = await this.getCommunityPosts();
      const updated = posts.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            comments: [...(p.comments || []), comment],
          };
        }
        return p;
      });
      await this.saveCommunityPosts(updated);
      return updated;
    } catch {
      return [];
    }
  },

  async getFriends() {
    try {
      const data = await AsyncStorage.getItem(KEYS.FRIENDS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async toggleFriend(user) {
    try {
      const friends = await this.getFriends();
      const exists = friends.some(f => f.username === user.username);
      const next = exists
        ? friends.filter(f => f.username !== user.username)
        : [...friends, { ...user, addedAt: new Date().toISOString() }];
      await AsyncStorage.setItem(KEYS.FRIENDS, JSON.stringify(next));
      return { friends: next, isFriend: !exists };
    } catch {
      return { friends: [], isFriend: false };
    }
  },

  async getFollowing() {
    try {
      const data = await AsyncStorage.getItem(KEYS.FOLLOWING);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async toggleFollowing(username) {
    try {
      const following = await this.getFollowing();
      const isFollowing = following.includes(username);
      const next = isFollowing
        ? following.filter(u => u !== username)
        : [...following, username];
      await AsyncStorage.setItem(KEYS.FOLLOWING, JSON.stringify(next));
      return { following: next, isFollowing: !isFollowing };
    } catch {
      return { following: [], isFollowing: false };
    }
  },

  async getDirectMessages() {
    try {
      const data = await AsyncStorage.getItem(KEYS.DIRECT_MESSAGES);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  async sendDirectMessage(recipientUsername, messageText, senderUsername = 'You') {
    try {
      const allDMs = await this.getDirectMessages();
      const thread = allDMs[recipientUsername] || [];
      const newMsg = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        sender: senderUsername,
        recipient: recipientUsername,
        text: messageText.trim(),
        createdAt: new Date().toISOString(),
      };
      const updated = {
        ...allDMs,
        [recipientUsername]: [...thread, newMsg],
      };
      await AsyncStorage.setItem(KEYS.DIRECT_MESSAGES, JSON.stringify(updated));
      return updated;
    } catch {
      return {};
    }
  },

  async getNotificationPreferences() {
    try {
      const data = await AsyncStorage.getItem(KEYS.NOTIF_PREFS);
      return data ? { ...DEFAULT_NOTIF_PREFS, ...JSON.parse(data) } : DEFAULT_NOTIF_PREFS;
    } catch {
      return DEFAULT_NOTIF_PREFS;
    }
  },

  async saveNotificationPreferences(prefs) {
    try {
      await AsyncStorage.setItem(KEYS.NOTIF_PREFS, JSON.stringify(prefs));
      return true;
    } catch {
      return false;
    }
  },

  async getSavedMeetings() {
    try {
      const data = await AsyncStorage.getItem(KEYS.SAVED_MEETINGS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async toggleSaveMeeting(meeting) {
    try {
      const saved = await this.getSavedMeetings();
      const exists = saved.some(m => m.id === meeting.id);
      const next = exists
        ? saved.filter(m => m.id !== meeting.id)
        : [...saved, meeting];
      await AsyncStorage.setItem(KEYS.SAVED_MEETINGS, JSON.stringify(next));
      return { savedMeetings: next, isSaved: !exists };
    } catch {
      return { savedMeetings: [], isSaved: false };
    }
  },
};
