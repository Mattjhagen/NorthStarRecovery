import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Modal,
  Animated,
  Easing,
  Alert,
} from 'react-native';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { C } from './src/constants/colors';
import { SOUNDSCAPES, getSoundscapeAudioSource } from './src/constants/soundscapes';
import { storageService } from './src/services/storage';
import { fetchLiveCMAMeetings, calculateNextMeeting } from './src/services/meetingsService';

// Components
import Header from './src/components/Header';
import TabBar from './src/components/TabBar';
import SplashScreen from './src/components/SplashScreen';
import TodayTab from './src/components/tabs/TodayTab';
import MeetingsTab from './src/components/tabs/MeetingsTab';
import LearnTab from './src/components/tabs/LearnTab';
import CalmTab from './src/components/tabs/CalmTab';
import CirclesTab from './src/components/tabs/CirclesTab';
import YouTab from './src/components/tabs/YouTab';

// Modals
import ProfileEditorModal from './src/components/ProfileEditorModal';
import SafetyNetworkModal from './src/components/SafetyNetworkModal';
import InviteFriendsModal from './src/components/InviteFriendsModal';
import SupportNorthstarModal from './src/components/SupportNorthstarModal';
import DirectMessagesModal from './src/components/DirectMessagesModal';
import NativeMeetingRoom from './src/components/NativeMeetingRoom';
import ReadingsLibraryModal from './src/components/ReadingsLibraryModal';
import StoryDetailModal from './src/components/StoryDetailModal';
import JournalModal from './src/components/journal/JournalModal';

export default function App() {
  // Splash State
  const [showSplash, setShowSplash] = useState(true);

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState('Today');

  // Core Persistent State
  const [profile, setProfile] = useState({
    pseudonym: '',
    bio: '',
    photo: '',
    dob: '',
    gender: '',
    groupPreference: 'All groups',
    sobrietyDate: '',
    blurSobrietyDays: false,
    isAnonymous: false,
  });
  const [safetyNetwork, setSafetyNetwork] = useState({
    sponsor: { name: '', phone: '', notes: '' },
    trustedContacts: [],
  });
  const [learnProgress, setLearnProgress] = useState({
    xp: 0,
    completedModules: [],
    earnedBadges: ['🌱 First Light'],
    readStories: [],
  });
  const [notifPrefs, setNotifPrefs] = useState({
    meetingReminders: true,
    dailyCheckin: true,
    checkinTime: '09:00',
    dailyUplift: true,
    dmNotifications: true,
    circleNotifications: true,
  });
  const [journalEntries, setJournalEntries] = useState([]);
  const [savedMeetings, setSavedMeetings] = useState([]);
  const [friendsList, setFriendsList] = useState([]);
  const [followingList, setFollowingList] = useState([]);

  // Meetings Directory State
  const [meetings, setMeetings] = useState([]);
  const [loadingMeetings, setLoadingMeetings] = useState(true);

  // Active Soundscape & Audio Player
  const [soundscape, setSoundscape] = useState(SOUNDSCAPES[0]);
  const soundscapeSource = getSoundscapeAudioSource(soundscape);
  const soundPlayer = useAudioPlayer(soundscapeSource);

  // Active Modals
  const [profileEditorOpen, setProfileEditorOpen] = useState(false);
  const [safetyNetworkOpen, setSafetyNetworkOpen] = useState(false);
  const [inviteFriendsOpen, setInviteFriendsOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [journalOpen, setJournalOpen] = useState(false);
  const [readingsLibraryOpen, setReadingsLibraryOpen] = useState(false);
  const [activeStoryModal, setActiveStoryModal] = useState(null);
  const [dmModalRecipient, setDmModalRecipient] = useState(null); // string | null (opens DM modal when set)
  const [activeNativeMeeting, setActiveNativeMeeting] = useState(null); // object | null (opens Native Meeting Room)

  // Toast / Notification banner
  const [toastMsg, setToastMsg] = useState('');
  const toastFade = useRef(new Animated.Value(0)).current;

  const say = text => {
    setToastMsg(text);
    Animated.sequence([
      Animated.timing(toastFade, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.delay(2600),
      Animated.timing(toastFade, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  // Configure Audio Mode & Soundscape Looping
  useEffect(() => {
    setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
    }).catch(() => {});

    soundPlayer.loop = true;
  }, [soundPlayer]);

  // Load Persistent Storage
  useEffect(() => {
    async function initStorage() {
      const [
        loadedProfile,
        loadedSafety,
        loadedLearn,
        loadedPrefs,
        loadedJournal,
        loadedSavedMeetings,
        loadedFriends,
        loadedFollowing,
      ] = await Promise.all([
        storageService.getProfile(),
        storageService.getSafetyNetwork(),
        storageService.getLearnProgress(),
        storageService.getNotificationPreferences(),
        storageService.getJournalEntries(),
        storageService.getSavedMeetings(),
        storageService.getFriends(),
        storageService.getFollowing(),
      ]);

      setProfile(loadedProfile);
      setSafetyNetwork(loadedSafety);
      setLearnProgress(loadedLearn);
      setNotifPrefs(loadedPrefs);
      setJournalEntries(loadedJournal);
      setSavedMeetings(loadedSavedMeetings);
      setFriendsList(loadedFriends);
      setFollowingList(loadedFollowing);

      // Load CMA Meetings
      const liveMeetings = await fetchLiveCMAMeetings();
      setMeetings(liveMeetings);
      setLoadingMeetings(false);

      // Dismiss splash after 2.4s
      setTimeout(() => {
        setShowSplash(false);
      }, 2400);
    }

    initStorage();
  }, []);

  // Compute Sobriety Days (or null if not designated)
  const calculateSobrietyDays = () => {
    if (!profile.sobrietyDate) return null;
    const start = new Date(profile.sobrietyDate);
    if (isNaN(start.getTime())) return null;
    const diff = Date.now() - start.getTime();
    if (diff < 0) return 0;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const sobrietyDays = calculateSobrietyDays();
  const nextMeeting = calculateNextMeeting(meetings);

  // Profile Save
  const handleSaveProfile = async updatedProfile => {
    setProfile(updatedProfile);
    await storageService.saveProfile(updatedProfile);
    setProfileEditorOpen(false);
    say('Profile updated.');
  };

  // Safety Network Save
  const handleSaveSafetyNetwork = async updatedSafety => {
    setSafetyNetwork(updatedSafety);
    await storageService.saveSafetyNetwork(updatedSafety);
    say('Safety network saved.');
  };

  // Journal Add
  const handleAddJournalEntry = async entry => {
    const nextEntries = await storageService.addJournalEntry(entry);
    setJournalEntries(nextEntries);
    await handleAwardXP(25);
  };

  // Gamification XP Award
  const handleAwardXP = async (amount, moduleId = null) => {
    const updated = await storageService.awardXP(amount, moduleId);
    if (updated) {
      setLearnProgress(updated);
    }
  };

  // Saved Meetings Toggle
  const handleToggleSaveMeeting = async m => {
    const res = await storageService.toggleSaveMeeting(m);
    setSavedMeetings(res.savedMeetings);
    say(res.isSaved ? `Saved "${m.title}"` : `Removed from saved`);
  };

  // Friends Toggle
  const handleAddFriend = async friendUser => {
    const res = await storageService.toggleFriend(friendUser);
    setFriendsList(res.friends);
    say(res.isFriend ? `Added ${friendUser.pseudonym || friendUser.username} as friend` : `Removed friend`);
  };

  // Follow Toggle
  const handleToggleFollow = async username => {
    const res = await storageService.toggleFollowing(username);
    setFollowingList(res.following);
    say(res.isFollowing ? `Following ${username}` : `Unfollowed ${username}`);
  };

  // Notification Preferences Update
  const handleUpdateNotifPrefs = async prefs => {
    setNotifPrefs(prefs);
    await storageService.saveNotificationPreferences(prefs);
  };

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.ink} />

      {/* Top Brand Header */}
      <Header
        onOpenNotifications={() => setActiveTab('You')}
        onOpenSponsor={() => setSafetyNetworkOpen(true)}
        sponsorName={safetyNetwork.sponsor?.name}
      />

      {/* Main Tab Content */}
      <View style={styles.content}>
        {activeTab === 'Today' && (
          <TodayTab
            profile={profile}
            sobrietyDays={sobrietyDays}
            nextMeeting={nextMeeting}
            onNavigate={tabName => setActiveTab(tabName)}
            onOpenJournal={() => setJournalOpen(true)}
            onOpenSponsor={() => setSafetyNetworkOpen(true)}
            onOpenNativeMeeting={m => setActiveNativeMeeting(m || { title: 'NorthStar CMA Room' })}
          />
        )}

        {activeTab === 'Meetings' && (
          <MeetingsTab
            meetings={meetings}
            loading={loadingMeetings}
            profile={profile}
            savedMeetings={savedMeetings}
            onToggleSaveMeeting={handleToggleSaveMeeting}
            onOpenNativeMeeting={m => setActiveNativeMeeting(m || { title: 'NorthStar CMA Room' })}
          />
        )}

        {activeTab === 'Learn' && (
          <LearnTab
            learnProgress={learnProgress}
            onAwardXP={handleAwardXP}
            onOpenReadings={() => setReadingsLibraryOpen(true)}
            onOpenStory={story => setActiveStoryModal(story)}
            say={say}
          />
        )}

        {activeTab === 'Calm' && (
          <CalmTab
            player={soundPlayer}
            soundscape={soundscape}
            soundscapes={SOUNDSCAPES}
            onSelectSoundscape={s => setSoundscape(s)}
          />
        )}

        {activeTab === 'Circles' && (
          <CirclesTab
            currentUser={profile.pseudonym || 'You'}
            onOpenDM={recipient => setDmModalRecipient(recipient)}
            onAddFriend={handleAddFriend}
            onToggleFollow={handleToggleFollow}
            friendsList={friendsList}
            followingList={followingList}
            say={say}
          />
        )}

        {activeTab === 'You' && (
          <YouTab
            profile={profile}
            sobrietyDays={sobrietyDays}
            notifPrefs={notifPrefs}
            onUpdateNotifPrefs={handleUpdateNotifPrefs}
            onEditProfile={() => setProfileEditorOpen(true)}
            onOpenSafetyNetwork={() => setSafetyNetworkOpen(true)}
            onOpenInviteFriends={() => setInviteFriendsOpen(true)}
            onOpenSupport={() => setSupportOpen(true)}
            onOpenJournal={() => setJournalOpen(true)}
            onSignOut={() => Alert.alert('Signed out', 'You are safely in offline local mode.')}
            journalCount={journalEntries.length}
            say={say}
          />
        )}
      </View>

      {/* Bottom Navigation Tab Bar */}
      <TabBar activeTab={activeTab} onSelectTab={tab => setActiveTab(tab)} />

      {/* Toast Notification Banner */}
      <Animated.View pointerEvents="none" style={[styles.toast, { opacity: toastFade }]}>
        <Text style={styles.toastText}>{toastMsg}</Text>
      </Animated.View>

      {/* Modals */}
      {/* 1. Profile Editor */}
      <Modal visible={profileEditorOpen} animationType="slide">
        <ProfileEditorModal
          profile={profile}
          onSave={handleSaveProfile}
          onCancel={() => setProfileEditorOpen(false)}
        />
      </Modal>

      {/* 2. Safety Network & Sponsor 1-Tap */}
      <Modal visible={safetyNetworkOpen} animationType="slide">
        <SafetyNetworkModal
          safetyNetwork={safetyNetwork}
          onSave={handleSaveSafetyNetwork}
          onClose={() => setSafetyNetworkOpen(false)}
        />
      </Modal>

      {/* 3. Invite Friends */}
      <Modal visible={inviteFriendsOpen} animationType="slide">
        <InviteFriendsModal
          username={profile.pseudonym}
          onClose={() => setInviteFriendsOpen(false)}
        />
      </Modal>

      {/* 4. Support Northstar (Apple Wallet, Venmo, Stripe) */}
      <Modal visible={supportOpen} animationType="slide">
        <SupportNorthstarModal
          onClose={() => setSupportOpen(false)}
          say={say}
        />
      </Modal>

      {/* 5. Direct Messages (DMs) */}
      <Modal visible={dmModalRecipient !== null} animationType="slide">
        {dmModalRecipient !== null && (
          <DirectMessagesModal
            initialRecipient={dmModalRecipient === true ? null : dmModalRecipient}
            currentUser={profile.pseudonym || 'You'}
            onClose={() => setDmModalRecipient(null)}
            onAddFriend={handleAddFriend}
            isFriend={friendsList.some(f => f.username === dmModalRecipient)}
          />
        )}
      </Modal>

      {/* 6. Native In-App Meeting Room */}
      <Modal visible={activeNativeMeeting !== null} animationType="slide">
        {activeNativeMeeting !== null && (
          <NativeMeetingRoom
            meeting={activeNativeMeeting}
            currentUser={profile.pseudonym || 'You'}
            onLeave={() => setActiveNativeMeeting(null)}
            onOpenSideDM={recipient => setDmModalRecipient(recipient)}
            onAddFriend={handleAddFriend}
            friendsList={friendsList}
          />
        )}
      </Modal>

      {/* 7. CMA Readings & Jessica Audio Literature */}
      <Modal visible={readingsLibraryOpen} animationType="slide">
        <ReadingsLibraryModal
          onClose={() => setReadingsLibraryOpen(false)}
          onLaunchNativeMeeting={reading => {
            setReadingsLibraryOpen(false);
            setActiveNativeMeeting({ title: `Literature Study: ${reading.title}` });
          }}
        />
      </Modal>

      {/* 8. Story & RSS Article Reader */}
      <Modal visible={activeStoryModal !== null} animationType="slide">
        <StoryDetailModal
          story={activeStoryModal}
          onClose={() => setActiveStoryModal(null)}
        />
      </Modal>

      {/* 9. Encrypted Journal */}
      <Modal visible={journalOpen} animationType="slide">
        <JournalModal
          entries={journalEntries}
          onAddEntry={handleAddJournalEntry}
          onClose={() => setJournalOpen(false)}
          say={say}
        />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.ink,
  },
  content: {
    flex: 1,
  },
  toast: {
    position: 'absolute',
    bottom: 84,
    left: 20,
    right: 20,
    backgroundColor: C.raised,
    borderWidth: 1,
    borderColor: C.mint,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  toastText: {
    color: C.warm,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
});