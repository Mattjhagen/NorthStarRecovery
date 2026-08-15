import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../constants/colors';

export default function StoryDetailModal({ story, onClose }) {
  if (!story) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={onClose} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color={C.warm} />
        </Pressable>
        <Text style={styles.headerTitle}>{story.category?.toUpperCase() || 'RECOVERY INSIGHT'}</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.badgeRow}>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryPillText}>{story.category || 'Story'}</Text>
          </View>
          <Text style={styles.readTimeText}>{story.readTime || '4 min read'}</Text>
        </View>

        <Text style={styles.title}>{story.title}</Text>

        <View style={styles.authorRow}>
          <View style={styles.authorAvatar}>
            <Text style={styles.authorAvatarText}>
              {(story.author || story.source || 'N').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.authorName}>{story.author || story.source}</Text>
            <Text style={styles.authorMeta}>
              {story.cleanTime ? `${story.cleanTime} · ` : ''}
              {story.publishedDate || 'NorthStar Recovery Story'}
            </Text>
          </View>
        </View>

        {story.quote && (
          <View style={styles.quoteCard}>
            <Ionicons name="quote" size={24} color={C.gold} />
            <Text style={styles.quoteText}>"{story.quote}"</Text>
          </View>
        )}

        <Text style={styles.bodyText}>{story.body}</Text>

        {story.url && (
          <Pressable onPress={() => Linking.openURL(story.url)} style={styles.sourceBtn}>
            <Ionicons name="open-outline" size={16} color={C.mint} />
            <Text style={styles.sourceBtnText}>Read Original on Source Website</Text>
          </Pressable>
        )}
      </ScrollView>
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
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: C.cardBorder,
  },
  headerTitle: {
    color: C.mint,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  closeBtn: {
    padding: 6,
  },
  scroll: {
    padding: 20,
    gap: 16,
    paddingBottom: 40,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryPill: {
    backgroundColor: C.raised,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.line,
  },
  categoryPillText: {
    color: C.mint,
    fontSize: 11,
    fontWeight: '800',
  },
  readTimeText: {
    color: C.muted,
    fontSize: 12,
  },
  title: {
    color: C.warm,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 32,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.cardBorder,
  },
  authorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: C.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorAvatarText: {
    color: C.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  authorName: {
    color: C.warm,
    fontSize: 15,
    fontWeight: '800',
  },
  authorMeta: {
    color: C.muted,
    fontSize: 12,
    marginTop: 2,
  },
  quoteCard: {
    backgroundColor: '#1b2638',
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 3,
    borderColor: C.gold,
    gap: 8,
  },
  quoteText: {
    color: C.warm,
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  bodyText: {
    color: C.warm,
    fontSize: 15,
    lineHeight: 25,
    letterSpacing: 0.2,
  },
  sourceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: C.raised,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.line,
    marginTop: 10,
  },
  sourceBtnText: {
    color: C.mint,
    fontSize: 13,
    fontWeight: '800',
  },
});
