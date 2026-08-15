import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../../constants/colors';
import {
  LEARN_MODULES,
  RECOVERY_STORIES,
  getLevelForXP,
} from '../../constants/learnData';
import { rssService } from '../../services/rssService';
import { storageService } from '../../services/storage';

export default function LearnTab({
  learnProgress,
  onAwardXP,
  onOpenReadings,
  onOpenStory,
  say,
}) {
  const [activeSection, setActiveSection] = useState('modules'); // 'modules' | 'stories' | 'news'
  const [expandedModule, setExpandedModule] = useState(1);
  const [rssArticles, setRssArticles] = useState([]);
  const [loadingRss, setLoadingRss] = useState(false);

  const levelInfo = getLevelForXP(learnProgress?.xp || 0);

  useEffect(() => {
    loadRss();
  }, []);

  const loadRss = async () => {
    setLoadingRss(true);
    const data = await rssService.getAllFeeds();
    setRssArticles(data);
    setLoadingRss(false);
  };

  const handleCompleteModule = async (module) => {
    const isCompleted = learnProgress?.completedModules?.includes(module.id);
    if (!isCompleted) {
      await onAwardXP(module.xp, module.id);
      say?.(`✨ +${module.xp} XP earned! "${module.title}" completed.`);
    } else {
      say?.(`Module opened for review.`);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.headerBlock}>
        <Text style={styles.eyebrow}>GAMIFIED RECOVERY & KNOWLEDGE</Text>
        <Text style={styles.h1}>Learn by Living It</Text>
        <Text style={styles.intro}>
          Step-by-step modules, authentic shares, and live neuroscience feeds to build lasting recovery.
        </Text>
      </View>

      {/* Gamification Level & XP Progress Banner */}
      <View style={styles.xpCard}>
        <View style={styles.xpHeaderRow}>
          <View style={styles.levelBadge}>
            <Ionicons name={levelInfo.icon} size={24} color={C.gold} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.xpTitleRow}>
              <Text style={styles.levelTitle}>Level {levelInfo.level}: {levelInfo.title}</Text>
              <Text style={styles.xpCounter}>{learnProgress?.xp || 0} XP</Text>
            </View>
            <Text style={styles.badgeLabel}>{levelInfo.badge}</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarWrap}>
          <View style={[styles.progressBarFill, { width: `${Math.round(levelInfo.progress * 100)}%` }]} />
        </View>

        <View style={styles.xpFooterRow}>
          <Text style={styles.xpFooterText}>
            {learnProgress?.completedModules?.length || 0} of {LEARN_MODULES.length} modules completed
          </Text>
          {levelInfo.nextLevel && (
            <Text style={styles.xpNextText}>
              {levelInfo.nextLevel.minXP - (learnProgress?.xp || 0)} XP to {levelInfo.nextLevel.title}
            </Text>
          )}
        </View>
      </View>

      {/* Literature Library Banner */}
      <Pressable onPress={onOpenReadings} style={styles.readingsBanner}>
        <View style={styles.readingsIconWrap}>
          <Ionicons name="book" size={24} color={C.ink} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.readingsBannerTitle}>CMA Literature & Audio Library</Text>
          <Text style={styles.readingsBannerSub}>7 official readings narrated by Jessica · Audio & PDF</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={C.muted} />
      </Pressable>

      {/* Section Switcher */}
      <View style={styles.tabSwitcher}>
        {[
          { id: 'modules', label: 'Curriculum & XP', icon: 'sparkles-outline' },
          { id: 'stories', label: 'Fellowship Stories', icon: 'heart-outline' },
          { id: 'news', label: 'Health & Science Feeds', icon: 'pulse-outline' },
        ].map(tab => {
          const active = activeSection === tab.id;
          return (
            <Pressable
              key={tab.id}
              onPress={() => setActiveSection(tab.id)}
              style={[styles.switchTab, active && styles.switchTabActive]}
            >
              <Ionicons name={tab.icon} size={16} color={active ? C.ink : C.muted} />
              <Text style={[styles.switchTabText, active && styles.switchTabTextActive]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* 1. Modules List */}
      {activeSection === 'modules' && (
        <View style={styles.sectionWrap}>
          {LEARN_MODULES.map((m, idx) => {
            const isDone = learnProgress?.completedModules?.includes(m.id);
            const isOpen = expandedModule === m.id;

            return (
              <View key={m.id} style={styles.moduleCard}>
                <Pressable
                  onPress={() => setExpandedModule(isOpen ? 0 : m.id)}
                  style={styles.moduleHeader}
                >
                  <View style={[styles.moduleIconWrap, isDone && styles.moduleIconWrapDone]}>
                    <Ionicons
                      name={isDone ? 'checkmark' : m.icon}
                      size={18}
                      color={isDone ? C.ink : C.mint}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={styles.moduleTagRow}>
                      <Text style={styles.moduleCategory}>{m.category.toUpperCase()}</Text>
                      <Text style={styles.moduleXp}>+{m.xp} XP</Text>
                    </View>
                    <Text style={styles.moduleTitle}>{m.title}</Text>
                  </View>

                  <Ionicons
                    name={isOpen ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={C.muted}
                  />
                </Pressable>

                {isOpen && (
                  <View style={styles.moduleBody}>
                    <Text style={styles.moduleSummary}>{m.summary}</Text>
                    <Text style={styles.moduleDetail}>{m.detail}</Text>

                    <Text style={styles.actionStepsHeader}>ACTION STEPS</Text>
                    {m.steps.map((step, sIdx) => (
                      <View key={sIdx} style={styles.stepRow}>
                        <View style={styles.stepBullet}>
                          <Text style={styles.stepNumber}>{sIdx + 1}</Text>
                        </View>
                        <Text style={styles.stepText}>{step}</Text>
                      </View>
                    ))}

                    <View style={styles.keyInsightCard}>
                      <Ionicons name="sunny" size={16} color={C.gold} />
                      <Text style={styles.keyInsightText}>{m.keyInsight}</Text>
                    </View>

                    <Pressable
                      onPress={() => handleCompleteModule(m)}
                      style={[styles.completeBtn, isDone && styles.reviewBtn]}
                    >
                      <Ionicons
                        name={isDone ? 'refresh' : 'checkmark-circle'}
                        size={18}
                        color={isDone ? C.warm : C.ink}
                      />
                      <Text style={[styles.completeBtnText, isDone && { color: C.warm }]}>
                        {isDone ? 'Review Module (+XP Earned)' : `Complete Module & Claim ${m.xp} XP`}
                      </Text>
                    </Pressable>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}

      {/* 2. Recovery Stories List */}
      {activeSection === 'stories' && (
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionInfo}>
            Candid, unfiltered shares from people who walked through early withdrawal and rebuilt meaningful lives.
          </Text>

          {RECOVERY_STORIES.map(story => (
            <Pressable
              key={story.id}
              onPress={() => onOpenStory && onOpenStory(story)}
              style={styles.storyCard}
            >
              <View style={styles.storyHeader}>
                <View style={styles.storyAuthorBadge}>
                  <Text style={styles.storyAuthorLetter}>{story.author.charAt(0)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.storyAuthor}>{story.author}</Text>
                  <Text style={styles.storyCleanTime}>{story.cleanTime} · {story.category}</Text>
                </View>
                <Text style={styles.storyReadTime}>{story.readTime}</Text>
              </View>

              <Text style={styles.storyTitle}>{story.title}</Text>
              <Text style={styles.storyQuote}>"{story.quote}"</Text>

              <View style={styles.readMoreRow}>
                <Text style={styles.readMoreText}>Read full story</Text>
                <Ionicons name="arrow-forward" size={14} color={C.mint} />
              </View>
            </Pressable>
          ))}
        </View>
      )}

      {/* 3. Live RSS & Health Science Feeds */}
      {activeSection === 'news' && (
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionInfo}>
            Live updates and peer-reviewed neuroscience on brain repair, dopamine recovery, sleep, and addiction policy.
          </Text>

          {loadingRss ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={C.mint} />
              <Text style={styles.loadingText}>Fetching live addiction science feeds...</Text>
            </View>
          ) : (
            rssArticles.map(article => (
              <Pressable
                key={article.id}
                onPress={() => onOpenStory && onOpenStory(article)}
                style={styles.rssCard}
              >
                <View style={styles.rssTopRow}>
                  <Text style={styles.rssSource}>{article.source}</Text>
                  <Text style={styles.rssDate}>{article.publishedDate}</Text>
                </View>
                <Text style={styles.rssTitle}>{article.title}</Text>
                <Text style={styles.rssSummary} numberOfLines={3}>{article.summary}</Text>
                <View style={styles.readMoreRow}>
                  <Text style={styles.readMoreText}>Read full article & references</Text>
                  <Ionicons name="arrow-forward" size={14} color={C.mint} />
                </View>
              </Pressable>
            ))
          )}
        </View>
      )}
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
  xpCard: {
    backgroundColor: '#1b263b',
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#31486d',
    gap: 12,
  },
  xpHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  levelBadge: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#263b5c',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.gold,
  },
  xpTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelTitle: {
    color: C.warm,
    fontSize: 16,
    fontWeight: '900',
  },
  xpCounter: {
    color: C.gold,
    fontSize: 18,
    fontWeight: '900',
  },
  badgeLabel: {
    color: C.mint,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  progressBarWrap: {
    height: 8,
    backgroundColor: '#111b2b',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: C.mint,
    borderRadius: 4,
  },
  xpFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  xpFooterText: {
    color: C.muted,
    fontSize: 11,
  },
  xpNextText: {
    color: C.gold,
    fontSize: 11,
    fontWeight: '700',
  },
  readingsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: C.surface,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  readingsIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: C.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readingsBannerTitle: {
    color: C.warm,
    fontSize: 15,
    fontWeight: '800',
  },
  readingsBannerSub: {
    color: C.muted,
    fontSize: 12,
    marginTop: 2,
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: C.surface,
    padding: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.line,
  },
  switchTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  switchTabActive: {
    backgroundColor: C.mint,
  },
  switchTabText: {
    color: C.muted,
    fontSize: 11,
    fontWeight: '800',
  },
  switchTabTextActive: {
    color: C.ink,
  },
  sectionWrap: {
    gap: 12,
  },
  sectionInfo: {
    color: C.muted,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 4,
  },
  moduleCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.cardBorder,
    overflow: 'hidden',
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  moduleIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: C.raised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleIconWrapDone: {
    backgroundColor: C.mint,
  },
  moduleTagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  moduleCategory: {
    color: C.mint,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  moduleXp: {
    color: C.gold,
    fontSize: 11,
    fontWeight: '900',
  },
  moduleTitle: {
    color: C.warm,
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  moduleBody: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: C.cardBorder,
    gap: 10,
  },
  moduleSummary: {
    color: C.warm,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 10,
  },
  moduleDetail: {
    color: C.muted,
    fontSize: 13,
    lineHeight: 20,
  },
  actionStepsHeader: {
    color: C.mint,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 6,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  stepBullet: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: C.raised,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepNumber: {
    color: C.mint,
    fontSize: 10,
    fontWeight: '900',
  },
  stepText: {
    flex: 1,
    color: C.warm,
    fontSize: 13,
    lineHeight: 19,
  },
  keyInsightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#26241c',
    padding: 12,
    borderRadius: 10,
    marginTop: 6,
  },
  keyInsightText: {
    flex: 1,
    color: C.gold,
    fontSize: 12,
    fontStyle: 'italic',
  },
  completeBtn: {
    backgroundColor: C.mint,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  completeBtnText: {
    color: C.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  reviewBtn: {
    backgroundColor: C.raised,
    borderWidth: 1,
    borderColor: C.line,
  },
  storyCard: {
    backgroundColor: C.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.cardBorder,
    gap: 8,
  },
  storyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  storyAuthorBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: C.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyAuthorLetter: {
    color: C.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  storyAuthor: {
    color: C.warm,
    fontSize: 14,
    fontWeight: '800',
  },
  storyCleanTime: {
    color: C.muted,
    fontSize: 11,
  },
  storyReadTime: {
    color: C.muted,
    fontSize: 11,
  },
  storyTitle: {
    color: C.warm,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  storyQuote: {
    color: C.gold,
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  readMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  readMoreText: {
    color: C.mint,
    fontSize: 12,
    fontWeight: '800',
  },
  rssCard: {
    backgroundColor: C.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.cardBorder,
    gap: 8,
  },
  rssTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rssSource: {
    color: C.blue,
    fontSize: 11,
    fontWeight: '800',
  },
  rssDate: {
    color: C.muted,
    fontSize: 11,
  },
  rssTitle: {
    color: C.warm,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 21,
  },
  rssSummary: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 24,
  },
  loadingText: {
    color: C.muted,
    fontSize: 12,
  },
});
