import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { C } from '../constants/colors';

const SPLASH_MESSAGES = [
  'You are not alone in this fellowship.',
  'Every step forward counts, no matter how small.',
  "Courage doesn't always roar. Sometimes it shows up quietly.",
  'Today is a new beginning.',
  'Your story is still being written.',
  "Healing is not linear — and that's okay.",
  'You deserve a life you want to live.',
  'One day at a time is enough.',
  'There is room for you here.',
  'Recovery is possible. You are proof.',
];

export default function SplashScreen() {
  const [msgIndex, setMsgIndex] = useState(Math.floor(Math.random() * SPLASH_MESSAGES.length));
  const [fadeMsg, setFadeMsg] = useState(false);
  const starPulse = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.7)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const textFade = useRef(new Animated.Value(0)).current;
  const floatY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(textFade, {
      toValue: 1,
      duration: 900,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, { toValue: -10, duration: 2800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(floatY, { toValue: 0, duration: 2800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.parallel([
        Animated.timing(ringScale, { toValue: 1.8, duration: 2600, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(ringOpacity, { toValue: 0.45, duration: 900, useNativeDriver: true }),
          Animated.timing(ringOpacity, { toValue: 0, duration: 1700, useNativeDriver: true }),
        ]),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(starPulse, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        Animated.timing(starPulse, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
      ])
    ).start();

    const interval = setInterval(() => {
      setFadeMsg(true);
      setTimeout(() => {
        setMsgIndex(i => (i + 1) % SPLASH_MESSAGES.length);
        setFadeMsg(false);
      }, 600);
    }, 4200);

    return () => clearInterval(interval);
  }, [starPulse, ringScale, ringOpacity, textFade, floatY]);

  const iconColor = starPulse.interpolate({
    inputRange: [0, 1],
    outputRange: ['#5DE0A6', '#75B8FF'],
  });

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <View style={styles.bgGradient} />
      <View style={styles.bgAccent} />

      <Animated.View style={[styles.content, { opacity: textFade }]}>
        <View style={styles.logoWrap}>
          <Animated.View style={[styles.ring, { transform: [{ scale: ringScale }], opacity: ringOpacity }]} />
          <Animated.View style={[styles.iconOuter, { transform: [{ translateY: floatY }] }]}>
            <View style={styles.iconBg} />
            <Animated.Text style={[styles.iconStar, { color: iconColor }]}>✧</Animated.Text>
          </Animated.View>
        </View>

        <Animated.Text style={[styles.brand, { transform: [{ translateY: floatY }] }]}>
          NORTHSTAR
        </Animated.Text>
        <Text style={styles.tagline}>recovery, one steady step at a time</Text>

        <View style={styles.msgWrap}>
          <Text style={[styles.msg, fadeMsg && { opacity: 0.1 }]}>
            "{SPLASH_MESSAGES[msgIndex]}"
          </Text>
        </View>

        <View style={styles.dots}>
          {[0, 1, 2].map(i => (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  opacity: starPulse.interpolate({
                    inputRange: [0, 0.33, 0.66, 1],
                    outputRange: i === 0 ? [1, 0.3, 0.3, 1] : i === 1 ? [0.3, 1, 0.3, 0.3] : [0.3, 0.3, 1, 0.3],
                  }),
                },
              ]}
            />
          ))}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0a121e',
  },
  bgGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0a121e',
  },
  bgAccent: {
    position: 'absolute',
    top: '-20%',
    left: '-10%',
    right: '-10%',
    height: '70%',
    borderRadius: 500,
    backgroundColor: '#132342',
    opacity: 0.6,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 32,
  },
  logoWrap: {
    height: 130,
    width: 130,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  ring: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: C.mint,
  },
  iconOuter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBg: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(93, 224, 166, 0.14)',
  },
  iconStar: {
    fontSize: 48,
  },
  brand: {
    color: C.warm,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 4.5,
  },
  tagline: {
    color: C.muted,
    fontSize: 13,
    textAlign: 'center',
    letterSpacing: 0.4,
  },
  msgWrap: {
    borderTopWidth: 1,
    borderColor: '#1d2f4d',
    paddingTop: 24,
    alignItems: 'center',
    minHeight: 76,
    justifyContent: 'center',
    marginTop: 8,
  },
  msg: {
    color: C.warm,
    fontSize: 16,
    lineHeight: 25,
    textAlign: 'center',
    fontStyle: 'italic',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: C.mint,
  },
});
