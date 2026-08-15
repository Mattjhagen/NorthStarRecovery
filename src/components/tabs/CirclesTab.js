import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../../constants/colors';
import { storageService, INITIAL_CIRCLES } from '../../services/storage';

export default function CirclesTab({
  currentUser = 'You',
  onOpenDM,
  onAddFriend,
  onToggleFollow,
  friendsList = [],
  followingList = [],
  say,
}) {
  const [circles, setCircles] = useState(INITIAL_CIRCLES);
  const [selectedCircle, setSelectedCircle] = useState(INITIAL_CIRCLES[0]);
  const [sortMode, setSortMode] = useState('popularity'); // 'distance' | 'popularity' | 'new'
  const [posts, setPosts] = useState([]);
  const [composeOpen, setComposeOpen] = useState(false);
  const [postDraft, setPostDraft] = useState('');
  const [postCategory, setPostCategory] = useState('Check-in');
  const [activePostForComments, setActivePostForComments] = useState(null);
  const [commentDraft, setCommentDraft] = useState('');
  const [memberProfileModal, setMemberProfileModal] = useState(null);

  useEffect(() => {
    loadCirclesAndPosts();
  }, []);

  const loadCirclesAndPosts = async () => {
    const savedCircles = await storageService.getCircles();
    const savedPosts = await storageService.getCommunityPosts();
    setCircles(savedCircles);
    if (savedCircles.length > 0) setSelectedCircle(savedCircles[0]);
    setPosts(savedPosts);
  };

  // Sort circles by Distance, Popularity, or New
  const sortedCircles = [...circles].sort((a, b) => {
    if (sortMode === 'distance') {
      return (a.distanceKm || 999) - (b.distanceKm || 999);
    }
    if (sortMode === 'popularity') {
      return (b.membersCount || 0) - (a.membersCount || 0);
    }
    // 'new'
    return b.id.localeCompare(a.id);
  });

  const handleCreatePost = async () => {
    if (!postDraft.trim()) {
      say?.('Write a few words before posting.');
      return;
    }
    const newPost = {
      id: `post-${Date.now()}`,
      circleId: selectedCircle.id,
      circleName: selectedCircle.name,
      author: currentUser || 'You',
      initial: (currentUser || 'Y').charAt(0).toUpperCase(),
      category: postCategory.toUpperCase(),
      time: 'Just now',
      body: postDraft.trim(),
      comments: [],
      likes: 0,
      createdAt: new Date().toISOString(),
    };
    const updated = await storageService.addCommunityPost(newPost);
    setPosts(updated);
    setPostDraft('');
    setComposeOpen(false);
    say?.('Shared with the circle.');
  };

  const handleAddComment = async () => {
    if (!commentDraft.trim() || !activePostForComments) return;
    const comment = {
      id: `c-${Date.now()}`,
      author: currentUser || 'You',
      body: commentDraft.trim(),
      time: 'Just now',
      createdAt: new Date().toISOString(),
    };
    const updated = await storageService.addCommentToPost(activePostForComments.id, comment);
    setPosts(updated);
    const updatedPost = updated.find(p => p.id === activePostForComments.id);
    setActivePostForComments(updatedPost || null);
    setCommentDraft('');
    say?.('Comment shared gently.');
  };

  const filteredPosts = posts.filter(
    p => !selectedCircle || p.circleId === selectedCircle.id || p.circleName === selectedCircle.name
  );

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.headerBlock}>
        <Text style={styles.eyebrow}>FELLOWSHIP SPACES</Text>
        <Text style={styles.h1}>Community Circles</Text>
        <Text style={styles.intro}>
          Sub-fellowships organized by location, topics, and recovery milestones.
        </Text>
      </View>

      {/* Circle Sorting Selector */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>SORT CIRCLES BY:</Text>
        <View style={styles.sortTabs}>
          {[
            { id: 'distance', label: 'Distance', icon: 'navigate-outline' },
            { id: 'popularity', label: 'Popularity', icon: 'flame-outline' },
            { id: 'new', label: 'New', icon: 'sparkles-outline' },
          ].map(s => {
            const active = sortMode === s.id;
            return (
              <Pressable
                key={s.id}
                onPress={() => setSortMode(s.id)}
                style={[styles.sortTab, active && styles.sortTabActive]}
              >
                <Ionicons name={s.icon} size={14} color={active ? C.ink : C.muted} />
                <Text style={[styles.sortTabText, active && styles.sortTabTextActive]}>
                  {s.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Horizontal Circles Cards Carousel */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.circlesScroll}>
        {sortedCircles.map(c => {
          const isSelected = selectedCircle?.id === c.id;
          return (
            <Pressable
              key={c.id}
              onPress={() => setSelectedCircle(c)}
              style={[styles.circleCard, isSelected && styles.circleCardActive]}
            >
              <View style={styles.circleHeader}>
                <View style={[styles.circleIconWrap, isSelected && { backgroundColor: C.ink }]}>
                  <Ionicons name={c.icon} size={18} color={isSelected ? C.mint : C.mint} />
                </View>
                <Text style={[styles.circleDistance, isSelected && { color: C.ink }]}>
                  {c.distanceKm} mi · {c.locationName}
                </Text>
              </View>

              <Text style={[styles.circleName, isSelected && { color: C.ink }]} numberOfLines={2}>
                {c.name}
              </Text>
              <Text style={[styles.circleMembers, isSelected && { color: '#163529' }]}>
                {c.membersCount.toLocaleString()} members
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Active Circle Banner & Post Trigger */}
      {selectedCircle && (
        <View style={styles.activeCircleBanner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.activeCircleCategory}>{selectedCircle.category.toUpperCase()}</Text>
            <Text style={styles.activeCircleName}>{selectedCircle.name}</Text>
            <Text style={styles.activeCircleDesc}>{selectedCircle.description}</Text>
          </View>
          <Pressable onPress={() => setComposeOpen(true)} style={styles.composeBtn}>
            <Ionicons name="create" size={18} color={C.ink} />
            <Text style={styles.composeBtnText}>Post to Circle</Text>
          </Pressable>
        </View>
      )}

      {/* Post Feed */}
      <View style={styles.postsList}>
        {filteredPosts.length === 0 ? (
          <View style={styles.emptyFeed}>
            <Ionicons name="chatbubbles-outline" size={40} color={C.muted} />
            <Text style={styles.emptyFeedTitle}>No posts in this circle yet</Text>
            <Text style={styles.emptyFeedCopy}>
              Be the first to share an honest check-in, story, or question with the circle.
            </Text>
            <Pressable onPress={() => setComposeOpen(true)} style={styles.firstPostBtn}>
              <Text style={styles.firstPostBtnText}>Start the Conversation</Text>
            </Pressable>
          </View>
        ) : (
          filteredPosts.map(post => {
            const isAuthorFriend = friendsList.some(f => f.username === post.author);
            const isFollowingAuthor = followingList.includes(post.author);

            return (
              <View key={post.id} style={styles.postCard}>
                <View style={styles.postTopRow}>
                  <Text style={styles.postCategory}>{post.category}</Text>
                  <Text style={styles.postTime}>{post.time}</Text>
                </View>

                {/* Author Info */}
                <View style={styles.postAuthorRow}>
                  <Pressable
                    onPress={() => setMemberProfileModal(post)}
                    style={styles.authorAvatar}
                  >
                    <Text style={styles.authorAvatarText}>{post.initial || 'Y'}</Text>
                  </Pressable>

                  <Pressable onPress={() => setMemberProfileModal(post)} style={{ flex: 1 }}>
                    <Text style={styles.authorName}>{post.author}</Text>
                    <Text style={styles.authorCircle}>{post.circleName}</Text>
                  </Pressable>

                  {post.author !== currentUser && (
                    <View style={styles.authorActionBtns}>
                      {onToggleFollow && (
                        <Pressable
                          onPress={() => onToggleFollow(post.author)}
                          style={[styles.followPill, isFollowingAuthor && styles.followPillActive]}
                        >
                          <Text style={[styles.followPillText, isFollowingAuthor && styles.followPillTextActive]}>
                            {isFollowingAuthor ? 'Following' : 'Follow'}
                          </Text>
                        </Pressable>
                      )}
                      {onAddFriend && (
                        <Pressable
                          onPress={() => onAddFriend({ username: post.author, pseudonym: post.author })}
                          style={[styles.friendPill, isAuthorFriend && styles.friendPillActive]}
                        >
                          <Ionicons name={isAuthorFriend ? 'checkmark' : 'person-add'} size={14} color={isAuthorFriend ? C.ink : C.mint} />
                        </Pressable>
                      )}
                    </View>
                  )}
                </View>

                {/* Body */}
                <Text style={styles.postBody}>{post.body}</Text>

                {/* Comments trigger */}
                <Pressable
                  onPress={() => setActivePostForComments(post)}
                  style={styles.commentTriggerRow}
                >
                  <Ionicons name="chatbubble-ellipses-outline" size={16} color={C.mint} />
                  <Text style={styles.commentTriggerText}>
                    {post.comments?.length || 0} {post.comments?.length === 1 ? 'comment' : 'comments'} · Join gently
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={C.muted} />
                </Pressable>
              </View>
            );
          })
        )}
      </View>

      {/* Compose Post Modal */}
      <Modal visible={composeOpen} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setComposeOpen(false)}>
          <Pressable style={styles.sheetContent} onPress={() => {}}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Share with {selectedCircle?.name}</Text>
            <Text style={styles.sheetSubtitle}>
              Share honest questions, milestones, or check-ins. No advice as authority.
            </Text>

            <Text style={styles.fieldLabel}>TAG YOUR POST</Text>
            <View style={styles.categoryChoices}>
              {['Check-in', 'Story', 'Question', 'Victory', 'Need Support'].map(c => {
                const active = postCategory === c;
                return (
                  <Pressable
                    key={c}
                    onPress={() => setPostCategory(c)}
                    style={[styles.categoryChoice, active && styles.categoryChoiceActive]}
                  >
                    <Text style={[styles.categoryChoiceText, active && styles.categoryChoiceTextActive]}>
                      {c}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <TextInput
              multiline
              value={postDraft}
              onChangeText={setPostDraft}
              placeholder="What feels true for you today?..."
              placeholderTextColor={C.muted}
              style={styles.composeTextInput}
            />

            <Pressable onPress={handleCreatePost} style={styles.publishBtn}>
              <Ionicons name="paper-plane" size={18} color={C.ink} />
              <Text style={styles.publishBtnText}>Publish to Circle</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Thread & Comments Modal */}
      <Modal visible={!!activePostForComments} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setActivePostForComments(null)}>
          <Pressable style={[styles.sheetContent, { height: '88%' }]} onPress={() => {}}>
            <View style={styles.sheetHandle} />
            {activePostForComments && (
              <View style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.threadScroll} showsVerticalScrollIndicator={false}>
                  <Text style={styles.postCategory}>{activePostForComments.category}</Text>
                  <Text style={styles.authorName}>{activePostForComments.author}</Text>
                  <Text style={styles.postBody}>{activePostForComments.body}</Text>

                  <Text style={styles.commentsSectionTitle}>RESPONSES ({activePostForComments.comments?.length || 0})</Text>

                  {(!activePostForComments.comments || activePostForComments.comments.length === 0) ? (
                    <Text style={styles.noCommentsText}>No responses yet. Offer a kind word below.</Text>
                  ) : (
                    activePostForComments.comments.map(c => (
                      <View key={c.id} style={styles.commentItem}>
                        <Text style={styles.commentAuthor}>{c.author}</Text>
                        <Text style={styles.commentBody}>{c.body}</Text>
                      </View>
                    ))
                  )}
                </ScrollView>

                <View style={styles.commentComposerBar}>
                  <TextInput
                    value={commentDraft}
                    onChangeText={setCommentDraft}
                    placeholder="Offer a kind response..."
                    placeholderTextColor={C.muted}
                    style={styles.commentInput}
                  />
                  <Pressable onPress={handleAddComment} style={styles.sendCommentBtn}>
                    <Ionicons name="send" size={16} color={C.ink} />
                  </Pressable>
                </View>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Member Mini-Profile Modal */}
      <Modal visible={!!memberProfileModal} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setMemberProfileModal(null)}>
          <Pressable style={styles.memberModalContent} onPress={() => {}}>
            {memberProfileModal && (
              <View style={styles.memberProfileInner}>
                <View style={styles.memberAvatarBig}>
                  <Text style={styles.memberAvatarBigText}>
                    {memberProfileModal.initial || memberProfileModal.author.charAt(0)}
                  </Text>
                </View>
                <Text style={styles.memberModalName}>{memberProfileModal.author}</Text>
                <Text style={styles.memberModalMeta}>Fellowship Member · CMA Circles</Text>

                <View style={styles.memberModalActions}>
                  <Pressable
                    onPress={() => {
                      const recipient = memberProfileModal.author;
                      setMemberProfileModal(null);
                      onOpenDM && onOpenDM(recipient);
                    }}
                    style={styles.dmMemberBtn}
                  >
                    <Ionicons name="chatbubble-outline" size={16} color={C.ink} />
                    <Text style={styles.dmMemberBtnText}>Message Privately</Text>
                  </Pressable>

                  {onAddFriend && (
                    <Pressable
                      onPress={() => {
                        onAddFriend({ username: memberProfileModal.author, pseudonym: memberProfileModal.author });
                        setMemberProfileModal(null);
                      }}
                      style={styles.addFriendMemberBtn}
                    >
                      <Ionicons name="person-add" size={16} color={C.mint} />
                      <Text style={styles.addFriendMemberBtnText}>Add Friend</Text>
                    </Pressable>
                  )}
                </View>

                <Pressable
                  onPress={() => {
                    Alert.alert(`Block ${memberProfileModal.author}?`, 'Their posts and comments will be hidden.', [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Block Member', style: 'destructive', onPress: () => {
                        setMemberProfileModal(null);
                        say?.(`${memberProfileModal.author} is now blocked.`);
                      }},
                    ]);
                  }}
                  style={styles.blockMemberBtn}
                >
                  <Ionicons name="eye-off-outline" size={16} color={C.coral} />
                  <Text style={styles.blockMemberBtnText}>Block & Report</Text>
                </Pressable>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  headerBlock: {
    gap: 4,
  },
  eyebrow: {
    color: C.mint,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  h1: {
    color: C.warm,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  intro: {
    color: C.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  sortContainer: {
    gap: 8,
  },
  sortLabel: {
    color: C.muted,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  sortTabs: {
    flexDirection: 'row',
    backgroundColor: C.surface,
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.line,
  },
  sortTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 9,
  },
  sortTabActive: {
    backgroundColor: C.mint,
  },
  sortTabText: {
    color: C.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  sortTabTextActive: {
    color: C.ink,
  },
  circlesScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  circleCard: {
    width: 190,
    backgroundColor: C.surface,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.cardBorder,
    marginRight: 10,
    gap: 8,
  },
  circleCardActive: {
    backgroundColor: C.mint,
    borderColor: C.mint,
  },
  circleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  circleIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: C.raised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleDistance: {
    color: C.blue,
    fontSize: 10,
    fontWeight: '800',
  },
  circleName: {
    color: C.warm,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  circleMembers: {
    color: C.muted,
    fontSize: 11,
  },
  activeCircleBanner: {
    backgroundColor: '#162335',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#294366',
    gap: 12,
  },
  activeCircleCategory: {
    color: C.mint,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  activeCircleName: {
    color: C.warm,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2,
  },
  activeCircleDesc: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  composeBtn: {
    backgroundColor: C.mint,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 11,
    borderRadius: 12,
  },
  composeBtnText: {
    color: C.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  postsList: {
    gap: 12,
  },
  emptyFeed: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  emptyFeedTitle: {
    color: C.warm,
    fontSize: 16,
    fontWeight: '800',
  },
  emptyFeedCopy: {
    color: C.muted,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
  },
  firstPostBtn: {
    marginTop: 8,
    backgroundColor: C.raised,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.mintDark,
  },
  firstPostBtnText: {
    color: C.mint,
    fontSize: 12,
    fontWeight: '800',
  },
  postCard: {
    backgroundColor: C.surface,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.cardBorder,
    gap: 10,
  },
  postTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  postCategory: {
    color: C.mint,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  postTime: {
    color: C.muted,
    fontSize: 11,
  },
  postAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  authorAvatar: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: C.raised,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.line,
  },
  authorAvatarText: {
    color: C.warm,
    fontSize: 16,
    fontWeight: '900',
  },
  authorName: {
    color: C.warm,
    fontSize: 14,
    fontWeight: '800',
  },
  authorCircle: {
    color: C.muted,
    fontSize: 11,
  },
  authorActionBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  followPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: C.raised,
    borderWidth: 1,
    borderColor: C.line,
  },
  followPillActive: {
    backgroundColor: C.blue,
    borderColor: C.blue,
  },
  followPillText: {
    color: C.muted,
    fontSize: 11,
    fontWeight: '800',
  },
  followPillTextActive: {
    color: C.ink,
  },
  friendPill: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: C.raised,
    borderWidth: 1,
    borderColor: C.mintDark,
  },
  friendPillActive: {
    backgroundColor: C.mint,
  },
  postBody: {
    color: C.warm,
    fontSize: 14,
    lineHeight: 21,
  },
  commentTriggerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: C.line,
  },
  commentTriggerText: {
    flex: 1,
    color: C.mint,
    fontSize: 12,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 9, 16, 0.75)',
    justifyContent: 'flex-end',
  },
  sheetContent: {
    backgroundColor: '#1b2738',
    padding: 22,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    gap: 12,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: C.muted,
    borderRadius: 4,
    alignSelf: 'center',
    opacity: 0.5,
    marginBottom: 4,
  },
  sheetTitle: {
    color: C.warm,
    fontSize: 20,
    fontWeight: '900',
  },
  sheetSubtitle: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  fieldLabel: {
    color: C.muted,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 4,
  },
  categoryChoices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  categoryChoice: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: C.raised,
    borderWidth: 1,
    borderColor: C.line,
  },
  categoryChoiceActive: {
    backgroundColor: C.mint,
    borderColor: C.mint,
  },
  categoryChoiceText: {
    color: C.muted,
    fontSize: 11,
    fontWeight: '800',
  },
  categoryChoiceTextActive: {
    color: C.ink,
  },
  composeTextInput: {
    backgroundColor: C.raised,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 12,
    padding: 14,
    color: C.warm,
    fontSize: 14,
    minHeight: 110,
    textAlignVertical: 'top',
  },
  publishBtn: {
    backgroundColor: C.mint,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 12,
    marginTop: 4,
  },
  publishBtnText: {
    color: C.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  threadScroll: {
    gap: 12,
    paddingBottom: 16,
  },
  commentsSectionTitle: {
    color: C.mint,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 10,
  },
  noCommentsText: {
    color: C.muted,
    fontSize: 12,
    fontStyle: 'italic',
  },
  commentItem: {
    backgroundColor: C.raised,
    padding: 12,
    borderRadius: 12,
    gap: 4,
  },
  commentAuthor: {
    color: C.warm,
    fontSize: 13,
    fontWeight: '800',
  },
  commentBody: {
    color: C.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  commentComposerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: C.line,
  },
  commentInput: {
    flex: 1,
    backgroundColor: C.raised,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: C.warm,
    fontSize: 13,
  },
  sendCommentBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: C.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberModalContent: {
    backgroundColor: '#1b2738',
    padding: 24,
    borderRadius: 22,
    marginHorizontal: 30,
    alignSelf: 'center',
    width: '88%',
  },
  memberProfileInner: {
    alignItems: 'center',
    gap: 10,
  },
  memberAvatarBig: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: C.mint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  memberAvatarBigText: {
    color: C.ink,
    fontSize: 28,
    fontWeight: '900',
  },
  memberModalName: {
    color: C.warm,
    fontSize: 18,
    fontWeight: '900',
  },
  memberModalMeta: {
    color: C.muted,
    fontSize: 12,
  },
  memberModalActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    width: '100%',
  },
  dmMemberBtn: {
    flex: 1,
    backgroundColor: C.mint,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  dmMemberBtnText: {
    color: C.ink,
    fontSize: 12,
    fontWeight: '900',
  },
  addFriendMemberBtn: {
    backgroundColor: C.raised,
    borderWidth: 1,
    borderColor: C.mintDark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addFriendMemberBtnText: {
    color: C.mint,
    fontSize: 12,
    fontWeight: '800',
  },
  blockMemberBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    marginTop: 4,
  },
  blockMemberBtnText: {
    color: C.coral,
    fontSize: 12,
    fontWeight: '700',
  },
});
