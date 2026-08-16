import 'react-native-get-random-values';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Animated, Easing, Image, KeyboardAvoidingView, Linking, Modal, Platform, Pressable, SafeAreaView, ScrollView, Share, StyleSheet, Switch, Text, TextInput, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import * as ImagePicker from 'expo-image-picker';
import * as WebBrowser from 'expo-web-browser';
import * as Haptics from 'expo-haptics';
import * as QuickActions from 'expo-quick-actions';
import * as Location from 'expo-location';
import * as Application from 'expo-application';
import * as Clipboard from 'expo-clipboard';
import * as SecureStore from 'expo-secure-store';
import * as Contacts from 'expo-contacts';
import { scheduleDemoInsight, scheduleDailyUplift, cancelDailyUplift, scheduleDailyCheckin, cancelDailyCheckin, scheduleMeetingReminder, cancelMeetingReminders, sendLocalNotification, getRemotePushToken } from './notifications';
import { READINGS } from './readings';
import { createAccount, confirmAccount, signInWithPassword, restoreSignedInUser, signOutEverywhere } from './auth';
import { apiRequest, isBackendConfigured } from './backend';

const C = { ink:'#101827', surface:'#192438', raised:'#233149', mint:'#5DE0A6', blue:'#75B8FF', warm:'#F4F1E8', muted:'#9DADC5', gold:'#F5B95D', line:'#34445d' };
const CF = process.env.EXPO_PUBLIC_CLOUDFRONT_SOUNDSCAPES || 'https://d10rkhd3bzdolj.cloudfront.net/soundscapes/';
const BRAND_ART = 'https://d10rkhd3bzdolj.cloudfront.net/branding/icon.png';

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

const LEARN_MODULES = [
  { id:1, title:'Foundations', xp:80, icon:'compass-outline',
    copy:'A kind introduction to taking the next right step.',
    steps:['Set your intention','Name one support','Practice a pause'],
    detail:"Recovery begins with a single decision: to try. This module helps you understand what that first step looks like, and how to build a gentle foundation without pressure.",
  },
  { id:2, title:'Your first meeting', xp:120, icon:'people-outline',
    copy:'Know what to expect before you walk in or join.',
    steps:['Choose a format','Arrive your way','Reflect after'],
    detail:"Meetings can feel intimidating. This module takes away the mystery so you can show up in whatever way feels safe — whether that's camera off, muted, or just listening.",
  },
  { id:3, title:'Managing cravings', xp:140, icon:'pulse-outline',
    copy:'Understand your cravings and learn to move through them.',
    steps:['Name the trigger','Ride the wave (urge surfing)','Use HALT to check in'],
    detail:"Cravings are temporary — even when they don't feel that way. The HALT check (Hungry, Angry, Lonely, Tired) is one of the most practical tools in early recovery.",
  },
  { id:4, title:'Stress & anxiety', xp:160, icon:'leaf-outline',
    copy:'Simple tools for when everything feels like too much.',
    steps:['5-4-3-2-1 grounding','Box breathing','Name what\'s real vs. what\'s fear'],
    detail:"Stress is normal. Anxiety in early recovery is extremely common. This module gives you grounding techniques that work in real moments — at home, at work, anywhere.",
  },
  { id:5, title:'Rebuilding your sleep', xp:160, icon:'moon-outline',
    copy:'Recovery and rest are deeply connected.',
    steps:['Understand your circadian rhythm','Build a wind-down routine','Protect your morning'],
    detail:"Methamphetamine severely disrupts sleep architecture. This module explains what\'s happening in your body and gives practical steps to rebuild healthy, restorative sleep.",
  },
  { id:6, title:'Building your circle', xp:200, icon:'git-network-outline',
    copy:'Small, consistent connections make a difference.',
    steps:['Map your people','Send a check-in','Plan the week'],
    detail:"Isolation is one of the biggest risk factors in recovery. This module helps you identify the relationships worth nurturing and practice reaching out before you need to.",
  },
  { id:7, title:'Nourishing your body', xp:180, icon:'nutrition-outline',
    copy:'What you eat shapes how you feel in recovery.',
    steps:['Blood sugar & mood','Gut-brain connection','Hydration as healing'],
    detail:"Nutrition is often overlooked in recovery. Stable blood sugar, protein, and hydration directly affect mood, cravings, and mental clarity. Small changes here matter.",
  },
  { id:8, title:'Service & purpose', xp:220, icon:'heart-outline',
    copy:'Giving back is part of getting better.',
    steps:['What service means in Step 12','Find your way to give','One small act this week'],
    detail:"Step 12 is about carrying the message. This module explores what service looks like in daily life — and why helping others is one of the most powerful tools for your own recovery.",
  },
  { id:9, title:'Relapse prevention', xp:240, icon:'shield-outline',
    copy:'Preparation and self-compassion, together.',
    steps:['Know your warning signs','Make your plan','If it happens: next right step'],
    detail:"Relapse is not failure — it\'s data. This module helps you identify your early warning signs and build a compassionate, practical response plan before you need it.",
  },
];

const FALLBACK_MEETINGS = [
  { id:'f1', title:'Morning Serenity', time:'8:00 AM', day:'Daily', format:'Remote', region:'Online · Worldwide', language:'English', url:'https://www.crystalmeth.org/meetings/?type=online', action:'Join meeting' },
  { id:'f2', title:'The Next Right Thing', time:'12:00 PM', day:'Daily', format:'Remote', region:'Online · Worldwide', language:'English', url:'https://www.crystalmeth.org/meetings/?type=online', action:'Join meeting' },
  { id:'f3', title:'A New Direction', time:'6:15 PM', day:'Mon/Wed/Fri', format:'Remote', region:'Online · Central', language:'English', url:'https://www.crystalmeth.org/meetings/?type=online', action:'Join meeting' },
  { id:'f4', title:'Night Lanterns', time:'7:00 PM', day:'Daily', format:'Remote', region:'Online · Eastern', language:'English', url:'https://www.crystalmeth.org/meetings/?type=online', action:'Join meeting' },
  { id:'f5', title:'Open Sky', time:'8:00 PM', day:'Daily', format:'Remote', region:'Online · Pacific', language:'English / Español', url:'https://www.crystalmeth.org/meetings/?type=online', action:'Join meeting' },
  { id:'f6', title:'Day by Day', time:'9:00 PM', day:'Daily', format:'Remote', region:'Online · Mountain', language:'English', url:'https://www.crystalmeth.org/meetings/?type=online', action:'Join meeting' },
];

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

// The API reports meeting times in 24-hour format ("06:30"); the UI and
// nextMeeting() both expect "6:30 AM".
function to12Hour(time) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time || '');
  if (!match) return time || '';
  let h = parseInt(match[1], 10);
  const suffix = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${match[2]} ${suffix}`;
}

async function fetchCMAMeetings() {
  try {
    const res = await fetch('https://www.crystalmeth.org/wp-admin/admin-ajax.php?action=meetings', {
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data
          .slice(0, 400)
          .map((m, i) => {
            const online = !!m.conference_url || m.types?.some(x => ['online', 'ONL', 'TC', 'VM'].includes(x));
            const hybrid = m.types?.includes('HY') || (online && m.address);
            const format = hybrid ? 'Hybrid' : online ? 'Remote' : 'In-person';
            const lat = parseFloat(m.latitude), lng = parseFloat(m.longitude);
            return {
              id: m.slug || `mg-${i}`,
              title: m.name,
              time: to12Hour(m.time),
              day: m.day !== undefined ? DAYS[m.day] : 'Daily',
              format,
              region: m.region || m.city || (online ? 'Online' : ''),
              language: m.language || 'English',
              lat: Number.isFinite(lat) ? lat : null,
              lng: Number.isFinite(lng) ? lng : null,
              url: m.conference_url || (Number.isFinite(lat) ? `https://maps.apple.com/?ll=${lat},${lng}&q=${encodeURIComponent(m.name)}` : 'https://www.crystalmeth.org/meetings/'),
              notes: m.conference_url_notes || '',
              searchText: [m.name, m.region, m.city, m.address, m.location, m.group, m.language].filter(Boolean).join(' ').toLowerCase(),
              passcode: /PW:?\s*(\S+)/i.exec(m.conference_url_notes || '')?.[1] || '',
              action: online ? 'Join meeting' : 'Directions',
            };
          });
      }
    }
  } catch {}
  return FALLBACK_MEETINGS;
}

function distanceKm(lat1, lng1, lat2, lng2) {
  const r=6371, p1=lat1*Math.PI/180, p2=lat2*Math.PI/180;
  const dp=(lat2-lat1)*Math.PI/180, dl=(lng2-lng1)*Math.PI/180;
  const a=Math.sin(dp/2)**2+Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)**2;
  return 2*r*Math.asin(Math.sqrt(a));
}

function nextMeeting(meetings) {
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();
  const today = DAYS[now.getDay()];
  return meetings
    .filter(m => m.format === 'Remote')
    .map(m => {
      const match = m.time?.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!match) return null;
      let h = parseInt(match[1]), min = parseInt(match[2]);
      if (match[3].toUpperCase() === 'PM' && h !== 12) h += 12;
      if (match[3].toUpperCase() === 'AM' && h === 12) h = 0;
      const mMins = h * 60 + min;
      const diff = mMins - mins;
      return diff > 0 && diff < 180 ? { ...m, minsAway: diff } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.minsAway - b.minsAway)[0] || null;
}

async function fetchRecoveryNews() {
  try {
    // rss2json rejects the `count` param without a paid API key; trim client-side instead.
    const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent('https://nida.nih.gov/rss.xml')}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'ok' && data.items?.length) {
        return data.items.slice(0, 6).map(item => ({
          id: item.guid || item.link,
          title: item.title,
          summary: (item.description || item.content || '')
            .replace(/<[^>]+>/g, '').replace(/&[a-z#\d]+;/gi, ' ').trim().slice(0, 200),
          pubDate: item.pubDate,
          link: item.link,
          source: 'NIDA',
        }));
      }
    }
  } catch {}
  return [];
}

const VENMO_USER = 'rooteddaily';

const GENDER_TO_API = { 'Woman':'woman','Man':'man','Nonbinary':'nonbinary','Prefer not to say':'prefer-not-to-say' };
const API_TO_GENDER = Object.fromEntries(Object.entries(GENDER_TO_API).map(([k,v])=>[v,k]));
const PREF_TO_API = { 'Women-only':'women','Men-only':'men','All groups':'all' };
const API_TO_PREF = Object.fromEntries(Object.entries(PREF_TO_API).map(([k,v])=>[v,k]));

function soundscapeUri(name) { return { uri: `${CF}${encodeURIComponent(name)}.wav` }; }
function Icon({ name, size=20, color=C.warm }) { return <Ionicons name={name} size={size} color={color} />; }
function Button({ label, onPress, kind='mint', icon }) {
  return <Pressable onPress={onPress} style={({pressed})=>[styles.button, kind==='dark'&&styles.buttonDark, pressed&&{opacity:.78}]}>
    <Icon name={icon||'arrow-forward'} size={17} color={kind==='mint'?C.ink:C.warm}/>
    <Text style={[styles.buttonText,kind==='dark'&&{color:C.warm}]}>{label}</Text>
  </Pressable>;
}
function Card({ children, style }) { return <View style={[styles.card,style]}>{children}</View>; }
// Web links open in an in-app browser sheet so members stay inside the app.
function openWeb(url) {
  WebBrowser.openBrowserAsync(url, { presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET })
    .catch(() => Linking.openURL(url));
}

// Auto-format a US phone number as (555) 123-4567 while typing.
function formatPhoneInput(value) {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0,3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
}

// Auto-insert slashes while typing a MM/DD/YYYY date (also accepts deletes).
function formatDateInput(value) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0,2)}/${digits.slice(2)}`;
  return `${digits.slice(0,2)}/${digits.slice(2,4)}/${digits.slice(4)}`;
}

function Field({ label, value, onChange, placeholder, secure=false, autoCapitalize='none' }) {
  return <View style={styles.field}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TextInput value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={C.muted} secureTextEntry={secure} autoCapitalize={autoCapitalize} style={styles.fieldInput}/>
  </View>;
}
function Choice({ label, active, onPress }) {
  return <Pressable onPress={onPress} style={[styles.choice,active&&styles.choiceActive]}>
    <Text style={[styles.choiceText,active&&styles.choiceTextActive]}>{label}</Text>
    {active&&<Icon name="checkmark" size={16} color={C.ink}/>}
  </Pressable>;
}
function Avatar({ photo, initial, size=56, radius=18 }) {
  if (photo) return <Image source={{uri:photo}} style={{width:size,height:size,borderRadius:radius,backgroundColor:C.raised}}/>;
  return <View style={{width:size,height:size,borderRadius:radius,backgroundColor:C.mint,alignItems:'center',justifyContent:'center'}}>
    <Text style={{color:C.ink,fontSize:size*0.38,fontWeight:'900'}}>{initial}</Text>
  </View>;
}

class ErrorBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) return (
      <SafeAreaView style={{flex:1,backgroundColor:C.ink,alignItems:'center',justifyContent:'center',padding:32}}>
        <Text style={{color:C.mint,fontSize:20,fontWeight:'800',marginBottom:12}}>Something went wrong</Text>
        <Text style={{color:C.muted,fontSize:13,textAlign:'center'}}>{String(this.state.error?.message || this.state.error)}</Text>
      </SafeAreaView>
    );
    return this.props.children;
  }
}

export default function App() {
  return <ErrorBoundary><AppInner/></ErrorBoundary>;
}

function AppInner() {
  const [authState, setAuthState] = useState('loading');
  const [tab, setTab] = useState('Today');
  const [bell, setBell] = useState(false);
  const [toast, setToast] = useState('');
  const [editingProfile, setEditingProfile] = useState(false);
  const [readingsOpen, setReadingsOpen] = useState(false);
  const [profile, setProfile] = useState({ pseudonym:'', bio:'', photo:'', dob:'', gender:'', groupPreference:'All groups', sobrietyDate:'', sponsor:{ name:'', phone:'' }, trustedPerson:{ name:'', phone:'', enabled:false }, privacyMode:false });
  const [journalEntries, setJournalEntries] = useState([]);
  const [currentSoundscape, setCurrentSoundscape] = useState(SOUNDSCAPES[0]);
  const [cmaLoaded, setCmaLoaded] = useState(false);
  const [meetings, setMeetings] = useState(FALLBACK_MEETINGS);
  const [recoveryNews, setRecoveryNews] = useState([]);

  const calmPlayer = useAudioPlayer(soundscapeUri(currentSoundscape.name));

  const [authEmail, setAuthEmail] = useState('');
  const [sosEnabled, setSosEnabled] = useState(false);
  const [learnComplete, setLearnComplete] = useState(1);
  useEffect(()=>{ SecureStore.getItemAsync('northstar.learn-complete').then(v=>{ const n=parseInt(v,10); if(Number.isFinite(n)&&n>1) setLearnComplete(n); }).catch(()=>{}); },[]);
  const advanceLearn = id => { setLearnComplete(id); SecureStore.setItemAsync('northstar.learn-complete', String(id)).catch(()=>{}); };
  const [inviteXP, setInviteXP] = useState(0);
  useEffect(()=>{ SecureStore.getItemAsync('northstar.invite-xp').then(v=>{ const n=parseInt(v,10); if(Number.isFinite(n)&&n>0) setInviteXP(n); }).catch(()=>{}); },[]);
  const earnInviteXP = () => setInviteXP(prev => { const next = Math.min(prev + 10, 200); SecureStore.setItemAsync('northstar.invite-xp', String(next)).catch(()=>{}); return next; });
  useEffect(() => { restoreSignedInUser().then(u => setAuthState(u ? 'authenticated' : 'onboarding')).catch(() => setAuthState('onboarding')); }, []);
  useEffect(() => {
    if (authState !== 'authenticated') return;
    restoreSignedInUser().then(u => setAuthEmail(u?.signInDetails?.loginId || u?.username || '')).catch(()=>{});
  }, [authState]);
  useEffect(() => { setAudioModeAsync({ playsInSilentMode:true, shouldPlayInBackground:true, interruptionMode:'duckOthers' }).catch(()=>{}); }, []);
  useEffect(() => { calmPlayer.loop = true; }, [calmPlayer]);

  useEffect(() => {
    if (authState !== 'authenticated' || !isBackendConfigured()) return;
    apiRequest('/v1/me').then(data => {
      if (!data?.profile) return;
      const p = data.profile;
      setProfile(prev => ({
        ...prev,
        pseudonym: p.pseudonym||'', bio: p.bio||'', dob: p.dateOfBirth||'',
        gender: API_TO_GENDER[p.gender]||'', groupPreference: API_TO_PREF[p.groupPreference]||'All groups',
        sobrietyDate: p.sobrietyDate||'',
      }));
    }).catch(()=>{});
  }, [authState]);

  useEffect(() => {
    if (authState !== 'authenticated' || !isBackendConfigured()) return;
    apiRequest('/v1/journal').then(data => {
      if (!data?.entries?.length) return;
      setJournalEntries(data.entries.map(e => ({
        id:e.createdAt, body:e.text, mood:e.mood.charAt(0).toUpperCase()+e.mood.slice(1),
        date: new Date(e.createdAt).toLocaleDateString('en-US',{month:'long',day:'numeric'}),
      })));
    }).catch(()=>{});
  }, [authState]);

  useEffect(() => {
    if (cmaLoaded) return;
    fetchCMAMeetings().then(m => { setMeetings(m); setCmaLoaded(true); });
  }, [cmaLoaded]);

  useEffect(() => { fetchRecoveryNews().then(setRecoveryNews); }, []);

  // Home-screen quick actions (long-press the app icon).
  const quickCtx = useRef({ meetings, profile });
  useEffect(() => { quickCtx.current = { meetings, profile }; }, [meetings, profile]);
  useEffect(() => {
    if (authState !== 'authenticated') return;
    QuickActions.setItems([
      { id:'meeting', title:'Join next meeting', icon:'symbol:video' },
      { id:'sponsor', title:'Call sponsor', icon:'symbol:phone' },
      { id:'circle', title:'Share with the circle', icon:'symbol:person.3' },
      { id:'calm', title:'Open Calm', icon:'symbol:leaf' },
    ]).catch(()=>{});
    const act = action => {
      const { meetings:mtgs, profile:prof } = quickCtx.current;
      if (!action) return;
      if (action.id==='sponsor') { prof.sponsor?.phone ? Linking.openURL(`tel:${prof.sponsor.phone.replace(/\D/g,'')}`) : setTab('You'); }
      else if (action.id==='meeting') { const next=nextMeeting(mtgs); setTab('Meetings'); if(next) openWeb(next.url); }
      else if (action.id==='circle') setTab('Connect');
      else if (action.id==='calm') setTab('Calm');
    };
    if (QuickActions.initial) act(QuickActions.initial);
    const sub = QuickActions.addListener(act);
    return () => sub.remove();
  }, [authState]);

  useEffect(() => {
    if (authState !== 'authenticated' || !isBackendConfigured()) return;
    getRemotePushToken('e2814d89-03ca-4798-a753-a56b695364f5').then(token => {
      if (token) apiRequest('/v1/push-tokens',{method:'POST',body:JSON.stringify({token})}).catch(()=>{});
    });
    (async () => {
      try {
        const deviceId = Platform.OS==='ios' ? await Application.getIosIdForVendorAsync() : Application.getAndroidId();
        if (deviceId) await apiRequest('/v1/me/device',{method:'POST',body:JSON.stringify({deviceId})});
      } catch {}
    })();
    apiRequest('/v1/me').then(d=>{ if(d?.profile?.sosOptIn) setSosEnabled(true); }).catch(()=>{});
  }, [authState]);

  const toggleSos = async val => {
    if (!isBackendConfigured()) { say('Nearby support needs a connection.'); return; }
    if (val) {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { say('Allow location access in Settings to enable nearby support.'); return; }
      try {
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        await apiRequest('/v1/me/location',{method:'POST',body:JSON.stringify({lat:pos.coords.latitude,lng:pos.coords.longitude,sosOptIn:true})});
        setSosEnabled(true); say('Nearby support is on. Only a coarse, city-level location is stored.');
      } catch { say('Could not enable nearby support right now.'); }
    } else {
      try { await apiRequest('/v1/me/location',{method:'POST',body:JSON.stringify({sosOptIn:false})}); } catch {}
      setSosEnabled(false); say('Nearby support is off.');
    }
  };

  const say = msg => { setToast(msg); setTimeout(()=>setToast(''), 2600); };
  const support = () => Alert.alert('Need support now?','This opens your phone app to contact urgent support. Northstar is not emergency care.',[{text:'Not now',style:'cancel'},{text:'Open phone',onPress:()=>Linking.openURL('tel:988')}]);

  const handleSignOut = () => Alert.alert('Sign out?','You\'ll need to sign in again to access your journal and profile.',[
    {text:'Cancel',style:'cancel'},
    {text:'Sign out',style:'destructive',onPress:async()=>{
      await signOutEverywhere().catch(()=>{});
      setProfile({pseudonym:'',bio:'',photo:'',dob:'',gender:'',groupPreference:'All groups',sobrietyDate:''});
      setJournalEntries([]);
      setAuthState('onboarding');
    }},
  ]);

  const saveProfile = async (next) => {
    setProfile(next); setEditingProfile(false); say('Profile saved.');
    if (!isBackendConfigured()) return;
    try {
      await apiRequest('/v1/me',{method:'PUT',body:JSON.stringify({profile:{
        pseudonym:next.pseudonym||undefined, bio:next.bio||undefined, dateOfBirth:next.dob||undefined,
        gender:GENDER_TO_API[next.gender]||undefined, groupPreference:PREF_TO_API[next.groupPreference]||undefined,
        sobrietyDate:next.sobrietyDate||undefined, privacyMode:!!next.privacyMode,
      }})});
      if (next.photoBase64) {
        await apiRequest('/v1/me/avatar',{method:'POST',body:JSON.stringify({imageBase64:next.photoBase64})}).catch(()=>{});
      }
    } catch { say('Profile saved locally. Sync will retry.'); }
  };

  const addJournalEntry = async (entry) => {
    setJournalEntries(prev => [entry,...prev]);
    if (!isBackendConfigured()) return;
    try { await apiRequest('/v1/journal',{method:'POST',body:JSON.stringify({text:entry.body,mood:entry.mood.toLowerCase(),createdAt:new Date().toISOString()})}); }
    catch {}
  };

  if (authState === 'loading') return <SplashScreen/>;
  if (authState === 'onboarding') return <Onboarding onComplete={p=>{setProfile(p);setAuthState('authenticated');}}/>;

  const sobrietyMs = profile.sobrietyDate ? new Date(profile.sobrietyDate).getTime() : NaN;
  const sobrietyDays = Number.isFinite(sobrietyMs) ? Math.max(0, Math.floor((Date.now()-sobrietyMs)/86400000)) : null;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light"/>
      <View style={styles.topo}/>
      <View style={styles.header}>
        <View><Text style={styles.brand}>NORTHSTAR</Text><Text style={styles.brandSub}>recovery, one steady step at a time</Text></View>
        <View style={styles.headerBtns}>
          <Pressable onPress={()=>setBell(true)} style={styles.iconBtn}><Icon name="notifications-outline"/></Pressable>
          <Pressable onPress={support} style={styles.helpBtn}><Icon name="heart-outline" color={C.ink}/></Pressable>
        </View>
      </View>
      <View style={styles.body}>
        {tab==='Today'    && <Today say={say} go={setTab} profile={profile} sobrietyDays={sobrietyDays} meetings={meetings} sosEnabled={sosEnabled}/>}
        {tab==='Meetings' && <Meetings say={say} profile={profile} meetings={meetings} loading={!cmaLoaded}/>}
        {tab==='Learn'    && <Learn say={say} onReadings={()=>setReadingsOpen(true)} news={recoveryNews} complete={learnComplete} onComplete={advanceLearn} inviteXP={inviteXP}/>}
        <View style={[styles.calmTab, tab!=='Calm'&&styles.hidden]}>
          <Calm player={calmPlayer} soundscape={currentSoundscape} soundscapes={SOUNDSCAPES} onSelectSoundscape={setCurrentSoundscape}/>
        </View>
        {tab==='Connect'  && <Connect say={say}/>}
        {tab==='You'      && <You say={say} profile={profile} sobrietyDays={sobrietyDays} editProfile={()=>setEditingProfile(true)} onSignOut={handleSignOut} addEntry={addJournalEntry} goJournal={()=>setTab('Journal')} entries={journalEntries} saveProfile={saveProfile} isAdmin={authEmail.toLowerCase()==='matty@purepulse.one'} sosEnabled={sosEnabled} onToggleSos={toggleSos} onInviteSent={earnInviteXP}/>}
        {tab==='Journal'  && <Journal say={say} entries={journalEntries} onAdd={addJournalEntry}/>}
      </View>
      <View style={styles.tabbar}>
        {[['Today','home-outline'],['Meetings','compass-outline'],['Learn','sparkles-outline'],['Calm','headset-outline'],['Connect','people-outline'],['You','person-outline']].map(([label,icon])=>
          <Pressable key={label} onPress={()=>setTab(label)} style={styles.tab}>
            <Icon name={icon} size={22} color={tab===label?C.mint:C.muted}/>
            <Text style={[styles.tabText,tab===label&&{color:C.mint}]}>{label}</Text>
          </Pressable>
        )}
      </View>
      <Modal visible={bell} transparent animationType="slide">
        <Pressable style={styles.modalBack} onPress={()=>setBell(false)}>
          <Pressable style={styles.sheet} onPress={()=>{}}>
            <View style={styles.handle}/>
            <Text style={styles.sheetTitle}>Reminders</Text>
            <Text style={styles.sheetCopy}>Meeting reminders and daily uplifts are set in the You tab under Reminders.</Text>
            <Button label="Got it" onPress={()=>setBell(false)} icon="checkmark"/>
          </Pressable>
        </Pressable>
      </Modal>
      {toast?<View style={styles.toast}><Icon name="checkmark-circle" color={C.mint}/><Text style={styles.toastText}>{toast}</Text></View>:null}
      <Modal visible={editingProfile} animationType="slide">
        <ProfileEditor profile={profile} onSave={saveProfile} onCancel={()=>setEditingProfile(false)}/>
      </Modal>
      <Modal visible={readingsOpen} animationType="slide">
        <ReadingsLibrary onClose={()=>setReadingsOpen(false)}/>
      </Modal>
    </SafeAreaView>
  );
}

// ─── SPLASH ──────────────────────────────────────────────────────────────────
const SPLASH_MESSAGES = [
  'You are not alone in this.','Every step forward counts, no matter how small.',
  "Courage doesn't always roar. Sometimes it shows up quietly.",'Today is a new beginning.',
  'Your story is still being written.',"Healing is not linear — and that's okay.",
  'You deserve a life you want to live.','One day at a time is enough.',
  'There is room for you here.','Recovery is possible. You are proof.',
];

function SplashScreen() {
  const [msgIndex, setMsgIndex] = useState(Math.floor(Math.random()*SPLASH_MESSAGES.length));
  const [fadeMsg, setFadeMsg] = useState(false);
  const starPulse = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.7)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const textFade = useRef(new Animated.Value(0)).current;
  const floatY = useRef(new Animated.Value(0)).current;
  useEffect(()=>{
    Animated.timing(textFade,{toValue:1,duration:900,easing:Easing.out(Easing.quad),useNativeDriver:true}).start();
    Animated.loop(Animated.sequence([Animated.timing(floatY,{toValue:-10,duration:2800,easing:Easing.inOut(Easing.sin),useNativeDriver:true}),Animated.timing(floatY,{toValue:0,duration:2800,easing:Easing.inOut(Easing.sin),useNativeDriver:true})])).start();
    Animated.loop(Animated.parallel([Animated.timing(ringScale,{toValue:1.8,duration:2600,easing:Easing.out(Easing.quad),useNativeDriver:true}),Animated.sequence([Animated.timing(ringOpacity,{toValue:.45,duration:900,useNativeDriver:true}),Animated.timing(ringOpacity,{toValue:0,duration:1700,useNativeDriver:true})])])).start();
    Animated.loop(Animated.sequence([Animated.timing(starPulse,{toValue:1,duration:1800,easing:Easing.inOut(Easing.sin),useNativeDriver:false}),Animated.timing(starPulse,{toValue:0,duration:1800,easing:Easing.inOut(Easing.sin),useNativeDriver:false})])).start();
    const interval=setInterval(()=>{setFadeMsg(true);setTimeout(()=>{setMsgIndex(i=>(i+1)%SPLASH_MESSAGES.length);setFadeMsg(false);},600);},4200);
    return ()=>clearInterval(interval);
  },[starPulse,ringScale,ringOpacity,textFade,floatY]);
  const iconColor=starPulse.interpolate({inputRange:[0,1],outputRange:['#5DE0A6','#75B8FF']});
  return (
    <SafeAreaView style={styles.splashSafe}><StatusBar style="light"/>
      <View style={styles.splashBg}/><View style={styles.splashBgAccent}/>
      {[[56,120],[80,290],[24,430],[140,180],[30,350],[160,80],[95,510],[48,600]].map(([x,y],i)=>(
        <Animated.View key={i} style={[styles.splashStar,{left:x,top:y,opacity:starPulse.interpolate({inputRange:[0,1],outputRange:[0.2+i*0.06,0.7+i*0.04]})}]}/>
      ))}
      <Animated.View style={[styles.splashContent,{opacity:textFade}]}>
        <View style={styles.splashLogoWrap}>
          <Animated.View style={[styles.splashRing,{transform:[{scale:ringScale}],opacity:ringOpacity}]}/>
          <Animated.View style={[styles.splashIconOuter,{transform:[{translateY:floatY}]}]}>
            <View style={styles.splashIconBg}/>
            <Animated.Text style={[styles.splashIcon,{color:iconColor}]}>âœ¦</Animated.Text>
          </Animated.View>
        </View>
        <Animated.Text style={[styles.splashBrand,{transform:[{translateY:floatY}]}]}>NORTHSTAR</Animated.Text>
        <Text style={styles.splashTagline}>recovery, one steady step at a time</Text>
        <View style={styles.splashMsgWrap}><Text style={[styles.splashMsg,fadeMsg&&{opacity:.1}]}>{SPLASH_MESSAGES[msgIndex]}</Text></View>
        <View style={styles.splashDots}>{[0,1,2].map(i=><Animated.View key={i} style={[styles.splashDot,{opacity:starPulse.interpolate({inputRange:[0,.33,.66,1],outputRange:i===0?[1,.3,.3,1]:i===1?[.3,1,.3,.3]:[.3,.3,1,.3]})}]}/>)}</View>
      </Animated.View>
    </SafeAreaView>
  );
}

// ─── PROFILE EDITOR ──────────────────────────────────────────────────────────
function ProfileEditor({ profile, onSave, onCancel }) {
  const [draft, setDraft] = useState(profile);
  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission needed','Allow photo access in Settings to set a profile photo.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes:['images'], allowsEditing:true, aspect:[1,1], quality:0.35, base64:true });
    if (!result.canceled && result.assets?.[0]) setDraft(p=>({...p,photo:result.assets[0].uri,photoBase64:result.assets[0].base64||''}));
  };
  return (
    <SafeAreaView style={styles.onboardSafe}>
      <ScrollView contentContainerStyle={styles.onboardScroll} automaticallyAdjustKeyboardInsets>
        <View style={styles.rowBetween}><Pressable onPress={onCancel}><Icon name="close" color={C.warm}/></Pressable><Text style={styles.onboardKicker}>PROFILE & PRIVACY</Text></View>
        <Text style={styles.onboardTitle}>Only what feels right.</Text>
        <Text style={styles.onboardCopy}>Your pseudonym is what others may see — not your legal name. Recovery details stay private.</Text>
        <Pressable onPress={pickPhoto} style={styles.photoRow}>
          <Avatar photo={draft.photo} initial={(draft.pseudonym||'?').charAt(0).toUpperCase()} size={72} radius={22}/>
          <View style={{flex:1}}><Text style={styles.cardTitle}>Profile photo</Text><Text style={styles.muted}>Optional · tap to choose from your library</Text></View>
          <Icon name="camera-outline" color={C.mint}/>
        </Pressable>
        <Field label="PSEUDONYM (OPTIONAL)" value={draft.pseudonym} onChange={v=>setDraft(p=>({...p,pseudonym:v}))} placeholder="How should we know you?" autoCapitalize="words"/>
        <View style={styles.field}><Text style={styles.fieldLabel}>BIO (OPTIONAL)</Text><TextInput multiline value={draft.bio} onChangeText={v=>setDraft(p=>({...p,bio:v}))} placeholder="A few words, if you want." placeholderTextColor={C.muted} style={[styles.fieldInput,styles.bioInput]}/></View>
        <Field label="DATE OF BIRTH (OPTIONAL)" value={draft.dob} onChange={v=>setDraft(p=>({...p,dob:formatDateInput(v)}))} placeholder="MM/DD/YYYY"/>
        <Text style={styles.fieldLabel}>GENDER (OPTIONAL)</Text>
        <View style={styles.choiceWrap}>{['Woman','Man','Nonbinary','Prefer not to say'].map(x=><Choice key={x} label={x} active={draft.gender===x} onPress={()=>setDraft(p=>({...p,gender:x}))}/>)}</View>
        <Text style={styles.fieldLabel}>GROUP PREFERENCE</Text>
        <View style={styles.choiceWrap}>{['Women-only','Men-only','All groups'].map(x=><Choice key={x} label={x} active={draft.groupPreference===x} onPress={()=>setDraft(p=>({...p,groupPreference:x}))}/>)}</View>
        <Field label="SOBRIETY DATE (OPTIONAL)" value={draft.sobrietyDate} onChange={v=>setDraft(p=>({...p,sobrietyDate:formatDateInput(v)}))} placeholder="MM/DD/YYYY"/>
        <Text style={[styles.onboardKicker,{marginTop:8}]}>SPONSOR (OPTIONAL)</Text>
        <Text style={[styles.muted,{marginBottom:4}]}>Save your sponsor's info for one-tap support.</Text>
        <Field label="SPONSOR NAME" value={draft.sponsor?.name||''} onChange={v=>setDraft(p=>({...p,sponsor:{...p.sponsor,name:v}}))} placeholder="Their name" autoCapitalize="words"/>
        <Field label="SPONSOR PHONE" value={draft.sponsor?.phone||''} onChange={v=>setDraft(p=>({...p,sponsor:{...p.sponsor,phone:formatPhoneInput(v)}}))} placeholder="+1 (555) 000-0000"/>
        <Text style={[styles.onboardKicker,{marginTop:8}]}>TRUSTED PERSON (OPTIONAL)</Text>
        <Text style={[styles.muted,{marginBottom:4}]}>Someone who can check on you if they're concerned.</Text>
        <Field label="TRUSTED PERSON NAME" value={draft.trustedPerson?.name||''} onChange={v=>setDraft(p=>({...p,trustedPerson:{...p.trustedPerson,name:v}}))} placeholder="Their name" autoCapitalize="words"/>
        <Field label="TRUSTED PERSON PHONE" value={draft.trustedPerson?.phone||''} onChange={v=>setDraft(p=>({...p,trustedPerson:{...p.trustedPerson,phone:formatPhoneInput(v)}}))} placeholder="+1 (555) 000-0000"/>
        <View style={[styles.setting,{borderBottomWidth:0,marginTop:4}]}>
          <View style={{flex:1}}><Text style={styles.cardTitle}>Allow trusted person access</Text><Text style={styles.muted}>They can see your check-in status.</Text></View>
          <Switch value={!!draft.trustedPerson?.enabled} onValueChange={v=>setDraft(p=>({...p,trustedPerson:{...p.trustedPerson,enabled:v}}))} trackColor={{false:C.line,true:'#3d9074'}} thumbColor={draft.trustedPerson?.enabled?C.mint:C.muted}/>
        </View>
        <Button label="Save profile" onPress={()=>onSave(draft)} icon="checkmark"/>
        <Pressable onPress={onCancel} style={styles.skip}><Text style={styles.textButtonLabel}>Cancel</Text></Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── ONBOARDING ──────────────────────────────────────────────────────────────
function Onboarding({ onComplete }) {
  const [mode, setMode] = useState('welcome');
  const [busy, setBusy] = useState(false);
  const [account, setAccount] = useState({email:'',password:''});
  const [code, setCode] = useState('');
  const [profile, setProfile] = useState({pseudonym:'',bio:'',photo:'',dob:'',gender:'',groupPreference:'All groups',sobrietyDate:''});
  const [message, setMessage] = useState('');
  const complete = () => onComplete(profile);
  const handleSignUp = async()=>{
    if (!account.email.trim()||account.password.length<8) return setMessage('Enter an email and a password with at least 8 characters.');
    setBusy(true); setMessage('');
    try { const r=await createAccount({email:account.email,password:account.password}); if(r.nextStep==='CONFIRM_SIGN_UP') setMode('confirm'); else complete(); }
    catch(err){ setMessage(err.message||'Account creation failed.'); } finally { setBusy(false); }
  };
  const handleConfirm = async()=>{
    if (code.trim().length<4) return setMessage('Enter the 6-digit code from your email.');
    setBusy(true); setMessage('');
    try { await confirmAccount({email:account.email,code}); await signInWithPassword({email:account.email,password:account.password}); setMode('profile'); }
    catch(err){ setMessage(err.message||'Code not accepted.'); } finally { setBusy(false); }
  };
  const handleSignIn = async()=>{
    if (!account.email.trim()||!account.password) return setMessage('Enter your email and password.');
    setBusy(true); setMessage('');
    try { const r=await signInWithPassword({email:account.email,password:account.password}); if(!r.complete) return setMessage('Additional sign-in step required.'); complete(); }
    catch(err){ setMessage(err.message||'Sign-in failed.'); } finally { setBusy(false); }
  };
  if (mode==='welcome') return (
    <SafeAreaView style={styles.onboardSafe}><StatusBar style="light"/>
      <View style={styles.onboardStar}><Icon name="compass" size={40} color={C.mint}/></View>
      <View style={styles.welcomeBody}><Text style={styles.brand}>NORTHSTAR</Text><Text style={styles.welcomeTitle}>A quiet place to find your way back.</Text><Text style={styles.welcomeCopy}>Support, reflection, and connection — at a pace that belongs to you.</Text></View>
      <View style={styles.welcomeBottom}><Button label="Create an account" onPress={()=>setMode('create')} icon="arrow-forward"/><Pressable onPress={()=>setMode('signin')} style={styles.textButton}><Text style={styles.textButtonLabel}>I already have an account</Text><Icon name="arrow-forward" size={16} color={C.mint}/></Pressable></View>
    </SafeAreaView>
  );
  if (mode==='signin') return (
    <SafeAreaView style={styles.onboardSafe}><ScrollView contentContainerStyle={styles.onboardScroll} automaticallyAdjustKeyboardInsets>
      <Pressable onPress={()=>setMode('welcome')}><Icon name="arrow-back" color={C.warm}/></Pressable>
      <Text style={styles.onboardKicker}>WELCOME BACK</Text><Text style={styles.onboardTitle}>Your space is here.</Text>
      <Field label="EMAIL" value={account.email} onChange={v=>setAccount(a=>({...a,email:v}))} placeholder="you@example.com"/>
      <Field label="PASSWORD" value={account.password} onChange={v=>setAccount(a=>({...a,password:v}))} placeholder="••••••••" secure/>
      {message?<Text style={styles.statusNote}>{message}</Text>:null}
      <Button label={busy?'Signing in…':'Sign in'} onPress={busy?undefined:handleSignIn} icon="log-in-outline"/>
      <Pressable onPress={()=>setMode('create')} style={styles.textButton}><Text style={styles.textButtonLabel}>New here? Create an account</Text></Pressable>
    </ScrollView></SafeAreaView>
  );
  if (mode==='confirm') return (
    <SafeAreaView style={styles.onboardSafe}><ScrollView contentContainerStyle={styles.onboardScroll} automaticallyAdjustKeyboardInsets>
      <Text style={styles.onboardKicker}>CHECK YOUR EMAIL</Text><Text style={styles.onboardTitle}>One more step.</Text>
      <Text style={styles.onboardCopy}>We sent a 6-digit code to {account.email}.</Text>
      <Field label="CONFIRMATION CODE" value={code} onChange={setCode} placeholder="123456"/>
      {message?<Text style={styles.statusNote}>{message}</Text>:null}
      <Button label={busy?'Confirming…':'Confirm account'} onPress={busy?undefined:handleConfirm} icon="checkmark-circle"/>
    </ScrollView></SafeAreaView>
  );
  if (mode==='profile') return (
    <SafeAreaView style={styles.onboardSafe}><ScrollView contentContainerStyle={styles.onboardScroll} automaticallyAdjustKeyboardInsets>
      <Text style={styles.onboardKicker}>WELCOME TO NORTHSTAR</Text><Text style={styles.onboardTitle}>Tell us a little about you.</Text>
      <Text style={styles.onboardCopy}>All optional. Only your pseudonym may be visible to other members.</Text>
      <Field label="PSEUDONYM (OPTIONAL)" value={profile.pseudonym} onChange={v=>setProfile(p=>({...p,pseudonym:v}))} placeholder="How should we know you?" autoCapitalize="words"/>
      <Field label="SOBRIETY DATE (OPTIONAL)" value={profile.sobrietyDate} onChange={v=>setProfile(p=>({...p,sobrietyDate:formatDateInput(v)}))} placeholder="MM/DD/YYYY"/>
      <Text style={styles.fieldLabel}>GROUP PREFERENCE</Text>
      <View style={styles.choiceWrap}>{['Women-only','Men-only','All groups'].map(x=><Choice key={x} label={x} active={profile.groupPreference===x} onPress={()=>setProfile(p=>({...p,groupPreference:x}))}/>)}</View>
      <Button label="Enter Northstar" onPress={complete} icon="sparkles"/>
      <Pressable onPress={complete} style={styles.skip}><Text style={styles.textButtonLabel}>Skip for now</Text></Pressable>
    </ScrollView></SafeAreaView>
  );
  return (
    <SafeAreaView style={styles.onboardSafe}><ScrollView contentContainerStyle={styles.onboardScroll} automaticallyAdjustKeyboardInsets>
      <Pressable onPress={()=>setMode('welcome')}><Icon name="arrow-back" color={C.warm}/></Pressable>
      <Text style={styles.onboardKicker}>CREATE ACCOUNT</Text><Text style={styles.onboardTitle}>A secure beginning.</Text>
      <Text style={styles.onboardCopy}>Your email is used only for account access. It is never shown to other members.</Text>
      <Field label="EMAIL" value={account.email} onChange={v=>setAccount(a=>({...a,email:v}))} placeholder="you@example.com"/>
      <Field label="PASSWORD" value={account.password} onChange={v=>setAccount(a=>({...a,password:v}))} placeholder="At least 8 characters" secure/>
      {message?<Text style={styles.statusNote}>{message}</Text>:null}
      <Button label={busy?'Creating account…':'Continue'} onPress={busy?undefined:handleSignUp} icon="arrow-forward"/>
      <Pressable onPress={()=>setMode('signin')} style={styles.textButton}><Text style={styles.textButtonLabel}>Already have an account? Sign in</Text></Pressable>
    </ScrollView></SafeAreaView>
  );
}

// ─── TODAY ────────────────────────────────────────────────────────────────────
function Today({ say, go, profile, sobrietyDays, meetings, sosEnabled }) {
  const sendSos = () => {
    if (!sosEnabled) {
      Alert.alert('Nearby support is off','Turn on "Nearby support (SOS)" in the You tab first — it lets members near you know when someone needs help, and lets you reach them too.',[{text:'OK'}]);
      return;
    }
    const fire = async radiusKm => {
      try {
        const r = await apiRequest('/v1/sos',{method:'POST',body:JSON.stringify({radiusKm})});
        say(r.alerted>0?`${r.alerted} nearby member${r.alerted===1?'':'s'} alerted. You are not alone.`:'No opted-in members in range right now — try 988 or your sponsor.');
      } catch (e) {
        say(String(e?.message||'').includes('rate')?'SOS was sent recently. Give it a few minutes.':'Could not send SOS. Try 988 or your sponsor.');
      }
    };
    Alert.alert('Send SOS to nearby members?','Members who opted into nearby support within your chosen radius get a push notification that you need help. Your exact location is never shared.',[
      {text:'Cancel',style:'cancel'},
      {text:'10 mi',onPress:()=>fire(16)},
      {text:'25 mi',onPress:()=>fire(40)},
      {text:'50 mi',onPress:()=>fire(80)},
    ]);
  };
  const name = profile.pseudonym || 'friend';
  const next = nextMeeting(meetings);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const [showDays, setShowDays] = useState(false);
  const hasSponsor = profile.sponsor?.name && profile.sponsor?.phone;
  const helpNow = () => {
    if (hasSponsor) {
      Alert.alert(`Reach out to ${profile.sponsor.name}?`, 'Opening your phone now.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => Linking.openURL(`tel:${profile.sponsor.phone}`) },
        { text: 'Text', onPress: () => Linking.openURL(`sms:${profile.sponsor.phone}`) },
      ]);
    } else {
      Alert.alert('Need support now?', 'Call or text 988 for immediate, confidential support.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call 988', onPress: () => Linking.openURL('tel:988') },
      ]);
    }
  };
  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <Text style={styles.eyebrow}>A GENTLE START</Text>
      <Text style={styles.h1}>{greeting}, {name}.</Text>
      <Text style={styles.intro}>You don't have to do the whole journey today. Just this moment.</Text>
      {sobrietyDays !== null && (
        <Card style={styles.streak}>
          <View style={{flex:1}}>
            <Text style={styles.mini}>YOUR CLEAR DAY STREAK</Text>
            <View style={{flexDirection:'row',alignItems:'center',gap:10,marginTop:2}}>
              <Text style={styles.streakNum}>{showDays ? sobrietyDays : '• • •'} <Text style={styles.streakUnit}>days</Text></Text>
              <Pressable onPress={()=>setShowDays(v=>!v)} style={styles.revealBtn} hitSlop={8}>
                <Icon name={showDays?'eye-off-outline':'eye-outline'} size={15} color={C.muted}/>
                <Text style={styles.revealText}>{showDays?'Hide':'Reveal'}</Text>
              </Pressable>
            </View>
            <Text style={styles.muted}>{!showDays ? 'Tap reveal to see your count.' : sobrietyDays === 0 ? 'Today is day one. You showed up.' : sobrietyDays === 1 ? 'One day. That\'s everything.' : 'A quiet streak, a real win.'}</Text>
          </View>
          <View style={styles.sun}><Icon name="sunny" size={30} color={C.gold}/></View>
        </Card>
      )}
      {hasSponsor && (
        <Pressable onPress={helpNow} style={styles.sponsorQuick}>
          <Icon name="person-circle-outline" size={22} color={C.mint}/>
          <View style={{flex:1}}>
            <Text style={styles.sponsorQuickName}>{profile.sponsor.name}</Text>
            <Text style={styles.sponsorQuickSub}>Your sponsor · tap to reach out</Text>
          </View>
          <View style={{flexDirection:'row',gap:8}}>
            <Pressable onPress={()=>Linking.openURL(`tel:${profile.sponsor.phone}`)} style={styles.contactChip}>
              <Icon name="call-outline" size={16} color={C.ink}/>
            </Pressable>
            <Pressable onPress={()=>Linking.openURL(`sms:${profile.sponsor.phone}`)} style={[styles.contactChip,{backgroundColor:C.blue}]}>
              <Icon name="chatbubble-outline" size={16} color={C.ink}/>
            </Pressable>
          </View>
        </Pressable>
      )}
      {next ? (
        <Card>
          <View style={styles.rowBetween}>
            <View><Text style={styles.mini}>NEXT MEETING</Text><Text style={styles.cardTitle}>{next.title}</Text><Text style={styles.muted}>Remote · {next.time} · in {next.minsAway} min</Text></View>
            <View style={styles.remote}><Icon name="videocam-outline" color={C.mint}/></View>
          </View>
          <Button label="Join meeting" onPress={()=>openWeb(next.url)} icon="videocam"/>
        </Card>
      ) : (
        <Card>
          <View style={styles.rowBetween}>
            <View><Text style={styles.mini}>MEETINGS</Text><Text style={styles.cardTitle}>Find your room</Text><Text style={styles.muted}>CMA meetings available now</Text></View>
            <View style={styles.remote}><Icon name="compass-outline" color={C.mint}/></View>
          </View>
          <Button label="Browse meetings" onPress={()=>go('Meetings')} icon="compass-outline"/>
        </Card>
      )}
      <Text style={styles.quote}>"A little connection can change the shape of a whole evening."</Text>
      <View style={styles.actionRow}>
        <Pressable style={styles.quick} onPress={()=>go('Meetings')}><Icon name="compass-outline" color={C.blue}/><Text style={styles.quickText}>Find a meeting</Text></Pressable>
        <Pressable style={styles.quick} onPress={()=>go('Calm')}><Icon name="headset-outline" color={C.mint}/><Text style={styles.quickText}>Calm & breathe</Text></Pressable>
      </View>
      <Card>
        <Text style={styles.mini}>MORE WAYS IN</Text>
        <Pressable onPress={()=>go('Connect')} style={styles.inlineAction}><Icon name="chatbubbles-outline" color={C.mint}/><Text style={styles.inlineText}>Connection, gently</Text></Pressable>
        <Pressable onPress={()=>go('Learn')} style={styles.inlineAction}><Icon name="sparkles-outline" color={C.gold}/><Text style={styles.inlineText}>Learn by living it</Text></Pressable>
        <Pressable onPress={()=>go('Calm')} style={styles.inlineAction}><Icon name="headset-outline" color={C.blue}/><Text style={styles.inlineText}>Calm soundscapes</Text></Pressable>
      </Card>
      <Pressable style={[styles.support,{borderColor:'#8a4444'}]} onPress={sendSos}>
        <Icon name="alert-circle" size={17} color="#ff8a80"/><Text style={[styles.supportText,{color:'#ff8a80'}]}>SOS — alert nearby members</Text><Icon name="navigate-outline" size={16} color="#ff8a80"/>
      </Pressable>
      <Pressable style={styles.support} onPress={helpNow}>
        <Icon name="heart" size={17} color={C.gold}/><Text style={styles.supportText}>{hasSponsor ? `Reach out to ${profile.sponsor.name}` : 'Need support now?'}</Text><Icon name={hasSponsor ? 'call-outline' : 'heart-outline'} size={16} color={C.gold}/>
      </Pressable>
    </ScrollView>
  );
}

// ─── MEETINGS ─────────────────────────────────────────────────────────────────
function Meetings({ say, profile, meetings, loading }) {
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [roomUrl, setRoomUrl] = useState(null);
  const [coords, setCoords] = useState(null);
  const nearMe = async () => {
    if (coords) { setCoords(null); return; }
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') { say('Allow location access in Settings to sort by distance.'); return; }
    try {
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      say('Sorted by distance.');
    } catch { say('Could not read your location right now.'); }
  };
  const q = query.trim().toLowerCase();
  let shown = meetings.filter(m=>(filter==='All'||m.format===filter)&&(!q||(m.searchText||`${m.title} ${m.region} ${m.day}`.toLowerCase()).includes(q)));
  if (coords) {
    shown = shown
      .map(m=>({ ...m, distanceMi: m.lat!=null ? distanceKm(coords.lat,coords.lng,m.lat,m.lng)*0.621371 : null }))
      .sort((a,b)=>(a.distanceMi??1e9)-(b.distanceMi??1e9));
  }
  shown = shown.slice(0, 80);
  const meetNow = nextMeeting(meetings);

  const openRoom = () => {
    const id = Math.random().toString(36).slice(2, 10);
    const url = `https://meet.jit.si/northstar-${id}`;
    setRoomUrl(url);
    Alert.alert(
      'Your meeting room is ready',
      `Share this link with others to join your room:\nmeet.jit.si/northstar-${id}`,
      [
        { text: 'Copy & Open', onPress: () => { Share.share({ message: `Join my Northstar Recovery meeting: ${url}`, title: 'Northstar Recovery Meeting' }); openWeb(url); } },
        { text: 'Share link', onPress: () => Share.share({ message: `Join my Northstar Recovery meeting: ${url}` }) },
        { text: 'Just open', onPress: () => openWeb(url) },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Text style={styles.h1}>Find your room</Text>
      <Text style={styles.intro}>Choose what feels possible today.</Text>
      <Card style={{borderColor:C.blue,borderWidth:1}}>
        <View style={styles.rowBetween}>
          <View style={{flex:1}}>
            <Text style={styles.mini}>HOST YOUR OWN MEETING</Text>
            <Text style={styles.cardTitle}>Start a free video room</Text>
            <Text style={styles.muted}>Share the link and anyone can join instantly.</Text>
          </View>
          <View style={[styles.remote,{backgroundColor:'#1a2040'}]}><Icon name="videocam-outline" color={C.blue}/></View>
        </View>
        <Button label="Open a video room" onPress={openRoom} icon="videocam"/>
      </Card>
      {profile.groupPreference!=='All groups'&&<View style={styles.preferenceNote}><Icon name="options-outline" size={16} color={C.mint}/><Text style={styles.preferenceText}>Your preference: {profile.groupPreference}.</Text></View>}
      {meetNow && (
        <Card style={{borderColor:C.mint,borderWidth:1.5}}>
          <Text style={styles.mini}>MEET NOW</Text>
          <Text style={styles.cardTitle}>{meetNow.title}</Text>
          <Text style={styles.muted}>Starts in {meetNow.minsAway} min · {meetNow.region}</Text>
          <Button label="Join now" onPress={()=>openWeb(meetNow.url)} icon="videocam"/>
        </Card>
      )}
      <View style={styles.search}><Icon name="search-outline" color={C.muted}/><TextInput value={query} onChangeText={setQuery} placeholder="Search meetings" placeholderTextColor={C.muted} style={styles.input}/></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.segmentScroll}>
        {['All','Remote','In-person','Hybrid'].map(x=><Pressable key={x} onPress={()=>setFilter(x)} style={[styles.segment,filter===x&&styles.segmentActive]}><Text style={[styles.segmentText,filter===x&&styles.segmentTextActive]}>{x}</Text></Pressable>)}
      </ScrollView>
      {loading&&<View style={{alignItems:'center',padding:20}}><ActivityIndicator color={C.mint}/><Text style={[styles.muted,{marginTop:8}]}>Loading CMA meetings…</Text></View>}
      <Pressable onPress={nearMe} style={[styles.visualChoice,coords&&styles.visualChoiceActive]}><Icon name="navigate-outline" size={15} color={coords?C.ink:C.muted}/><Text style={[styles.visualText,coords&&styles.visualTextActive]}>{coords?'Sorted by distance · tap to clear':'Sort by distance from me'}</Text></Pressable>
      <Text style={styles.results}>{shown.length} meeting{shown.length!==1?'s':''} found</Text>
      {shown.map(m=>(
        <Card key={m.id} style={styles.meeting}>
          <View style={styles.time}><Text style={styles.timeText}>{m.time}</Text><Text style={styles.timeZone}>{m.day||'daily'}</Text></View>
          <View style={{flex:1}}>
            <Text style={styles.cardTitle}>{m.title}</Text>
            <Text style={styles.meetingMeta}>{m.format} · {m.region}{m.distanceMi!=null?` · ${m.distanceMi<10?m.distanceMi.toFixed(1):Math.round(m.distanceMi)} mi`:''}</Text>
            <Text style={styles.muted}>{m.language}</Text>
            {m.notes?<Text style={[styles.muted,{fontSize:12}]}>{m.notes}</Text>:null}
            <Pressable onPress={()=>{
              if (!m.url) return say('No link available');
              if (m.passcode) { Clipboard.setStringAsync(m.passcode).catch(()=>{}); say(`Passcode ${m.passcode} copied — paste it if Zoom asks.`); }
              openWeb(m.url);
            }} style={styles.inlineAction}>
              <Text style={styles.inlineText}>{m.action}{m.passcode?` · PW ${m.passcode}`:''}</Text>
              <Icon name={m.format==='Remote'?'videocam-outline':'navigate-outline'} size={16} color={C.mint}/>
            </Pressable>
          </View>
        </Card>
      ))}
      {!shown.length&&!loading&&<Card style={styles.empty}><Icon name="search-outline" size={26} color={C.muted}/><Text style={styles.cardTitle}>No meetings match</Text><Text style={styles.muted}>Try another filter or search term.</Text></Card>}
      <Card>
        <Text style={styles.mini}>CMA DIRECTORY</Text>
        <Text style={styles.muted}>Browse the full Crystal Meth Anonymous meeting directory online.</Text>
        <Pressable onPress={()=>openWeb('https://www.crystalmeth.org/meetings/?type=online')} style={styles.inlineAction}><Text style={styles.inlineText}>View all online meetings</Text><Icon name="open-outline" size={16} color={C.mint}/></Pressable>
      </Card>
    </ScrollView>
  );
}

// ─── LEARN ────────────────────────────────────────────────────────────────────
function Learn({ say, onReadings, news, complete, onComplete, inviteXP=0 }) {
  const [open, setOpen] = useState(1);
  const totalXP = LEARN_MODULES.slice(0,complete).reduce((s,m)=>s+m.xp,0) + inviteXP;
  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Text style={styles.h1}>Learn by living it</Text>
      <Text style={styles.intro}>Tiny chapters. Practical ideas. No pressure to rush.</Text>
      <Pressable onPress={onReadings} style={styles.readingsEntry}>
        <View style={styles.readingsBadge}><Icon name="book-outline" size={22} color={C.ink}/></View>
        <View style={{flex:1}}>
          <Text style={styles.cardTitle}>CMA Readings library</Text>
          <Text style={styles.muted}>{READINGS.length} readings · PDF + audio narration by Jessica</Text>
        </View>
        <Icon name="chevron-forward" color={C.muted}/>
      </Pressable>
      <Card style={styles.xp}>
        <View><Text style={styles.mini}>YOUR NORTHSTAR PATH</Text><Text style={styles.xpNum}>{totalXP} XP <Text style={styles.xpSmall}>earned</Text></Text><Text style={styles.muted}>{complete} of {LEARN_MODULES.length} modules complete{inviteXP>0?` · ${inviteXP} XP from invites`:''}</Text></View>
        <Icon name="sparkles" size={32} color={C.gold}/>
      </Card>
      {LEARN_MODULES.map((m,i)=>{
        const locked=i+1>complete+1, done=i+1<=complete, isOpen=open===m.id, completable=!locked&&!done;
        return (
          <Card key={m.id} style={[styles.module,locked&&{opacity:.56}]}>
            <Pressable onPress={()=>setOpen(isOpen?0:m.id)}>
              <View style={styles.rowBetween}>
                <View style={[styles.moduleDot,done&&{backgroundColor:C.mint}]}>
                  <Icon name={done?'checkmark':locked?'lock-closed':m.icon} size={16} color={done?C.ink:C.muted}/>
                </View>
                <View style={{flex:1}}>
                  <Text style={styles.cardTitle}>{m.title}</Text>
                  <Text style={styles.muted}>{done?'Complete · ':locked?'Next up · ':'Ready · '}{m.xp} XP</Text>
                </View>
                <Icon name={isOpen?'chevron-up':'chevron-down'} color={C.muted}/>
              </View>
            </Pressable>
            {isOpen&&<View style={styles.moduleDetail}>
              <Text style={styles.moduleCopy}>{m.copy}</Text>
              <Text style={[styles.muted,{lineHeight:20,marginBottom:4}]}>{m.detail}</Text>
              {m.steps.map(s=><Text key={s} style={styles.step}>• {s}</Text>)}
              {locked
                ? <Text style={[styles.muted,{fontStyle:'italic'}]}>Finish the earlier modules to complete this one — reading ahead is always okay.</Text>
                : <Button label={done?'Review module':'Complete module'} onPress={()=>{if(!done)onComplete(m.id);say(done?'Module opened for review':`${m.title} complete — ${m.xp} XP earned`);}} icon={done?'refresh':'checkmark'}/>}
            </View>}
          </Card>
        );
      })}
      {news.length > 0 && <>
        <Text style={[styles.sectionTitle,{marginTop:8}]}>RECOVERY RESEARCH & NEWS</Text>
        <Text style={[styles.muted,{marginBottom:4}]}>From NIDA — the National Institute on Drug Abuse.</Text>
        {news.map(item=>(
          <Pressable key={item.id} onPress={()=>openWeb(item.link)} style={styles.newsCard}>
            <View style={styles.newsBadge}><Icon name="newspaper-outline" size={16} color={C.ink}/></View>
            <View style={{flex:1}}>
              <Text style={styles.newsTitle} numberOfLines={2}>{item.title}</Text>
              {item.summary?<Text style={styles.newsSummary} numberOfLines={3}>{item.summary}</Text>:null}
              <Text style={styles.newsSource}>{item.source} · {item.pubDate?.slice(0,10)}</Text>
            </View>
            <Icon name="open-outline" size={15} color={C.muted}/>
          </Pressable>
        ))}
      </>}
    </ScrollView>
  );
}

// ─── CALM ─────────────────────────────────────────────────────────────────────
function Calm({ player, soundscape, soundscapes, onSelectSoundscape }) {
  const status = useAudioPlayerStatus(player);
  const [minutes, setMinutes] = useState(10);
  const [remaining, setRemaining] = useState(10*60);
  const [visual, setVisual] = useState('Breath');
  const [hapticLevel, setHapticLevel] = useState(1);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState('All');
  const isPlaying = status.playing;

  // player.loop covers most cases, but remote streams can still end; restart
  // so soundscapes play indefinitely until the member stops them.
  useEffect(()=>{
    if (status.didJustFinish) { try { player.seekTo(0); player.play(); } catch {} }
  },[status.didJustFinish, player]);

  // Control Center / lock screen media card.
  useEffect(()=>{
    if (!isPlaying) return;
    try {
      player.setActiveForLockScreen(true,
        { title: soundscape.name, artist: 'Northstar Recovery · Calm', albumTitle: soundscape.category, artworkUrl: BRAND_ART },
        { showSeekForward: false, showSeekBackward: false });
    } catch {}
  },[isPlaying, soundscape, player]);

  const infinite = minutes==='∞';
  useEffect(()=>{ setRemaining(infinite?Infinity:minutes*60); },[minutes,infinite]);
  useEffect(()=>{
    if (!isPlaying||infinite||remaining===0) return;
    const t=setInterval(()=>setRemaining(v=>v>0?v-1:0),1000);
    return ()=>clearInterval(t);
  },[isPlaying,remaining,infinite]);
  useEffect(()=>{ if(!infinite&&remaining===0&&isPlaying) player.pause(); },[remaining,isPlaying,player,infinite]);

  const togglePlayback = ()=>{
    if (isPlaying) player.pause();
    else { if(!infinite&&remaining===0) setRemaining(minutes*60); player.play(); }
  };
  const setSession = v=>{ player.pause(); player.seekTo(0); setMinutes(v); };
  const handleSelectSoundscape = s=>{ player.pause(); onSelectSoundscape(s); setPickerOpen(false); setRemaining(infinite?Infinity:minutes*60); };
  const display = infinite ? '∞' : `${String(Math.floor(remaining/60)).padStart(2,'0')}:${String(remaining%60).padStart(2,'0')}`;
  const categories = ['All',...new Set(soundscapes.map(s=>s.category))];
  const filtered = filterCategory==='All'?soundscapes:soundscapes.filter(s=>s.category===filterCategory);

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <Text style={styles.eyebrow}>A QUIET PLACE TO RESET</Text>
      <Text style={styles.h1}>Take a calm moment.</Text>
      <Card style={styles.playerCard}>
        <Text style={styles.cardTitle}>{soundscape.name}</Text>
        <Text style={styles.muted}>{soundscape.category} · {isPlaying?'Playing':'Paused'}</Text>
        <CalmVisual visual={visual} isPlaying={isPlaying} haptics={hapticLevel}/>
        <Text style={styles.timer}>{display}</Text>
        <Pressable onPress={togglePlayback} style={styles.playButton}>
          <Icon name={isPlaying?'pause':'play'} size={26} color={C.ink}/>
          <Text style={styles.playText}>{isPlaying?'Pause session':'Begin session'}</Text>
        </Pressable>
      </Card>
      <Text style={styles.sectionTitle}>CHOOSE A VISUAL LOOP</Text>
      <View style={styles.visualRow}>{[['Breath','ellipse-outline'],['Night','moon-outline'],['Waves','water-outline']].map(([name,icon])=><Pressable key={name} onPress={()=>setVisual(name)} style={[styles.visualChoice,visual===name&&styles.visualChoiceActive]}><Icon name={icon} size={18} color={visual===name?C.ink:C.muted}/><Text style={[styles.visualText,visual===name&&styles.visualTextActive]}>{name}</Text></Pressable>)}</View>
      {visual==='Breath'&&<View style={[styles.visualRow,{marginTop:2}]}>{[['Off',0],['Soft',1],['Strong',2]].map(([label,lvl])=><Pressable key={label} onPress={()=>setHapticLevel(lvl)} style={[styles.visualChoice,hapticLevel===lvl&&styles.visualChoiceActive]}><Icon name={lvl===0?'radio-outline':'radio'} size={15} color={hapticLevel===lvl?C.ink:C.muted}/><Text style={[styles.visualText,hapticLevel===lvl&&styles.visualTextActive]}>{label==='Off'?'Haptics off':`${label} haptics`}</Text></Pressable>)}</View>}
      <Text style={styles.sectionTitle}>CHOOSE YOUR SESSION</Text>
      <View style={styles.sessionRow}>{[5,10,20,'∞'].map(v=><Pressable key={v} onPress={()=>setSession(v)} style={[styles.session,minutes===v&&styles.sessionActive]}><Text style={[styles.sessionText,minutes===v&&styles.sessionTextActive]}>{v==='∞'?'∞':`${v} min`}</Text></Pressable>)}</View>
      <Pressable onPress={()=>setPickerOpen(true)} style={styles.soundscapePicker}>
        <Icon name="musical-notes-outline" color={C.mint}/>
        <Text style={styles.soundscapePickerText}>Choose soundscape ({soundscapes.length} available)</Text>
        <Icon name="chevron-forward" size={16} color={C.muted}/>
      </Pressable>
      <Card><View style={styles.row}><Icon name="ear-outline" size={25} color={C.gold}/><View style={{flex:1}}><Text style={styles.cardTitle}>Best with headphones</Text><Text style={styles.muted}>Binaural audio uses subtle differences between channels. Keep the volume comfortable.</Text></View></View></Card>
      <Card style={{borderColor:'#334455'}}><Text style={styles.mini}>A GENTLE REMINDER</Text><Text style={styles.muted}>This space supports relaxation, but it is not a substitute for urgent care or professional support.</Text></Card>
      <Modal visible={pickerOpen} animationType="slide">
        <SafeAreaView style={[styles.safe,{backgroundColor:'#141f31'}]}>
          <View style={[styles.header,{height:60}]}>
            <Text style={styles.sheetTitle}>Choose a soundscape</Text>
            <Pressable onPress={()=>setPickerOpen(false)}><Icon name="close" color={C.warm}/></Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.segmentScroll,{paddingHorizontal:16,marginBottom:8}]}>
            {categories.map(c=><Pressable key={c} onPress={()=>setFilterCategory(c)} style={[styles.segment,filterCategory===c&&styles.segmentActive,{marginRight:7}]}><Text style={[styles.segmentText,filterCategory===c&&styles.segmentTextActive]}>{c}</Text></Pressable>)}
          </ScrollView>
          <ScrollView contentContainerStyle={{padding:16,gap:8}}>
            {filtered.map(s=>(
              <Pressable key={s.name} onPress={()=>handleSelectSoundscape(s)} style={[styles.soundscapeRow,s.name===soundscape.name&&styles.soundscapeRowActive]}>
                <Icon name={s.icon} size={20} color={s.name===soundscape.name?C.ink:C.mint}/>
                <View style={{flex:1}}><Text style={[styles.cardTitle,s.name===soundscape.name&&{color:C.ink}]}>{s.name}</Text><Text style={[styles.muted,s.name===soundscape.name&&{color:'#1a4a3a'}]}>{s.category}</Text></View>
                {s.name===soundscape.name&&<Icon name="checkmark-circle" size={20} color={C.ink}/>}
              </Pressable>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </ScrollView>
  );
}

// Breathing guide — now the hero of the Calm screen, not a modal
// Watch-style continuous haptic pulses during inhale/exhale. level: 0 off, 1 soft, 2 strong.
function useBreathHaptics(level) {
  const timer = useRef(null);
  const stop = useCallback(()=>{ if(timer.current){clearInterval(timer.current);timer.current=null;} },[]);
  const pulse = useCallback((label,duration)=>{
    stop();
    if (!level) return;
    const style = level===2?Haptics.ImpactFeedbackStyle.Heavy:Haptics.ImpactFeedbackStyle.Light;
    const gap = level===2?160:320;
    if (label==='Breathe in'||label==='Breathe out') {
      Haptics.impactAsync(style).catch(()=>{});
      timer.current = setInterval(()=>Haptics.impactAsync(style).catch(()=>{}), gap);
      setTimeout(stop, duration-80);
    } else {
      Haptics.selectionAsync().catch(()=>{});
    }
  },[level,stop]);
  useEffect(()=>stop,[stop]);
  return { pulse, stop };
}

function BreathingGuide({ isPlaying, haptics }) {
  const pulse = useRef(new Animated.Value(.72)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const [phase, setPhase] = useState('Breathe in');
  const anim = useRef(null);
  const { pulse: hapticPulse, stop: hapticStop } = useBreathHaptics(haptics);
  useEffect(()=>{
    if (!isPlaying) { anim.current?.stop(); hapticStop(); setPhase('Ready'); return; }
    const steps = [['Breathe in',1.18,4000],['Hold',1.18,2000],['Breathe out',.72,4000],['Hold',.72,2000]];
    let idx=0, active=true;
    const run=()=>{
      if (!active) return;
      const [label,scale,dur]=steps[idx];
      setPhase(label);
      hapticPulse(label,dur);
      anim.current = Animated.parallel([
        Animated.timing(pulse,{toValue:scale,duration:dur,easing:Easing.inOut(Easing.sin),useNativeDriver:true}),
        Animated.timing(glow,{toValue:label==='Breathe in'||(label==='Hold'&&scale>1)?1:0,duration:dur,easing:Easing.inOut(Easing.sin),useNativeDriver:true}),
      ]);
      anim.current.start(({finished})=>{ if(finished&&active){ idx=(idx+1)%steps.length; run(); } });
    };
    run();
    return ()=>{ active=false; anim.current?.stop(); hapticStop(); };
  },[isPlaying,pulse,glow,haptics,hapticPulse,hapticStop]);
  return (
    <View style={styles.breathGuide}>
      <Animated.View style={[styles.breathGlow,{opacity:glow,transform:[{scale:Animated.multiply(pulse,1.12)}]}]}/>
      <Animated.View style={[styles.breathGuideOuter,{transform:[{scale:pulse}]}]}/>
      <Animated.View style={[styles.breathGuideInner,{transform:[{scale:Animated.multiply(pulse,.82)}]}]}/>
      <Animated.View style={[styles.breathFill,{opacity:Animated.add(.35,Animated.multiply(glow,.35)),transform:[{scale:Animated.multiply(pulse,.6)}]}]}/>
      <View style={styles.breathGuideCenter}>
        <Icon name="leaf" size={28} color={C.mint}/>
        <Text style={styles.breathPhase}>{phase}</Text>
        {!isPlaying&&<Text style={styles.breathCount}>Press begin to start</Text>}
      </View>
    </View>
  );
}

function NightGuide({ isPlaying }) {
  const stars = useRef(Array.from({length:14},(_,i)=>({
    v:new Animated.Value(.15+((i*37)%50)/100),
    left:(i*61)%210-105, top:(i*47)%180-90, size:2+(i%3),
  }))).current;
  const drift = useRef(new Animated.Value(0)).current;
  useEffect(()=>{
    if (!isPlaying) return;
    const loops = stars.map((s,i)=>Animated.loop(Animated.sequence([
      Animated.timing(s.v,{toValue:.9,duration:1400+(i%5)*600,easing:Easing.inOut(Easing.sin),useNativeDriver:true}),
      Animated.timing(s.v,{toValue:.15,duration:1400+((i+2)%5)*600,easing:Easing.inOut(Easing.sin),useNativeDriver:true}),
    ])));
    const driftLoop = Animated.loop(Animated.sequence([
      Animated.timing(drift,{toValue:1,duration:6000,easing:Easing.inOut(Easing.sin),useNativeDriver:true}),
      Animated.timing(drift,{toValue:0,duration:6000,easing:Easing.inOut(Easing.sin),useNativeDriver:true}),
    ]));
    loops.forEach(l=>l.start()); driftLoop.start();
    return ()=>{ loops.forEach(l=>l.stop()); driftLoop.stop(); };
  },[isPlaying,stars,drift]);
  return (
    <View style={styles.breathGuide}>
      {stars.map((s,i)=>(
        <Animated.View key={i} style={{position:'absolute',left:110+s.left,top:110+s.top,width:s.size,height:s.size,borderRadius:s.size,backgroundColor:C.warm,opacity:isPlaying?s.v:.3}}/>
      ))}
      <Animated.View style={{transform:[{translateY:drift.interpolate({inputRange:[0,1],outputRange:[4,-4]})}]}}>
        <Icon name="moon" size={46} color={C.gold}/>
      </Animated.View>
      {!isPlaying&&<Text style={[styles.breathCount,{position:'absolute',bottom:24}]}>Press begin to start</Text>}
    </View>
  );
}

function WavesGuide({ isPlaying }) {
  const ripples = useRef([0,1,2].map(()=>new Animated.Value(0))).current;
  useEffect(()=>{
    if (!isPlaying) return;
    const loops = ripples.map((r,i)=>Animated.loop(Animated.sequence([
      Animated.delay(i*1500),
      Animated.timing(r,{toValue:1,duration:4500,easing:Easing.out(Easing.sin),useNativeDriver:true}),
      Animated.timing(r,{toValue:0,duration:0,useNativeDriver:true}),
    ])));
    loops.forEach(l=>l.start());
    return ()=>loops.forEach(l=>l.stop());
  },[isPlaying,ripples]);
  return (
    <View style={styles.breathGuide}>
      {ripples.map((r,i)=>(
        <Animated.View key={i} style={[styles.waveRipple,{opacity:r.interpolate({inputRange:[0,.15,1],outputRange:[0,.75,0]}),transform:[{scale:r.interpolate({inputRange:[0,1],outputRange:[.35,1.55]})}]}]}/>
      ))}
      <Icon name="water" size={40} color={C.blue}/>
      {!isPlaying&&<Text style={[styles.breathCount,{position:'absolute',bottom:24}]}>Press begin to start</Text>}
    </View>
  );
}

function CalmVisual({ visual, isPlaying, haptics }) {
  if (visual==='Night') return <NightGuide isPlaying={isPlaying}/>;
  if (visual==='Waves') return <WavesGuide isPlaying={isPlaying}/>;
  return <BreathingGuide isPlaying={isPlaying} haptics={haptics}/>;
}

// ─── CONNECT ──────────────────────────────────────────────────────────────────
function timeAgo(iso) {
  if (!iso) return '';
  const mins = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.floor(mins/60)}h ago`;
  return `${Math.floor(mins/1440)}d ago`;
}

function Connect({ say }) {
  const [posts, setPosts] = useState([]);
  const [blocked, setBlocked] = useState([]);
  const [compose, setCompose] = useState(false);
  const [postSheet, setPostSheet] = useState(null);
  const [member, setMember] = useState(null);
  const [dm, setDm] = useState(null);
  const [dmThread, setDmThread] = useState(null);
  const [dmMessages, setDmMessages] = useState([]);
  const [dmDraft, setDmDraft] = useState('');
  const [category, setCategory] = useState('Question');
  const [draft, setDraft] = useState('');
  const [comment, setComment] = useState('');
  const online = isBackendConfigured();

  const loadPosts = () => {
    if (!online) return;
    apiRequest('/v1/posts').then(data => {
      if (!data?.posts) return;
      setPosts(data.posts.map(p => ({
        id:p.id, author:p.mine?'You':p.author, authorId:p.authorId, initial:(p.mine?'Y':p.author.charAt(0)).toUpperCase(),
        avatar:p.avatar||'', following:!!p.following, category:p.category, time:timeAgo(p.createdAt), body:p.body, bio:p.bio||'', comments:[], commentCount:p.commentCount||0,
      })));
    }).catch(()=>{});
  };
  useEffect(loadPosts, []);

  const openPost = post => {
    setPostSheet(post);
    if (!online || String(post.id).startsWith('local-')) return;
    apiRequest(`/v1/posts/${post.id}/comments`).then(data => {
      if (!data?.comments) return;
      const comments = data.comments.map(c => ({ id:c.id, author:c.author, authorId:c.authorId, avatar:c.avatar||'', bio:c.bio||'', body:c.body }));
      setPosts(p=>p.map(x=>x.id===post.id?{...x,comments}:x));
      setPostSheet(x=>x&&x.id===post.id?{...x,comments}:x);
    }).catch(()=>{});
  };

  const visiblePosts = posts.filter(p=>!blocked.includes(p.author));
  const blockMember = target=>Alert.alert(`Block ${target.author}?`,'Their posts and comments will be hidden.',[{text:'Cancel',style:'cancel'},{text:'Block member',style:'destructive',onPress:()=>{
    setBlocked(b=>[...b,target.author]);setMember(null);setPostSheet(null);say(`${target.author} is now hidden.`);
    if (online && target.authorId) apiRequest('/v1/blocks',{method:'POST',body:JSON.stringify({memberId:target.authorId})}).catch(()=>{});
  }}]);
  const reportPost = post=>Alert.alert('Report this post?','Our moderators will review it. Thank you for keeping the circle safe.',[{text:'Cancel',style:'cancel'},{text:'Report',style:'destructive',onPress:()=>{
    say('Report received. Thank you.');
    if (online && !String(post.id).startsWith('local-')) apiRequest('/v1/moderation/reports',{method:'POST',body:JSON.stringify({targetType:'post',targetId:String(post.id),reason:'member_report'})}).catch(()=>{});
  }}]);
  const publish=()=>{
    if(!draft.trim()) return say('Write a little before sharing.');
    const text=draft.trim(); setDraft(''); setCompose(false);
    if (online) {
      apiRequest('/v1/posts',{method:'POST',body:JSON.stringify({category:category.toUpperCase(),body:text})})
        .then(data=>{ const p=data.post; setPosts(prev=>[{id:p.id,author:'You',authorId:p.authorId,initial:'Y',category:p.category,time:'Just now',body:p.body,bio:p.bio||'',comments:[],commentCount:0},...prev]); say('Shared with the circle.'); })
        .catch(()=>{ say('Could not reach the circle. Try again soon.'); });
    } else {
      setPosts(p=>[{id:`local-${Date.now()}`,author:'You',initial:'Y',category:category.toUpperCase(),time:'Just now',body:text,bio:'',comments:[],commentCount:0},...p]);
      say('Shared with the circle.');
    }
  };
  const addComment=()=>{
    if(!comment.trim()||!postSheet) return;
    const text=comment.trim(); setComment('');
    const applyLocal=c=>{ setPosts(p=>p.map(x=>x.id===postSheet.id?{...x,comments:[...x.comments,c],commentCount:(x.commentCount||0)+1}:x)); setPostSheet(x=>({...x,comments:[...x.comments,c]})); };
    if (online && !String(postSheet.id).startsWith('local-')) {
      apiRequest(`/v1/posts/${postSheet.id}/comments`,{method:'POST',body:JSON.stringify({body:text})})
        .then(data=>{ applyLocal({id:data.comment.id,author:'You',authorId:data.comment.authorId,body:data.comment.body}); say('Comment added.'); })
        .catch(()=>say('Could not add the comment. Try again soon.'));
    } else { applyLocal({id:`local-${Date.now()}`,author:'You',body:text}); say('Comment added.'); }
  };

  const [sponsorsOpen, setSponsorsOpen] = useState(false);
  const [sponsors, setSponsors] = useState([]);
  const openSponsors = () => {
    setSponsorsOpen(true);
    if (!online) return;
    apiRequest('/v1/sponsors').then(d=>setSponsors(d.sponsors||[])).catch(()=>say('Could not load sponsors.'));
  };
  const toggleFollow = target => {
    if (!online || !target.authorId) return;
    const next = !target.following;
    setPosts(p=>p.map(x=>x.authorId===target.authorId?{...x,following:next}:x));
    setMember(m=>m&&m.authorId===target.authorId?{...m,following:next}:m);
    apiRequest('/v1/follows',{method:'POST',body:JSON.stringify({memberId:target.authorId,following:next})})
      .then(()=>say(next?`Following ${target.author}.`:`Unfollowed ${target.author}.`))
      .catch(()=>{});
  };

  const openDm = target => {
    setMember(null); setDm(target); setDmMessages([]); setDmThread(null);
    if (!online || !target.authorId) return;
    apiRequest('/v1/dms',{method:'POST',body:JSON.stringify({peerId:target.authorId})})
      .then(data=>setDmThread(data.thread.threadId))
      .catch(()=>say('Messaging is unavailable right now.'));
  };
  useEffect(() => {
    if (!dmThread) return;
    let live = true;
    const pull = () => apiRequest(`/v1/dms/${dmThread}/messages`).then(data=>{ if(live&&data?.messages) setDmMessages(data.messages); }).catch(()=>{});
    pull();
    const timer = setInterval(pull, 5000);
    return () => { live = false; clearInterval(timer); };
  }, [dmThread]);
  const sendDm = () => {
    if (!dmDraft.trim() || !dmThread) return;
    const text = dmDraft.trim(); setDmDraft('');
    apiRequest(`/v1/dms/${dmThread}/messages`,{method:'POST',body:JSON.stringify({body:text})})
      .then(data=>setDmMessages(m=>[...m,data.message]))
      .catch(()=>say('Message not sent. Try again.'));
  };
  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Text style={styles.eyebrow}>PRIVATE COMMUNITY</Text><Text style={styles.h1}>The circle</Text>
      <Text style={styles.intro}>Questions, stories, and small truths — held with care.</Text>
      <View style={styles.standard}><Icon name="shield-checkmark" color={C.mint}/><Text style={styles.standardText}>No advice as authority. No pressure to share. If someone feels unsafe, block and report.</Text></View>
      <Pressable style={styles.compose} onPress={()=>setCompose(true)}><Icon name="create-outline" color={C.ink}/><Text style={styles.composeText}>Share with the circle</Text></Pressable>
      <Pressable onPress={openSponsors} style={styles.soundscapePicker}>
        <Icon name="hand-left-outline" color={C.mint}/>
        <View style={{flex:1}}><Text style={styles.cardTitle}>Find a sponsor</Text><Text style={styles.muted}>Members who volunteered to walk alongside you.</Text></View>
        <Icon name="chevron-forward" size={16} color={C.muted}/>
      </Pressable>
      {visiblePosts.map(post=>(
        <Card key={post.id} style={styles.boardPost}>
          <View style={styles.rowBetween}><Text style={styles.topic}>{post.category}</Text><Text style={styles.postTime}>{post.time}</Text></View>
          <View style={styles.postHead}><Pressable onPress={()=>setMember(post)}>{post.avatar?<Image source={{uri:post.avatar}} style={styles.avatarImg}/>:<View style={styles.avatar}><Text style={styles.avatarText}>{post.initial}</Text></View>}</Pressable><Pressable onPress={()=>setMember(post)}><View style={{flexDirection:'row',alignItems:'center',gap:6}}><Text style={styles.cardTitle}>{post.author}</Text>{post.following?<Text style={{color:C.mint,fontSize:10,fontWeight:'900'}}>FOLLOWING</Text>:null}</View><Text style={styles.tapHint}>Tap to view profile</Text></Pressable></View>
          <Pressable onPress={()=>openPost(post)}><Text style={styles.postText}>{post.body}</Text></Pressable>
          <Pressable onPress={()=>openPost(post)} style={styles.commentAction}><Icon name="chatbubble-ellipses-outline" color={C.mint}/><Text style={styles.commentActionText}>{Math.max(post.commentCount||0,post.comments.length)} {Math.max(post.commentCount||0,post.comments.length)===1?'comment':'comments'} · join gently</Text><Icon name="chevron-forward" size={15} color={C.muted}/></Pressable>
        </Card>
      ))}
      {visiblePosts.length===0&&<View style={styles.boardEmpty}><Icon name="shield-outline" size={31} color={C.mint}/><Text style={styles.cardTitle}>Your circle is quiet.</Text></View>}
      <Modal visible={sponsorsOpen} animationType="slide">
        <SafeAreaView style={[styles.safe,{backgroundColor:'#141f31'}]}>
          <View style={[styles.header,{height:60}]}>
            <Text style={styles.sheetTitle}>Available sponsors</Text>
            <Pressable onPress={()=>setSponsorsOpen(false)}><Icon name="close" color={C.warm}/></Pressable>
          </View>
          <ScrollView contentContainerStyle={{padding:16,gap:10}}>
            {!online&&<Text style={styles.muted}>Connect to the internet to see available sponsors.</Text>}
            {online&&sponsors.length===0&&<Text style={styles.muted}>No members are listed as available sponsors yet. You can volunteer in the You tab.</Text>}
            {sponsors.map(s=>(
              <Pressable key={s.memberId} onPress={()=>{setSponsorsOpen(false);setMember({author:s.author,authorId:s.memberId,avatar:s.avatar,bio:s.note||s.bio,initial:s.author.charAt(0).toUpperCase()});}} style={styles.soundscapeRow}>
                {s.avatar?<Image source={{uri:s.avatar}} style={styles.avatarImg}/>:<View style={styles.avatar}><Text style={styles.avatarText}>{s.author.charAt(0).toUpperCase()}</Text></View>}
                <View style={{flex:1}}><Text style={styles.cardTitle}>{s.author}</Text><Text style={styles.muted} numberOfLines={2}>{s.note||s.bio||'Here to help.'}</Text></View>
                <Icon name="chevron-forward" size={16} color={C.muted}/>
              </Pressable>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
      <Modal visible={compose} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} style={{flex:1}}><Pressable style={styles.modalBack} onPress={()=>setCompose(false)}>
          <Pressable style={styles.sheet} onPress={()=>{}}>
            <View style={styles.handle}/><Text style={styles.sheetTitle}>Share with care</Text>
            <Text style={styles.sheetCopy}>If you may hurt yourself or someone else, call or text 988.</Text>
            <Text style={styles.fieldLabel}>WHAT ARE YOU SHARING?</Text>
            <View style={styles.choiceWrap}>{['Question','Story','Check-in'].map(x=><Choice key={x} label={x} active={category===x} onPress={()=>setCategory(x)}/>)}</View>
            <TextInput multiline value={draft} onChangeText={setDraft} placeholder="Write what feels true…" placeholderTextColor={C.muted} style={styles.composeInput}/>
            <Button label="Share" onPress={publish} icon="paper-plane"/>
          </Pressable>
        </Pressable></KeyboardAvoidingView>
      </Modal>
      <Modal visible={!!postSheet} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} style={{flex:1}}><Pressable style={styles.modalBack} onPress={()=>setPostSheet(null)}>
          <Pressable style={[styles.sheet,styles.postSheet]} onPress={()=>{}}>
            {postSheet&&<><View style={styles.handle}/>
              <ScrollView style={styles.threadScroll} contentContainerStyle={styles.threadContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.topic}>{postSheet.category}</Text>
                <Pressable onPress={()=>setMember(postSheet)}><Text style={styles.cardTitle}>{postSheet.author}</Text></Pressable>
                <Text style={styles.postText}>{postSheet.body}</Text>
                <Text style={styles.sectionTitle}>COMMENTS</Text>
                {postSheet.comments.filter(c=>!blocked.includes(c.author)).map(c=>{
                  const cp=posts.find(p=>p.author===c.author)||{author:c.author,initial:c.author.charAt(0).toUpperCase(),bio:''};
                  return <View key={c.id} style={styles.comment}><Pressable onPress={()=>setMember(cp)} hitSlop={6}><Text style={styles.commentName}>{c.author}</Text></Pressable><Text style={styles.muted}>{c.body}</Text></View>;
                })}
              </ScrollView>
              <View style={styles.threadComposer}>
                <TextInput value={comment} onChangeText={setComment} placeholder="Offer a kind response…" placeholderTextColor={C.muted} style={styles.commentInput}/>
                <Button label="Add comment" onPress={addComment} icon="chatbubble-outline"/>
                <Pressable style={styles.dangerAction} onPress={()=>reportPost(postSheet)}><Icon name="flag-outline" color={C.gold}/><Text style={styles.dangerText}>Report post</Text></Pressable>
              </View>
            </>}
          </Pressable>
        </Pressable></KeyboardAvoidingView>
      </Modal>
      <Modal visible={!!member} transparent animationType="slide">
        <Pressable style={styles.modalBack} onPress={()=>setMember(null)}>
          <Pressable style={styles.sheet} onPress={()=>{}}>
            {member&&<><View style={styles.handle}/>
              <View style={styles.memberHero}>{member.avatar?<Image source={{uri:member.avatar}} style={styles.memberAvatarImg}/>:<View style={styles.memberAvatar}><Text style={styles.bigAvatarText}>{member.initial}</Text></View>}<View style={{flex:1}}><Text style={styles.sheetTitle}>{member.author}</Text><Text style={styles.muted}>Member profile</Text></View></View>
              <Text style={styles.sheetCopy}>{member.bio||'No bio.'}</Text>
              {member.authorId?<Button label={member.following?'Following ✓':'Follow'} onPress={()=>toggleFollow(member)} kind={member.following?'dark':undefined} icon={member.following?'checkmark':'person-add-outline'}/>:null}
              <Button label="Message privately" onPress={()=>openDm(member)} icon="chatbubble-outline"/>
              <Pressable style={styles.dangerAction} onPress={()=>blockMember(member)}><Icon name="eye-off-outline" color={C.gold}/><Text style={styles.dangerText}>Block member</Text></Pressable>
            </>}
          </Pressable>
        </Pressable>
      </Modal>
      <Modal visible={!!dm} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} style={{flex:1}}><Pressable style={styles.modalBack} onPress={()=>setDm(null)}>
          <Pressable style={styles.sheet} onPress={()=>{}}>
            {dm&&<><View style={styles.handle}/><Text style={styles.mini}>DIRECT MESSAGE</Text><Text style={styles.sheetTitle}>Message {dm.author}</Text>
              {!online&&<Text style={styles.sheetCopy}>Messaging needs a connection. Try again when you're back online.</Text>}
              {online&&!dm.authorId&&<Text style={styles.sheetCopy}>This member can't receive messages yet.</Text>}
              {online&&dm.authorId&&<>
                <ScrollView style={styles.threadScroll} contentContainerStyle={styles.threadContent} showsVerticalScrollIndicator={false}>
                  {dmMessages.length===0&&<Text style={styles.sheetCopy}>Say hello — messages are private between the two of you. Be kind; you can block or report anytime.</Text>}
                  {dmMessages.map(m=>(
                    <View key={m.id} style={[styles.comment,m.mine&&{backgroundColor:'#1d4038',alignSelf:'flex-end',maxWidth:'85%'},!m.mine&&{alignSelf:'flex-start',maxWidth:'85%'}]}>
                      <Text style={styles.commentName}>{m.mine?'You':dm.author}</Text><Text style={styles.muted}>{m.body}</Text>
                    </View>
                  ))}
                </ScrollView>
                <View style={styles.threadComposer}>
                  <TextInput value={dmDraft} onChangeText={setDmDraft} placeholder="Write something kind…" placeholderTextColor={C.muted} style={styles.commentInput}/>
                  <Button label="Send" onPress={sendDm} icon="paper-plane"/>
                </View>
              </>}
              <Button label="Close" onPress={()=>setDm(null)} icon="close" kind="dark"/></>}
          </Pressable>
        </Pressable></KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}

// ─── JOURNAL ─────────────────────────────────────────────────────────────────
function Journal({ say, entries, onAdd }) {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState('');
  const [mood, setMood] = useState('Steady');
  const save=()=>{ if(!body.trim()) return say('Write a few words before keeping this entry.'); const entry={id:Date.now(),body:body.trim(),mood,date:new Date().toLocaleDateString('en-US',{month:'long',day:'numeric'})}; onAdd(entry); setBody(''); setOpen(false); say('Entry saved.'); };
  return (
    <ScrollView contentContainerStyle={[styles.scroll,styles.journalScroll]}>
      <Text style={styles.eyebrow}>PRIVATE · NEVER SHOWN IN COMMUNITY</Text>
      <Text style={styles.h1}>Your journal</Text>
      <Text style={styles.intro}>A place for what is yours.</Text>
      <Pressable onPress={()=>setOpen(true)} style={styles.journalNew}><Icon name="create-outline" color={C.ink}/><Text style={styles.composeText}>Write an entry</Text></Pressable>
      {entries.length===0?<View style={styles.journalEmpty}><Icon name="book-outline" size={34} color={C.gold}/><Text style={styles.cardTitle}>The page is open.</Text><Text style={[styles.muted,{textAlign:'center'}]}>No streaks to keep. No right way to begin.</Text></View>:entries.map(e=>(
        <View key={e.id} style={styles.journalEntry}><View style={styles.rowBetween}><Text style={styles.mini}>{typeof e.date==='string'?e.date.toUpperCase():e.date}</Text><Text style={styles.journalMood}>{e.mood}</Text></View><Text style={styles.journalBody}>{e.body}</Text></View>
      ))}
      <Modal visible={open} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} style={{flex:1}}><View style={styles.modalBack}><View style={[styles.sheet,styles.journalSheet]}>
          <View style={styles.handle}/>
          <View style={styles.rowBetween}><Text style={styles.sheetTitle}>A private page</Text><Pressable onPress={()=>setOpen(false)}><Icon name="close" color={C.muted}/></Pressable></View>
          <Text style={styles.sheetCopy}>Entries are encrypted and belong only to you.</Text>
          <Text style={styles.fieldLabel}>HOW DOES THIS MOMENT FEEL?</Text>
          <View style={styles.moodRow}>{['Heavy','Tender','Steady','Hopeful'].map(x=><Choice key={x} label={x} active={mood===x} onPress={()=>setMood(x)}/>)}</View>
          <TextInput value={body} onChangeText={setBody} multiline autoFocus placeholder="There is room for the honest version…" placeholderTextColor={C.muted} style={styles.journalInput}/>
          <Button label="Keep entry" onPress={save} icon="bookmark-outline"/>
        </View></View></KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}

// ─── SUPPORT CARD (Stripe + Venmo) ─────────────────────────────────────────
function SupportNorthstar({ say }) {
  const donate = (amount, label) => {
    Linking.openURL(`venmo://paycharge?txn=pay&recipients=${VENMO_USER}&amount=${amount}&note=Northstar Recovery Support`)
      .catch(() => Linking.openURL(`https://venmo.com/${VENMO_USER}`));
  };
  return (
    <Card style={styles.supportCard}>
      <View style={styles.row}>
        <View style={styles.supportBadge}><Icon name="heart" color={C.ink}/></View>
        <View style={{flex:1}}>
          <Text style={styles.cardTitle}>Support Northstar</Text>
          <Text style={styles.muted}>Optional support — every recovery tool stays free.</Text>
        </View>
      </View>
      <View style={styles.supportOptions}>
        {[['$2',2],['$5',5],['$10',10]].map(([label,amount])=>(
          <Pressable key={label} onPress={()=>donate(amount,label)} style={styles.supportOption}>
            <Text style={styles.supportPrice}>{label}</Text>
            <Text style={styles.supportOptionLabel}>one-time</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.supportFinePrint}>Apple Pay, Venmo, and card accepted.</Text>
    </Card>
  );
}

// ─── YOU ──────────────────────────────────────────────────────────────────────
function You({ say, profile, sobrietyDays, editProfile, onSignOut, goJournal, entries, saveProfile, isAdmin, sosEnabled, onToggleSos, onInviteSent }) {
  const [adminOpen, setAdminOpen] = useState(false);
  const [contactsOpen, setContactsOpen] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [contactQuery, setContactQuery] = useState('');
  const openContacts = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== 'granted') { say('Allow contact access in Settings to invite friends.'); return; }
    const { data } = await Contacts.getContactsAsync({ fields: [Contacts.Fields.PhoneNumbers], sort: Contacts.SortTypes.FirstName });
    setContacts((data||[]).filter(c=>c.phoneNumbers?.length));
    setContactsOpen(true);
  };
  const inviteContact = c => {
    const phone = c.phoneNumbers[0].number.replace(/[^+\d]/g,'');
    const msg = encodeURIComponent("I'm using Northstar Recovery on my sobriety journey. It's gentle and private — join me: https://cmameet.site");
    Linking.openURL(`sms:${phone}${Platform.OS==='ios'?'&':'?'}body=${msg}`).then(()=>{ onInviteSent(); say('+10 XP — thank you for sharing Northstar.'); }).catch(()=>say('Could not open Messages.'));
  };
  const toggleSponsorAvailable = val => {
    saveProfile({ ...profile, sponsorAvailable: val });
    say(val?'You are listed as an available sponsor.':'You are no longer listed as a sponsor.');
  };
  const [prefs, setPrefs] = useState({ meetings:true, insight:false, checkin:false, circleNotifs:true });
  const name = profile.pseudonym || 'Northstar member';
  const hasSponsor = profile.sponsor?.name;
  const hasTrusted = profile.trustedPerson?.name && profile.trustedPerson?.enabled;

  const toggleInsight = async val => {
    setPrefs(p=>({...p,insight:val}));
    if (val) { const r=await scheduleDailyUplift(9,0); if(!r.ok){say(r.reason);setPrefs(p=>({...p,insight:false}));}else say('Daily inspiration at 9 AM.'); }
    else { await cancelDailyUplift(); say('Daily inspiration off.'); }
  };
  const toggleCheckin = async val => {
    setPrefs(p=>({...p,checkin:val}));
    if (val) { const r=await scheduleDailyCheckin(20,0); if(!r.ok){say(r.reason);setPrefs(p=>({...p,checkin:false}));}else say('Check-in reminder at 8 PM.'); }
    else { await cancelDailyCheckin(); say('Check-in reminder off.'); }
  };
  const toggleMeetings = async val => {
    setPrefs(p=>({...p,meetings:val}));
    if (!val) { await cancelMeetingReminders(); say('Meeting reminders off.'); }
    else say('Meeting reminders on.');
  };
  const togglePrivacy = val => {
    const next = { ...profile, privacyMode: val };
    saveProfile(next);
    say(val ? 'Anonymous mode on — your profile is hidden from community search.' : 'Anonymous mode off.');
  };
  const inviteFriend = () => Share.share({
    message: "I'm using Northstar Recovery on my sobriety journey. It's gentle and private — join me: https://cmameet.site",
    title: 'Northstar Recovery',
  });

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Text style={styles.h1}>Your northstar</Text>
      <Text style={styles.intro}>The small things you are carrying forward.</Text>

      <Card style={styles.profile}>
        <Avatar photo={profile.photo} initial={name.charAt(0).toUpperCase()} size={56} radius={18}/>
        <View style={{flex:1}}>
          <Text style={styles.cardTitle}>{name}</Text>
          <Text style={styles.muted}>{sobrietyDays !== null ? 'In recovery · showing up' : 'Here in your own time'}</Text>
        </View>
        <Pressable onPress={editProfile}><Icon name="create-outline" color={C.mint}/></Pressable>
      </Card>
      <Pressable onPress={editProfile} style={styles.privacyAction}>
        <Icon name="shield-checkmark-outline" color={C.mint}/>
        <View style={{flex:1}}><Text style={styles.cardTitle}>Profile & privacy</Text><Text style={styles.muted}>Change name, photo, sponsor, trusted person.</Text></View>
        <Icon name="chevron-forward" color={C.muted}/>
      </Pressable>

      {hasSponsor && (
        <Card style={styles.sponsorCard}>
          <Text style={styles.mini}>YOUR SPONSOR</Text>
          <View style={styles.rowBetween}>
            <View style={{flex:1}}>
              <Text style={styles.cardTitle}>{profile.sponsor.name}</Text>
              <Text style={styles.muted}>{profile.sponsor.phone || 'No number saved yet'}</Text>
            </View>
            {profile.sponsor.phone && (
              <View style={{flexDirection:'row',gap:9}}>
                <Pressable onPress={()=>Linking.openURL(`tel:${profile.sponsor.phone}`)} style={styles.contactChip}><Icon name="call-outline" size={18} color={C.ink}/></Pressable>
                <Pressable onPress={()=>Linking.openURL(`sms:${profile.sponsor.phone}`)} style={[styles.contactChip,{backgroundColor:C.blue}]}><Icon name="chatbubble-outline" size={18} color={C.ink}/></Pressable>
              </View>
            )}
          </View>
        </Card>
      )}
      {!hasSponsor && (
        <Pressable onPress={editProfile} style={styles.privacyAction}>
          <Icon name="person-add-outline" color={C.muted}/>
          <View style={{flex:1}}><Text style={styles.cardTitle}>Add your sponsor</Text><Text style={styles.muted}>One-tap call or text when you need support.</Text></View>
          <Icon name="chevron-forward" color={C.muted}/>
        </Pressable>
      )}

      {hasTrusted && (
        <View style={[styles.setting,{borderBottomWidth:0,backgroundColor:C.raised,borderRadius:14,padding:14,marginBottom:4}]}>
          <Icon name="shield-checkmark-outline" color={C.mint}/>
          <View style={{flex:1}}><Text style={styles.cardTitle}>Trusted: {profile.trustedPerson.name}</Text><Text style={styles.muted}>Can see your recovery status.</Text></View>
          <Icon name="checkmark-circle" color={C.mint}/>
        </View>
      )}

      {sobrietyDays !== null && (
        <View style={styles.achievement}>
          <Icon name="flame" size={28} color={C.gold}/>
          <View><Text style={styles.cardTitle}>Your rhythm</Text><Text style={styles.muted}>In recovery, one day at a time.</Text></View>
        </View>
      )}

      <Pressable onPress={goJournal} style={styles.privacyAction}>
        <Icon name="book-outline" color={C.gold}/>
        <View style={{flex:1}}><Text style={styles.cardTitle}>Your journal</Text><Text style={styles.muted}>{entries.length} {entries.length===1?'entry':'entries'} · private</Text></View>
        <Icon name="chevron-forward" color={C.muted}/>
      </Pressable>

      <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>
      {[
        ['meetings','Meeting reminders','Heads-up before a meeting starts',prefs.meetings,toggleMeetings],
        ['insight','Daily inspiration','A quiet message each morning at 9 AM',prefs.insight,toggleInsight],
        ['checkin','Evening check-in','Reminder to journal at 8 PM',prefs.checkin,toggleCheckin],
        ['circleNotifs','Circle & DM alerts','Notify me on replies to my posts',prefs.circleNotifs,v=>setPrefs(p=>({...p,circleNotifs:v}))],
      ].map(([key,title,desc,val,toggle])=>(
        <View key={key} style={styles.setting}>
          <View style={{flex:1}}><Text style={styles.cardTitle}>{title}</Text><Text style={styles.muted}>{desc}</Text></View>
          <Switch value={val} onValueChange={toggle} trackColor={{false:C.line,true:'#3d9074'}} thumbColor={val?C.mint:C.muted}/>
        </View>
      ))}
      {isAdmin&&<Button label="Send a demo notification" onPress={async()=>{ const r=await scheduleDemoInsight(); say(r.ok?'Check in 8 seconds':r.reason); }} kind="dark" icon="notifications-outline"/>}

      <Text style={styles.sectionTitle}>PRIVACY</Text>
      <View style={styles.setting}>
        <Icon name="eye-off-outline" color={C.muted}/>
        <View style={{flex:1}}><Text style={styles.cardTitle}>Anonymous mode</Text><Text style={styles.muted}>Hide your profile from community search.</Text></View>
        <Switch value={!!profile.privacyMode} onValueChange={togglePrivacy} trackColor={{false:C.line,true:'#3d9074'}} thumbColor={profile.privacyMode?C.mint:C.muted}/>
      </View>

      <View style={styles.setting}>
        <Icon name="navigate-outline" color={C.muted}/>
        <View style={{flex:1}}><Text style={styles.cardTitle}>Nearby support (SOS)</Text><Text style={styles.muted}>Share a coarse, city-level location so you can send and receive nearby SOS alerts.</Text></View>
        <Switch value={!!sosEnabled} onValueChange={onToggleSos} trackColor={{false:C.line,true:'#3d9074'}} thumbColor={sosEnabled?C.mint:C.muted}/>
      </View>
      <View style={styles.setting}>
        <Icon name="hand-left-outline" color={C.muted}/>
        <View style={{flex:1}}><Text style={styles.cardTitle}>Available to sponsor</Text><Text style={styles.muted}>List yourself in the sponsor directory so members can reach out.</Text></View>
        <Switch value={!!profile.sponsorAvailable} onValueChange={toggleSponsorAvailable} trackColor={{false:C.line,true:'#3d9074'}} thumbColor={profile.sponsorAvailable?C.mint:C.muted}/>
      </View>

      {isAdmin&&<>
        <Text style={styles.sectionTitle}>MODERATION</Text>
        <Button label="Review reports" onPress={()=>setAdminOpen(true)} kind="dark" icon="shield-half-outline"/>
        <AdminReports visible={adminOpen} onClose={()=>setAdminOpen(false)} say={say}/>
      </>}

      <Text style={styles.sectionTitle}>YOUR NETWORK</Text>
      <Card>
        <Text style={styles.mini}>INVITE A FRIEND · EARN XP</Text>
        <Text style={styles.muted}>Share Northstar with someone in your recovery network. Each invite earns 10 XP on your Northstar Path. Contacts stay on your device — never uploaded.</Text>
        <Button label="Invite from contacts" onPress={openContacts} icon="people-outline"/>
        <Button label="Share invite link" onPress={()=>{inviteFriend();onInviteSent();}} icon="person-add-outline" kind="dark"/>
      </Card>
      <Modal visible={contactsOpen} animationType="slide">
        <SafeAreaView style={[styles.safe,{backgroundColor:'#141f31'}]}>
          <View style={[styles.header,{height:60}]}>
            <Text style={styles.sheetTitle}>Invite friends</Text>
            <Pressable onPress={()=>setContactsOpen(false)}><Icon name="close" color={C.warm}/></Pressable>
          </View>
          <View style={[styles.search,{marginHorizontal:16,marginBottom:8}]}>
            <Icon name="search" size={16} color={C.muted}/>
            <TextInput value={contactQuery} onChangeText={setContactQuery} placeholder="Search contacts…" placeholderTextColor={C.muted} style={styles.input}/>
          </View>
          <ScrollView contentContainerStyle={{padding:16,paddingTop:0,gap:8}}>
            {contacts.filter(c=>(c.name||'').toLowerCase().includes(contactQuery.toLowerCase())).slice(0,200).map(c=>(
              <Pressable key={c.id} onPress={()=>inviteContact(c)} style={styles.soundscapeRow}>
                <View style={styles.avatar}><Text style={styles.avatarText}>{(c.name||'?').charAt(0).toUpperCase()}</Text></View>
                <View style={{flex:1}}><Text style={styles.cardTitle}>{c.name||'Unknown'}</Text><Text style={styles.muted}>{c.phoneNumbers[0].number}</Text></View>
                <Icon name="chatbubble-outline" size={17} color={C.mint}/>
              </Pressable>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Text style={styles.sectionTitle}>SUPPORT NORTHSTAR</Text>
      <SupportNorthstar say={say}/>

      <Text style={styles.sectionTitle}>LITERATURE & RESOURCES</Text>
      <Card>
        <Text style={styles.cardTitle}>Official CMA literature</Text>
        <Text style={styles.muted}>The Crystal Meth Anonymous resource library.</Text>
        <Pressable onPress={()=>openWeb('https://www.crystalmeth.org/')} style={styles.inlineAction}>
          <Text style={styles.inlineText}>Visit crystalmeth.org</Text>
          <Icon name="open-outline" size={16} color={C.mint}/>
        </Pressable>
      </Card>

      <Pressable onPress={onSignOut} style={[styles.setting,{borderBottomWidth:0,justifyContent:'center',gap:8,marginTop:8}]}>
        <Icon name="log-out-outline" color={C.muted} size={18}/>
        <Text style={[styles.muted,{fontWeight:'700'}]}>Sign out</Text>
      </Pressable>
    </ScrollView>
  );
}

// ─── READINGS LIBRARY ─────────────────────────────────────────────────────────
function ReadingsLibrary({ onClose }) {
  const [selected, setSelected] = useState(null);
  return (
    <SafeAreaView style={styles.onboardSafe}>
      <View style={[styles.header,{height:64}]}>
        <View><Text style={styles.brand}>READINGS</Text><Text style={styles.brandSub}>CMA literature · narrated by Jessica</Text></View>
        <Pressable onPress={onClose} style={styles.iconBtn}><Icon name="close"/></Pressable>
      </View>
      <ScrollView contentContainerStyle={[styles.scroll,{paddingTop:8}]}>
        <Text style={styles.intro}>Official CMA pamphlets — listen along or open the full PDF.</Text>
        {READINGS.map(r=>(
          <React.Fragment key={r.id}>
          <Pressable onPress={()=>setSelected(selected?.id===r.id?null:r)} style={[styles.readingCard, selected?.id===r.id&&styles.readingCardActive]}>
            <View style={[styles.readingIcon,selected?.id===r.id&&{backgroundColor:C.ink}]}>
              <Icon name={r.icon} size={20} color={selected?.id===r.id?C.mint:C.ink}/>
            </View>
            <View style={{flex:1}}>
              <Text style={[styles.cardTitle,selected?.id===r.id&&{color:C.ink}]}>{r.title}</Text>
              <Text style={[styles.muted,selected?.id===r.id&&{color:'#1a4a3a'}]}>{r.durationEst} · {r.description.slice(0,55)}…</Text>
            </View>
            <Icon name={selected?.id===r.id?'chevron-down':'chevron-forward'} size={16} color={selected?.id===r.id?C.ink:C.muted}/>
          </Pressable>
          {selected?.id===r.id&&<ReadingPlayer reading={selected} onClose={()=>setSelected(null)}/>}
          </React.Fragment>
        ))}
        <Card style={{marginTop:4}}>
          <Text style={styles.mini}>FULL LITERATURE LIBRARY</Text>
          <Text style={styles.muted}>More pamphlets and workbooks are available on the official CMA website.</Text>
          <Pressable onPress={()=>openWeb('https://www.crystalmeth.org/cma-literature/')} style={styles.inlineAction}>
            <Text style={styles.inlineText}>Browse crystalmeth.org/literature</Text>
            <Icon name="open-outline" size={16} color={C.mint}/>
          </Pressable>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function ReadingPlayer({ reading, onClose }) {
  const player = useAudioPlayer(reading.audio);
  const status = useAudioPlayerStatus(player);
  const progress = status.duration > 0 ? status.currentTime / status.duration : 0;
  const fmt = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(Math.floor(s%60)).padStart(2,'0')}`;
  // Switching readings releases the old native player before this cleanup
  // runs; pausing a released player throws NativeSharedObjectNotFoundException.
  useEffect(()=>{ return ()=>{ try { player.pause(); } catch {} }; },[player]);
  useEffect(()=>{
    if (!status.playing) return;
    try {
      player.setActiveForLockScreen(true,
        { title: reading.title, artist: 'CMA Readings · narrated by Jessica', albumTitle: 'Northstar Recovery', artworkUrl: BRAND_ART });
    } catch {}
  },[status.playing, reading, player]);
  const toggle = ()=>{ if(status.playing) player.pause(); else player.play(); };
  const seek = frac => player.seekTo(frac * status.duration);
  return (
    <View style={styles.readingPlayer}>
      <View style={styles.rowBetween}>
        <Text style={styles.cardTitle}>{reading.title}</Text>
        <Pressable onPress={onClose}><Icon name="close" size={18} color={C.muted}/></Pressable>
      </View>
      <Text style={styles.muted}>{reading.description}</Text>
      <View style={styles.progressTrack}>
        <Pressable onPress={e=>{ const w=e.nativeEvent.locationX/e.nativeEvent.target?.measure?.(0,0,300,0,0,0)||300; seek(e.nativeEvent.locationX/300); }} style={styles.progressBar}>
          <View style={[styles.progressFill,{flex:progress}]}/>
          <View style={{flex:1-progress}}/>
        </Pressable>
        <View style={styles.rowBetween}>
          <Text style={styles.timeLabel}>{fmt(status.currentTime||0)}</Text>
          <Text style={styles.timeLabel}>{fmt(status.duration||0)}</Text>
        </View>
      </View>
      <View style={styles.playerControls}>
        <Pressable onPress={()=>player.seekTo(Math.max(0,(status.currentTime||0)-15))} style={styles.skipBtn}>
          <Icon name="play-back-outline" size={22} color={C.muted}/>
          <Text style={styles.skipLabel}>15s</Text>
        </Pressable>
        <Pressable onPress={toggle} style={styles.playRing}>
          <Icon name={status.playing?'pause':'play'} size={28} color={C.ink}/>
        </Pressable>
        <Pressable onPress={()=>player.seekTo(Math.min(status.duration||0,(status.currentTime||0)+15))} style={styles.skipBtn}>
          <Icon name="play-forward-outline" size={22} color={C.muted}/>
          <Text style={styles.skipLabel}>15s</Text>
        </Pressable>
      </View>
      <View style={styles.readingActions}>
        <Pressable onPress={()=>openWeb(reading.pdfUrl)} style={styles.readingAction}>
          <Icon name="document-text-outline" color={C.gold}/>
          <Text style={styles.readingActionText}>Open PDF</Text>
        </Pressable>
        <Pressable onPress={()=>{
          const roomUrl=`https://meet.jit.si/northstar-reading-${Math.random().toString(36).slice(2,8)}`;
          Alert.alert('Play for your room',`A private video room is ready. Share the link, join, then press play here — the reading ("${reading.title}") plays from your device while the room listens.`,[
            {text:'Cancel',style:'cancel'},
            {text:'Share link',onPress:()=>Share.share({message:`Join me for a CMA reading (${reading.title}): ${roomUrl}`})},
            {text:'Share & join',onPress:()=>{Share.share({message:`Join me for a CMA reading (${reading.title}): ${roomUrl}`});openWeb(roomUrl);}},
          ]);
        }} style={styles.readingAction}>
          <Icon name="people-outline" color={C.blue}/>
          <Text style={styles.readingActionText}>Play for room</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── ADMIN ────────────────────────────────────────────────────────────────────
function AdminReports({ visible, onClose, say }) {
  const [reports, setReports] = useState([]);
  const [busy, setBusy] = useState(false);
  const load = () => apiRequest('/v1/admin/reports').then(d=>setReports(d.reports||[])).catch(()=>say('Could not load reports.'));
  useEffect(()=>{ if(visible) load(); },[visible]);
  const act = async (label, path, payload) => {
    setBusy(true);
    try { await apiRequest(path,{method:'POST',body:JSON.stringify(payload)}); say(label); load(); }
    catch { say('Action failed.'); }
    setBusy(false);
  };
  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={[styles.safe,{backgroundColor:'#141f31'}]}>
        <View style={[styles.header,{height:60}]}>
          <Text style={styles.sheetTitle}>Reports</Text>
          <Pressable onPress={onClose}><Icon name="close" color={C.warm}/></Pressable>
        </View>
        <ScrollView contentContainerStyle={{padding:16,gap:10}}>
          {reports.length===0&&<Text style={styles.muted}>No reports. The circle is quiet.</Text>}
          {reports.map(r=>(
            <Card key={r.id}>
              <View style={styles.rowBetween}><Text style={styles.topic}>{r.targetType.toUpperCase()}</Text><Text style={styles.postTime}>{timeAgo(r.createdAt)}</Text></View>
              {r.author?<Text style={styles.cardTitle}>{r.author}</Text>:null}
              {r.snippet?<Text style={styles.muted}>“{r.snippet}”</Text>:null}
              <Text style={styles.muted}>Reason: {r.reason||'member report'}</Text>
              <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>
                {r.targetType==='post'&&<Pressable disabled={busy} onPress={()=>act('Post removed.','/v1/admin/remove-post',{postId:r.targetId})} style={styles.dangerAction}><Icon name="trash-outline" color={C.gold} size={15}/><Text style={styles.dangerText}>Remove post</Text></Pressable>}
                {r.authorId&&<Pressable disabled={busy} onPress={()=>act('Member suspended.','/v1/admin/ban',{memberId:r.authorId,banned:true})} style={styles.dangerAction}><Icon name="person-remove-outline" color={C.gold} size={15}/><Text style={styles.dangerText}>Suspend</Text></Pressable>}
                {r.authorId&&<Pressable disabled={busy} onPress={()=>act('Member and device suspended.','/v1/admin/ban',{memberId:r.authorId,banned:true,banDevices:true})} style={styles.dangerAction}><Icon name="phone-portrait-outline" color={C.gold} size={15}/><Text style={styles.dangerText}>Suspend + device</Text></Pressable>}
                {r.authorId&&<Pressable disabled={busy} onPress={()=>act('Member restored.','/v1/admin/ban',{memberId:r.authorId,banned:false})} style={[styles.dangerAction,{borderColor:'#3d9074'}]}><Icon name="refresh-outline" color={C.mint} size={15}/><Text style={[styles.dangerText,{color:C.mint}]}>Restore</Text></Pressable>}
              </View>
            </Card>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  standard:{flexDirection:'row',gap:9,padding:13,borderLeftWidth:2,borderColor:C.mint,backgroundColor:'#16343a'}, standardText:{color:C.warm,fontSize:12,lineHeight:18,flex:1}, boardPost:{gap:11}, topic:{color:C.mint,fontSize:10,fontWeight:'900',letterSpacing:1.2}, postTime:{color:C.muted,fontSize:11}, tapHint:{color:C.blue,fontSize:11,marginTop:1}, commentAction:{flexDirection:'row',alignItems:'center',gap:7,paddingTop:11,borderTopWidth:1,borderColor:C.line}, commentActionText:{color:C.mint,fontSize:12,fontWeight:'800',flex:1}, boardEmpty:{minHeight:180,justifyContent:'center',alignItems:'center',gap:10,padding:24,borderWidth:1,borderColor:C.line,borderRadius:17}, memberHero:{flexDirection:'row',alignItems:'center',gap:13}, memberAvatar:{height:57,width:57,borderRadius:18,backgroundColor:C.mint,alignItems:'center',justifyContent:'center'}, profileSafety:{flexDirection:'row',gap:9,padding:12,backgroundColor:'#17363a',borderRadius:12}, profileSafetyText:{color:C.warm,fontSize:12,lineHeight:18,flex:1}, dangerAction:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8,padding:12,borderWidth:1,borderColor:'#66583d',borderRadius:12}, dangerText:{color:C.gold,fontWeight:'800',fontSize:14}, postSheet:{height:'88%',paddingBottom:20}, threadScroll:{flexGrow:0,flexShrink:1}, threadContent:{gap:12,paddingBottom:8}, threadComposer:{gap:8,paddingTop:10,borderTopWidth:1,borderColor:C.line}, comment:{padding:11,backgroundColor:C.raised,borderRadius:11,gap:3}, commentName:{color:C.warm,fontWeight:'800',fontSize:13}, commentInput:{color:C.warm,borderWidth:1,borderColor:C.line,borderRadius:12,padding:12,minHeight:52,fontSize:14},
  safe:{flex:1,backgroundColor:C.ink}, topo:{position:'absolute',top:0,left:0,right:0,height:210,backgroundColor:'#172944',borderBottomLeftRadius:110,borderBottomRightRadius:40,opacity:.8}, header:{height:76,paddingHorizontal:20,flexDirection:'row',alignItems:'center',justifyContent:'space-between'}, brand:{color:C.warm,fontSize:15,fontWeight:'900',letterSpacing:2}, brandSub:{color:C.muted,fontSize:10,marginTop:3}, headerBtns:{flexDirection:'row',gap:9}, iconBtn:{height:38,width:38,alignItems:'center',justifyContent:'center',backgroundColor:C.raised,borderRadius:12}, helpBtn:{height:38,width:38,alignItems:'center',justifyContent:'center',backgroundColor:C.mint,borderRadius:12}, body:{flex:1}, scroll:{padding:20,paddingBottom:28,gap:14}, eyebrow:{color:C.mint,fontSize:11,fontWeight:'800',letterSpacing:1.2}, mini:{color:C.mint,fontSize:11,fontWeight:'800',letterSpacing:1.2}, sectionTitle:{color:C.mint,fontSize:11,fontWeight:'800',letterSpacing:1.2,marginTop:7}, h1:{color:C.warm,fontSize:31,lineHeight:36,fontWeight:'900',letterSpacing:-.6}, intro:{color:C.muted,fontSize:15,lineHeight:22,marginTop:-7,marginBottom:3}, card:{backgroundColor:C.surface,borderWidth:1,borderColor:'rgba(157,173,197,.14)',padding:16,borderRadius:18,gap:12}, streak:{backgroundColor:'#202e42',flexDirection:'row',justifyContent:'space-between',alignItems:'center',borderColor:'#466176'}, streakNum:{color:C.warm,fontSize:37,fontWeight:'900',marginTop:2}, streakUnit:{fontSize:16,color:C.muted}, muted:{color:C.muted,fontSize:13,lineHeight:19}, sun:{height:56,width:56,borderRadius:28,backgroundColor:'#344154',alignItems:'center',justifyContent:'center'}, rowBetween:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:12}, row:{flexDirection:'row',alignItems:'center',gap:18}, cardTitle:{color:C.warm,fontSize:16,fontWeight:'800',lineHeight:21}, remote:{padding:10,backgroundColor:'#183c3a',borderRadius:12}, button:{backgroundColor:C.mint,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:7,paddingVertical:12,borderRadius:12,marginTop:1}, buttonDark:{backgroundColor:C.raised,borderWidth:1,borderColor:C.line}, buttonText:{color:C.ink,fontWeight:'900',fontSize:14}, quote:{color:C.warm,fontSize:18,lineHeight:27,fontWeight:'600',paddingHorizontal:7,paddingVertical:9}, actionRow:{flexDirection:'row',gap:10}, quick:{flex:1,minHeight:95,backgroundColor:C.raised,borderRadius:16,padding:14,justifyContent:'space-between'}, quickText:{color:C.warm,fontSize:14,fontWeight:'800'}, support:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:7,padding:12,borderWidth:1,borderColor:'#66583d',borderRadius:12}, supportText:{color:C.gold,fontWeight:'800',fontSize:13}, supportCard:{borderColor:'rgba(93,224,166,.36)'}, supportBadge:{height:38,width:38,borderRadius:13,backgroundColor:C.mint,alignItems:'center',justifyContent:'center'}, supportFinePrint:{color:C.muted,fontSize:12,lineHeight:17}, supportOptions:{flexDirection:'row',gap:8}, supportOption:{flex:1,backgroundColor:C.raised,borderWidth:1,borderColor:C.line,borderRadius:12,paddingVertical:11,alignItems:'center',gap:2}, supportPrice:{color:C.mint,fontSize:16,fontWeight:'900'}, supportOptionLabel:{color:C.muted,fontSize:9,fontWeight:'700',textAlign:'center'}, tabbar:{height:72,backgroundColor:'#141f31',borderTopWidth:1,borderColor:'#293850',flexDirection:'row',paddingHorizontal:2}, tab:{flex:1,alignItems:'center',justifyContent:'center',gap:3}, tabText:{color:C.muted,fontSize:8,fontWeight:'700'}, location:{flexDirection:'row',alignItems:'center',gap:7}, locationText:{color:C.warm,fontSize:13,fontWeight:'700'}, change:{color:C.mint,fontSize:12,fontWeight:'800',marginLeft:'auto'}, search:{flexDirection:'row',alignItems:'center',backgroundColor:C.surface,borderRadius:13,paddingHorizontal:13,borderWidth:1,borderColor:C.line}, input:{color:C.warm,height:46,flex:1,marginLeft:8,fontSize:14}, segmentScroll:{marginHorizontal:-20,paddingHorizontal:20,flexGrow:0}, segment:{paddingVertical:9,paddingHorizontal:14,marginRight:8,borderRadius:11,borderWidth:1,borderColor:C.line}, segmentActive:{backgroundColor:C.mint,borderColor:C.mint}, segmentText:{color:C.muted,fontWeight:'800',fontSize:13}, segmentTextActive:{color:C.ink}, results:{color:C.muted,fontSize:12,fontWeight:'700'}, meeting:{flexDirection:'row',gap:13}, time:{width:54,borderRightWidth:1,borderColor:C.line}, timeText:{color:C.warm,fontWeight:'900',fontSize:14}, timeZone:{color:C.muted,fontSize:10,marginTop:3}, meetingMeta:{color:C.blue,fontSize:12,fontWeight:'700',marginTop:2}, inlineAction:{flexDirection:'row',alignItems:'center',gap:5,marginTop:7}, inlineText:{color:C.mint,fontWeight:'800',fontSize:13}, empty:{alignItems:'center',paddingVertical:30}, xp:{backgroundColor:'#26304b',flexDirection:'row',alignItems:'center',justifyContent:'space-between'}, xpNum:{color:C.gold,fontWeight:'900',fontSize:25,marginTop:3}, xpSmall:{fontSize:13,color:C.muted}, module:{gap:0}, moduleDot:{height:31,width:31,borderRadius:10,alignItems:'center',justifyContent:'center',backgroundColor:C.raised,marginRight:11}, moduleDetail:{borderTopWidth:1,borderColor:C.line,marginTop:14,paddingTop:12,gap:7}, moduleCopy:{color:C.warm,lineHeight:20,fontSize:14,fontWeight:'700'}, step:{color:C.muted,fontSize:13}, calmTab:{flex:1}, hidden:{display:'none'}, playerCard:{alignItems:'center',paddingVertical:20,gap:8}, breathGuide:{height:220,width:220,alignSelf:'center',alignItems:'center',justifyContent:'center',marginVertical:8}, breathGuideOuter:{position:'absolute',width:190,height:190,borderRadius:95,borderWidth:2,borderColor:'rgba(93,224,166,.58)'}, breathGuideInner:{position:'absolute',width:190,height:190,borderRadius:95,borderWidth:1,borderColor:'rgba(117,184,255,.7)'}, breathGuideCenter:{alignItems:'center',gap:4}, breathGlow:{position:'absolute',width:200,height:200,borderRadius:100,backgroundColor:'rgba(93,224,166,.16)'}, breathFill:{position:'absolute',width:190,height:190,borderRadius:95,backgroundColor:'rgba(93,224,166,.22)'}, waveRipple:{position:'absolute',width:170,height:170,borderRadius:85,borderWidth:2,borderColor:C.blue}, breathPhase:{color:C.warm,fontSize:20,fontWeight:'900',marginTop:5}, breathCount:{color:C.muted,fontSize:12,textAlign:'center'}, timer:{color:C.warm,fontSize:38,fontWeight:'900',letterSpacing:1}, playButton:{alignSelf:'stretch',backgroundColor:C.mint,paddingVertical:13,borderRadius:13,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:9}, playText:{color:C.ink,fontSize:15,fontWeight:'900'}, sessionRow:{flexDirection:'row',gap:9}, session:{flex:1,paddingVertical:12,alignItems:'center',borderWidth:1,borderColor:C.line,borderRadius:12,backgroundColor:C.raised}, sessionActive:{backgroundColor:C.mint,borderColor:C.mint}, sessionText:{color:C.muted,fontWeight:'800'}, sessionTextActive:{color:C.ink}, visualRow:{flexDirection:'row',gap:8}, visualChoice:{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:5,paddingVertical:10,borderRadius:11,borderWidth:1,borderColor:C.line,backgroundColor:C.raised}, visualChoiceActive:{backgroundColor:C.mint,borderColor:C.mint}, visualText:{color:C.muted,fontSize:12,fontWeight:'800'}, visualTextActive:{color:C.ink}, soundscapePicker:{flexDirection:'row',alignItems:'center',gap:10,padding:14,backgroundColor:C.raised,borderRadius:14,borderWidth:1,borderColor:C.line}, soundscapePickerText:{flex:1,color:C.warm,fontSize:14,fontWeight:'700'}, soundscapeRow:{flexDirection:'row',alignItems:'center',gap:12,padding:14,backgroundColor:C.surface,borderRadius:14,borderWidth:1,borderColor:C.line}, soundscapeRowActive:{backgroundColor:C.mint,borderColor:C.mint}, compose:{backgroundColor:C.mint,padding:14,borderRadius:14,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8}, composeText:{fontSize:14,color:C.ink,fontWeight:'900'}, postHead:{flexDirection:'row',alignItems:'center',gap:10}, avatar:{height:35,width:35,borderRadius:12,backgroundColor:'#476686',alignItems:'center',justifyContent:'center'}, avatarText:{color:C.warm,fontWeight:'900'}, avatarImg:{height:35,width:35,borderRadius:12,backgroundColor:C.raised}, memberAvatarImg:{height:57,width:57,borderRadius:18,backgroundColor:C.raised}, postText:{color:C.warm,fontSize:15,lineHeight:22}, profile:{flexDirection:'row',alignItems:'center'}, bigAvatar:{width:56,height:56,borderRadius:18,backgroundColor:C.mint,alignItems:'center',justifyContent:'center'}, bigAvatarText:{color:C.ink,fontSize:22,fontWeight:'900'}, achievement:{flexDirection:'row',alignItems:'center',gap:12,padding:14,borderWidth:1,borderColor:'#66583d',borderRadius:16}, setting:{flexDirection:'row',alignItems:'center',paddingVertical:11,borderBottomWidth:1,borderColor:C.line,gap:12}, modalBack:{flex:1,backgroundColor:'rgba(5,9,16,.7)',justifyContent:'flex-end'}, sheet:{backgroundColor:'#223047',padding:22,paddingBottom:35,borderTopLeftRadius:26,borderTopRightRadius:26,gap:13}, handle:{width:40,height:4,backgroundColor:C.muted,borderRadius:4,alignSelf:'center',opacity:.5}, sheetTitle:{color:C.warm,fontSize:22,fontWeight:'900'}, sheetCopy:{color:C.muted,lineHeight:21,fontSize:14}, composeInput:{color:C.warm,minHeight:105,borderWidth:1,borderColor:C.line,borderRadius:12,padding:12,textAlignVertical:'top',fontSize:15}, toast:{position:'absolute',left:20,right:20,bottom:84,backgroundColor:'#263a44',padding:13,borderRadius:13,flexDirection:'row',alignItems:'center',gap:8,borderWidth:1,borderColor:'#478f72'}, toastText:{color:C.warm,fontSize:13,fontWeight:'700',flex:1},
  onboardSafe:{flex:1,backgroundColor:C.ink}, onboardStar:{height:180,alignItems:'center',justifyContent:'center',backgroundColor:'#173047',borderBottomRightRadius:95,borderBottomLeftRadius:35}, welcomeBody:{padding:28,gap:15}, welcomeTitle:{color:C.warm,fontSize:38,fontWeight:'900',lineHeight:44,letterSpacing:-1}, welcomeCopy:{color:C.muted,fontSize:16,lineHeight:25,maxWidth:310}, welcomeBottom:{padding:24,gap:20,marginTop:'auto'}, textButton:{alignItems:'center',justifyContent:'center',flexDirection:'row',gap:6,padding:8}, textButtonLabel:{color:C.mint,fontSize:14,fontWeight:'800'}, onboardScroll:{padding:24,paddingTop:32,gap:17,paddingBottom:45}, onboardKicker:{color:C.mint,fontSize:11,fontWeight:'900',letterSpacing:1.5,marginTop:8}, onboardTitle:{color:C.warm,fontSize:32,lineHeight:38,fontWeight:'900',letterSpacing:-.7}, onboardCopy:{color:C.muted,fontSize:15,lineHeight:23,marginBottom:5}, field:{gap:6}, fieldLabel:{color:C.muted,fontSize:10,fontWeight:'900',letterSpacing:1}, fieldInput:{borderBottomWidth:1,borderColor:C.line,color:C.warm,paddingVertical:12,fontSize:16}, bioInput:{minHeight:82,textAlignVertical:'top',borderWidth:1,borderRadius:12,paddingHorizontal:12}, choiceWrap:{flexDirection:'row',flexWrap:'wrap',gap:8}, choice:{paddingVertical:10,paddingHorizontal:12,borderWidth:1,borderColor:C.line,borderRadius:10,flexDirection:'row',gap:6,alignItems:'center'}, choiceActive:{backgroundColor:C.mint,borderColor:C.mint}, choiceText:{color:C.muted,fontSize:13,fontWeight:'800'}, choiceTextActive:{color:C.ink}, statusNote:{color:C.gold,fontSize:13,lineHeight:19,backgroundColor:'#312b20',padding:12,borderRadius:10}, skip:{alignItems:'center',padding:7}, preferenceNote:{flexDirection:'row',gap:8,alignItems:'center',padding:10,backgroundColor:'#163636',borderWidth:1,borderColor:'#326d60',borderRadius:11}, preferenceText:{color:C.warm,fontSize:12,flex:1,lineHeight:17}, privacyAction:{flexDirection:'row',alignItems:'center',gap:12,padding:14,borderWidth:1,borderColor:C.line,borderRadius:15}, photoRow:{flexDirection:'row',alignItems:'center',gap:14,padding:14,backgroundColor:C.raised,borderRadius:14,borderWidth:1,borderColor:C.line}, journalScroll:{backgroundColor:'#151d2b'}, journalNew:{backgroundColor:C.mint,padding:14,borderRadius:13,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8}, journalEmpty:{minHeight:220,justifyContent:'center',alignItems:'center',gap:12,borderTopWidth:1,borderBottomWidth:1,borderColor:'#4d4a40',paddingHorizontal:36}, journalEntry:{backgroundColor:'#20263a',padding:18,gap:11,borderLeftWidth:2,borderColor:C.gold}, journalMood:{color:C.gold,fontSize:12,fontWeight:'800'}, journalBody:{color:C.warm,fontSize:16,lineHeight:25}, journalSheet:{backgroundColor:'#252b3a'}, moodRow:{flexDirection:'row',gap:7,flexWrap:'wrap'}, journalInput:{minHeight:190,color:C.warm,fontSize:17,lineHeight:26,textAlignVertical:'top',paddingVertical:10,borderBottomWidth:1,borderColor:'#665f4f'},
  splashSafe:{flex:1,backgroundColor:'#0b1420'}, splashBg:{position:'absolute',top:0,left:0,right:0,bottom:0,backgroundColor:'#0b1420'}, splashBgAccent:{position:'absolute',top:'-20%',left:'-10%',right:'-10%',height:'70%',borderRadius:500,backgroundColor:'#112040',opacity:.7}, splashContent:{flex:1,alignItems:'center',justifyContent:'center',gap:14,paddingHorizontal:32}, splashStar:{position:'absolute',width:3,height:3,borderRadius:2,backgroundColor:C.warm}, splashLogoWrap:{height:130,width:130,alignItems:'center',justifyContent:'center',marginBottom:4}, splashRing:{position:'absolute',width:130,height:130,borderRadius:65,borderWidth:2,borderColor:C.mint}, splashIconOuter:{alignItems:'center',justifyContent:'center'}, splashIconBg:{position:'absolute',width:72,height:72,borderRadius:36,backgroundColor:'rgba(93,224,166,0.12)'}, splashIcon:{fontSize:44,textShadowColor:C.mint,textShadowRadius:18}, splashBrand:{color:C.warm,fontSize:22,fontWeight:'900',letterSpacing:4,marginTop:2}, splashTagline:{color:C.muted,fontSize:13,textAlign:'center',letterSpacing:.4}, splashMsgWrap:{borderTopWidth:1,borderColor:'#1f3050',paddingTop:20,alignItems:'center',minHeight:68,justifyContent:'center'}, splashMsg:{color:C.warm,fontSize:17,lineHeight:26,textAlign:'center',fontStyle:'italic',fontWeight:'600',letterSpacing:.2}, splashDots:{flexDirection:'row',gap:8,marginTop:10}, splashDot:{width:7,height:7,borderRadius:4,backgroundColor:C.mint},
  readingsEntry:{flexDirection:'row',alignItems:'center',gap:13,padding:14,backgroundColor:C.surface,borderRadius:16,borderWidth:1,borderColor:'rgba(93,224,166,.3)'},
  readingsBadge:{width:44,height:44,borderRadius:14,backgroundColor:C.mint,alignItems:'center',justifyContent:'center'},
  readingCard:{flexDirection:'row',alignItems:'center',gap:12,padding:14,backgroundColor:C.surface,borderRadius:14,borderWidth:1,borderColor:C.line,marginBottom:4},
  readingCardActive:{backgroundColor:C.mint,borderColor:C.mint},
  readingIcon:{width:38,height:38,borderRadius:11,backgroundColor:C.mint,alignItems:'center',justifyContent:'center'},
  readingPlayer:{backgroundColor:'#1e2e44',borderRadius:18,padding:18,marginBottom:8,gap:12,borderWidth:1,borderColor:C.mint},
  progressTrack:{gap:4},
  progressBar:{height:6,backgroundColor:C.raised,borderRadius:3,flexDirection:'row',overflow:'hidden'},
  progressFill:{backgroundColor:C.mint,borderRadius:3},
  timeLabel:{color:C.muted,fontSize:11},
  playerControls:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:28},
  skipBtn:{alignItems:'center',gap:2},
  skipLabel:{color:C.muted,fontSize:9,fontWeight:'800'},
  playRing:{width:58,height:58,borderRadius:29,backgroundColor:C.mint,alignItems:'center',justifyContent:'center'},
  readingActions:{flexDirection:'row',gap:10},
  readingAction:{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:7,paddingVertical:11,borderRadius:12,borderWidth:1,borderColor:C.line,backgroundColor:C.raised},
  readingActionText:{color:C.warm,fontWeight:'800',fontSize:13},
  revealBtn:{flexDirection:'row',alignItems:'center',gap:4,paddingHorizontal:9,paddingVertical:5,backgroundColor:C.raised,borderRadius:9,borderWidth:1,borderColor:C.line},
  revealText:{color:C.muted,fontSize:11,fontWeight:'800'},
  sponsorCard:{borderColor:'rgba(93,224,166,.4)',borderWidth:1.5},
  sponsorQuick:{flexDirection:'row',alignItems:'center',gap:12,padding:14,backgroundColor:'#16333a',borderRadius:15,borderWidth:1,borderColor:'rgba(93,224,166,.4)'},
  sponsorQuickName:{color:C.warm,fontSize:15,fontWeight:'800'},
  sponsorQuickSub:{color:C.mint,fontSize:11,marginTop:2},
  contactChip:{width:36,height:36,borderRadius:11,backgroundColor:C.mint,alignItems:'center',justifyContent:'center'},
  newsCard:{flexDirection:'row',alignItems:'flex-start',gap:12,padding:14,backgroundColor:C.surface,borderRadius:14,borderWidth:1,borderColor:C.line,marginBottom:4},
  newsBadge:{width:34,height:34,borderRadius:10,backgroundColor:C.mint,alignItems:'center',justifyContent:'center',marginTop:2},
  newsTitle:{color:C.warm,fontSize:14,fontWeight:'800',lineHeight:19,marginBottom:3},
  newsSummary:{color:C.muted,fontSize:12,lineHeight:18,marginBottom:3},
  newsSource:{color:C.blue,fontSize:10,fontWeight:'800',letterSpacing:.6},
});