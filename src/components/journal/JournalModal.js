import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../../constants/colors';

const MOODS = [
  { id: 'grounded', emoji: '🌱', label: 'Grounded' },
  { id: 'hopeful', emoji: '☀️', label: 'Hopeful' },
  { id: 'tender', emoji: '🌊', label: 'Tender' },
  { id: 'triggered', emoji: '🌪️', label: 'Triggered / Urge' },
  { id: 'reflective', emoji: '🌙', label: 'Reflective' },
];

export default function JournalModal({ entries = [], onAddEntry, onClose, say }) {
  const [mood, setMood] = useState('grounded');
  const [gratitude, setGratitude] = useState('');
  const [reflection, setReflection] = useState('');
  const [isComposing, setIsComposing] = useState(entries.length === 0);

  const handleSave = async () => {
    if (!reflection.trim() && !gratitude.trim()) {
      say?.('Please write a sentence or two for your reflection.');
      return;
    }
    const newEntry = {
      id: `j-${Date.now()}`,
      date: new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mood,
      gratitude: gratitude.trim(),
      reflection: reflection.trim(),
      createdAt: new Date().toISOString(),
    };
    await onAddEntry(newEntry);
    setGratitude('');
    setReflection('');
    setIsComposing(false);
    say?.('Entry saved privately.');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={onClose} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color={C.warm} />
        </Pressable>
        <Text style={styles.headerTitle}>PRIVATE JOURNAL</Text>
        <Pressable
          onPress={() => setIsComposing(!isComposing)}
          style={styles.toggleComposeBtn}
        >
          <Ionicons name={isComposing ? 'list' : 'add'} size={20} color={C.ink} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {isComposing ? (
          <View style={styles.composeBox}>
            <Text style={styles.title}>Daily Reflection</Text>
            <Text style={styles.subtitle}>
              What you write here is private to your device. There is no right or wrong way to feel.
            </Text>

            {/* Mood Selector */}
            <Text style={styles.fieldLabel}>HOW DOES YOUR NERVOUS SYSTEM FEEL?</Text>
            <View style={styles.moodGrid}>
              {MOODS.map(m => {
                const active = mood === m.id;
                return (
                  <Pressable
                    key={m.id}
                    onPress={() => setMood(m.id)}
                    style={[styles.moodItem, active && styles.moodItemActive]}
                  >
                    <Text style={styles.moodEmoji}>{m.emoji}</Text>
                    <Text style={[styles.moodLabel, active && styles.moodLabelActive]}>{m.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Gratitude Prompt */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>ONE THING I AM GRATEFUL FOR TODAY</Text>
              <TextInput
                value={gratitude}
                onChangeText={setGratitude}
                placeholder="Even something simple (clean sheets, cool water, a quiet walk)..."
                placeholderTextColor={C.muted}
                style={styles.input}
              />
            </View>

            {/* Main Reflection */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>DAILY REFLECTION / CRAVING LOG</Text>
              <TextInput
                multiline
                value={reflection}
                onChangeText={setReflection}
                placeholder="What was hard today? What did you notice about your thoughts? Where did you find peace?..."
                placeholderTextColor={C.muted}
                style={[styles.input, styles.reflectionInput]}
              />
            </View>

            <Pressable onPress={handleSave} style={styles.saveBtn}>
              <Ionicons name="lock-closed" size={16} color={C.ink} />
              <Text style={styles.saveBtnText}>Save Private Entry</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.historyBox}>
            <View style={styles.historyHeader}>
              <Text style={styles.title}>Journal History</Text>
              <Pressable onPress={() => setIsComposing(true)} style={styles.newEntryBtn}>
                <Ionicons name="add" size={16} color={C.ink} />
                <Text style={styles.newEntryBtnText}>New Entry</Text>
              </Pressable>
            </View>

            {entries.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="book-outline" size={40} color={C.muted} />
                <Text style={styles.emptyTitle}>Your journal is empty</Text>
                <Text style={styles.emptyCopy}>Write your first reflection to track your personal healing path.</Text>
              </View>
            ) : (
              entries.map(entry => {
                const moodObj = MOODS.find(m => m.id === entry.mood) || MOODS[0];
                return (
                  <View key={entry.id} style={styles.entryCard}>
                    <View style={styles.entryTopRow}>
                      <View style={styles.moodPill}>
                        <Text style={styles.entryMoodEmoji}>{moodObj.emoji}</Text>
                        <Text style={styles.entryMoodText}>{moodObj.label}</Text>
                      </View>
                      <Text style={styles.entryDate}>{entry.date} · {entry.time}</Text>
                    </View>

                    {entry.gratitude ? (
                      <View style={styles.gratitudeHighlight}>
                        <Text style={styles.gratitudeHeader}>GRATITUDE</Text>
                        <Text style={styles.gratitudeText}>{entry.gratitude}</Text>
                      </View>
                    ) : null}

                    {entry.reflection ? (
                      <Text style={styles.entryBody}>{entry.reflection}</Text>
                    ) : null}
                  </View>
                );
              })
            )}
          </View>
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
  toggleComposeBtn: {
    backgroundColor: C.mint,
    padding: 6,
    borderRadius: 8,
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    color: C.warm,
    fontSize: 26,
    fontWeight: '900',
  },
  subtitle: {
    color: C.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
    marginBottom: 12,
  },
  composeBox: {
    gap: 14,
  },
  fieldLabel: {
    color: C.mint,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: C.surface,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.line,
  },
  moodItemActive: {
    backgroundColor: C.mint,
    borderColor: C.mint,
  },
  moodEmoji: {
    fontSize: 16,
  },
  moodLabel: {
    color: C.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  moodLabelActive: {
    color: C.ink,
  },
  field: {
    gap: 6,
  },
  input: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 12,
    padding: 14,
    color: C.warm,
    fontSize: 14,
  },
  reflectionInput: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  saveBtn: {
    backgroundColor: C.mint,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  saveBtnText: {
    color: C.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  historyBox: {
    gap: 14,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newEntryBtn: {
    backgroundColor: C.mint,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  newEntryBtnText: {
    color: C.ink,
    fontSize: 12,
    fontWeight: '900',
  },
  emptyState: {
    paddingVertical: 48,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    color: C.warm,
    fontSize: 16,
    fontWeight: '800',
  },
  emptyCopy: {
    color: C.muted,
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 260,
  },
  entryCard: {
    backgroundColor: C.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.cardBorder,
    gap: 10,
  },
  entryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  moodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: C.raised,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  entryMoodEmoji: {
    fontSize: 12,
  },
  entryMoodText: {
    color: C.mint,
    fontSize: 11,
    fontWeight: '800',
  },
  entryDate: {
    color: C.muted,
    fontSize: 11,
  },
  gratitudeHighlight: {
    backgroundColor: '#1b2535',
    padding: 10,
    borderRadius: 10,
    borderLeftWidth: 2,
    borderColor: C.gold,
    gap: 2,
  },
  gratitudeHeader: {
    color: C.gold,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  gratitudeText: {
    color: C.warm,
    fontSize: 13,
  },
  entryBody: {
    color: C.warm,
    fontSize: 14,
    lineHeight: 21,
  },
});
