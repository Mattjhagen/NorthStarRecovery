import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../constants/colors';

const TABS = [
  { id: 'Today', label: 'Today', icon: 'home-outline', activeIcon: 'home' },
  { id: 'Meetings', label: 'Meetings', icon: 'compass-outline', activeIcon: 'compass' },
  { id: 'Learn', label: 'Learn', icon: 'sparkles-outline', activeIcon: 'sparkles' },
  { id: 'Calm', label: 'Calm', icon: 'headset-outline', activeIcon: 'headset' },
  { id: 'Circles', label: 'Circles', icon: 'people-outline', activeIcon: 'people' },
  { id: 'You', label: 'You', icon: 'person-outline', activeIcon: 'person' },
];

export default function TabBar({ activeTab, onSelectTab }) {
  return (
    <View style={styles.container}>
      {TABS.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <Pressable
            key={tab.id}
            onPress={() => onSelectTab(tab.id)}
            style={styles.tab}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <View style={[styles.iconWrapper, isActive && styles.iconActive]}>
              <Ionicons
                name={isActive ? tab.activeIcon : tab.icon}
                size={22}
                color={isActive ? C.mint : C.muted}
              />
            </View>
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 72,
    backgroundColor: '#121c2c',
    borderTopWidth: 1,
    borderTopColor: '#25354d',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 6,
    paddingBottom: 6,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 6,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 30,
    width: 30,
  },
  iconActive: {
    transform: [{ scale: 1.08 }],
  },
  tabLabel: {
    color: C.muted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    color: C.mint,
    fontWeight: '900',
  },
});
