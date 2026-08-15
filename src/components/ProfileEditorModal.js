import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Pressable,
  Image,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { C } from '../constants/colors';

const AVATAR_PRESETS = [
  '🌿', '🌊', '🏔️', '🌲', '🌙', '⭐', '🕊️', '🌅'
];

export default function ProfileEditorModal({ profile, onSave, onCancel }) {
  const [draft, setDraft] = useState({ ...profile });

  const pickFromLibrary = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow photo access to select a profile photo.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.[0]) {
        setDraft(p => ({ ...p, photo: result.assets[0].uri }));
      }
    } catch {
      Alert.alert('Photo Error', 'Could not open photo library.');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow camera access to take a profile photo.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.[0]) {
        setDraft(p => ({ ...p, photo: result.assets[0].uri }));
      }
    } catch {
      Alert.alert('Camera Error', 'Could not access camera.');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={onCancel} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color={C.warm} />
        </Pressable>
        <Text style={styles.headerTitle}>PROFILE & PRIVACY</Text>
        <Pressable onPress={() => onSave(draft)} style={styles.saveBtn}>
          <Text style={styles.saveBtnText}>Save</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Your NorthStar Profile</Text>
        <Text style={styles.subtitle}>
          Only share what feels comfortable. Your pseudonym is how you appear to others — legal names stay private.
        </Text>

        {/* Profile Avatar Selection */}
        <View style={styles.photoSection}>
          <View style={styles.avatarWrap}>
            {draft.photo ? (
              <Image source={{ uri: draft.photo }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarLetter}>
                  {(draft.pseudonym || '★').charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.photoButtons}>
            <Pressable onPress={pickFromLibrary} style={styles.actionPill}>
              <Ionicons name="images-outline" size={16} color={C.mint} />
              <Text style={styles.actionPillText}>Choose Photo</Text>
            </Pressable>
            <Pressable onPress={takePhoto} style={styles.actionPill}>
              <Ionicons name="camera-outline" size={16} color={C.blue} />
              <Text style={styles.actionPillText}>Take Photo</Text>
            </Pressable>
            {draft.photo ? (
              <Pressable onPress={() => setDraft(p => ({ ...p, photo: '' }))} style={styles.actionPillDanger}>
                <Ionicons name="trash-outline" size={16} color={C.coral} />
                <Text style={styles.actionPillDangerText}>Remove</Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        {/* Username / Pseudonym */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>PSEUDONYM / USERNAME</Text>
          <TextInput
            value={draft.pseudonym}
            onChangeText={v => setDraft(p => ({ ...p, pseudonym: v }))}
            placeholder="e.g. River M., S. Traveler"
            placeholderTextColor={C.muted}
            autoCapitalize="words"
            style={styles.fieldInput}
          />
        </View>

        {/* Bio */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>BIO (OPTIONAL)</Text>
          <TextInput
            multiline
            value={draft.bio}
            onChangeText={v => setDraft(p => ({ ...p, bio: v }))}
            placeholder="A few gentle words about where you are today..."
            placeholderTextColor={C.muted}
            style={[styles.fieldInput, styles.bioInput]}
          />
        </View>

        {/* Group Preference */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>GROUP MEETING PREFERENCE</Text>
          <View style={styles.choiceWrap}>
            {['All groups', 'Women-only', 'Men-only'].map(opt => {
              const active = draft.groupPreference === opt;
              return (
                <Pressable
                  key={opt}
                  onPress={() => setDraft(p => ({ ...p, groupPreference: opt }))}
                  style={[styles.choice, active && styles.choiceActive]}
                >
                  <Text style={[styles.choiceText, active && styles.choiceTextActive]}>{opt}</Text>
                  {active && <Ionicons name="checkmark" size={16} color={C.ink} />}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Sobriety Date & Day Count Options */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="calendar-outline" size={20} color={C.gold} />
            <Text style={styles.cardTitle}>Sobriety Date & Day Counting</Text>
          </View>

          <Text style={styles.cardCopy}>
            If you do not set a date, NorthStar will not display any day streak. Recovery is about today.
          </Text>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>SOBRIETY DATE (OPTIONAL, YYYY-MM-DD or MM/DD/YYYY)</Text>
            <TextInput
              value={draft.sobrietyDate}
              onChangeText={v => setDraft(p => ({ ...p, sobrietyDate: v }))}
              placeholder="e.g. 2026-01-15 or leave blank"
              placeholderTextColor={C.muted}
              style={styles.fieldInput}
            />
          </View>

          {draft.sobrietyDate ? (
            <View style={styles.toggleRow}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={styles.toggleLabel}>Blur Clean Day Count</Text>
                <Text style={styles.toggleDesc}>
                  Obscures the number of clean days with a tap-to-reveal interaction. Highly recommended to eliminate milestone anxiety and prevent relapse triggers.
                </Text>
              </View>
              <Switch
                value={draft.blurSobrietyDays}
                onValueChange={val => setDraft(p => ({ ...p, blurSobrietyDays: val }))}
                trackColor={{ false: C.line, true: C.mintDark }}
                thumbColor={draft.blurSobrietyDays ? C.mint : C.muted}
              />
            </View>
          ) : null}
        </View>

        {/* Anonymous Ghost Mode */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="eye-off-outline" size={20} color={C.blue} />
            <Text style={styles.cardTitle}>Anonymous Ghost Mode</Text>
          </View>
          <View style={styles.toggleRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.toggleLabel}>Keep Profile Completely Private</Text>
              <Text style={styles.toggleDesc}>
                Hides your profile from public circle directories and disables any distance/location indicators.
              </Text>
            </View>
            <Switch
              value={draft.isAnonymous}
              onValueChange={val => setDraft(p => ({ ...p, isAnonymous: val }))}
              trackColor={{ false: C.line, true: C.blueDark }}
              thumbColor={draft.isAnonymous ? C.blue : C.muted}
            />
          </View>
        </View>

        <Pressable onPress={() => onSave(draft)} style={styles.fullSaveBtn}>
          <Ionicons name="checkmark-circle" size={20} color={C.ink} />
          <Text style={styles.fullSaveBtnText}>Save Profile Settings</Text>
        </Pressable>
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
  saveBtn: {
    backgroundColor: C.mint,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  saveBtnText: {
    color: C.ink,
    fontWeight: '900',
    fontSize: 13,
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  title: {
    color: C.warm,
    fontSize: 26,
    fontWeight: '900',
  },
  subtitle: {
    color: C.muted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: -8,
  },
  photoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    backgroundColor: C.surface,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  avatarWrap: {
    width: 76,
    height: 76,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: C.raised,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    flex: 1,
    backgroundColor: C.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: 32,
    fontWeight: '900',
    color: C.ink,
  },
  photoButtons: {
    flex: 1,
    gap: 8,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: C.raised,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.line,
  },
  actionPillText: {
    color: C.warm,
    fontSize: 12,
    fontWeight: '700',
  },
  actionPillDanger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: C.coralMuted,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  actionPillDangerText: {
    color: C.coral,
    fontSize: 12,
    fontWeight: '700',
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    color: C.muted,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  fieldInput: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: C.warm,
    fontSize: 15,
  },
  bioInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  choiceWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  choice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 10,
  },
  choiceActive: {
    backgroundColor: C.mint,
    borderColor: C.mint,
  },
  choiceText: {
    color: C.muted,
    fontWeight: '800',
    fontSize: 13,
  },
  choiceTextActive: {
    color: C.ink,
  },
  card: {
    backgroundColor: C.surface,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.cardBorder,
    gap: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardTitle: {
    color: C.warm,
    fontSize: 16,
    fontWeight: '800',
  },
  cardCopy: {
    color: C.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: C.line,
  },
  toggleLabel: {
    color: C.warm,
    fontSize: 14,
    fontWeight: '800',
  },
  toggleDesc: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
  fullSaveBtn: {
    backgroundColor: C.mint,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 10,
  },
  fullSaveBtnText: {
    color: C.ink,
    fontSize: 15,
    fontWeight: '900',
  },
});
