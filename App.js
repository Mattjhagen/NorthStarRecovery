import 'react-native-get-random-values';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Animated, Easing, Linking, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TextInput, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { ErrorCode, useIAP } from 'expo-iap';
import { scheduleDemoInsight } from './notifications';
import { createAccount, confirmAccount, signInWithPassword, restoreSignedInUser, signOutEverywhere } from './auth';
import { apiRequest, isBackendConfigured } from './backend';

const C = { ink:'#101827', surface:'#192438', raised:'#233149', mint:'#5DE0A6', blue:'#75B8FF', warm:'#F4F1E8', muted:'#9DADC5', gold:'#F5B95D', line:'#34445d' };

const CF = process.env.EXPO_PUBLIC_CLOUDFRONT_SOUNDSCAPES || 'https://d10rkhd3bzdolj.cloudfront.net/soundscapes/';

const SOUNDSCAPES = [
  { name:'Binaural Breath & Echoes', category:'Ambient', icon:'headset-outline' },
  { name:'Bamboo Stillness', category:'Nature', icon:'leaf-outline' },
  { name:'Inner Stillness', category:'Ambient', icon:'radio-button-off-outline' },
  { name:'Infinite Stillness', category:'Ambient', icon:'infinite-outline' },
  { name:'Stillness', category:'Ambient', icon:'ellipse-outline' },
  { name:'Synthesized Stillness', category:'Ambient', icon:'pulse-outline' },
  { name:'Emerald Glade', category:'Nature', icon:'leaf' },
  { name:'Forest Flow', category:'Nature', icon:'leaf' },
  { name:'Sacred Grove', category:'Nature', icon:'flower-outline' },
  { name:'Verdant Breath', category:'Nature', icon:'flower' },
  { name:'Rain Veil', category:'Rain', icon:'rainy-outline' },
  { name:'Soft Night Rain', category:'Rain', icon:'rainy' },
  { name:'Soft Night Rainfall', category:'Rain', icon:'rainy' },
  { name:'Soft Night Rainfall (Loopable)', category:'Rain', icon:'rainy' },
  { name:'Seamless Loop Ambient Rainfall', category:'Rain', icon:'rainy-outline' },
  { name:'Seamlessly Loopable Soft Night Rain', category:'Rain', icon:'rainy-outline' },
  { name:'Steady Rainfall', category:'Rain', icon:'thunderstorm-outline' },
  { name:'Window Patter', category:'Rain', icon:'rainy-outline' },
  { name:'Distant Thunder', category:'Rain', icon:'thunderstorm' },
  { name:'Distant Rumble', category:'Atmospheric', icon:'cloudy-outline' },
  { name:'Expansive Void', category:'Atmospheric', icon:'planet-outline' },
  { name:'Glass Echoes in Orbit', category:'Atmospheric', icon:'planet' },
  { name:'The Deep Blanket', category:'Atmospheric', icon:'cloudy' },
  { name:'Submerged Comfort', category:'Atmospheric', icon:'water-outline' },
  { name:'Shadow Textures', category:'Atmospheric', icon:'moon-outline' },
  { name:'Chrome Velocity', category:'Electronic', icon:'flash-outline' },
  { name:'Copper Resonance', category:'Electronic', icon:'radio-outline' },
  { name:'Velvet Pulse', category:'Electronic', icon:'pulse' },
  { name:'Elevation', category:'Electronic', icon:'arrow-up-outline' },
];

const meetings = [
  { id:'m1', title:'Night Lanterns', time:'7:00 PM', format:'Remote', region:'Online · Central', language:'English', action:'Join room' },
  { id:'m2', title:'A New Direction', time:'6:15 PM', format:'In-person', region:'Austin · 2.1 mi', language:'English', action:'Directions' },
  { id:'m3', title:'Open Sky', time:'8:00 PM', format:'Hybrid', region:'Chicago · Lakeview', language:'English / Español', action:'Join room' },
  { id:'m4', title:'Day by Day', time:'9:00 PM', format:'Remote', region:'Online · Pacific', language:'English', action:'Join room' },
];
const modules = [
  { id:1, title:'Foundations', copy:'A kind introduction to taking the next right step.', xp:80, steps:['Set your intention','Name one support','Practice a pause'] },
  { id:2, title:'Your first meeting', copy:'Know what to expect before you walk in or join.', xp:120, steps:['Choose a format','Arrive your way','Reflect after'] },
  { id:3, title:'Building your circle', copy:'Small, consistent connections make a difference.', xp:160, steps:['Map your people','Send a check-in','Plan the week'] },
];
const supportProducts = [
  { id:'com.northstar.recovery.support.small', fallbackPrice:'$1.99' },
  { id:'com.northstar.recovery.support.medium', fallbackPrice:'$4.99' },
  { id:'com.northstar.recovery.support.large', fallbackPrice:'$9.99' },
];

// Map UI display values to API values
const GENDER_TO_API = { 'Woman':'woman','Man':'man','Nonbinary':'nonbinary','Prefer not to say':'prefer-not-to-say' };
const API_TO_GENDER = Object.fromEntries(Object.entries(GENDER_TO_API).map(([k,v])=>[v,k]));
const PREF_TO_API = { 'Women-only':'women','Men-only':'men','All groups':'all' };
const API_TO_PREF = Object.fromEntries(Object.entries(PREF_TO_API).map(([k,v])=>[v,k]));

function soundscapeUri(name) {
  return { uri: `${CF}${encodeURIComponent(name)}.wav` };
}

function Icon({ name, size=20, color=C.warm }) { return <Ionicons name={name} size={size} color={color} />; }
function Button({ label, onPress, kind='mint', icon }) { return <Pressable onPress={onPress} style={({pressed})=>[styles.button, kind==='dark'&&styles.buttonDark, pressed&&{opacity:.78}]}><Icon name={icon || 'arrow-forward'} size={17} color={kind==='mint'?C.ink:C.warm}/><Text style={[styles.buttonText,kind==='dark'&&{color:C.warm}]}>{label}</Text></Pressable>; }
function Card({ children, style }) { return <View style={[styles.card,style]}>{children}</View>; }
function Field({ label, value, onChange, placeholder, secure=false, autoCapitalize='none' }) { return <View style={styles.field}><Text style={styles.fieldLabel}>{label}</Text><TextInput value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={C.muted} secureTextEntry={secure} autoCapitalize={autoCapitalize} style={styles.fieldInput}/></View>; }
function Choice({ label, active, onPress }) { return <Pressable onPress={onPress} style={[styles.choice,active&&styles.choiceActive]}><Text style={[styles.choiceText,active&&styles.choiceTextActive]}>{label}</Text>{active&&<Icon name="checkmark" size={16} color={C.ink}/>}</Pressable>; }

export default function App() {
  // Auth state: 'loading' | 'onboarding' | 'authenticated'
  const [authState, setAuthState] = useState('loading');
  const [tab, setTab] = useState('Today');
  const [bell, setBell] = useState(false);
  const [toast, setToast] = useState('');
  const [editingProfile, setEditingProfile] = useState(false);
  const [profile, setProfile] = useState({ pseudonym:'', bio:'', photo:false, dob:'', gender:'', groupPreference:'All groups', sobrietyDate:'' });
  const [journalEntries, setJournalEntries] = useState([]);
  const [currentSoundscape, setCurrentSoundscape] = useState(SOUNDSCAPES[0]);

  const calmPlayer = useAudioPlayer(soundscapeUri(currentSoundscape.name));

  // Restore session on launch
  useEffect(() => {
    restoreSignedInUser().then(user => {
      setAuthState(user ? 'authenticated' : 'onboarding');
    }).catch(() => setAuthState('onboarding'));
  }, []);

  // Configure audio mode once
  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode:true, shouldPlayInBackground:true, interruptionMode:'duckOthers' });
  }, []);

  // Set loop when player changes
  useEffect(() => { calmPlayer.loop = true; }, [calmPlayer]);

  // Load profile from API when authenticated
  useEffect(() => {
    if (authState !== 'authenticated' || !isBackendConfigured()) return;
    apiRequest('/v1/me').then(data => {
      if (!data?.profile) return;
      const p = data.profile;
      setProfile(prev => ({
        ...prev,
        pseudonym: p.pseudonym || '',
        bio: p.bio || '',
        dob: p.dateOfBirth || '',
        gender: API_TO_GENDER[p.gender] || '',
        groupPreference: API_TO_PREF[p.groupPreference] || 'All groups',
        sobrietyDate: p.sobrietyDate || '',
      }));
    }).catch(() => {});
  }, [authState]);

  // Load journal from API when authenticated
  useEffect(() => {
    if (authState !== 'authenticated' || !isBackendConfigured()) return;
    apiRequest('/v1/journal').then(data => {
      if (!data?.entries?.length) return;
      setJournalEntries(data.entries.map(e => ({
        id: e.createdAt,
        body: e.text,
        mood: e.mood.charAt(0).toUpperCase() + e.mood.slice(1),
        date: new Date(e.createdAt).toLocaleDateString('en-US', { month:'long', day:'numeric' }),
      })));
    }).catch(() => {});
  }, [authState]);

  const say = (message) => { setToast(message); setTimeout(() => setToast(''), 2600); };
  const support = () => Alert.alert('Need support now?', 'This opens your phone app to contact urgent support. Northstar is not emergency care.', [{text:'Not now',style:'cancel'},{text:'Open phone',onPress:()=>Linking.openURL('tel:988')}]);

  const handleSignOut = () => Alert.alert('Sign out?', 'You\'ll need to sign in again to access your journal and profile.', [
    {text:'Cancel', style:'cancel'},
    {text:'Sign out', style:'destructive', onPress: async () => {
      await signOutEverywhere().catch(() => {});
      setProfile({ pseudonym:'', bio:'', photo:false, dob:'', gender:'', groupPreference:'All groups', sobrietyDate:'' });
      setJournalEntries([]);
      setAuthState('onboarding');
    }},
  ]);

  const saveProfile = async (next) => {
    setProfile(next);
    setEditingProfile(false);
    say('Profile saved.');
    if (!isBackendConfigured()) return;
    try {
      await apiRequest('/v1/me', {
        method: 'PUT',
        body: JSON.stringify({ profile: {
          pseudonym: next.pseudonym || undefined,
          bio: next.bio || undefined,
          dateOfBirth: next.dob || undefined,
          gender: GENDER_TO_API[next.gender] || undefined,
          groupPreference: PREF_TO_API[next.groupPreference] || undefined,
          sobrietyDate: next.sobrietyDate || undefined,
        }}),
      });
    } catch { say('Profile saved locally. Sync will retry.'); }
  };

  const addJournalEntry = async (entry) => {
    setJournalEntries(prev => [entry, ...prev]);
    if (!isBackendConfigured()) return;
    try {
      await apiRequest('/v1/journal', {
        method: 'POST',
        body: JSON.stringify({ text: entry.body, mood: entry.mood.toLowerCase(), createdAt: new Date().toISOString() }),
      });
    } catch { /* local copy already saved */ }
  };

  if (authState === 'loading') return <SplashScreen/>;

  if (authState === 'onboarding') return (
    <Onboarding onComplete={nextProfile => { setProfile(nextProfile); setAuthState('authenticated'); }}/>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light"/>
      <View style={styles.topo}/>
      <View style={styles.header}>
        <View><Text style={styles.brand}>NORTHSTAR</Text><Text style={styles.brandSub}>recovery, one steady step at a time</Text></View>
        <View style={styles.headerBtns}>
          <Pressable onPress={() => setBell(true)} style={styles.iconBtn}><Icon name="notifications-outline"/></Pressable>
          <Pressable onPress={support} style={styles.helpBtn}><Icon name="heart-outline" color={C.ink}/></Pressable>
        </View>
      </View>
      <View style={styles.body}>
        {tab==='Today' && <Today say={say} go={setTab} profile={profile}/>}
        {tab==='Meetings' && <Meetings say={say} profile={profile}/>}
        {tab==='Learn' && <Learn say={say}/>}
        <View style={[styles.calmTab, tab!=='Calm' && styles.hidden]}>
          <Calm player={calmPlayer} soundscape={currentSoundscape} soundscapes={SOUNDSCAPES} onSelectSoundscape={setCurrentSoundscape}/>
        </View>
        {tab==='Connect' && <Connect say={say}/>}
        {tab==='Journal' && <Journal say={say} entries={journalEntries} onAdd={addJournalEntry}/>}
        {tab==='You' && <You say={say} profile={profile} editProfile={() => setEditingProfile(true)} onSignOut={handleSignOut}/>}
      </View>
      <View style={styles.tabbar}>
        {[['Today','home-outline'],['Meetings','compass-outline'],['Connect','people-outline'],['Journal','book-outline'],['You','person-outline']].map(([label,icon]) =>
          <Pressable key={label} onPress={() => setTab(label)} style={styles.tab}>
            <Icon name={icon} size={22} color={tab===label ? C.mint : C.muted}/>
            <Text style={[styles.tabText, {fontSize:11}, tab===label && {color:C.mint}]}>{label}</Text>
          </Pressable>
        )}
      </View>
      <Modal visible={bell} transparent animationType="slide">
        <Pressable style={styles.modalBack} onPress={() => setBell(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.handle}/>
            <Text style={styles.sheetTitle}>A little ahead of you</Text>
            <Text style={styles.sheetCopy}>Your 7:00 PM meeting begins in 45 minutes. Reminders are gentle and private.</Text>
            <Button label="Got it" onPress={() => setBell(false)} icon="checkmark"/>
          </Pressable>
        </Pressable>
      </Modal>
      {toast ? <View style={styles.toast}><Icon name="checkmark-circle" color={C.mint}/><Text style={styles.toastText}>{toast}</Text></View> : null}
      <Modal visible={editingProfile} animationType="slide">
        <ProfileEditor profile={profile} onSave={saveProfile} onCancel={() => setEditingProfile(false)}/>
      </Modal>
    </SafeAreaView>
  );
}

const SPLASH_MESSAGES = [
  'You are not alone in this.',
  'Every step forward counts, no matter how small.',
  'Courage doesn\'t always roar. Sometimes it shows up quietly.',
  'Today is a new beginning.',
  'Your story is still being written.',
  'Healing is not linear — and that\'s okay.',
  'You deserve a life you want to live.',
  'One day at a time is enough.',
  'There is room for you here.',
  'Recovery is possible. You are proof.',
];

function SplashScreen() {
  const [msgIndex, setMsgIndex] = useState(Math.floor(Math.random() * SPLASH_MESSAGES.length));
  const [fadeMsg, setFadeMsg] = useState(false);
  const starPulse = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.7)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const textFade = useRef(new Animated.Value(0)).current;
  const floatY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in the whole thing
    Animated.timing(textFade, { toValue:1, duration:900, easing:Easing.out(Easing.quad), useNativeDriver:true }).start();
    // Gentle float loop
    Animated.loop(Animated.sequence([
      Animated.timing(floatY, { toValue:-10, duration:2800, easing:Easing.inOut(Easing.sin), useNativeDriver:true }),
      Animated.timing(floatY, { toValue:0, duration:2800, easing:Easing.inOut(Easing.sin), useNativeDriver:true }),
    ])).start();
    // Ripple ring
    Animated.loop(Animated.parallel([
      Animated.timing(ringScale, { toValue:1.8, duration:2600, easing:Easing.out(Easing.quad), useNativeDriver:true }),
      Animated.sequence([
        Animated.timing(ringOpacity, { toValue:0.45, duration:900, useNativeDriver:true }),
        Animated.timing(ringOpacity, { toValue:0, duration:1700, useNativeDriver:true }),
      ]),
    ])).start();
    // Star glow pulse
    Animated.loop(Animated.sequence([
      Animated.timing(starPulse, { toValue:1, duration:1800, easing:Easing.inOut(Easing.sin), useNativeDriver:false }),
      Animated.timing(starPulse, { toValue:0, duration:1800, easing:Easing.inOut(Easing.sin), useNativeDriver:false }),
    ])).start();
    // Cycle messages
    const interval = setInterval(() => {
      setFadeMsg(true);
      setTimeout(() => { setMsgIndex(i => (i + 1) % SPLASH_MESSAGES.length); setFadeMsg(false); }, 600);
    }, 4200);
    return () => clearInterval(interval);
  }, [starPulse, ringScale, ringOpacity, textFade, floatY]);

  const iconColor = starPulse.interpolate({ inputRange:[0,1], outputRange:['#5DE0A6','#75B8FF'] });

  return (
    <SafeAreaView style={styles.splashSafe}>
      <StatusBar style="light"/>
      {/* Deep radial background */}
      <View style={styles.splashBg}/>
      <View style={styles.splashBgAccent}/>
      {/* Floating star field dots */}
      {[[56,120],[80,290],[24,430],[140,180],[30,350],[160,80],[95,510],[48,600]].map(([x,y],i) => (
        <Animated.View key={i} style={[styles.splashStar, {left:x, top:y, opacity:starPulse.interpolate({inputRange:[0,1],outputRange:[0.2+i*0.06,0.7+i*0.04]})}]}/>
      ))}
      <Animated.View style={[styles.splashContent, {opacity:textFade}]}>
        {/* Logo cluster */}
        <View style={styles.splashLogoWrap}>
          <Animated.View style={[styles.splashRing, {transform:[{scale:ringScale}], opacity:ringOpacity}]}/>
          <Animated.View style={[styles.splashIconOuter, {transform:[{translateY:floatY}]}]}>
            <View style={styles.splashIconBg}/>
            <Animated.Text style={[styles.splashIcon, {color:iconColor}]}>✦</Animated.Text>
          </Animated.View>
        </View>
        <Animated.Text style={[styles.splashBrand, {transform:[{translateY:floatY}]}]}>NORTHSTAR</Animated.Text>
        <Text style={styles.splashTagline}>recovery, one steady step at a time</Text>
        {/* Cycling message */}
        <View style={styles.splashMsgWrap}>
          <Text style={[styles.splashMsg, fadeMsg && {opacity:0.1}]}>{SPLASH_MESSAGES[msgIndex]}</Text>
        </View>
        {/* Subtle dots loader */}
        <View style={styles.splashDots}>
          {[0,1,2].map(i => (
            <Animated.View key={i} style={[styles.splashDot, {opacity:starPulse.interpolate({inputRange:[0,0.33,0.66,1],outputRange:i===0?[1,0.3,0.3,1]:i===1?[0.3,1,0.3,0.3]:[0.3,0.3,1,0.3]})}]}/>
          ))}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

function ProfileEditor({ profile, onSave, onCancel }) {
  const [draft, setDraft] = useState(profile);
  return (
    <SafeAreaView style={styles.onboardSafe}>
      <ScrollView contentContainerStyle={styles.onboardScroll}>
        <View style={styles.rowBetween}><Pressable onPress={onCancel}><Icon name="close" color={C.warm}/></Pressable><Text style={styles.onboardKicker}>PROFILE & PRIVACY</Text></View>
        <Text style={styles.onboardTitle}>Only what feels right.</Text>
        <Text style={styles.onboardCopy}>Your pseudonym is what others may see — not your legal name. Recovery details stay private.</Text>
        <Field label="PSEUDONYM (OPTIONAL)" value={draft.pseudonym} onChange={v => setDraft(p => ({...p,pseudonym:v}))} placeholder="How should we know you?" autoCapitalize="words"/>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>BIO (OPTIONAL)</Text>
          <TextInput multiline value={draft.bio} onChangeText={v => setDraft(p => ({...p,bio:v}))} placeholder="A few words, if you want." placeholderTextColor={C.muted} style={[styles.fieldInput, styles.bioInput]}/>
        </View>
        <Field label="DATE OF BIRTH (OPTIONAL)" value={draft.dob} onChange={v => setDraft(p => ({...p,dob:v}))} placeholder="MM/DD/YYYY"/>
        <Text style={styles.fieldLabel}>GENDER (OPTIONAL)</Text>
        <View style={styles.choiceWrap}>{['Woman','Man','Nonbinary','Prefer not to say'].map(x => <Choice key={x} label={x} active={draft.gender===x} onPress={() => setDraft(p => ({...p,gender:x}))}/>)}</View>
        <Text style={styles.fieldLabel}>GROUP PREFERENCE</Text>
        <View style={styles.choiceWrap}>{['Women-only','Men-only','All groups'].map(x => <Choice key={x} label={x} active={draft.groupPreference===x} onPress={() => setDraft(p => ({...p,groupPreference:x}))}/>)}</View>
        <Field label="SOBRIETY DATE (OPTIONAL)" value={draft.sobrietyDate} onChange={v => setDraft(p => ({...p,sobrietyDate:v}))} placeholder="MM/DD/YYYY"/>
        <Button label="Save profile" onPress={() => onSave(draft)} icon="checkmark"/>
        <Pressable onPress={onCancel} style={styles.skip}><Text style={styles.textButtonLabel}>Cancel</Text></Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Onboarding({ onComplete }) {
  const [mode, setMode] = useState('welcome');
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [account, setAccount] = useState({ email:'', password:'' });
  const [code, setCode] = useState('');
  const [profile, setProfile] = useState({ pseudonym:'', bio:'', photo:false, dob:'', gender:'', groupPreference:'All groups', sobrietyDate:'' });
  const [message, setMessage] = useState('');

  const complete = () => onComplete(profile);

  const handleSignUp = async () => {
    if (!account.email.trim() || account.password.length < 8) return setMessage('Enter an email and a password with at least 8 characters.');
    setBusy(true); setMessage('');
    try {
      const result = await createAccount({ email: account.email, password: account.password });
      if (result.nextStep === 'CONFIRM_SIGN_UP') setMode('confirm');
      else complete();
    } catch (err) {
      setMessage(err.message || 'Account creation failed. Check your email and try again.');
    } finally { setBusy(false); }
  };

  const handleConfirm = async () => {
    if (code.trim().length < 4) return setMessage('Enter the 6-digit code from your email.');
    setBusy(true); setMessage('');
    try {
      await confirmAccount({ email: account.email, code });
      await signInWithPassword({ email: account.email, password: account.password });
      setMode('profile');
    } catch (err) {
      setMessage(err.message || 'Code not accepted. Check your email and try again.');
    } finally { setBusy(false); }
  };

  const handleSignIn = async () => {
    if (!account.email.trim() || !account.password) return setMessage('Enter your email and password.');
    setBusy(true); setMessage('');
    try {
      const result = await signInWithPassword({ email: account.email, password: account.password });
      if (!result.complete) return setMessage('Additional sign-in step required. Please contact support.');
      complete();
    } catch (err) {
      setMessage(err.message || 'Sign-in failed. Check your email and password.');
    } finally { setBusy(false); }
  };

  if (mode === 'welcome') return (
    <SafeAreaView style={styles.onboardSafe}>
      <StatusBar style="light"/>
      <View style={styles.onboardStar}><Icon name="compass" size={40} color={C.mint}/></View>
      <View style={styles.welcomeBody}>
        <Text style={styles.brand}>NORTHSTAR</Text>
        <Text style={styles.welcomeTitle}>A quiet place to find your way back.</Text>
        <Text style={styles.welcomeCopy}>Support, reflection, and connection — at a pace that belongs to you.</Text>
      </View>
      <View style={styles.welcomeBottom}>
        <Button label="Create an account" onPress={() => setMode('create')} icon="arrow-forward"/>
        <Pressable onPress={() => setMode('signin')} style={styles.textButton}>
          <Text style={styles.textButtonLabel}>I already have an account</Text>
          <Icon name="arrow-forward" size={16} color={C.mint}/>
        </Pressable>
      </View>
    </SafeAreaView>
  );

  if (mode === 'signin') return (
    <SafeAreaView style={styles.onboardSafe}>
      <ScrollView contentContainerStyle={styles.onboardScroll}>
        <Pressable onPress={() => setMode('welcome')}><Icon name="arrow-back" color={C.warm}/></Pressable>
        <Text style={styles.onboardKicker}>WELCOME BACK</Text>
        <Text style={styles.onboardTitle}>Your space is here.</Text>
        <Field label="EMAIL" value={account.email} onChange={v => setAccount(a => ({...a,email:v}))} placeholder="you@example.com"/>
        <Field label="PASSWORD" value={account.password} onChange={v => setAccount(a => ({...a,password:v}))} placeholder="••••••••" secure/>
        {message ? <Text style={styles.statusNote}>{message}</Text> : null}
        <Button label={busy ? 'Signing in…' : 'Sign in'} onPress={busy ? undefined : handleSignIn} icon="log-in-outline"/>
        <Pressable onPress={() => setMode('create')} style={styles.textButton}>
          <Text style={styles.textButtonLabel}>New here? Create an account</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );

  if (mode === 'confirm') return (
    <SafeAreaView style={styles.onboardSafe}>
      <ScrollView contentContainerStyle={styles.onboardScroll}>
        <Text style={styles.onboardKicker}>CHECK YOUR EMAIL</Text>
        <Text style={styles.onboardTitle}>One more step.</Text>
        <Text style={styles.onboardCopy}>We sent a 6-digit code to {account.email}. Enter it below to confirm your account.</Text>
        <Field label="CONFIRMATION CODE" value={code} onChange={setCode} placeholder="123456"/>
        {message ? <Text style={styles.statusNote}>{message}</Text> : null}
        <Button label={busy ? 'Confirming…' : 'Confirm account'} onPress={busy ? undefined : handleConfirm} icon="checkmark-circle"/>
        <Pressable onPress={() => { setMode('create'); setCode(''); setMessage(''); }} style={styles.textButton}>
          <Text style={styles.textButtonLabel}>Back</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );

  if (mode === 'profile') return (
    <SafeAreaView style={styles.onboardSafe}>
      <ScrollView contentContainerStyle={styles.onboardScroll}>
        <Text style={styles.onboardKicker}>WELCOME TO NORTHSTAR</Text>
        <Text style={styles.onboardTitle}>Tell us a little about you.</Text>
        <Text style={styles.onboardCopy}>All optional. Only your pseudonym may be visible to other members — recovery details stay private.</Text>
        <Field label="PSEUDONYM (OPTIONAL)" value={profile.pseudonym} onChange={v => setProfile(p => ({...p,pseudonym:v}))} placeholder="How should we know you?" autoCapitalize="words"/>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>BIO (OPTIONAL)</Text>
          <TextInput multiline value={profile.bio} onChangeText={v => setProfile(p => ({...p,bio:v}))} placeholder="A few words, if you want." placeholderTextColor={C.muted} style={[styles.fieldInput, styles.bioInput]}/>
        </View>
        <Field label="DATE OF BIRTH (OPTIONAL)" value={profile.dob} onChange={v => setProfile(p => ({...p,dob:v}))} placeholder="MM/DD/YYYY"/>
        <Text style={styles.fieldLabel}>GENDER (OPTIONAL)</Text>
        <View style={styles.choiceWrap}>{['Woman','Man','Nonbinary','Prefer not to say'].map(x => <Choice key={x} label={x} active={profile.gender===x} onPress={() => setProfile(p => ({...p,gender:x}))}/>)}</View>
        <Text style={styles.fieldLabel}>GROUP PREFERENCE</Text>
        <View style={styles.choiceWrap}>{['Women-only','Men-only','All groups'].map(x => <Choice key={x} label={x} active={profile.groupPreference===x} onPress={() => setProfile(p => ({...p,groupPreference:x}))}/>)}</View>
        <Field label="SOBRIETY DATE (OPTIONAL)" value={profile.sobrietyDate} onChange={v => setProfile(p => ({...p,sobrietyDate:v}))} placeholder="MM/DD/YYYY"/>
        <Button label="Enter Northstar" onPress={complete} icon="sparkles"/>
        <Pressable onPress={complete} style={styles.skip}><Text style={styles.textButtonLabel}>Skip for now</Text></Pressable>
      </ScrollView>
    </SafeAreaView>
  );

  // Create account: step 0 = credentials
  return (
    <SafeAreaView style={styles.onboardSafe}>
      <ScrollView contentContainerStyle={styles.onboardScroll}>
        <Pressable onPress={() => setMode('welcome')}><Icon name="arrow-back" color={C.warm}/></Pressable>
        <Text style={styles.onboardKicker}>CREATE ACCOUNT</Text>
        <Text style={styles.onboardTitle}>A secure beginning.</Text>
        <Text style={styles.onboardCopy}>Your email is used only for account access and recovery. It is never shown to other members.</Text>
        <Field label="EMAIL" value={account.email} onChange={v => setAccount(a => ({...a,email:v}))} placeholder="you@example.com"/>
        <Field label="PASSWORD" value={account.password} onChange={v => setAccount(a => ({...a,password:v}))} placeholder="At least 8 characters" secure/>
        {message ? <Text style={styles.statusNote}>{message}</Text> : null}
        <Button label={busy ? 'Creating account…' : 'Continue'} onPress={busy ? undefined : handleSignUp} icon="arrow-forward"/>
        <Pressable onPress={() => setMode('signin')} style={styles.textButton}>
          <Text style={styles.textButtonLabel}>Already have an account? Sign in</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Journal({ say, entries, onAdd }) {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState('');
  const [mood, setMood] = useState('Steady');
  const save = () => {
    if (!body.trim()) return say('Write a few words before keeping this entry.');
    const entry = { id: Date.now(), body: body.trim(), mood, date: new Date().toLocaleDateString('en-US', { month:'long', day:'numeric' }) };
    onAdd(entry);
    setBody(''); setOpen(false); say('Entry saved.');
  };
  return (
    <ScrollView contentContainerStyle={[styles.scroll, styles.journalScroll]}>
      <Text style={styles.eyebrow}>PRIVATE · NEVER SHOWN IN COMMUNITY</Text>
      <Text style={styles.h1}>Your journal</Text>
      <Text style={styles.intro}>A place for what is yours. Entries are separate from Connect.</Text>
      <Pressable onPress={() => setOpen(true)} style={styles.journalNew}>
        <Icon name="create-outline" color={C.ink}/>
        <Text style={styles.composeText}>Write an entry</Text>
      </Pressable>
      {entries.length === 0 ? (
        <View style={styles.journalEmpty}>
          <Icon name="book-outline" size={34} color={C.gold}/>
          <Text style={styles.cardTitle}>The page is open.</Text>
          <Text style={[styles.muted, {textAlign:'center'}]}>No streaks to keep. No right way to begin.</Text>
        </View>
      ) : entries.map(entry => (
        <View key={entry.id} style={styles.journalEntry}>
          <View style={styles.rowBetween}>
            <Text style={styles.mini}>{typeof entry.date === 'string' ? entry.date.toUpperCase() : entry.date}</Text>
            <Text style={styles.journalMood}>{entry.mood}</Text>
          </View>
          <Text style={styles.journalBody}>{entry.body}</Text>
        </View>
      ))}
      <Modal visible={open} transparent animationType="slide">
        <View style={styles.modalBack}>
          <View style={[styles.sheet, styles.journalSheet]}>
            <View style={styles.handle}/>
            <View style={styles.rowBetween}>
              <Text style={styles.sheetTitle}>A private page</Text>
              <Pressable onPress={() => setOpen(false)}><Icon name="close" color={C.muted}/></Pressable>
            </View>
            <Text style={styles.sheetCopy}>Entries are encrypted and belong only to you.</Text>
            <Text style={styles.fieldLabel}>HOW DOES THIS MOMENT FEEL?</Text>
            <View style={styles.moodRow}>{['Heavy','Tender','Steady','Hopeful'].map(x => <Choice key={x} label={x} active={mood===x} onPress={() => setMood(x)}/>)}</View>
            <TextInput value={body} onChangeText={setBody} multiline autoFocus placeholder="There is room for the honest version…" placeholderTextColor={C.muted} style={styles.journalInput}/>
            <Button label="Keep entry" onPress={save} icon="bookmark-outline"/>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function Today({ say, go, profile }) {
  const name = profile.pseudonym || 'friend';
  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <Text style={styles.eyebrow}>A GENTLE START</Text>
      <Text style={styles.h1}>Good evening, {name}.</Text>
      <Text style={styles.intro}>You don't have to do the whole journey tonight. Just this moment.</Text>
      <Card style={styles.streak}><View><Text style={styles.mini}>YOUR CLEAR DAY STREAK</Text><Text style={styles.streakNum}>14 <Text style={styles.streakUnit}>days</Text></Text><Text style={styles.muted}>A quiet streak, a real win.</Text></View><View style={styles.sun}><Icon name="sunny" size={30} color={C.gold}/></View></Card>
      <Card><View style={styles.rowBetween}><View><Text style={styles.mini}>NEXT MEETING</Text><Text style={styles.cardTitle}>Night Lanterns</Text><Text style={styles.muted}>Remote · 7:00 PM · starts in 45 min</Text></View><View style={styles.remote}><Icon name="videocam-outline" color={C.mint}/></View></View><Button label="Join room" onPress={() => say('Room link ready — demo only')} icon="videocam"/></Card>
      <Text style={styles.quote}>"A little connection can change the shape of a whole evening."</Text>
      <View style={styles.actionRow}>
        <Pressable style={styles.quick} onPress={() => go('Meetings')}><Icon name="compass-outline" color={C.blue}/><Text style={styles.quickText}>Find a meeting</Text></Pressable>
        <Pressable style={styles.quick} onPress={() => go('Journal')}><Icon name="book-outline" color={C.gold}/><Text style={styles.quickText}>Write privately</Text></Pressable>
      </View>
      <Card><Text style={styles.mini}>MORE WAYS IN</Text>
        <Pressable onPress={() => go('Connect')} style={styles.inlineAction}><Icon name="chatbubbles-outline" color={C.mint}/><Text style={styles.inlineText}>Connection, gently</Text></Pressable>
        <Pressable onPress={() => go('Learn')} style={styles.inlineAction}><Icon name="sparkles-outline" color={C.gold}/><Text style={styles.inlineText}>Learn by living it</Text></Pressable>
        <Pressable onPress={() => go('Calm')} style={styles.inlineAction}><Icon name="headset-outline" color={C.blue}/><Text style={styles.inlineText}>Calm soundscapes</Text></Pressable>
      </Card>
      <Pressable style={styles.support} onPress={() => Alert.alert('Need support now?', 'Northstar can open a phone/urgent-support path. It is not emergency care.', [{text:'OK'}])}>
        <Icon name="heart" size={17} color={C.gold}/><Text style={styles.supportText}>Need support now?</Text><Icon name="call-outline" size={16} color={C.gold}/>
      </Pressable>
    </ScrollView>
  );
}

function Meetings({ say, profile }) {
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const shown = useMemo(() => meetings.filter(m => (filter==='All' || m.format===filter) && `${m.title} ${m.region} ${m.format}`.toLowerCase().includes(query.toLowerCase())), [filter, query]);
  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Text style={styles.h1}>Find your room</Text>
      <Text style={styles.intro}>Choose what feels possible today.</Text>
      {profile.groupPreference !== 'All groups' && <View style={styles.preferenceNote}><Icon name="options-outline" size={16} color={C.mint}/><Text style={styles.preferenceText}>Your preference: {profile.groupPreference}.</Text></View>}
      <View style={styles.location}><Icon name="location-outline" color={C.mint}/><Text style={styles.locationText}>Near Austin, Texas</Text><Text style={styles.change}>Change</Text></View>
      <View style={styles.search}><Icon name="search-outline" color={C.muted}/><TextInput value={query} onChangeText={setQuery} placeholder="Search meetings or places" placeholderTextColor={C.muted} style={styles.input}/></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.segmentScroll}>{['All','Remote','In-person','Hybrid'].map(x => <Pressable key={x} onPress={() => setFilter(x)} style={[styles.segment, filter===x && styles.segmentActive]}><Text style={[styles.segmentText, filter===x && styles.segmentTextActive]}>{x}</Text></Pressable>)}</ScrollView>
      <Text style={styles.results}>{shown.length} rooms for tonight</Text>
      {shown.map(m => <Card key={m.id} style={styles.meeting}><View style={styles.time}><Text style={styles.timeText}>{m.time}</Text><Text style={styles.timeZone}>local</Text></View><View style={{flex:1}}><Text style={styles.cardTitle}>{m.title}</Text><Text style={styles.meetingMeta}>{m.format} · {m.region}</Text><Text style={styles.muted}>{m.language}</Text><Pressable onPress={() => say(m.action==='Directions' ? 'Opening directions — demo only' : 'Room link ready — demo only')} style={styles.inlineAction}><Text style={styles.inlineText}>{m.action}</Text><Icon name={m.action==='Directions' ? 'navigate-outline' : 'arrow-forward'} size={16} color={C.mint}/></Pressable></View></Card>)}
      {!shown.length && <Card style={styles.empty}><Icon name="search-outline" size={26} color={C.muted}/><Text style={styles.cardTitle}>No rooms match yet</Text><Text style={styles.muted}>Try another format or search term.</Text></Card>}
    </ScrollView>
  );
}

function Learn({ say }) {
  const [complete, setComplete] = useState(1);
  const [open, setOpen] = useState(complete);
  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Text style={styles.h1}>Learn by living it</Text>
      <Text style={styles.intro}>Tiny chapters. Practical ideas. No pressure to rush.</Text>
      <Card style={styles.xp}><View><Text style={styles.mini}>YOUR NORTHSTAR PATH</Text><Text style={styles.xpNum}>{complete*80} XP <Text style={styles.xpSmall}>earned</Text></Text></View><Icon name="sparkles" size={32} color={C.gold}/></Card>
      {modules.map((m, i) => {
        const locked = i+1 > complete+1, done = i+1 <= complete, isOpen = open === m.id;
        return (
          <Card key={m.id} style={[styles.module, locked && {opacity:.56}]}>
            <Pressable disabled={locked} onPress={() => setOpen(isOpen ? 0 : m.id)}>
              <View style={styles.rowBetween}><View style={[styles.moduleDot, done && {backgroundColor:C.mint}]}><Icon name={done ? 'checkmark' : 'lock-closed'} size={16} color={done ? C.ink : C.muted}/></View><View style={{flex:1}}><Text style={styles.cardTitle}>{m.title}</Text><Text style={styles.muted}>{done ? 'Complete · ' : locked ? 'Next up · ' : 'Ready · '}{m.xp} XP</Text></View><Icon name={isOpen ? 'chevron-up' : 'chevron-down'} color={C.muted}/></View>
            </Pressable>
            {isOpen && <View style={styles.moduleDetail}><Text style={styles.moduleCopy}>{m.copy}</Text>{m.steps.map(s => <Text key={s} style={styles.step}>• {s}</Text>)}<Button label={done ? 'Review module' : 'Continue'} onPress={() => { if(!done) setComplete(m.id); say(done ? 'Module opened for review' : `${m.title} complete — ${m.xp} XP earned`); }} icon={done ? 'refresh' : 'play'}/></View>}
          </Card>
        );
      })}
    </ScrollView>
  );
}

function Calm({ player, soundscape, soundscapes, onSelectSoundscape }) {
  const status = useAudioPlayerStatus(player);
  const [minutes, setMinutes] = useState(10);
  const [remaining, setRemaining] = useState(10 * 60);
  const [visual, setVisual] = useState('Breath');
  const [breathing, setBreathing] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState('All');
  const isPlaying = status.playing;

  useEffect(() => { setRemaining(minutes * 60); }, [minutes]);
  useEffect(() => {
    if (!isPlaying || remaining === 0) return undefined;
    const timer = setInterval(() => setRemaining(v => v > 0 ? v - 1 : 0), 1000);
    return () => clearInterval(timer);
  }, [isPlaying, remaining]);
  useEffect(() => { if (remaining === 0 && isPlaying) player.pause(); }, [remaining, isPlaying, player]);

  const togglePlayback = () => {
    if (isPlaying) player.pause();
    else { if (remaining === 0) setRemaining(minutes * 60); player.play(); }
  };
  const setSession = value => { player.pause(); player.seekTo(0); setMinutes(value); };

  const handleSelectSoundscape = (s) => {
    player.pause();
    onSelectSoundscape(s);
    setPickerOpen(false);
    setRemaining(minutes * 60);
  };

  const display = `${String(Math.floor(remaining / 60)).padStart(2,'0')}:${String(remaining % 60).padStart(2,'0')}`;
  const categories = ['All', ...new Set(soundscapes.map(s => s.category))];
  const filtered = filterCategory === 'All' ? soundscapes : soundscapes.filter(s => s.category === filterCategory);

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <Text style={styles.eyebrow}>A QUIET PLACE TO RESET</Text>
      <Text style={styles.h1}>Take a calm moment.</Text>
      <Card style={styles.playerCard}>
        <LoopVisual visual={visual}/>
        <Text style={styles.cardTitle}>{soundscape.name}</Text>
        <Text style={styles.muted}>{soundscape.category} · headphones recommended</Text>
        <Text style={styles.timer}>{display}</Text>
        <Pressable onPress={togglePlayback} style={styles.playButton}>
          <Icon name={isPlaying ? 'pause' : 'play'} size={26} color={C.ink}/>
          <Text style={styles.playText}>{isPlaying ? 'Pause session' : 'Begin session'}</Text>
        </Pressable>
      </Card>
      <Pressable onPress={() => setPickerOpen(true)} style={styles.soundscapePicker}>
        <Icon name="musical-notes-outline" color={C.mint}/>
        <Text style={styles.soundscapePickerText}>Choose soundscape ({soundscapes.length} available)</Text>
        <Icon name="chevron-forward" size={16} color={C.muted}/>
      </Pressable>
      <Text style={styles.sectionTitle}>VISUAL LOOP</Text>
      <View style={styles.visualRow}>{[['Breath','ellipse-outline'],['Night','moon-outline'],['Waves','water-outline']].map(([name,icon]) => <Pressable key={name} onPress={() => setVisual(name)} style={[styles.visualChoice, visual===name && styles.visualChoiceActive]}><Icon name={icon} size={18} color={visual===name ? C.ink : C.muted}/><Text style={[styles.visualText, visual===name && styles.visualTextActive]}>{name}</Text></Pressable>)}</View>
      <Pressable onPress={() => setBreathing(true)} style={styles.breatheStart}><Icon name="expand-outline" color={C.ink}/><Text style={styles.breatheStartText}>Try circle breathing</Text></Pressable>
      <Text style={styles.sectionTitle}>SESSION LENGTH</Text>
      <View style={styles.sessionRow}>{[5,10,20].map(value => <Pressable key={value} onPress={() => setSession(value)} style={[styles.session, minutes===value && styles.sessionActive]}><Text style={[styles.sessionText, minutes===value && styles.sessionTextActive]}>{value} min</Text></Pressable>)}</View>
      <Card><View style={styles.row}><Icon name="ear-outline" size={25} color={C.gold}/><View style={{flex:1}}><Text style={styles.cardTitle}>Best with headphones</Text><Text style={styles.muted}>Binaural audio uses subtle differences between channels. Keep the volume comfortable.</Text></View></View></Card>
      <Modal visible={breathing} transparent animationType="fade">
        <Pressable style={styles.modalBack} onPress={() => setBreathing(false)}>
          <Pressable style={[styles.sheet, styles.breathSheet]} onPress={() => {}}>
            <View style={styles.handle}/><Text style={styles.sheetTitle}>Circle breathing</Text><Text style={styles.sheetCopy}>Follow the circle at a pace that feels comfortable.</Text><BreathingGuide/><Button label="Finish" onPress={() => setBreathing(false)} icon="checkmark"/>
          </Pressable>
        </Pressable>
      </Modal>
      <Modal visible={pickerOpen} animationType="slide">
        <SafeAreaView style={[styles.safe, {backgroundColor:'#141f31'}]}>
          <View style={[styles.header, {height:60}]}>
            <Text style={styles.sheetTitle}>Choose a soundscape</Text>
            <Pressable onPress={() => setPickerOpen(false)}><Icon name="close" color={C.warm}/></Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.segmentScroll, {paddingHorizontal:16, marginBottom:8}]}>
            {categories.map(c => <Pressable key={c} onPress={() => setFilterCategory(c)} style={[styles.segment, filterCategory===c && styles.segmentActive, {marginRight:7}]}><Text style={[styles.segmentText, filterCategory===c && styles.segmentTextActive]}>{c}</Text></Pressable>)}
          </ScrollView>
          <ScrollView contentContainerStyle={{padding:16, gap:8}}>
            {filtered.map(s => (
              <Pressable key={s.name} onPress={() => handleSelectSoundscape(s)} style={[styles.soundscapeRow, s.name===soundscape.name && styles.soundscapeRowActive]}>
                <Icon name={s.icon} size={20} color={s.name===soundscape.name ? C.ink : C.mint}/>
                <View style={{flex:1}}>
                  <Text style={[styles.cardTitle, s.name===soundscape.name && {color:C.ink}]}>{s.name}</Text>
                  <Text style={[styles.muted, s.name===soundscape.name && {color:'#1a4a3a'}]}>{s.category}</Text>
                </View>
                {s.name===soundscape.name && <Icon name="checkmark-circle" size={20} color={C.ink}/>}
              </Pressable>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </ScrollView>
  );
}

function BreathingGuide() {
  const pulse = useRef(new Animated.Value(.72)).current;
  const [phase, setPhase] = useState('Breathe in');
  useEffect(() => {
    const steps = [['Breathe in',1.16],['Hold',1.16],['Breathe out',.72],['Hold',.72]];
    let index = 0;
    const run = () => { const [label,scale]=steps[index]; setPhase(label); Animated.timing(pulse,{toValue:scale,duration:4000,easing:Easing.inOut(Easing.sin),useNativeDriver:true}).start(); index=(index+1)%steps.length; };
    run(); const interval = setInterval(run, 4000); return () => clearInterval(interval);
  }, [pulse]);
  return <View style={styles.breathGuide}><Animated.View style={[styles.breathGuideOuter,{transform:[{scale:pulse}]}]}/><Animated.View style={[styles.breathGuideInner,{transform:[{scale:Animated.multiply(pulse,.66)}]}]}/><View style={styles.breathGuideCenter}><Icon name="leaf" size={28} color={C.mint}/><Text style={styles.breathPhase}>{phase}</Text><Text style={styles.breathCount}>4 seconds</Text></View></View>;
}

function LoopVisual({ visual }) {
  const phase = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.timing(phase,{toValue:1,duration:visual==='Waves'?4200:6200,easing:Easing.inOut(Easing.sin),useNativeDriver:true}));
    loop.start(); return () => loop.stop();
  }, [phase, visual]);
  const float = phase.interpolate({inputRange:[0,.5,1],outputRange:[-10,10,-10]});
  const expand = phase.interpolate({inputRange:[0,.5,1],outputRange:[.8,1.12,.8]});
  const drift = phase.interpolate({inputRange:[0,.5,1],outputRange:[-42,42,-42]});
  if (visual==='Night') return <View style={[styles.visualStage,styles.visualNight]}><Animated.View style={[styles.moon,{transform:[{translateY:float}]}]}/><Animated.View style={[styles.star,styles.starOne,{transform:[{scale:expand}]}]}/><Animated.View style={[styles.star,styles.starTwo,{transform:[{translateY:float}]}]}/><Animated.View style={[styles.star,styles.starThree,{transform:[{scale:expand}]}]}/></View>;
  if (visual==='Waves') return <View style={[styles.visualStage,styles.visualWaves]}><Animated.View style={[styles.wave,styles.waveBack,{transform:[{translateX:drift}]}]}/><Animated.View style={[styles.wave,styles.waveFront,{transform:[{translateX:Animated.multiply(drift,-1)}]}]}/><Icon name="water" size={29} color="#B8E9F0"/></View>;
  return <View style={[styles.visualStage,styles.visualBreath]}><Animated.View style={[styles.breathRing,styles.breathRingOuter,{transform:[{scale:expand}]}]}/><Animated.View style={[styles.breathRing,styles.breathRingInner,{transform:[{scale:Animated.multiply(expand,.68)}]}]}/><Icon name="leaf" size={31} color={C.mint}/></View>;
}

const boardSeed = [
  {id:'p1',author:'Maya R.',initial:'M',category:'CHECK-IN',time:'18 minutes ago',body:'Today I called someone before I talked myself out of it. That was enough.',bio:'Finding my footing one honest conversation at a time.',comments:[{id:'c1',author:'Sage',body:'That took courage. I\'m glad you reached out.'}]},
  {id:'p2',author:'Jonah L.',initial:'J',category:'QUESTION',time:'42 minutes ago',body:'What helps you make it through the first hour when a hard feeling shows up?',bio:'Here to listen, learn, and offer a little steadiness.',comments:[]},
  {id:'p3',author:'River',initial:'R',category:'STORY',time:'Yesterday',body:'I went to a meeting even though I wanted to disappear. I left feeling a little less alone.',bio:'Quietly rebuilding a life I want to be present for.',comments:[{id:'c2',author:'Maya R.',body:'Thank you for sharing this. You helped me remember I can go too.'}]},
];

function Connect({ say }) {
  const [posts, setPosts] = useState(boardSeed);
  const [blocked, setBlocked] = useState([]);
  const [compose, setCompose] = useState(false);
  const [postSheet, setPostSheet] = useState(null);
  const [member, setMember] = useState(null);
  const [dm, setDm] = useState(null);
  const [category, setCategory] = useState('Question');
  const [draft, setDraft] = useState('');
  const [comment, setComment] = useState('');
  const visiblePosts = posts.filter(post => !blocked.includes(post.author));
  const blockMember = author => Alert.alert(`Block ${author}?`, 'Their posts and comments will be hidden.', [{text:'Cancel',style:'cancel'},{text:'Block member',style:'destructive',onPress:()=>{setBlocked(b=>[...b,author]);setMember(null);setPostSheet(null);say(`${author} is now hidden.`);}}]);
  const publish = () => { if (!draft.trim()) return say('Write a little before sharing.'); setPosts(p => [{id:`local-${Date.now()}`,author:'You',initial:'Y',category:category.toUpperCase(),time:'Just now',body:draft.trim(),bio:'',comments:[]},...p]); setDraft(''); setCompose(false); say('Shared with the circle.'); };
  const addComment = () => { if (!comment.trim() || !postSheet) return; const c = {id:`local-${Date.now()}`,author:'You',body:comment.trim()}; setPosts(p=>p.map(x=>x.id===postSheet.id?{...x,comments:[...x.comments,c]}:x)); setPostSheet(x=>({...x,comments:[...x.comments,c]})); setComment(''); say('Comment added.'); };
  const memberSheet = member && (
    <Modal visible transparent animationType="slide">
      <Pressable style={styles.modalBack} onPress={() => setMember(null)}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle}/>
          <View style={styles.memberHero}><View style={styles.memberAvatar}><Text style={styles.bigAvatarText}>{member.initial}</Text></View><View style={{flex:1}}><Text style={styles.sheetTitle}>{member.author}</Text><Text style={styles.muted}>Member profile</Text></View></View>
          <Text style={styles.sheetCopy}>{member.bio || 'No bio.'}</Text>
          <View style={styles.profileSafety}><Icon name="shield-checkmark-outline" color={C.mint}/><Text style={styles.profileSafetyText}>Only chosen bio appears here. Recovery details stay private.</Text></View>
          <Button label="Message privately" onPress={() => { setMember(null); setDm(member); }} icon="chatbubble-outline"/>
          <Pressable style={styles.dangerAction} onPress={() => blockMember(member.author)}><Icon name="eye-off-outline" color={C.gold}/><Text style={styles.dangerText}>Block member</Text></Pressable>
          <Pressable style={styles.reportAction} onPress={() => Alert.alert('Report concern','Moderation reporting is being connected to a staffed review queue.')}><Icon name="flag-outline" color={C.muted}/><Text style={styles.muted}>Report concern</Text></Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Text style={styles.eyebrow}>PRIVATE COMMUNITY</Text>
      <Text style={styles.h1}>The circle</Text>
      <Text style={styles.intro}>Questions, stories, and small truths — held with care.</Text>
      <View style={styles.standard}><Icon name="shield-checkmark" color={C.mint}/><Text style={styles.standardText}>No advice as authority. No pressure to share. If someone feels unsafe, block and report.</Text></View>
      <Pressable style={styles.compose} onPress={() => setCompose(true)}><Icon name="create-outline" color={C.ink}/><Text style={styles.composeText}>Share with the circle</Text></Pressable>
      {visiblePosts.map(post => (
        <Card key={post.id} style={styles.boardPost}>
          <View style={styles.rowBetween}><Text style={styles.topic}>{post.category}</Text><Text style={styles.postTime}>{post.time}</Text></View>
          <View style={styles.postHead}><Pressable onPress={() => setMember(post)} style={styles.avatar}><Text style={styles.avatarText}>{post.initial}</Text></Pressable><Pressable onPress={() => setMember(post)}><Text style={styles.cardTitle}>{post.author}</Text><Text style={styles.tapHint}>Tap to view profile</Text></Pressable></View>
          <Pressable onPress={() => setPostSheet(post)}><Text style={styles.postText}>{post.body}</Text></Pressable>
          <Pressable onPress={() => setPostSheet(post)} style={styles.commentAction}><Icon name="chatbubble-ellipses-outline" color={C.mint}/><Text style={styles.commentActionText}>{post.comments.length} {post.comments.length===1?'comment':'comments'} · join gently</Text><Icon name="chevron-forward" size={15} color={C.muted}/></Pressable>
        </Card>
      ))}
      {visiblePosts.length === 0 && <View style={styles.boardEmpty}><Icon name="shield-outline" size={31} color={C.mint}/><Text style={styles.cardTitle}>Your circle is quiet.</Text><Text style={[styles.muted,{textAlign:'center'}]}>Blocked members are hidden.</Text></View>}
      <Modal visible={compose} transparent animationType="slide">
        <Pressable style={styles.modalBack} onPress={() => setCompose(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.handle}/>
            <Text style={styles.sheetTitle}>Share with care</Text>
            <Text style={styles.sheetCopy}>This space is not for emergency use. If you may hurt yourself or someone else, call or text 988 in the U.S. or contact local emergency services.</Text>
            <Text style={styles.fieldLabel}>WHAT ARE YOU SHARING?</Text>
            <View style={styles.choiceWrap}>{['Question','Story','Check-in'].map(x => <Choice key={x} label={x} active={category===x} onPress={() => setCategory(x)}/>)}</View>
            <TextInput multiline value={draft} onChangeText={setDraft} placeholder="Write what feels true, without names or identifying details…" placeholderTextColor={C.muted} style={styles.composeInput}/>
            <Button label="Share" onPress={publish} icon="paper-plane"/>
          </Pressable>
        </Pressable>
      </Modal>
      <Modal visible={!!postSheet} transparent animationType="slide">
        <Pressable style={styles.modalBack} onPress={() => setPostSheet(null)}>
          <Pressable style={[styles.sheet, styles.postSheet]} onPress={() => {}}>
            {postSheet && <>
              <View style={styles.handle}/>
              <ScrollView style={styles.threadScroll} contentContainerStyle={styles.threadContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.topic}>{postSheet.category}</Text>
                <Pressable onPress={() => setMember(postSheet)}><Text style={styles.cardTitle}>{postSheet.author}</Text></Pressable>
                <Text style={styles.postText}>{postSheet.body}</Text>
                <Text style={styles.sectionTitle}>COMMENTS</Text>
                {postSheet.comments.filter(c => !blocked.includes(c.author)).map(c => {
                  const cp = posts.find(p => p.author===c.author) || {author:c.author,initial:c.author.charAt(0).toUpperCase(),bio:''};
                  return <View key={c.id} style={styles.comment}><Pressable onPress={() => setMember(cp)} hitSlop={6}><Text style={styles.commentName}>{c.author}</Text></Pressable><Text style={styles.muted}>{c.body}</Text></View>;
                })}
              </ScrollView>
              <View style={styles.threadComposer}>
                <TextInput value={comment} onChangeText={setComment} placeholder="Offer a kind response…" placeholderTextColor={C.muted} style={styles.commentInput}/>
                <Button label="Add comment" onPress={addComment} icon="chatbubble-outline"/>
              </View>
            </>}
          </Pressable>
        </Pressable>
      </Modal>
      <Modal visible={!!dm} transparent animationType="slide">
        <Pressable style={styles.modalBack} onPress={() => setDm(null)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            {dm && <>
              <View style={styles.handle}/>
              <Text style={styles.mini}>DIRECT MESSAGE</Text>
              <Text style={styles.sheetTitle}>Message {dm.author}</Text>
              <Text style={styles.sheetCopy}>Private messaging will be available once the community service is connected.</Text>
              <Button label="Close" onPress={() => setDm(null)} icon="close" kind="dark"/>
            </>}
          </Pressable>
        </Pressable>
      </Modal>
      {memberSheet}
    </ScrollView>
  );
}

function SupportNorthstar({ say }) {
  const { connected, products, fetchProducts, requestPurchase, finishTransaction } = useIAP({
    onPurchaseSuccess: async purchase => { try { await finishTransaction({purchase,isConsumable:true}); say('Thank you for supporting Northstar.'); } catch { say('Purchase received. Reopen the app if it remains pending.'); } },
    onPurchaseError: error => { if (error.code !== ErrorCode.UserCancelled) say('The purchase could not be completed. Please try again.'); },
    onError: () => say('The App Store is not available right now.'),
  });
  useEffect(() => { fetchProducts({skus:supportProducts.map(p=>p.id),type:'in-app'}); }, [fetchProducts]);
  const buy = async id => {
    if (!connected) { say('Connecting to the App Store…'); return; }
    try { await requestPurchase({type:'in-app',request:{apple:{sku:id,quantity:1},google:{skus:[id]}}}); } catch { say('Purchase could not be started. Please try again.'); }
  };
  return (
    <Card style={styles.supportCard}>
      <View style={styles.row}><View style={styles.supportBadge}><Icon name="heart" color={C.ink}/></View><View style={{flex:1}}><Text style={styles.cardTitle}>Support Northstar</Text><Text style={styles.muted}>Optional one-time support for continued development.</Text></View></View>
      <Text style={styles.supportFinePrint}>Every recovery tool remains available whether or not you support Northstar.</Text>
      <View style={styles.supportOptions}>{supportProducts.map(option => { const product=products.find(item=>item.id===option.id); const price=product?.displayPrice||option.fallbackPrice; return <Pressable key={option.id} onPress={() => buy(option.id)} style={styles.supportOption}><Text style={styles.supportPrice}>{price}</Text><Text style={styles.supportOptionLabel}>One-time</Text></Pressable>; })}</View>
    </Card>
  );
}

function You({ say, profile, editProfile, onSignOut }) {
  const [prefs, setPrefs] = useState({meetings:true,messages:true,insight:false});
  const flip = k => setPrefs(p => ({...p,[k]:!p[k]}));
  const days = profile.sobrietyDate ? Math.max(0, Math.floor((Date.now()-new Date(profile.sobrietyDate).getTime())/86400000)) : null;
  const name = profile.pseudonym || 'Northstar member';
  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Text style={styles.h1}>Your northstar</Text>
      <Text style={styles.intro}>The small things you're carrying forward.</Text>
      <Card style={styles.profile}><View style={styles.bigAvatar}><Text style={styles.bigAvatarText}>{name.charAt(0).toUpperCase()}</Text></View><View style={{flex:1}}><Text style={styles.cardTitle}>{name}</Text><Text style={styles.muted}>{days!==null?`${days} clear days · showing up`:'Here in your own time'}</Text></View><Pressable onPress={editProfile}><Icon name="create-outline" color={C.mint}/></Pressable></Card>
      <Pressable onPress={editProfile} style={styles.privacyAction}><Icon name="shield-checkmark-outline" color={C.mint}/><View style={{flex:1}}><Text style={styles.cardTitle}>Profile & privacy</Text><Text style={styles.muted}>Review what you choose to share.</Text></View><Icon name="chevron-forward" color={C.muted}/></Pressable>
      {days !== null && <View style={styles.achievement}><Icon name="flame" size={28} color={C.gold}/><View><Text style={styles.cardTitle}>Your rhythm</Text><Text style={styles.muted}>{days} clear days, one day at a time.</Text></View></View>}
      <Text style={styles.sectionTitle}>SUPPORT NORTHSTAR</Text>
      <SupportNorthstar say={say}/>
      <Text style={styles.sectionTitle}>REMINDERS, ON YOUR TERMS</Text>
      {[['meetings','Meeting reminders','A gentle heads-up before saved rooms'],['messages','Messages','Know when a member replies'],['insight','Daily insight','One quiet thought, once a day']].map(([key,title,desc]) =>
        <View key={key} style={styles.setting}><View style={{flex:1}}><Text style={styles.cardTitle}>{title}</Text><Text style={styles.muted}>{desc}</Text></View><Switch value={prefs[key]} onValueChange={() => flip(key)} trackColor={{false:C.line,true:'#3d9074'}} thumbColor={prefs[key]?C.mint:C.muted}/></View>
      )}
      <Button label="Send a demo insight" onPress={async() => { const r=await scheduleDemoInsight(); say(r.ok?'Insight scheduled for 8 seconds':r.reason); }} kind="dark" icon="notifications-outline"/>
      <Text style={styles.sectionTitle}>LITERATURE & RESOURCES</Text>
      <Card><Text style={styles.cardTitle}>Official CMA literature</Text><Text style={styles.muted}>Open the Crystal Meth Anonymous resource library in your browser.</Text><Pressable onPress={() => Linking.openURL('https://www.crystalmeth.org/')} style={styles.inlineAction}><Text style={styles.inlineText}>Visit crystalmeth.org</Text><Icon name="open-outline" size={16} color={C.mint}/></Pressable></Card>
      <Pressable onPress={onSignOut} style={[styles.setting, {borderBottomWidth:0, justifyContent:'center', gap:8, marginTop:8}]}>
        <Icon name="log-out-outline" color={C.muted} size={18}/>
        <Text style={[styles.muted, {fontWeight:'700'}]}>Sign out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  standard:{flexDirection:'row',gap:9,padding:13,borderLeftWidth:2,borderColor:C.mint,backgroundColor:'#16343a'}, standardText:{color:C.warm,fontSize:12,lineHeight:18,flex:1}, boardPost:{gap:11}, topic:{color:C.mint,fontSize:10,fontWeight:'900',letterSpacing:1.2}, postTime:{color:C.muted,fontSize:11}, tapHint:{color:C.blue,fontSize:11,marginTop:1}, commentAction:{flexDirection:'row',alignItems:'center',gap:7,paddingTop:11,borderTopWidth:1,borderColor:C.line}, commentActionText:{color:C.mint,fontSize:12,fontWeight:'800',flex:1}, boardEmpty:{minHeight:180,justifyContent:'center',alignItems:'center',gap:10,padding:24,borderWidth:1,borderColor:C.line,borderRadius:17}, memberHero:{flexDirection:'row',alignItems:'center',gap:13}, memberAvatar:{height:57,width:57,borderRadius:18,backgroundColor:C.mint,alignItems:'center',justifyContent:'center'}, profileSafety:{flexDirection:'row',gap:9,padding:12,backgroundColor:'#17363a',borderRadius:12}, profileSafetyText:{color:C.warm,fontSize:12,lineHeight:18,flex:1}, dangerAction:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8,padding:12,borderWidth:1,borderColor:'#66583d',borderRadius:12}, dangerText:{color:C.gold,fontWeight:'800',fontSize:14}, reportAction:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8,padding:8}, postSheet:{height:'88%',paddingBottom:20}, threadScroll:{flexGrow:0,flexShrink:1}, threadContent:{gap:12,paddingBottom:8}, threadComposer:{gap:8,paddingTop:10,borderTopWidth:1,borderColor:C.line}, comment:{padding:11,backgroundColor:C.raised,borderRadius:11,gap:3}, commentName:{color:C.warm,fontWeight:'800',fontSize:13}, commentInput:{color:C.warm,borderWidth:1,borderColor:C.line,borderRadius:12,padding:12,minHeight:52,fontSize:14},
  safe:{flex:1,backgroundColor:C.ink}, topo:{position:'absolute',top:0,left:0,right:0,height:210,backgroundColor:'#172944',borderBottomLeftRadius:110,borderBottomRightRadius:40,opacity:.8}, header:{height:76,paddingHorizontal:20,flexDirection:'row',alignItems:'center',justifyContent:'space-between'}, brand:{color:C.warm,fontSize:15,fontWeight:'900',letterSpacing:2}, brandSub:{color:C.muted,fontSize:10,marginTop:3}, headerBtns:{flexDirection:'row',gap:9}, iconBtn:{height:38,width:38,alignItems:'center',justifyContent:'center',backgroundColor:C.raised,borderRadius:12}, helpBtn:{height:38,width:38,alignItems:'center',justifyContent:'center',backgroundColor:C.mint,borderRadius:12}, body:{flex:1}, scroll:{padding:20,paddingBottom:28,gap:14}, eyebrow:{color:C.mint,fontSize:11,fontWeight:'800',letterSpacing:1.2}, mini:{color:C.mint,fontSize:11,fontWeight:'800',letterSpacing:1.2}, sectionTitle:{color:C.mint,fontSize:11,fontWeight:'800',letterSpacing:1.2,marginTop:7}, h1:{color:C.warm,fontSize:31,lineHeight:36,fontWeight:'900',letterSpacing:-.6}, intro:{color:C.muted,fontSize:15,lineHeight:22,marginTop:-7,marginBottom:3}, card:{backgroundColor:C.surface,borderWidth:1,borderColor:'rgba(157,173,197,.14)',padding:16,borderRadius:18,gap:12}, streak:{backgroundColor:'#202e42',flexDirection:'row',justifyContent:'space-between',alignItems:'center',borderColor:'#466176'}, streakNum:{color:C.warm,fontSize:37,fontWeight:'900',marginTop:2}, streakUnit:{fontSize:16,color:C.muted}, muted:{color:C.muted,fontSize:13,lineHeight:19}, sun:{height:56,width:56,borderRadius:28,backgroundColor:'#344154',alignItems:'center',justifyContent:'center'}, rowBetween:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:12}, row:{flexDirection:'row',alignItems:'center',gap:18}, cardTitle:{color:C.warm,fontSize:16,fontWeight:'800',lineHeight:21}, remote:{padding:10,backgroundColor:'#183c3a',borderRadius:12}, button:{backgroundColor:C.mint,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:7,paddingVertical:12,borderRadius:12,marginTop:1}, buttonDark:{backgroundColor:C.raised,borderWidth:1,borderColor:C.line}, buttonText:{color:C.ink,fontWeight:'900',fontSize:14}, quote:{color:C.warm,fontSize:18,lineHeight:27,fontWeight:'600',paddingHorizontal:7,paddingVertical:9}, actionRow:{flexDirection:'row',gap:10}, quick:{flex:1,minHeight:95,backgroundColor:C.raised,borderRadius:16,padding:14,justifyContent:'space-between'}, quickText:{color:C.warm,fontSize:14,fontWeight:'800'}, support:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:7,padding:12,borderWidth:1,borderColor:'#66583d',borderRadius:12}, supportText:{color:C.gold,fontWeight:'800',fontSize:13}, supportCard:{borderColor:'rgba(93,224,166,.36)'}, supportBadge:{height:38,width:38,borderRadius:13,backgroundColor:C.mint,alignItems:'center',justifyContent:'center'}, supportFinePrint:{color:C.muted,fontSize:12,lineHeight:17}, supportOptions:{flexDirection:'row',gap:8}, supportOption:{flex:1,backgroundColor:C.raised,borderWidth:1,borderColor:C.line,borderRadius:12,paddingVertical:11,alignItems:'center',gap:2}, supportPrice:{color:C.mint,fontSize:16,fontWeight:'900'}, supportOptionLabel:{color:C.muted,fontSize:9,fontWeight:'700',textAlign:'center'}, tabbar:{height:72,backgroundColor:'#141f31',borderTopWidth:1,borderColor:'#293850',flexDirection:'row',paddingHorizontal:2}, tab:{flex:1,alignItems:'center',justifyContent:'center',gap:3}, tabText:{color:C.muted,fontSize:8,fontWeight:'700'}, location:{flexDirection:'row',alignItems:'center',gap:7}, locationText:{color:C.warm,fontSize:13,fontWeight:'700'}, change:{color:C.mint,fontSize:12,fontWeight:'800',marginLeft:'auto'}, search:{flexDirection:'row',alignItems:'center',backgroundColor:C.surface,borderRadius:13,paddingHorizontal:13,borderWidth:1,borderColor:C.line}, input:{color:C.warm,height:46,flex:1,marginLeft:8,fontSize:14}, segmentScroll:{marginHorizontal:-20,paddingHorizontal:20,flexGrow:0}, segment:{paddingVertical:9,paddingHorizontal:14,marginRight:8,borderRadius:11,borderWidth:1,borderColor:C.line}, segmentActive:{backgroundColor:C.mint,borderColor:C.mint}, segmentText:{color:C.muted,fontWeight:'800',fontSize:13}, segmentTextActive:{color:C.ink}, results:{color:C.muted,fontSize:12,fontWeight:'700'}, meeting:{flexDirection:'row',gap:13}, time:{width:54,borderRightWidth:1,borderColor:C.line}, timeText:{color:C.warm,fontWeight:'900',fontSize:14}, timeZone:{color:C.muted,fontSize:10,marginTop:3}, meetingMeta:{color:C.blue,fontSize:12,fontWeight:'700',marginTop:2}, inlineAction:{flexDirection:'row',alignItems:'center',gap:5,marginTop:7}, inlineText:{color:C.mint,fontWeight:'800',fontSize:13}, empty:{alignItems:'center',paddingVertical:30}, xp:{backgroundColor:'#26304b',flexDirection:'row',alignItems:'center',justifyContent:'space-between'}, xpNum:{color:C.gold,fontWeight:'900',fontSize:25,marginTop:3}, xpSmall:{fontSize:13,color:C.muted}, module:{gap:0}, moduleDot:{height:31,width:31,borderRadius:10,alignItems:'center',justifyContent:'center',backgroundColor:C.raised,marginRight:11}, moduleDetail:{borderTopWidth:1,borderColor:C.line,marginTop:14,paddingTop:12,gap:7}, moduleCopy:{color:C.warm,lineHeight:20,fontSize:14}, step:{color:C.muted,fontSize:13}, calmTab:{flex:1}, hidden:{display:'none'}, playerCard:{alignItems:'center',paddingVertical:25}, visualStage:{height:154,alignSelf:'stretch',borderRadius:18,overflow:'hidden',alignItems:'center',justifyContent:'center',position:'relative'}, visualBreath:{backgroundColor:'#173b3b'}, visualNight:{backgroundColor:'#172944'}, visualWaves:{backgroundColor:'#16445a'}, breathRing:{position:'absolute',height:106,width:106,borderRadius:53,borderWidth:1}, breathRingOuter:{borderColor:'rgba(93,224,166,.45)'}, breathRingInner:{borderColor:'rgba(184,233,240,.65)'}, moon:{height:61,width:61,borderRadius:31,backgroundColor:'#F4F1E8',shadowColor:'#F4F1E8',shadowOpacity:.6,shadowRadius:15,elevation:8}, star:{position:'absolute',height:5,width:5,borderRadius:3,backgroundColor:'#F4F1E8'}, starOne:{left:40,top:31}, starTwo:{right:50,top:43}, starThree:{right:84,bottom:34}, wave:{position:'absolute',width:230,height:100,borderRadius:100,backgroundColor:'rgba(184,233,240,.28)'}, waveBack:{bottom:-66,left:-40}, waveFront:{bottom:-76,right:-45,backgroundColor:'rgba(93,224,240,.38)'}, visualRow:{flexDirection:'row',gap:8}, visualChoice:{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:5,paddingVertical:10,borderRadius:11,borderWidth:1,borderColor:C.line,backgroundColor:C.raised}, visualChoiceActive:{backgroundColor:C.mint,borderColor:C.mint}, visualText:{color:C.muted,fontSize:12,fontWeight:'800'}, visualTextActive:{color:C.ink}, breatheStart:{backgroundColor:C.mint,paddingVertical:13,borderRadius:13,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8}, breatheStartText:{color:C.ink,fontWeight:'900',fontSize:14}, breathSheet:{alignItems:'center'}, breathGuide:{height:250,width:250,alignItems:'center',justifyContent:'center',marginVertical:4}, breathGuideOuter:{position:'absolute',width:190,height:190,borderRadius:95,borderWidth:2,borderColor:'rgba(93,224,166,.58)'}, breathGuideInner:{position:'absolute',width:190,height:190,borderRadius:95,borderWidth:1,borderColor:'rgba(117,184,255,.7)'}, breathGuideCenter:{alignItems:'center',gap:4}, breathPhase:{color:C.warm,fontSize:22,fontWeight:'900',marginTop:5}, breathCount:{color:C.muted,fontSize:13}, timer:{color:C.warm,fontSize:38,fontWeight:'900',letterSpacing:1}, playButton:{alignSelf:'stretch',backgroundColor:C.mint,paddingVertical:13,borderRadius:13,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:9}, playText:{color:C.ink,fontSize:15,fontWeight:'900'}, sessionRow:{flexDirection:'row',gap:9}, session:{flex:1,paddingVertical:12,alignItems:'center',borderWidth:1,borderColor:C.line,borderRadius:12,backgroundColor:C.raised}, sessionActive:{backgroundColor:C.mint,borderColor:C.mint}, sessionText:{color:C.muted,fontWeight:'800'}, sessionTextActive:{color:C.ink}, compose:{backgroundColor:C.mint,padding:14,borderRadius:14,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8}, composeText:{fontSize:14,color:C.ink,fontWeight:'900'}, postHead:{flexDirection:'row',alignItems:'center',gap:10}, avatar:{height:35,width:35,borderRadius:12,backgroundColor:'#476686',alignItems:'center',justifyContent:'center'}, avatarText:{color:C.warm,fontWeight:'900'}, postText:{color:C.warm,fontSize:15,lineHeight:22}, profile:{flexDirection:'row',alignItems:'center'}, bigAvatar:{width:56,height:56,borderRadius:18,backgroundColor:C.mint,alignItems:'center',justifyContent:'center'}, bigAvatarText:{color:C.ink,fontSize:22,fontWeight:'900'}, achievement:{flexDirection:'row',alignItems:'center',gap:12,padding:14,borderWidth:1,borderColor:'#66583d',borderRadius:16}, setting:{flexDirection:'row',alignItems:'center',paddingVertical:11,borderBottomWidth:1,borderColor:C.line,gap:12}, modalBack:{flex:1,backgroundColor:'rgba(5,9,16,.7)',justifyContent:'flex-end'}, sheet:{backgroundColor:'#223047',padding:22,paddingBottom:35,borderTopLeftRadius:26,borderTopRightRadius:26,gap:13}, handle:{width:40,height:4,backgroundColor:C.muted,borderRadius:4,alignSelf:'center',opacity:.5}, sheetTitle:{color:C.warm,fontSize:22,fontWeight:'900'}, sheetCopy:{color:C.muted,lineHeight:21,fontSize:14}, composeInput:{color:C.warm,minHeight:105,borderWidth:1,borderColor:C.line,borderRadius:12,padding:12,textAlignVertical:'top',fontSize:15}, toast:{position:'absolute',left:20,right:20,bottom:84,backgroundColor:'#263a44',padding:13,borderRadius:13,flexDirection:'row',alignItems:'center',gap:8,borderWidth:1,borderColor:'#478f72'}, toastText:{color:C.warm,fontSize:13,fontWeight:'700',flex:1},
  onboardSafe:{flex:1,backgroundColor:C.ink}, onboardStar:{height:180,alignItems:'center',justifyContent:'center',backgroundColor:'#173047',borderBottomRightRadius:95,borderBottomLeftRadius:35}, welcomeBody:{padding:28,gap:15}, welcomeTitle:{color:C.warm,fontSize:38,fontWeight:'900',lineHeight:44,letterSpacing:-1}, welcomeCopy:{color:C.muted,fontSize:16,lineHeight:25,maxWidth:310}, welcomeBottom:{padding:24,gap:20,marginTop:'auto'}, textButton:{alignItems:'center',justifyContent:'center',flexDirection:'row',gap:6,padding:8}, textButtonLabel:{color:C.mint,fontSize:14,fontWeight:'800'}, onboardScroll:{padding:24,paddingTop:32,gap:17,paddingBottom:45}, onboardKicker:{color:C.mint,fontSize:11,fontWeight:'900',letterSpacing:1.5,marginTop:8}, onboardTitle:{color:C.warm,fontSize:32,lineHeight:38,fontWeight:'900',letterSpacing:-.7}, onboardCopy:{color:C.muted,fontSize:15,lineHeight:23,marginBottom:5}, field:{gap:6}, fieldLabel:{color:C.muted,fontSize:10,fontWeight:'900',letterSpacing:1}, fieldInput:{borderBottomWidth:1,borderColor:C.line,color:C.warm,paddingVertical:12,fontSize:16}, bioInput:{minHeight:82,textAlignVertical:'top',borderWidth:1,borderRadius:12,paddingHorizontal:12}, choiceWrap:{flexDirection:'row',flexWrap:'wrap',gap:8}, choice:{paddingVertical:10,paddingHorizontal:12,borderWidth:1,borderColor:C.line,borderRadius:10,flexDirection:'row',gap:6,alignItems:'center'}, choiceActive:{backgroundColor:C.mint,borderColor:C.mint}, choiceText:{color:C.muted,fontSize:13,fontWeight:'800'}, choiceTextActive:{color:C.ink}, photoPlaceholder:{borderWidth:1,borderColor:C.line,borderStyle:'dashed',minHeight:92,alignItems:'center',justifyContent:'center',gap:4,borderRadius:13}, photoText:{color:C.warm,fontWeight:'800'}, photoHint:{color:C.muted,fontSize:11}, statusNote:{color:C.gold,fontSize:13,lineHeight:19,backgroundColor:'#312b20',padding:12,borderRadius:10}, skip:{alignItems:'center',padding:7}, preferenceNote:{flexDirection:'row',gap:8,alignItems:'center',padding:10,backgroundColor:'#163636',borderWidth:1,borderColor:'#326d60',borderRadius:11}, preferenceText:{color:C.warm,fontSize:12,flex:1,lineHeight:17}, privacyAction:{flexDirection:'row',alignItems:'center',gap:12,padding:14,borderWidth:1,borderColor:C.line,borderRadius:15}, journalScroll:{backgroundColor:'#151d2b'}, journalNew:{backgroundColor:C.mint,padding:14,borderRadius:13,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8}, journalEmpty:{minHeight:220,justifyContent:'center',alignItems:'center',gap:12,borderTopWidth:1,borderBottomWidth:1,borderColor:'#4d4a40',paddingHorizontal:36}, journalEntry:{backgroundColor:'#20263a',padding:18,gap:11,borderLeftWidth:2,borderColor:C.gold}, journalMood:{color:C.gold,fontSize:12,fontWeight:'800'}, journalBody:{color:C.warm,fontSize:16,lineHeight:25}, journalSheet:{backgroundColor:'#252b3a'}, moodRow:{flexDirection:'row',gap:7,flexWrap:'wrap'}, journalInput:{minHeight:190,color:C.warm,fontSize:17,lineHeight:26,textAlignVertical:'top',paddingVertical:10,borderBottomWidth:1,borderColor:'#665f4f'},
  soundscapePicker:{flexDirection:'row',alignItems:'center',gap:10,padding:14,backgroundColor:C.raised,borderRadius:14,borderWidth:1,borderColor:C.line}, soundscapePickerText:{flex:1,color:C.warm,fontSize:14,fontWeight:'700'}, soundscapeRow:{flexDirection:'row',alignItems:'center',gap:12,padding:14,backgroundColor:C.surface,borderRadius:14,borderWidth:1,borderColor:C.line}, soundscapeRowActive:{backgroundColor:C.mint,borderColor:C.mint},
  splashSafe:{flex:1,backgroundColor:'#0b1420'}, splashBg:{position:'absolute',top:0,left:0,right:0,bottom:0,backgroundColor:'#0b1420'}, splashBgAccent:{position:'absolute',top:'-20%',left:'-10%',right:'-10%',height:'70%',borderRadius:500,backgroundColor:'#112040',opacity:.7}, splashContent:{flex:1,alignItems:'center',justifyContent:'center',gap:14,paddingHorizontal:32}, splashStar:{position:'absolute',width:3,height:3,borderRadius:2,backgroundColor:C.warm}, splashLogoWrap:{height:130,width:130,alignItems:'center',justifyContent:'center',marginBottom:4}, splashRing:{position:'absolute',width:130,height:130,borderRadius:65,borderWidth:2,borderColor:C.mint}, splashIconOuter:{alignItems:'center',justifyContent:'center'}, splashIconBg:{position:'absolute',width:72,height:72,borderRadius:36,backgroundColor:'rgba(93,224,166,0.12)'}, splashIcon:{fontSize:44,textShadowColor:C.mint,textShadowRadius:18}, splashBrand:{color:C.warm,fontSize:22,fontWeight:'900',letterSpacing:4,marginTop:2}, splashTagline:{color:C.muted,fontSize:13,textAlign:'center',letterSpacing:.4}, splashMsgWrap:{borderTopWidth:1,borderColor:'#1f3050',paddingTop:20,alignItems:'center',minHeight:68,justifyContent:'center'}, splashMsg:{color:C.warm,fontSize:17,lineHeight:26,textAlign:'center',fontStyle:'italic',fontWeight:'600',letterSpacing:.2}, splashDots:{flexDirection:'row',gap:8,marginTop:10}, splashDot:{width:7,height:7,borderRadius:4,backgroundColor:C.mint},
});
