import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Pressable,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../constants/colors';
import { storageService } from '../services/storage';

export default function DirectMessagesModal({
  initialRecipient = null,
  onClose,
  currentUser = 'You',
  onAddFriend,
  isFriend = false,
}) {
  const [conversations, setConversations] = useState({});
  const [activeRecipient, setActiveRecipient] = useState(initialRecipient);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    loadDMs();
  }, []);

  const loadDMs = async () => {
    const data = await storageService.getDirectMessages();
    setConversations(data);
  };

  const handleSend = async () => {
    if (!inputText.trim() || !activeRecipient) return;
    const updated = await storageService.sendDirectMessage(activeRecipient, inputText.trim(), currentUser);
    setConversations(updated);
    setInputText('');
  };

  const activeMessages = activeRecipient ? (conversations[activeRecipient] || []) : [];
  const recipients = Object.keys(conversations);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        {activeRecipient ? (
          <Pressable onPress={() => setActiveRecipient(null)} style={styles.headerBackBtn}>
            <Ionicons name="arrow-back" size={22} color={C.warm} />
          </Pressable>
        ) : (
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={C.warm} />
          </Pressable>
        )}

        <Text style={styles.headerTitle}>
          {activeRecipient ? activeRecipient.toUpperCase() : 'DIRECT MESSAGES'}
        </Text>

        {activeRecipient && onAddFriend ? (
          <Pressable
            onPress={() => onAddFriend({ username: activeRecipient, pseudonym: activeRecipient })}
            style={[styles.friendBtn, isFriend && styles.friendBtnActive]}
          >
            <Ionicons name={isFriend ? 'checkmark' : 'person-add'} size={15} color={isFriend ? C.ink : C.mint} />
            <Text style={[styles.friendBtnText, isFriend && styles.friendBtnTextActive]}>
              {isFriend ? 'Friends' : 'Add Friend'}
            </Text>
          </Pressable>
        ) : (
          <View style={{ width: 30 }} />
        )}
      </View>

      {activeRecipient ? (
        // Active Thread View
        <View style={styles.threadContainer}>
          <ScrollView
            contentContainerStyle={styles.messagesScroll}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.threadHero}>
              <View style={styles.recipientAvatar}>
                <Text style={styles.recipientAvatarText}>
                  {activeRecipient.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.recipientName}>{activeRecipient}</Text>
              <Text style={styles.threadSub}>
                Private recovery conversation · End-to-end confidential
              </Text>
            </View>

            {activeMessages.length === 0 && (
              <View style={styles.emptyThread}>
                <Text style={styles.emptyThreadText}>
                  Say hello to {activeRecipient}. There is room for the honest version here.
                </Text>
              </View>
            )}

            {activeMessages.map(msg => {
              const isMine = msg.sender === currentUser || msg.sender === 'You';
              return (
                <View
                  key={msg.id}
                  style={[styles.msgRow, isMine ? styles.msgRowMine : styles.msgRowTheirs]}
                >
                  <View style={[styles.msgBubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
                    <Text style={[styles.msgText, isMine ? styles.msgTextMine : styles.msgTextTheirs]}>
                      {msg.text}
                    </Text>
                    <Text style={[styles.msgTime, isMine ? styles.msgTimeMine : styles.msgTimeTheirs]}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Composer */}
          <View style={styles.composerBar}>
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder={`Message ${activeRecipient}...`}
              placeholderTextColor={C.muted}
              style={styles.composerInput}
            />
            <Pressable
              onPress={handleSend}
              disabled={!inputText.trim()}
              style={[styles.sendBtn, !inputText.trim() && { opacity: 0.5 }]}
            >
              <Ionicons name="send" size={18} color={C.ink} />
            </Pressable>
          </View>
        </View>
      ) : (
        // Conversation List
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Conversations</Text>
          <Text style={styles.subtitle}>
            Private connections with sponsors, fellows, and meeting friends.
          </Text>

          {recipients.length === 0 ? (
            <View style={styles.emptyInbox}>
              <Ionicons name="chatbubbles-outline" size={44} color={C.muted} />
              <Text style={styles.emptyTitle}>No messages yet</Text>
              <Text style={styles.emptyMuted}>
                Start a private side chat from any meeting room or circle profile.
              </Text>
            </View>
          ) : (
            recipients.map(rec => {
              const thread = conversations[rec] || [];
              const lastMsg = thread[thread.length - 1];
              return (
                <Pressable
                  key={rec}
                  onPress={() => setActiveRecipient(rec)}
                  style={styles.inboxItem}
                >
                  <View style={styles.avatarPill}>
                    <Text style={styles.avatarText}>{rec.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.rowBetween}>
                      <Text style={styles.inboxName}>{rec}</Text>
                      {lastMsg && (
                        <Text style={styles.inboxTime}>
                          {new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.inboxPreview} numberOfLines={1}>
                      {lastMsg ? lastMsg.text : 'Start conversation...'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={C.muted} />
                </Pressable>
              );
            })
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.ink,
  },
  header: {
    height: 60,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: C.cardBorder,
  },
  headerTitle: {
    color: C.mint,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  closeBtn: {
    padding: 6,
  },
  headerBackBtn: {
    padding: 6,
  },
  friendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: C.raised,
    borderWidth: 1,
    borderColor: C.mintDark,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  friendBtnActive: {
    backgroundColor: C.mint,
    borderColor: C.mint,
  },
  friendBtnText: {
    color: C.mint,
    fontSize: 11,
    fontWeight: '800',
  },
  friendBtnTextActive: {
    color: C.ink,
  },
  scroll: {
    padding: 20,
    gap: 14,
  },
  title: {
    color: C.warm,
    fontSize: 24,
    fontWeight: '900',
  },
  subtitle: {
    color: C.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: -8,
    marginBottom: 6,
  },
  emptyInbox: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 30,
  },
  emptyTitle: {
    color: C.warm,
    fontSize: 18,
    fontWeight: '800',
  },
  emptyMuted: {
    color: C.muted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
  inboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.surface,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  avatarPill: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: C.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: C.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inboxName: {
    color: C.warm,
    fontSize: 15,
    fontWeight: '800',
  },
  inboxTime: {
    color: C.muted,
    fontSize: 11,
  },
  inboxPreview: {
    color: C.muted,
    fontSize: 13,
    marginTop: 3,
  },
  threadContainer: {
    flex: 1,
  },
  messagesScroll: {
    padding: 16,
    gap: 12,
    paddingBottom: 20,
  },
  threadHero: {
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: C.cardBorder,
    marginBottom: 8,
    gap: 4,
  },
  recipientAvatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: C.mint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  recipientAvatarText: {
    color: C.ink,
    fontSize: 24,
    fontWeight: '900',
  },
  recipientName: {
    color: C.warm,
    fontSize: 18,
    fontWeight: '900',
  },
  threadSub: {
    color: C.muted,
    fontSize: 11,
  },
  emptyThread: {
    padding: 20,
    alignItems: 'center',
  },
  emptyThreadText: {
    color: C.muted,
    fontSize: 13,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  msgRow: {
    flexDirection: 'row',
  },
  msgRowMine: {
    justifyContent: 'flex-end',
  },
  msgRowTheirs: {
    justifyContent: 'flex-start',
  },
  msgBubble: {
    maxWidth: '78%',
    padding: 12,
    borderRadius: 16,
    gap: 4,
  },
  bubbleMine: {
    backgroundColor: C.mint,
    borderBottomRightRadius: 4,
  },
  bubbleTheirs: {
    backgroundColor: C.raised,
    borderWidth: 1,
    borderColor: C.line,
    borderBottomLeftRadius: 4,
  },
  msgText: {
    fontSize: 14,
    lineHeight: 20,
  },
  msgTextMine: {
    color: C.ink,
    fontWeight: '600',
  },
  msgTextTheirs: {
    color: C.warm,
  },
  msgTime: {
    fontSize: 10,
    alignSelf: 'flex-end',
  },
  msgTimeMine: {
    color: 'rgba(14, 22, 36, 0.65)',
  },
  msgTimeTheirs: {
    color: C.muted,
  },
  composerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: C.surface,
    borderTopWidth: 1,
    borderColor: C.cardBorder,
    gap: 10,
  },
  composerInput: {
    flex: 1,
    backgroundColor: C.raised,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.line,
    color: C.warm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: C.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
