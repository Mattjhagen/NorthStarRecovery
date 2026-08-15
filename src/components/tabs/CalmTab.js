import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  Easing,
  Modal,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayerStatus } from 'expo-audio';
import { C } from '../../constants/colors';

const BREATH_MODES = [
  {
    id: 'box',
    name: 'Box Breathing (4-4-4-4)',
    desc: 'For acute cravings and panic',
    steps: [
      { label: 'Breathe In', scale: 1.25, dur: 4000 },
      { label: 'Hold Breath', scale: 1.25, dur: 4000 },
      { label: 'Breathe Out', scale: 0.75, dur: 4000 },
      { label: 'Hold Empty', scale: 0.75, dur: 4000 },
    ],
  },
  {
    id: 'relax_478',
    name: 'Relaxing Breath (4-7-8)',
    desc: 'For deep rest and insomnia',
    steps: [
      { label: 'Breathe In', scale: 1.25, dur: 4000 },
      { label: 'Hold Breath', scale: 1.25, dur: 7000 },
      { label: 'Breathe Out', scale: 0.75, dur: 8000 },
    ],
  },
  {
    id: 'resonance',
    name: 'Steady Resonance (5-5)',
    desc: 'For heart coherence & grounding',
    steps: [
      { label: 'Breathe In', scale: 1.22, dur: 5000 },
      { label: 'Breathe Out', scale: 0.78, dur: 5000 },
    ],
  },
];

export default function CalmTab({
  player,
  soundscape,
  soundscapes,
  onSelectSoundscape,
}) {
  const status = useAudioPlayerStatus(player);
  const [sessionMinutes, setSessionMinutes] = useState(10);
  const [remainingSeconds, setRemainingSeconds] = useState(10 * 60);
  const [selectedBreathMode, setSelectedBreathMode] = useState(BREATH_MODES[0]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState('All');

  const isPlaying = status.playing;

  // Session countdown timer
  useEffect(() => {
    setRemainingSeconds(sessionMinutes * 60);
  }, [sessionMinutes]);

  useEffect(() => {
    if (!isPlaying || remainingSeconds === 0) return;
    const interval = setInterval(() => {
      setRemainingSeconds(v => (v > 0 ? v - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, remainingSeconds]);

  useEffect(() => {
    if (remainingSeconds === 0 && isPlaying) {
      player.pause();
    }
  }, [remainingSeconds, isPlaying, player]);

  const togglePlayback = () => {
    if (isPlaying) {
      player.pause();
    } else {
      if (remainingSeconds === 0) {
        setRemainingSeconds(sessionMinutes * 60);
      }
      player.play();
    }
  };

  const handleSelectMinutes = mins => {
    setSessionMinutes(mins);
    setRemainingSeconds(mins * 60);
  };

  const formatTimer = secs => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const categories = ['All', ...new Set(soundscapes.map(s => s.category))];
  const filteredSoundscapes = filterCategory === 'All'
    ? soundscapes
    : soundscapes.filter(s => s.category === filterCategory);

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      {/* Header Block */}
      <View style={styles.headerBlock}>
        <Text style={styles.eyebrow}>SANCTUARY & NERVOUS SYSTEM RESET</Text>
        <Text style={styles.h1}>Calm & Grounding</Text>
        <Text style={styles.intro}>
          Continuous looping binaural soundscapes and rhythmic breathing to quiet somatic cravings.
        </Text>
      </View>

      {/* Hero Soundscape Player Card */}
      <View style={styles.playerCard}>
        <View style={styles.playerHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.nowPlayingCategory}>{soundscape.category.toUpperCase()} SOUNDSCAPE</Text>
            <Text style={styles.nowPlayingTitle}>{soundscape.name}</Text>
            <Text style={styles.nowPlayingDesc}>{soundscape.description}</Text>
          </View>
        </View>

        {/* Circle Breathing Animation */}
        <CircleBreathingGuide isPlaying={isPlaying} mode={selectedBreathMode} />

        <Text style={styles.timerDisplay}>{formatTimer(remainingSeconds)}</Text>

        <Pressable onPress={togglePlayback} style={styles.playButton}>
          <Ionicons name={isPlaying ? 'pause' : 'play'} size={24} color={C.ink} />
          <Text style={styles.playButtonText}>
            {isPlaying ? 'Pause Session' : 'Begin Calm Session'}
          </Text>
        </Pressable>

        <Pressable onPress={() => setPickerOpen(true)} style={styles.changeTrackBtn}>
          <Ionicons name="musical-notes-outline" size={18} color={C.mint} />
          <Text style={styles.changeTrackBtnText}>
            Change Soundscape ({soundscapes.length} available)
          </Text>
          <Ionicons name="chevron-forward" size={16} color={C.muted} />
        </Pressable>
      </View>

      {/* Breathing Technique Selector */}
      <Text style={styles.sectionTitle}>BREATHING RHYTHM</Text>
      <View style={styles.breathModesGrid}>
        {BREATH_MODES.map(mode => {
          const active = selectedBreathMode.id === mode.id;
          return (
            <Pressable
              key={mode.id}
              onPress={() => setSelectedBreathMode(mode)}
              style={[styles.breathModeCard, active && styles.breathModeCardActive]}
            >
              <Ionicons
                name={active ? 'checkmark-circle' : 'radio-button-off-outline'}
                size={18}
                color={active ? C.mint : C.muted}
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.breathModeName, active && { color: C.mint }]}>{mode.name}</Text>
                <Text style={styles.breathModeDesc}>{mode.desc}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Session Duration Selector */}
      <Text style={styles.sectionTitle}>SESSION DURATION</Text>
      <View style={styles.sessionRow}>
        {[5, 10, 15, 20, 30].map(mins => {
          const active = sessionMinutes === mins;
          return (
            <Pressable
              key={mins}
              onPress={() => handleSelectMinutes(mins)}
              style={[styles.sessionPill, active && styles.sessionPillActive]}
            >
              <Text style={[styles.sessionPillText, active && styles.sessionPillTextActive]}>
                {mins} min
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Binaural Headphones Tip Card */}
      <View style={styles.tipCard}>
        <View style={styles.tipIconWrap}>
          <Ionicons name="headset" size={24} color={C.gold} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.tipTitle}>Recommended With Headphones</Text>
          <Text style={styles.tipCopy}>
            Binaural frequencies utilize slight phase shifts between left and right audio channels to naturally stimulate calming theta brainwaves.
          </Text>
        </View>
      </View>

      {/* Soundscape Picker Modal */}
      <Modal visible={pickerOpen} animationType="slide">
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Choose a Soundscape</Text>
            <Pressable onPress={() => setPickerOpen(false)} style={styles.modalCloseBtn}>
              <Ionicons name="close" size={22} color={C.warm} />
            </Pressable>
          </View>

          {/* Category Filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryFilterScroll}
          >
            {categories.map(cat => {
              const active = filterCategory === cat;
              return (
                <Pressable
                  key={cat}
                  onPress={() => setFilterCategory(cat)}
                  style={[styles.categoryPill, active && styles.categoryPillActive]}
                >
                  <Text style={[styles.categoryPillText, active && styles.categoryPillTextActive]}>
                    {cat}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Soundscapes List */}
          <ScrollView contentContainerStyle={styles.soundscapesListScroll}>
            {filteredSoundscapes.map(s => {
              const isSelected = s.name === soundscape.name;
              return (
                <Pressable
                  key={s.name}
                  onPress={() => {
                    player.pause();
                    onSelectSoundscape(s);
                    setPickerOpen(false);
                  }}
                  style={[styles.soundscapeItem, isSelected && styles.soundscapeItemActive]}
                >
                  <View style={[styles.soundscapeIconWrap, isSelected && { backgroundColor: C.ink }]}>
                    <Ionicons name={s.icon} size={20} color={isSelected ? C.mint : C.ink} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.soundscapeName, isSelected && { color: C.ink }]}>
                      {s.name}
                    </Text>
                    <Text style={[styles.soundscapeMeta, isSelected && { color: '#163529' }]}>
                      {s.category} · {s.duration}
                    </Text>
                  </View>
                  {isSelected && <Ionicons name="checkmark-circle" size={22} color={C.ink} />}
                </Pressable>
              );
            })}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </ScrollView>
  );
}

function CircleBreathingGuide({ isPlaying, mode }) {
  const pulse = useRef(new Animated.Value(0.75)).current;
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const animRef = useRef(null);

  useEffect(() => {
    if (!isPlaying) {
      animRef.current?.stop();
      setCurrentStepIndex(0);
      return;
    }

    let active = true;
    let idx = 0;

    const runStep = () => {
      if (!active) return;
      const step = mode.steps[idx];
      setCurrentStepIndex(idx);

      animRef.current = Animated.timing(pulse, {
        toValue: step.scale,
        duration: step.dur,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      });

      animRef.current.start(({ finished }) => {
        if (finished && active) {
          idx = (idx + 1) % mode.steps.length;
          runStep();
        }
      });
    };

    runStep();

    return () => {
      active = false;
      animRef.current?.stop();
    };
  }, [isPlaying, mode, pulse]);

  const currentStep = mode.steps[currentStepIndex] || mode.steps[0];

  return (
    <View style={styles.guideContainer}>
      {/* Animated Concentric Circles */}
      <Animated.View
        style={[
          styles.guideRingOuter,
          { transform: [{ scale: pulse }] },
        ]}
      />
      <Animated.View
        style={[
          styles.guideRingInner,
          { transform: [{ scale: Animated.multiply(pulse, 0.72) }] },
        ]}
      />

      {/* Center Label */}
      <View style={styles.guideCenterBox}>
        <Ionicons name="leaf" size={26} color={C.mint} />
        <Text style={styles.guidePhaseText}>
          {isPlaying ? currentStep.label : 'Press Begin'}
        </Text>
        <Text style={styles.guideSubText}>
          {isPlaying ? `${Math.round(currentStep.dur / 1000)}s interval` : mode.name}
        </Text>
      </View>
    </View>
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
  playerCard: {
    backgroundColor: C.surface,
    padding: 20,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: C.cardBorder,
    alignItems: 'center',
    gap: 14,
  },
  playerHeaderRow: {
    alignSelf: 'stretch',
  },
  nowPlayingCategory: {
    color: C.mint,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  nowPlayingTitle: {
    color: C.warm,
    fontSize: 20,
    fontWeight: '900',
    marginTop: 2,
  },
  nowPlayingDesc: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  guideContainer: {
    height: 220,
    width: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
  },
  guideRingOuter: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'rgba(93, 224, 166, 0.45)',
    backgroundColor: 'rgba(93, 224, 166, 0.04)',
  },
  guideRingInner: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 1,
    borderColor: 'rgba(117, 184, 255, 0.6)',
  },
  guideCenterBox: {
    alignItems: 'center',
    gap: 4,
  },
  guidePhaseText: {
    color: C.warm,
    fontSize: 19,
    fontWeight: '900',
  },
  guideSubText: {
    color: C.muted,
    fontSize: 11,
  },
  timerDisplay: {
    color: C.warm,
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  playButton: {
    alignSelf: 'stretch',
    backgroundColor: C.mint,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  playButtonText: {
    color: C.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  changeTrackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.raised,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.line,
  },
  changeTrackBtnText: {
    color: C.warm,
    fontSize: 13,
    fontWeight: '700',
  },
  sectionTitle: {
    color: C.mint,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginTop: 4,
  },
  breathModesGrid: {
    gap: 8,
  },
  breathModeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.surface,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  breathModeCardActive: {
    borderColor: C.mint,
    backgroundColor: '#162838',
  },
  breathModeName: {
    color: C.warm,
    fontSize: 14,
    fontWeight: '800',
  },
  breathModeDesc: {
    color: C.muted,
    fontSize: 12,
    marginTop: 2,
  },
  sessionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sessionPill: {
    flex: 1,
    backgroundColor: C.surface,
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.line,
  },
  sessionPillActive: {
    backgroundColor: C.mint,
    borderColor: C.mint,
  },
  sessionPillText: {
    color: C.muted,
    fontWeight: '800',
    fontSize: 13,
  },
  sessionPillTextActive: {
    color: C.ink,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#1b2536',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#33486b',
    marginTop: 6,
  },
  tipIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#273852',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipTitle: {
    color: C.gold,
    fontSize: 14,
    fontWeight: '800',
  },
  tipCopy: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },
  modalSafe: {
    flex: 1,
    backgroundColor: C.ink,
  },
  modalHeader: {
    height: 60,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: C.cardBorder,
  },
  modalTitle: {
    color: C.warm,
    fontSize: 18,
    fontWeight: '900',
  },
  modalCloseBtn: {
    padding: 6,
  },
  categoryFilterScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 56,
  },
  categoryPill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.line,
    marginRight: 8,
  },
  categoryPillActive: {
    backgroundColor: C.mint,
    borderColor: C.mint,
  },
  categoryPillText: {
    color: C.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  categoryPillTextActive: {
    color: C.ink,
  },
  soundscapesListScroll: {
    padding: 16,
    gap: 10,
    paddingBottom: 40,
  },
  soundscapeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.surface,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  soundscapeItemActive: {
    backgroundColor: C.mint,
    borderColor: C.mint,
  },
  soundscapeIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soundscapeName: {
    color: C.warm,
    fontSize: 15,
    fontWeight: '800',
  },
  soundscapeMeta: {
    color: C.muted,
    fontSize: 12,
    marginTop: 2,
  },
});
