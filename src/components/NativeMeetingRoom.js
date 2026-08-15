import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { C } from '../constants/colors';
import { READINGS } from '../constants/readingsData';

export default function NativeMeetingRoom({
  meeting,
  onLeave,
  currentUser = 'You',
  onOpenSideDM,
  onAddFriend,
  friendsList = [],
}) {
  const [micMuted, setMicMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [activeTab, setActiveTab] = useState('stage'); // 'stage' | 'chat' | 'readings' | 'people'
  const [chatMessages, setChatMessages] = useState([
    { id: 'm1', sender: 'Chair (Marcus)', text: 'Welcome everyone to our NorthStar CMA Room. We will begin with the Serenity Prayer in 2 minutes.', time: 'Just now' },
    { id: 'm2', sender: 'Secretary (Elena)', text: 'Feel free to introduce yourself in chat or drop phone numbers if you need fellowshipping.', time: 'Just now' },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [selectedReading, setSelectedReading] = useState(READINGS[0]);
  const [isBroadcastingReading, setIsBroadcastingReading] = useState(false);

  // Broadcaster audio player
  const readingPlayer = useAudioPlayer(selectedReading.audio);
  const readingStatus = useAudioPlayerStatus(readingPlayer);

  useEffect(() => {
    return () => {
      readingPlayer.pause();
    };
  }, [readingPlayer]);

  const toggleBroadcasting = () => {
    if (readingStatus.playing) {
      readingPlayer.pause();
      setIsBroadcastingReading(false);
    } else {
      readingPlayer.play();
      setIsBroadcastingReading(true);
    }
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const msg = {
      id: `chat-${Date.now()}`,
      sender: currentUser || 'You',
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages(prev => [...prev, msg]);
    setChatInput('');
  };

  const participants = [
    { id: 'p1', name: 'Chair (Marcus)', initial: 'M', hasVideo: true, isSpeaking: true, hand: false },
    { id: 'p2', name: 'Secretary (Elena)', initial: 'E', hasVideo: true, isSpeaking: false, hand: false },
    { id: 'p3', name: currentUser || 'You', initial: (currentUser || 'Y').charAt(0).toUpperCase(), hasVideo: !videoOff, isSpeaking: false, hand: handRaised },
    { id: 'p4', name: 'David M.', initial: 'D', hasVideo: false, isSpeaking: false, hand: false },
    { id: 'p5', name: 'Chloe S.', initial: 'C', hasVideo: true, isSpeaking: false, hand: true },
    { id: 'p6', name: 'Sage (Newcomer)', initial: 'S', hasVideo: false, isSpeaking: false, hand: false },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header Bar */}
      <View style={styles.header}>
        <View style={styles.roomInfo}>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE CMA ROOM</Text>
          </View>
          <Text style={styles.roomTitle} numberOfLines={1}>
            {meeting?.title || 'NorthStar Fellowship Room'}
          </Text>
        </View>

        <Pressable onPress={onLeave} style={styles.leaveBtn}>
          <Ionicons name="log-out-outline" size={16} color={C.coral} />
          <Text style={styles.leaveBtnText}>Leave</Text>
        </Pressable>
      </View>

      {/* Main Room Viewport */}
      {activeTab === 'stage' && (
        <View style={styles.stageContainer}>
          {/* Main Speaker Tile */}
          <View style={styles.speakerTile}>
            {isBroadcastingReading ? (
              <View style={styles.readingBroadcastOverlay}>
                <View style={styles.broadcastBadge}>
                  <Ionicons name="radio" size={16} color={C.mint} />
                  <Text style={styles.broadcastBadgeText}>BROADCASTING LITERATURE TO ROOM</Text>
                </View>
                <Text style={styles.broadcastTitle}>{selectedReading.title}</Text>
                <Text style={styles.broadcastSub}>Narrated by Jessica</Text>
                <ScrollView style={styles.broadcastScroll}>
                  <Text style={styles.broadcastText}>{selectedReading.text}</Text>
                </ScrollView>
              </View>
            ) : (
              <View style={styles.speakerVideoBox}>
                <View style={styles.speakerAvatar}>
                  <Text style={styles.speakerAvatarText}>M</Text>
                </View>
                <View style={styles.speakerLabelPill}>
                  <Ionicons name="mic" size={14} color={C.mint} />
                  <Text style={styles.speakerLabelText}>Chair (Marcus) · Speaking</Text>
                </View>
              </View>
            )}
          </View>

          {/* Participant Mini Grid */}
          <View style={styles.miniGrid}>
            {participants.slice(1, 5).map(p => {
              const isMe = p.name === (currentUser || 'You');
              return (
                <Pressable
                  key={p.id}
                  onPress={() => {
                    if (!isMe && onOpenSideDM) onOpenSideDM(p.name);
                  }}
                  style={[styles.gridTile, isMe && styles.gridTileMe]}
                >
                  <View style={styles.gridTileAvatar}>
                    <Text style={styles.gridTileAvatarText}>{p.initial}</Text>
                  </View>
                  <View style={styles.gridTileNameRow}>
                    <Text style={styles.gridTileName} numberOfLines={1}>{p.name}</Text>
                    {p.hand && <Text style={styles.gridTileHand}>✋</Text>}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {/* In-Room Public Chat */}
      {activeTab === 'chat' && (
        <View style={styles.inRoomSection}>
          <ScrollView contentContainerStyle={styles.chatScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.chatHero}>
              <Ionicons name="chatbubbles-outline" size={24} color={C.mint} />
              <Text style={styles.chatHeroTitle}>Meeting Room Public Chat</Text>
              <Text style={styles.chatHeroSub}>Messages are visible to all members in this room.</Text>
            </View>

            {chatMessages.map(m => (
              <View key={m.id} style={styles.chatMsg}>
                <View style={styles.chatMsgHeader}>
                  <Text style={styles.chatSender}>{m.sender}</Text>
                  <Text style={styles.chatTime}>{m.time}</Text>
                </View>
                <Text style={styles.chatText}>{m.text}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.chatBar}>
            <TextInput
              value={chatInput}
              onChangeText={setChatInput}
              placeholder="Share with the room..."
              placeholderTextColor={C.muted}
              style={styles.chatBarInput}
            />
            <Pressable onPress={handleSendChat} style={styles.chatSendBtn}>
              <Ionicons name="send" size={16} color={C.ink} />
            </Pressable>
          </View>
        </View>
      )}

      {/* In-Room Literature & Readings Broadcaster */}
      {activeTab === 'readings' && (
        <View style={styles.inRoomSection}>
          <ScrollView contentContainerStyle={styles.readingsScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.chatHero}>
              <Ionicons name="book-outline" size={24} color={C.gold} />
              <Text style={styles.chatHeroTitle}>Host Literature Broadcaster</Text>
              <Text style={styles.chatHeroSub}>
                Play official CMA readings with Jessica's narration for all attendees in this room.
              </Text>
            </View>

            <View style={styles.broadcastControlCard}>
              <Text style={styles.nowPlayingTitle}>SELECTED READING</Text>
              <Text style={styles.selectedReadingName}>{selectedReading.title}</Text>
              <Text style={styles.selectedReadingMuted}>{selectedReading.durationEst} · Narration by Jessica</Text>

              <View style={styles.broadcastActionRow}>
                <Pressable onPress={toggleBroadcasting} style={[styles.broadcastPlayBtn, readingStatus.playing && styles.broadcastPauseBtn]}>
                  <Ionicons name={readingStatus.playing ? 'pause' : 'play'} size={20} color={C.ink} />
                  <Text style={styles.broadcastPlayBtnText}>
                    {readingStatus.playing ? 'Pause for Room' : 'Broadcast to Room'}
                  </Text>
                </Pressable>
                <Pressable onPress={() => Linking.openURL(selectedReading.pdfUrl)} style={styles.openPdfBtn}>
                  <Ionicons name="document-text-outline" size={18} color={C.warm} />
                  <Text style={styles.openPdfBtnText}>Open PDF</Text>
                </Pressable>
              </View>
            </View>

            <Text style={styles.readingsListHeader}>CHOOSE A READING TO PLAY</Text>
            {READINGS.map(r => {
              const active = selectedReading.id === r.id;
              return (
                <Pressable
                  key={r.id}
                  onPress={() => setSelectedReading(r)}
                  style={[styles.readingItem, active && styles.readingItemActive]}
                >
                  <Ionicons name={r.icon} size={20} color={active ? C.ink : C.mint} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.readingItemTitle, active && { color: C.ink }]}>{r.title}</Text>
                    <Text style={[styles.readingItemMuted, active && { color: '#163529' }]}>{r.durationEst}</Text>
                  </View>
                  {active && <Ionicons name="checkmark-circle" size={20} color={C.ink} />}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Participants & Side Chats */}
      {activeTab === 'people' && (
        <View style={styles.inRoomSection}>
          <ScrollView contentContainerStyle={styles.peopleScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.chatHero}>
              <Ionicons name="people-outline" size={24} color={C.blue} />
              <Text style={styles.chatHeroTitle}>Meeting Attendees ({participants.length})</Text>
              <Text style={styles.chatHeroSub}>
                Tap any fellow to branch off into a private side chat or add as friend.
              </Text>
            </View>

            {participants.map(p => {
              const isMe = p.name === (currentUser || 'You');
              const isAlreadyFriend = friendsList?.some(f => f.username === p.name);

              return (
                <View key={p.id} style={styles.personCard}>
                  <View style={styles.personAvatar}>
                    <Text style={styles.personAvatarText}>{p.initial}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.personName}>{p.name}</Text>
                    <Text style={styles.personStatus}>
                      {p.isSpeaking ? 'Speaking' : isMe ? 'You' : 'Listening'} {p.hand ? '· ✋ Hand Raised' : ''}
                    </Text>
                  </View>

                  {!isMe && (
                    <View style={styles.personActions}>
                      <Pressable
                        onPress={() => onOpenSideDM && onOpenSideDM(p.name)}
                        style={styles.sideDmBtn}
                      >
                        <Ionicons name="chatbubble-outline" size={16} color={C.mint} />
                        <Text style={styles.sideDmBtnText}>Side Chat</Text>
                      </Pressable>

                      {onAddFriend && (
                        <Pressable
                          onPress={() => onAddFriend({ username: p.name, pseudonym: p.name })}
                          style={[styles.sideFriendBtn, isAlreadyFriend && styles.sideFriendBtnActive]}
                        >
                          <Ionicons name={isAlreadyFriend ? 'checkmark' : 'person-add'} size={15} color={isAlreadyFriend ? C.ink : C.blue} />
                        </Pressable>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Bottom Room Toolbar */}
      <View style={styles.toolbar}>
        <Pressable
          onPress={() => setMicMuted(!micMuted)}
          style={[styles.toolBtn, micMuted && styles.toolBtnActive]}
        >
          <Ionicons name={micMuted ? 'mic-off' : 'mic'} size={20} color={micMuted ? C.coral : C.warm} />
          <Text style={[styles.toolBtnLabel, micMuted && { color: C.coral }]}>
            {micMuted ? 'Muted' : 'Mute'}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setVideoOff(!videoOff)}
          style={[styles.toolBtn, videoOff && styles.toolBtnActive]}
        >
          <Ionicons name={videoOff ? 'videocam-off' : 'videocam'} size={20} color={videoOff ? C.coral : C.warm} />
          <Text style={[styles.toolBtnLabel, videoOff && { color: C.coral }]}>
            {videoOff ? 'Camera Off' : 'Camera'}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setHandRaised(!handRaised)}
          style={[styles.toolBtn, handRaised && styles.toolBtnHighlight]}
        >
          <Ionicons name="hand-left" size={20} color={handRaised ? C.ink : C.gold} />
          <Text style={[styles.toolBtnLabel, handRaised && { color: C.ink }]}>
            {handRaised ? 'Hand Up' : 'Raise Hand'}
          </Text>
        </Pressable>

        {/* Tab switches */}
        <Pressable
          onPress={() => setActiveTab(activeTab === 'stage' ? 'chat' : 'stage')}
          style={[styles.toolBtn, activeTab === 'chat' && styles.toolBtnSelected]}
        >
          <Ionicons name="chatbubbles" size={20} color={activeTab === 'chat' ? C.mint : C.muted} />
          <Text style={[styles.toolBtnLabel, activeTab === 'chat' && { color: C.mint }]}>Chat</Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab(activeTab === 'readings' ? 'stage' : 'readings')}
          style={[styles.toolBtn, activeTab === 'readings' && styles.toolBtnSelected]}
        >
          <Ionicons name="book" size={20} color={activeTab === 'readings' ? C.gold : C.muted} />
          <Text style={[styles.toolBtnLabel, activeTab === 'readings' && { color: C.gold }]}>Literature</Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab(activeTab === 'people' ? 'stage' : 'people')}
          style={[styles.toolBtn, activeTab === 'people' && styles.toolBtnSelected]}
        >
          <Ionicons name="people" size={20} color={activeTab === 'people' ? C.blue : C.muted} />
          <Text style={[styles.toolBtnLabel, activeTab === 'people' && { color: C.blue }]}>People</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#090f18',
  },
  header: {
    height: 64,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#111b29',
    borderBottomWidth: 1,
    borderColor: '#1d2e46',
  },
  roomInfo: {
    flex: 1,
    paddingRight: 12,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: C.mint,
  },
  liveText: {
    color: C.mint,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  roomTitle: {
    color: C.warm,
    fontSize: 15,
    fontWeight: '900',
    marginTop: 1,
  },
  leaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: C.coralMuted,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  leaveBtnText: {
    color: C.coral,
    fontSize: 12,
    fontWeight: '800',
  },
  stageContainer: {
    flex: 1,
    padding: 14,
    gap: 12,
  },
  speakerTile: {
    flex: 1,
    backgroundColor: '#152132',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#263a56',
    overflow: 'hidden',
  },
  speakerVideoBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111c2c',
  },
  speakerAvatar: {
    width: 84,
    height: 84,
    borderRadius: 28,
    backgroundColor: C.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speakerAvatarText: {
    color: C.ink,
    fontSize: 36,
    fontWeight: '900',
  },
  speakerLabelPill: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(10, 16, 26, 0.8)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(93, 224, 166, 0.4)',
  },
  speakerLabelText: {
    color: C.warm,
    fontSize: 12,
    fontWeight: '700',
  },
  readingBroadcastOverlay: {
    flex: 1,
    backgroundColor: '#122338',
    padding: 18,
    gap: 8,
  },
  broadcastBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  broadcastBadgeText: {
    color: C.mint,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  broadcastTitle: {
    color: C.warm,
    fontSize: 20,
    fontWeight: '900',
  },
  broadcastSub: {
    color: C.gold,
    fontSize: 12,
    fontWeight: '700',
  },
  broadcastScroll: {
    flex: 1,
    marginTop: 6,
  },
  broadcastText: {
    color: C.warm,
    fontSize: 14,
    lineHeight: 22,
  },
  miniGrid: {
    height: 100,
    flexDirection: 'row',
    gap: 8,
  },
  gridTile: {
    flex: 1,
    backgroundColor: '#152132',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#263a56',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    gap: 6,
  },
  gridTileMe: {
    borderColor: C.mint,
  },
  gridTileAvatar: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#273a56',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridTileAvatarText: {
    color: C.warm,
    fontSize: 16,
    fontWeight: '800',
  },
  gridTileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  gridTileName: {
    color: C.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  gridTileHand: {
    fontSize: 10,
  },
  inRoomSection: {
    flex: 1,
    backgroundColor: '#0c1522',
  },
  chatScroll: {
    padding: 16,
    gap: 12,
  },
  chatHero: {
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#1d2e46',
    marginBottom: 6,
    gap: 4,
  },
  chatHeroTitle: {
    color: C.warm,
    fontSize: 16,
    fontWeight: '900',
  },
  chatHeroSub: {
    color: C.muted,
    fontSize: 11,
    textAlign: 'center',
  },
  chatMsg: {
    backgroundColor: '#152132',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#263a56',
    gap: 4,
  },
  chatMsgHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chatSender: {
    color: C.mint,
    fontSize: 12,
    fontWeight: '800',
  },
  chatTime: {
    color: C.muted,
    fontSize: 10,
  },
  chatText: {
    color: C.warm,
    fontSize: 13,
    lineHeight: 19,
  },
  chatBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#111b29',
    borderTopWidth: 1,
    borderColor: '#1d2e46',
    gap: 8,
  },
  chatBarInput: {
    flex: 1,
    backgroundColor: '#1a273a',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: C.warm,
    fontSize: 13,
  },
  chatSendBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: C.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readingsScroll: {
    padding: 16,
    gap: 12,
  },
  broadcastControlCard: {
    backgroundColor: '#16253a',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.mint,
    gap: 8,
  },
  nowPlayingTitle: {
    color: C.mint,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  selectedReadingName: {
    color: C.warm,
    fontSize: 18,
    fontWeight: '900',
  },
  selectedReadingMuted: {
    color: C.muted,
    fontSize: 12,
  },
  broadcastActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  broadcastPlayBtn: {
    flex: 2,
    backgroundColor: C.mint,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  broadcastPauseBtn: {
    backgroundColor: C.gold,
  },
  broadcastPlayBtnText: {
    color: C.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  openPdfBtn: {
    flex: 1,
    backgroundColor: '#273850',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  openPdfBtnText: {
    color: C.warm,
    fontSize: 12,
    fontWeight: '800',
  },
  readingsListHeader: {
    color: C.muted,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 8,
  },
  readingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#152132',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#263a56',
  },
  readingItemActive: {
    backgroundColor: C.mint,
    borderColor: C.mint,
  },
  readingItemTitle: {
    color: C.warm,
    fontSize: 14,
    fontWeight: '800',
  },
  readingItemMuted: {
    color: C.muted,
    fontSize: 11,
  },
  peopleScroll: {
    padding: 16,
    gap: 10,
  },
  personCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#152132',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#263a56',
  },
  personAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personAvatarText: {
    color: C.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  personName: {
    color: C.warm,
    fontSize: 14,
    fontWeight: '800',
  },
  personStatus: {
    color: C.muted,
    fontSize: 11,
    marginTop: 2,
  },
  personActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sideDmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#19293e',
    borderWidth: 1,
    borderColor: C.mintDark,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  sideDmBtnText: {
    color: C.mint,
    fontSize: 11,
    fontWeight: '800',
  },
  sideFriendBtn: {
    padding: 6,
    backgroundColor: '#19293e',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#304c6e',
  },
  sideFriendBtnActive: {
    backgroundColor: C.mint,
    borderColor: C.mint,
  },
  toolbar: {
    height: 68,
    backgroundColor: '#0c1522',
    borderTopWidth: 1,
    borderColor: '#1d2e46',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 4,
  },
  toolBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    padding: 6,
  },
  toolBtnActive: {
    backgroundColor: 'rgba(248, 113, 113, 0.12)',
    borderRadius: 8,
  },
  toolBtnHighlight: {
    backgroundColor: C.gold,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  toolBtnSelected: {
    borderBottomWidth: 2,
    borderBottomColor: C.mint,
  },
  toolBtnLabel: {
    color: C.muted,
    fontSize: 9,
    fontWeight: '700',
  },
});
