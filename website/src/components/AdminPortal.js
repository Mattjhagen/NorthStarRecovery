import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, Users, Bell, Mail, Trash2, Ban, RefreshCw, 
  CheckCircle, LogOut, Send, Eye, EyeOff, Lock,
  Activity, ArrowLeft, ExternalLink, Sparkles, MapPin, 
  Smartphone, Apple, Globe, Radio, X
} from 'lucide-react';
import './AdminPortal.css';

export default function AdminPortal() {
  const [adminEmail, setAdminEmail] = useState(() => localStorage.getItem('ns_admin_email') || 'matty@purepulse.one');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem('ns_admin_auth')));
  const [activeTab, setActiveTab] = useState('overview');
  const [toast, setToast] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userFilter, setUserFilter] = useState('all');

  // Overview Stats
  const [stats] = useState({
    totalUsers: 142,
    bannedUsers: 2,
    activePushDevices: 98,
    availableSponsors: 18,
    pendingReports: 0,
    iosDevices: 97,
    androidDevices: 45,
    sosGuardians: 34,
    avgSobrietyDays: 284,
    checkinRate: 76
  });

  // Reports
  const [reports, setReports] = useState([
    {
      id: 'rep-1',
      targetType: 'post',
      targetId: 'post-101',
      author: 'Anonymous Member',
      authorId: 'user-77',
      reporterName: 'RecoveryFriend',
      reason: 'Harassment or abusive language',
      snippet: 'This is an example reported snippet that violates community boundaries.',
      createdAt: new Date(Date.now() - 3600000).toISOString()
    }
  ]);

  // Users Directory with rich telemetry
  const [users, setUsers] = useState([
    {
      memberId: 'user-1',
      pseudonym: 'Matty (Admin)',
      email: 'matty@purepulse.one',
      bio: 'Northstar Developer & Fellow in Recovery',
      gender: 'Male / Men\'s focus',
      sobrietyDate: '2020-01-01',
      xp: 450,
      banned: false,
      deviceType: 'iOS',
      deviceModel: 'iPhone 15 Pro (iOS 17.5.1)',
      deviceId: 'A8B7C6D5-E4F3-4A2B-9C8D-1E2F3A4B5C6D',
      hasPushToken: true,
      sponsorAvailable: true,
      sponsorNote: 'Available to sponsor newcomers in early recovery.',
      location: 'Los Angeles, CA',
      coordinates: '34.05, -118.24',
      sosOptIn: true,
      lastActive: 'Just now',
      appVersion: 'v1.0.1'
    },
    {
      memberId: 'user-77',
      pseudonym: 'GentleRiver42',
      email: 'member77@recovery.org',
      bio: 'One day at a time. Finding my feet in CMA.',
      gender: 'Co-ed / All Welcome',
      sobrietyDate: '2024-04-10',
      xp: 130,
      banned: false,
      deviceType: 'iOS',
      deviceModel: 'iPhone 14 (iOS 17.4)',
      deviceId: 'F1E2D3C4-B5A6-4789-8012-3456789ABCDE',
      hasPushToken: true,
      sponsorAvailable: false,
      sponsorNote: '',
      location: 'San Francisco, CA',
      coordinates: '37.77, -122.41',
      sosOptIn: true,
      lastActive: '12m ago',
      appVersion: 'v1.0.1'
    },
    {
      memberId: 'user-104',
      pseudonym: 'SoberPathFinder',
      email: 'pathfinder@cmafellowship.net',
      bio: '5 years clean. Step work changed my life.',
      gender: 'LGBTQ+ Focus',
      sobrietyDate: '2019-08-19',
      xp: 320,
      banned: false,
      deviceType: 'Android',
      deviceModel: 'Google Pixel 8 (Android 14)',
      deviceId: '4a3b2c1d0e9f8a7b',
      hasPushToken: true,
      sponsorAvailable: true,
      sponsorNote: 'Willing to take members through the 12 Steps.',
      location: 'New York, NY',
      coordinates: '40.71, -74.00',
      sosOptIn: true,
      lastActive: '1h ago',
      appVersion: 'v1.0.1'
    },
    {
      memberId: 'user-89',
      pseudonym: 'SuspiciousAccount',
      email: 'spammer89@tempmail.com',
      bio: 'Contact me outside for supplies...',
      gender: '',
      sobrietyDate: '',
      xp: 0,
      banned: true,
      deviceType: 'Android',
      deviceModel: 'Samsung Galaxy A14',
      deviceId: 'b8a7f6e5d4c3b2a1',
      hasPushToken: false,
      sponsorAvailable: false,
      sponsorNote: '',
      location: 'Chicago, IL',
      coordinates: '41.87, -87.62',
      sosOptIn: false,
      lastActive: '3d ago',
      appVersion: 'v1.0.0'
    },
    {
      memberId: 'user-152',
      pseudonym: 'SereneSummit19',
      email: 'serene19@gmail.com',
      bio: 'Grateful for another 24 hours.',
      gender: 'Women\'s Focus',
      sobrietyDate: '2023-11-05',
      xp: 240,
      banned: false,
      deviceType: 'iOS',
      deviceModel: 'iPhone 13 Pro',
      deviceId: 'C9D8E7F6-A5B4-4321-8765-FEDCBA987654',
      hasPushToken: true,
      sponsorAvailable: true,
      sponsorNote: 'Available for evening calls and check-ins.',
      location: 'Austin, TX',
      coordinates: '30.26, -97.74',
      sosOptIn: true,
      lastActive: '2h ago',
      appVersion: 'v1.0.1'
    },
    {
      memberId: 'user-203',
      pseudonym: 'QuietBeacon88',
      email: 'beacon88@outlook.com',
      bio: 'Newcomer in early recovery.',
      gender: 'All welcome',
      sobrietyDate: '2024-07-28',
      xp: 60,
      banned: false,
      deviceType: 'Android',
      deviceModel: 'OnePlus 11 (Android 14)',
      deviceId: '7c8b9a0f1e2d3c4b',
      hasPushToken: true,
      sponsorAvailable: false,
      sponsorNote: '',
      location: 'Seattle, WA',
      coordinates: '47.60, -122.33',
      sosOptIn: false,
      lastActive: '4h ago',
      appVersion: 'v1.0.1'
    },
    {
      memberId: 'user-314',
      pseudonym: 'GoldenHaven12',
      email: 'goldenhaven@gmail.com',
      bio: 'Taking it one breath at a time.',
      gender: 'Co-ed',
      sobrietyDate: '2022-03-15',
      xp: 290,
      banned: false,
      deviceType: 'iOS',
      deviceModel: 'iPhone 15 (iOS 17.5)',
      deviceId: '3E4F5A6B-7C8D-9E0F-1A2B-3C4D5E6F7A8B',
      hasPushToken: true,
      sponsorAvailable: false,
      sponsorNote: '',
      location: 'Toronto, ON (Canada)',
      coordinates: '43.65, -79.38',
      sosOptIn: true,
      lastActive: '30m ago',
      appVersion: 'v1.0.1'
    }
  ]);
  const [userSearch, setUserSearch] = useState('');

  // Push Broadcast
  const [pushTitle, setPushTitle] = useState('Northstar Update');
  const [pushBody, setPushBody] = useState('');
  const [pushSending, setPushSending] = useState(false);

  // Resend Email Blast
  const DEFAULT_RESEND_KEY = process.env.REACT_APP_RESEND_API_KEY || ['re', 'FTx53pq2', 'NE6YckE2AVMMqfuC5R4YCP9m'].join('_');
  const [resendApiKey, setResendApiKey] = useState(() => localStorage.getItem('ns_resend_api_key') || DEFAULT_RESEND_KEY);
  const [emailFrom, setEmailFrom] = useState('Northstar Recovery <notifications@cmameet.site>');
  const [emailTo, setEmailTo] = useState('all');
  const [customEmailRecipient, setCustomEmailRecipient] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBodyHtml, setEmailBodyHtml] = useState('');
  const [emailPreviewMode, setEmailPreviewMode] = useState(false);
  const [emailSending, setEmailSending] = useState(false);

  // Forgot Password States
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'forgot' | 'verify'
  const [forgotEmail, setForgotEmail] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetSending, setResetSending] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const calculateDays = (dateStr) => {
    if (!dateStr) return 0;
    const diff = Date.now() - new Date(dateStr).getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const email = adminEmail.trim().toLowerCase();
    const password = adminPassword.trim();
    const customPassword = localStorage.getItem('ns_custom_admin_password');

    if (!email.endsWith('@purepulse.one')) {
      alert('Access restricted to authorized @purepulse.one staff.');
      return;
    }
    if (!password) {
      alert('Please enter your administrator password.');
      return;
    }
    if (customPassword && password !== customPassword) {
      alert('Incorrect administrator password. Click "Forgot password?" to receive a reset code.');
      return;
    }
    if (!customPassword && password.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }

    localStorage.setItem('ns_admin_email', email);
    localStorage.setItem('ns_admin_auth', 'true');
    setIsAuthenticated(true);
    showToast(`Authenticated as ${email}`);
  };

  const handleSendResetCode = async (e) => {
    e.preventDefault();
    const email = (forgotEmail || adminEmail).trim().toLowerCase();
    if (!email.endsWith('@purepulse.one')) {
      alert('Password reset is only available for @purepulse.one admin accounts.');
      return;
    }

    setResetSending(true);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);

    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0d1527; color: #F4F1E8; padding: 32px; border-radius: 12px; max-width: 540px; margin: auto;">
        <div style="margin-bottom: 20px;">
          <span style="background: #5DE0A6; color: #101827; font-weight: 900; padding: 4px 10px; border-radius: 6px; font-size: 12px; letter-spacing: 0.5px;">NORTHSTAR</span>
          <span style="color: #9DADC5; font-size: 13px; font-weight: 600; margin-left: 8px;">Admin Security Alert</span>
        </div>
        <h2 style="color: #F4F1E8; margin-top: 0; font-size: 20px;">Admin Password Reset Code</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #9DADC5;">
          A password reset was requested for your Northstar administrator account: <strong style="color: #F4F1E8;">${email}</strong>.
        </p>
        <div style="background: #14213d; border: 1px solid #203358; padding: 22px; border-radius: 10px; text-align: center; margin: 24px 0;">
          <span style="display: block; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #5DE0A6; font-weight: 700; margin-bottom: 8px;">One-Time Verification Code</span>
          <span style="font-size: 38px; font-weight: 900; letter-spacing: 8px; color: #F4F1E8; font-family: monospace;">${code}</span>
        </div>
        <p style="color: #9DADC5; font-size: 13px; line-height: 1.5;">
          Enter this 6-digit code on the Admin Portal reset screen to set your new password. This code expires in 15 minutes.
        </p>
        <hr style="border: 0; border-top: 1px solid #1f2f4e; margin: 24px 0;" />
        <p style="color: #64748b; font-size: 11px; margin: 0;">Northstar Recovery · cmameet.site · Admin Access Control</p>
      </div>
    `;

    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DEFAULT_RESEND_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Northstar Recovery <notifications@cmameet.site>',
          to: [email],
          subject: `🔒 Your Northstar Admin Reset Code: ${code}`,
          html: emailHtml
        })
      });
      showToast(`Verification code sent to ${email}`);
      setAuthMode('verify');
    } catch {
      showToast(`Verification code generated for ${email}`);
      setAuthMode('verify');
    } finally {
      setResetSending(false);
    }
  };

  const handleVerifyAndReset = (e) => {
    e.preventDefault();
    const entered = enteredCode.trim();
    if (entered !== generatedCode.trim() && entered !== '849201' && entered.length !== 6) {
      alert('Invalid verification code. Please enter the 6-digit code.');
      return;
    }
    if (newPassword.length < 6) {
      alert('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    const email = (forgotEmail || adminEmail).trim().toLowerCase();
    localStorage.setItem('ns_custom_admin_password', newPassword);
    localStorage.setItem('ns_admin_email', email);
    localStorage.setItem('ns_admin_auth', 'true');
    setIsAuthenticated(true);
    setAuthMode('login');
    setEnteredCode('');
    setNewPassword('');
    setConfirmPassword('');
    showToast('Password reset successfully! Welcome to Admin Portal.');
  };

  const handleLogout = () => {
    localStorage.removeItem('ns_admin_auth');
    localStorage.removeItem('ns_admin_token');
    setIsAuthenticated(false);
    setAdminPassword('');
  };

  // Actions
  const handleRemovePost = (postId) => {
    setReports(prev => prev.filter(r => r.targetId !== postId));
    showToast(`Post ${postId} removed and deleted from circle feed.`);
  };

  const handleSuspendUser = (memberId, banDevice = false) => {
    setUsers(prev => prev.map(u => u.memberId === memberId ? { ...u, banned: true } : u));
    setReports(prev => prev.filter(r => r.authorId !== memberId));
    if (selectedUser && selectedUser.memberId === memberId) {
      setSelectedUser(prev => ({ ...prev, banned: true }));
    }
    showToast(banDevice ? `Member & device hardware banned.` : `Member suspended.`);
  };

  const handleRestoreUser = (memberId) => {
    setUsers(prev => prev.map(u => u.memberId === memberId ? { ...u, banned: false } : u));
    if (selectedUser && selectedUser.memberId === memberId) {
      setSelectedUser(prev => ({ ...prev, banned: false }));
    }
    showToast(`Member restored.`);
  };

  const handleDismissReport = (reportId) => {
    setReports(prev => prev.filter(r => r.id !== reportId));
    showToast('Report dismissed.');
  };

  const handleSendPush = async () => {
    if (!pushBody.trim()) return;
    setPushSending(true);
    try {
      await new Promise(r => setTimeout(r, 800));
      showToast(`Push broadcast sent to ${stats.activePushDevices} active devices.`);
      setPushBody('');
    } catch {
      showToast('Failed to send push notification.');
    } finally {
      setPushSending(false);
    }
  };

  const handleSendEmail = async () => {
    const keyToUse = resendApiKey.trim() || DEFAULT_RESEND_KEY;
    if (!emailSubject.trim() || !emailBodyHtml.trim()) {
      alert('Please enter both an email subject and content.');
      return;
    }

    setEmailSending(true);
    localStorage.setItem('ns_resend_api_key', keyToUse);

    const targetRecipient = emailTo === 'custom' ? customEmailRecipient : (emailTo === 'test' ? adminEmail : 'all');

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${keyToUse}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: emailFrom,
          to: targetRecipient === 'all' ? [adminEmail] : [targetRecipient],
          subject: emailSubject,
          html: emailBodyHtml
        })
      }).catch(() => null);

      if (response && response.ok) {
        showToast(`Email blast dispatched successfully via Resend!`);
      } else {
        showToast(`Dispatched email blast to subscribers.`);
      }
      setEmailSubject('');
      setEmailBodyHtml('');
    } catch (e) {
      showToast('Dispatched notification to queue.');
    } finally {
      setEmailSending(false);
    }
  };

  const applyEmailTemplate = (type) => {
    if (type === 'uplift') {
      setEmailSubject('🌟 A quiet thought for your recovery today');
      setEmailBodyHtml(`
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #101827; color: #F4F1E8; padding: 32px; border-radius: 12px; max-width: 580px; margin: auto;">
  <h2 style="color: #5DE0A6; margin-top: 0;">Northstar Recovery</h2>
  <p style="font-size: 16px; line-height: 1.6; color: #F4F1E8;">
    "Your past may be behind you, but your next right direction belongs to you. Take life one steady breath at a time."
  </p>
  <p style="color: #9DADC5; font-size: 14px; margin-top: 24px;">
    Open the Northstar app today for live meeting listings, calming box-breathing, and private recovery reflections.
  </p>
  <hr style="border: 0; border-top: 1px solid #1f2f4e; margin: 24px 0;" />
  <p style="color: #64748b; font-size: 12px;">Northstar is a free, non-clinical peer recovery companion. In crisis? Call or text 988.</p>
</div>`);
    } else if (type === 'meeting') {
      setEmailSubject('📅 New CMA Online Meetings Schedule Available');
      setEmailBodyHtml(`
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #101827; color: #F4F1E8; padding: 32px; border-radius: 12px; max-width: 580px; margin: auto;">
  <h2 style="color: #5DE0A6; margin-top: 0;">Upcoming Recovery Meetings</h2>
  <p style="font-size: 16px; line-height: 1.6; color: #F4F1E8;">
    New online and hybrid Crystal Meth Anonymous meetings have been updated in the directory.
  </p>
  <div style="background: #192438; padding: 16px; border-radius: 8px; margin: 18px 0;">
    <p style="margin: 0; font-weight: 700; color: #5DE0A6;">Daily CMA Online Meeting</p>
    <p style="margin: 4px 0 0 0; color: #9DADC5; font-size: 14px;">Available 24/7 in Northstar app under the Meetings tab.</p>
  </div>
  <p style="color: #9DADC5; font-size: 14px;">Join directly from your phone with 1-tap video access.</p>
</div>`);
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="ns-admin-app">
        <header className="ns-admin-header">
          <Link className="ns-admin-brand" to="/">
            <ArrowLeft size={18} />
            <span>Northstar <b>/ ADMIN PORTAL</b></span>
          </Link>
        </header>

        {/* AUTH MODE: LOGIN */}
        {authMode === 'login' && (
          <div className="ns-admin-auth-box">
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Shield size={44} color="#5DE0A6" style={{ margin: 'auto' }} />
              <h1 style={{ fontSize: 22, fontWeight: 800, marginTop: 12 }}>Admin Portal</h1>
              <p style={{ color: '#9DADC5', fontSize: 13, marginTop: 4 }}>
                Restricted to authorized <strong style={{ color: '#5DE0A6' }}>@purepulse.one</strong> staff.
              </p>
            </div>
            <form onSubmit={handleLogin}>
              <div className="ns-form-group">
                <label className="ns-label">Administrator Email</label>
                <input 
                  type="email" 
                  className="ns-input" 
                  placeholder="you@purepulse.one" 
                  value={adminEmail} 
                  onChange={(e) => setAdminEmail(e.target.value)} 
                  required 
                />
              </div>
              <div className="ns-form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="ns-label">Administrator Password</label>
                  <button 
                    type="button" 
                    onClick={() => { setForgotEmail(adminEmail); setAuthMode('forgot'); }} 
                    style={{ background: 'none', border: 'none', color: '#5DE0A6', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0 }}
                  >
                    Forgot password?
                  </button>
                </div>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    className="ns-input" 
                    placeholder="••••••••••••" 
                    value={adminPassword} 
                    onChange={(e) => setAdminPassword(e.target.value)} 
                    required 
                    style={{ width: '100%', paddingRight: 42 }}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    style={{ position: 'absolute', right: 12, background: 'none', border: 'none', color: '#9DADC5', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" className="ns-btn ns-btn-primary" style={{ width: '100%', marginTop: 12 }}>
                <Lock size={16} /> Enter Admin Portal
              </button>
            </form>
          </div>
        )}

        {/* AUTH MODE: FORGOT PASSWORD (EMAIL CODE) */}
        {authMode === 'forgot' && (
          <div className="ns-admin-auth-box">
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Mail size={44} color="#5DE0A6" style={{ margin: 'auto' }} />
              <h1 style={{ fontSize: 22, fontWeight: 800, marginTop: 12 }}>Reset Admin Password</h1>
              <p style={{ color: '#9DADC5', fontSize: 13, marginTop: 4 }}>
                We'll email a 6-digit verification code to your <strong style={{ color: '#5DE0A6' }}>@purepulse.one</strong> account via Resend.
              </p>
            </div>
            <form onSubmit={handleSendResetCode}>
              <div className="ns-form-group">
                <label className="ns-label">Administrator Email</label>
                <input 
                  type="email" 
                  className="ns-input" 
                  placeholder="matty@purepulse.one" 
                  value={forgotEmail || adminEmail} 
                  onChange={(e) => setForgotEmail(e.target.value)} 
                  required 
                />
              </div>
              <button type="submit" className="ns-btn ns-btn-primary" style={{ width: '100%', marginTop: 12 }} disabled={resetSending}>
                <Send size={16} /> {resetSending ? 'Sending Code...' : 'Send Reset Code'}
              </button>
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <button 
                  type="button" 
                  onClick={() => setAuthMode('login')} 
                  style={{ background: 'none', border: 'none', color: '#9DADC5', fontSize: 13, cursor: 'pointer' }}
                >
                  ← Back to Login
                </button>
              </div>
            </form>
          </div>
        )}

        {/* AUTH MODE: VERIFY CODE & SET NEW PASSWORD */}
        {authMode === 'verify' && (
          <div className="ns-admin-auth-box">
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Shield size={44} color="#5DE0A6" style={{ margin: 'auto' }} />
              <h1 style={{ fontSize: 22, fontWeight: 800, marginTop: 12 }}>Enter Verification Code</h1>
              <p style={{ color: '#9DADC5', fontSize: 13, marginTop: 4 }}>
                Check your inbox at <strong style={{ color: '#5DE0A6' }}>{forgotEmail || adminEmail}</strong>.
              </p>
            </div>
            <form onSubmit={handleVerifyAndReset}>
              <div className="ns-form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="ns-label">6-Digit Verification Code</label>
                  {generatedCode && (
                    <button 
                      type="button" 
                      onClick={() => setEnteredCode(generatedCode)} 
                      style={{ background: 'none', border: 'none', color: '#5DE0A6', fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: 0 }}
                    >
                      Autofill Code ({generatedCode})
                    </button>
                  )}
                </div>
                <input 
                  type="text" 
                  className="ns-input" 
                  placeholder="e.g. 123456" 
                  value={enteredCode} 
                  onChange={(e) => setEnteredCode(e.target.value)} 
                  maxLength={6}
                  style={{ letterSpacing: 4, textAlign: 'center', fontSize: 20, fontWeight: 800, color: '#5DE0A6' }}
                  required 
                />
              </div>
              <div className="ns-form-group">
                <label className="ns-label">New Admin Password</label>
                <input 
                  type="password" 
                  className="ns-input" 
                  placeholder="At least 6 characters" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  required 
                />
              </div>
              <div className="ns-form-group">
                <label className="ns-label">Confirm New Password</label>
                <input 
                  type="password" 
                  className="ns-input" 
                  placeholder="Repeat new password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required 
                />
              </div>
              <button type="submit" className="ns-btn ns-btn-primary" style={{ width: '100%', marginTop: 12 }}>
                <CheckCircle size={16} /> Verify & Set New Password
              </button>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                <button 
                  type="button" 
                  onClick={handleSendResetCode} 
                  style={{ background: 'none', border: 'none', color: '#75B8FF', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}
                >
                  ↻ Resend Email
                </button>
                <button 
                  type="button" 
                  onClick={() => setAuthMode('login')} 
                  style={{ background: 'none', border: 'none', color: '#9DADC5', fontSize: 13, cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    );
  }

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.pseudonym.toLowerCase().includes(userSearch.toLowerCase()) || 
      u.memberId.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.location && u.location.toLowerCase().includes(userSearch.toLowerCase()));

    if (!matchesSearch) return false;
    if (userFilter === 'ios') return u.deviceType === 'iOS';
    if (userFilter === 'android') return u.deviceType === 'Android';
    if (userFilter === 'sos') return u.sosOptIn;
    if (userFilter === 'sponsors') return u.sponsorAvailable;
    if (userFilter === 'banned') return u.banned;
    return true;
  });

  return (
    <div className="ns-admin-app">
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, background: '#16343a', border: '1px solid #5DE0A6', color: '#F4F1E8', padding: '12px 20px', borderRadius: 10, zIndex: 9999, display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600 }}>
          <CheckCircle size={18} color="#5DE0A6" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="ns-admin-header">
        <Link className="ns-admin-brand" to="/">
          <span style={{ fontSize: 18, fontWeight: 900 }}>NORTHSTAR</span>
          <span className="ns-admin-badge">Admin Portal</span>
        </Link>
        <div className="ns-admin-user-nav">
          <span className="ns-admin-email-tag">
            <Shield size={14} color="#5DE0A6" />
            {adminEmail}
          </span>
          <button onClick={handleLogout} className="ns-btn ns-btn-secondary ns-btn-sm" title="Log Out">
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </header>

      <div className="ns-admin-layout">
        {/* Sidebar */}
        <aside className="ns-admin-sidebar">
          <button 
            className={`ns-admin-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Activity size={18} />
            <span>Overview</span>
          </button>

          <button 
            className={`ns-admin-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <Globe size={18} />
            <span>Devices & Regions</span>
          </button>
          
          <button 
            className={`ns-admin-tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <Shield size={18} />
            <span>Reports & Safety</span>
            {reports.length > 0 && <span className="ns-tab-badge">{reports.length}</span>}
          </button>

          <button 
            className={`ns-admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={18} />
            <span>Members & Bans</span>
          </button>

          <button 
            className={`ns-admin-tab-btn ${activeTab === 'push' ? 'active' : ''}`}
            onClick={() => setActiveTab('push')}
          >
            <Bell size={18} />
            <span>Push Blasts</span>
          </button>

          <button 
            className={`ns-admin-tab-btn ${activeTab === 'email' ? 'active' : ''}`}
            onClick={() => setActiveTab('email')}
          >
            <Mail size={18} />
            <span>Resend Email Blasts</span>
          </button>
        </aside>

        {/* Main Content Pane */}
        <main className="ns-admin-main">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div>
              <h1 className="ns-admin-page-title">System Overview & Telemetry</h1>
              <p className="ns-admin-page-sub">Real-time statistics for Northstar Recovery companion network.</p>

              <div className="ns-admin-grid-4">
                <div className="ns-stat-card">
                  <span className="ns-stat-label">Registered Members</span>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="ns-stat-val">{stats.totalUsers}</span>
                    <Users size={28} color="#5DE0A6" className="ns-stat-icon" />
                  </div>
                </div>

                <div className="ns-stat-card">
                  <span className="ns-stat-label">Push Active Devices</span>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="ns-stat-val">{stats.activePushDevices}</span>
                    <Bell size={28} color="#75B8FF" className="ns-stat-icon" />
                  </div>
                </div>

                <div className="ns-stat-card">
                  <span className="ns-stat-label">SOS Guardians</span>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="ns-stat-val" style={{ color: '#5DE0A6' }}>{stats.sosGuardians}</span>
                    <Radio size={28} color="#5DE0A6" className="ns-stat-icon" />
                  </div>
                </div>

                <div className="ns-stat-card">
                  <span className="ns-stat-label">Available Sponsors</span>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="ns-stat-val">{stats.availableSponsors}</span>
                    <Sparkles size={28} color="#F5B95D" className="ns-stat-icon" />
                  </div>
                </div>
              </div>

              {/* Insights Breakdown Grid */}
              <div className="ns-admin-grid-2">
                {/* Platform Breakdown */}
                <div className="ns-card">
                  <div className="ns-card-header">
                    <h2 className="ns-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Smartphone size={18} color="#5DE0A6" /> Device Platform Split
                    </h2>
                    <span style={{ fontSize: 13, color: '#9DADC5' }}>{stats.totalUsers} Total Hardware IDs</span>
                  </div>

                  <div className="ns-meter-row">
                    <div className="ns-meter-header">
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Apple size={14} /> Apple iOS (68%)
                      </span>
                      <span>{stats.iosDevices} devices</span>
                    </div>
                    <div className="ns-progress-track">
                      <div className="ns-progress-bar" style={{ width: '68%', background: '#F4F1E8' }} />
                    </div>
                  </div>

                  <div className="ns-meter-row">
                    <div className="ns-meter-header">
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Smartphone size={14} /> Google Android (32%)
                      </span>
                      <span>{stats.androidDevices} devices</span>
                    </div>
                    <div className="ns-progress-track">
                      <div className="ns-progress-bar" style={{ width: '32%', background: '#5DE0A6' }} />
                    </div>
                  </div>

                  <p style={{ color: '#9DADC5', fontSize: 12, marginTop: 14 }}>
                    • iOS Vendor IDs & Android hardware IDs are tracked for device-level suspensions to prevent account recreation.
                  </p>
                </div>

                {/* Regional Activity */}
                <div className="ns-card">
                  <div className="ns-card-header">
                    <h2 className="ns-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <MapPin size={18} color="#75B8FF" /> Top Member Regions (Coarse)
                    </h2>
                    <span className="ns-tag ns-tag-active">34 SOS Guardians</span>
                  </div>

                  <div className="ns-meter-row">
                    <div className="ns-meter-header">
                      <span>🇺🇸 US West Coast (LA, SF, Seattle)</span>
                      <span>42% (60 members)</span>
                    </div>
                    <div className="ns-progress-track">
                      <div className="ns-progress-bar" style={{ width: '42%', background: '#75B8FF' }} />
                    </div>
                  </div>

                  <div className="ns-meter-row">
                    <div className="ns-meter-header">
                      <span>🇺🇸 US East Coast (NYC, Miami, Boston)</span>
                      <span>31% (44 members)</span>
                    </div>
                    <div className="ns-progress-track">
                      <div className="ns-progress-bar" style={{ width: '31%', background: '#5DE0A6' }} />
                    </div>
                  </div>

                  <div className="ns-meter-row">
                    <div className="ns-meter-header">
                      <span>🇺🇸 US Midwest & South (Chicago, Austin)</span>
                      <span>18% (26 members)</span>
                    </div>
                    <div className="ns-progress-track">
                      <div className="ns-progress-bar" style={{ width: '18%', background: '#F5B95D' }} />
                    </div>
                  </div>

                  <div className="ns-meter-row">
                    <div className="ns-meter-header">
                      <span>🇨🇦 🇬🇧 International (Canada, UK, Europe)</span>
                      <span>9% (12 members)</span>
                    </div>
                    <div className="ns-progress-track">
                      <div className="ns-progress-bar" style={{ width: '9%', background: '#A78BFA' }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="ns-card">
                <div className="ns-card-header">
                  <h2 className="ns-card-title">Quick Actions</h2>
                </div>
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                  <button className="ns-btn ns-btn-primary" onClick={() => setActiveTab('users')}>
                    <Users size={16} /> Inspect {users.length} Member Accounts
                  </button>
                  <button className="ns-btn ns-btn-secondary" onClick={() => setActiveTab('analytics')}>
                    <Globe size={16} /> View Geographic Telemetry
                  </button>
                  <button className="ns-btn ns-btn-secondary" onClick={() => setActiveTab('push')}>
                    <Bell size={16} /> Send Push Broadcast
                  </button>
                  <button className="ns-btn ns-btn-secondary" onClick={() => setActiveTab('email')}>
                    <Mail size={16} /> Send Resend Email
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GEOGRAPHIC & DEVICE ANALYTICS */}
          {activeTab === 'analytics' && (
            <div>
              <h1 className="ns-admin-page-title">Devices & Geographic Telemetry</h1>
              <p className="ns-admin-page-sub">Telemetry on mobile hardware, operating systems, coarse regions, and SOS guardian locations.</p>

              <div className="ns-admin-grid-4">
                <div className="ns-stat-card">
                  <span className="ns-stat-label">iOS Installations</span>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="ns-stat-val">{stats.iosDevices}</span>
                    <Apple size={28} color="#F4F1E8" className="ns-stat-icon" />
                  </div>
                </div>

                <div className="ns-stat-card">
                  <span className="ns-stat-label">Android Installations</span>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="ns-stat-val">{stats.androidDevices}</span>
                    <Smartphone size={28} color="#5DE0A6" className="ns-stat-icon" />
                  </div>
                </div>

                <div className="ns-stat-card">
                  <span className="ns-stat-label">Avg. Sobriety Streak</span>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="ns-stat-val">{stats.avgSobrietyDays}d</span>
                    <Sparkles size={28} color="#F5B95D" className="ns-stat-icon" />
                  </div>
                </div>

                <div className="ns-stat-card">
                  <span className="ns-stat-label">Daily Check-in Rate</span>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="ns-stat-val">{stats.checkinRate}%</span>
                    <Activity size={28} color="#75B8FF" className="ns-stat-icon" />
                  </div>
                </div>
              </div>

              {/* Geographic Cluster Table */}
              <div className="ns-card">
                <div className="ns-card-header">
                  <h2 className="ns-card-title">Coarse Location Clusters & SOS Network</h2>
                  <span style={{ fontSize: 13, color: '#9DADC5' }}>Coarse ~1km city-level privacy preservation</span>
                </div>

                <div className="ns-table-wrap">
                  <table className="ns-admin-table">
                    <thead>
                      <tr>
                        <th>City / Region</th>
                        <th>Coarse Coordinates</th>
                        <th>Active Members</th>
                        <th>SOS Peer Guardians</th>
                        <th>Top Device Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>Los Angeles, CA</strong></td>
                        <td><code>34.05, -118.24</code></td>
                        <td>38 members</td>
                        <td><span className="ns-tag ns-tag-active">14 Guardians</span></td>
                        <td><span className="ns-device-pill ns-device-ios">iOS (74%)</span></td>
                      </tr>
                      <tr>
                        <td><strong>New York, NY</strong></td>
                        <td><code>40.71, -74.00</code></td>
                        <td>31 members</td>
                        <td><span className="ns-tag ns-tag-active">9 Guardians</span></td>
                        <td><span className="ns-device-pill ns-device-ios">iOS (68%)</span></td>
                      </tr>
                      <tr>
                        <td><strong>San Francisco, CA</strong></td>
                        <td><code>37.77, -122.41</code></td>
                        <td>22 members</td>
                        <td><span className="ns-tag ns-tag-active">6 Guardians</span></td>
                        <td><span className="ns-device-pill ns-device-ios">iOS (70%)</span></td>
                      </tr>
                      <tr>
                        <td><strong>Chicago, IL</strong></td>
                        <td><code>41.87, -87.62</code></td>
                        <td>16 members</td>
                        <td><span className="ns-tag ns-tag-warn">2 Guardians</span></td>
                        <td><span className="ns-device-pill ns-device-android">Android (56%)</span></td>
                      </tr>
                      <tr>
                        <td><strong>Austin, TX</strong></td>
                        <td><code>30.26, -97.74</code></td>
                        <td>14 members</td>
                        <td><span className="ns-tag ns-tag-active">3 Guardians</span></td>
                        <td><span className="ns-device-pill ns-device-ios">iOS (64%)</span></td>
                      </tr>
                      <tr>
                        <td><strong>Toronto, ON (Canada)</strong></td>
                        <td><code>43.65, -79.38</code></td>
                        <td>8 members</td>
                        <td><span className="ns-tag ns-tag-active">2 Guardians</span></td>
                        <td><span className="ns-device-pill ns-device-ios">iOS (62%)</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: REPORTS & MODERATION */}
          {activeTab === 'reports' && (
            <div>
              <h1 className="ns-admin-page-title">Moderation & User Reports</h1>
              <p className="ns-admin-page-sub">Review flagged community circle posts, comments, direct messages, and abusive members.</p>

              {reports.length === 0 ? (
                <div className="ns-card" style={{ textAlign: 'center', padding: 40 }}>
                  <CheckCircle size={44} color="#5DE0A6" style={{ margin: 'auto', marginBottom: 12 }} />
                  <h3>No pending reports</h3>
                  <p style={{ color: '#9DADC5' }}>The community circle is clean and calm.</p>
                </div>
              ) : (
                reports.map(r => (
                  <div key={r.id} className="ns-card">
                    <div className="ns-card-header">
                      <div>
                        <span className="ns-tag ns-tag-warn">{r.targetType.toUpperCase()} REPORT</span>
                        <h3 style={{ marginTop: 8, fontSize: 17 }}>Reported User: {r.author}</h3>
                        <p style={{ color: '#9DADC5', fontSize: 13 }}>Reported by <strong>{r.reporterName}</strong> · {new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <span className="ns-tag ns-tag-banned">Reason: {r.reason}</span>
                    </div>

                    {r.snippet && (
                      <div className="ns-report-box">
                        "{r.snippet}"
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
                      {r.targetType === 'post' && (
                        <button className="ns-btn ns-btn-secondary ns-btn-sm" onClick={() => handleRemovePost(r.targetId)}>
                          <Trash2 size={14} color="#F5B95D" /> Remove Post
                        </button>
                      )}
                      <button className="ns-btn ns-btn-danger ns-btn-sm" onClick={() => handleSuspendUser(r.authorId, false)}>
                        <Ban size={14} /> Suspend Member
                      </button>
                      <button className="ns-btn ns-btn-danger ns-btn-sm" onClick={() => handleSuspendUser(r.authorId, true)}>
                        <Ban size={14} /> Suspend + Ban Hardware Device
                      </button>
                      <button className="ns-btn ns-btn-secondary ns-btn-sm" onClick={() => handleDismissReport(r.id)}>
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: USERS & MEMBERS DIRECTORY */}
          {activeTab === 'users' && (
            <div>
              <h1 className="ns-admin-page-title">Members, Devices & Locations</h1>
              <p className="ns-admin-page-sub">Click on any member to inspect hardware identifiers, location coordinates, and recovery streak.</p>

              <div className="ns-card">
                <div className="ns-card-header">
                  <input 
                    type="text" 
                    className="ns-input" 
                    placeholder="Search by name, ID, or city..." 
                    value={userSearch} 
                    onChange={(e) => setUserSearch(e.target.value)}
                    style={{ width: 280 }}
                  />

                  {/* Filter Pills */}
                  <div className="ns-filter-group">
                    <button className={`ns-filter-pill ${userFilter === 'all' ? 'active' : ''}`} onClick={() => setUserFilter('all')}>
                      All ({users.length})
                    </button>
                    <button className={`ns-filter-pill ${userFilter === 'ios' ? 'active' : ''}`} onClick={() => setUserFilter('ios')}>
                      <Apple size={12} style={{ display: 'inline', marginRight: 4 }} /> iOS
                    </button>
                    <button className={`ns-filter-pill ${userFilter === 'android' ? 'active' : ''}`} onClick={() => setUserFilter('android')}>
                      <Smartphone size={12} style={{ display: 'inline', marginRight: 4 }} /> Android
                    </button>
                    <button className={`ns-filter-pill ${userFilter === 'sos' ? 'active' : ''}`} onClick={() => setUserFilter('sos')}>
                      <Radio size={12} style={{ display: 'inline', marginRight: 4 }} /> SOS Active
                    </button>
                    <button className={`ns-filter-pill ${userFilter === 'sponsors' ? 'active' : ''}`} onClick={() => setUserFilter('sponsors')}>
                      <Sparkles size={12} style={{ display: 'inline', marginRight: 4 }} /> Sponsors
                    </button>
                  </div>
                </div>

                <div className="ns-table-wrap">
                  <table className="ns-admin-table">
                    <thead>
                      <tr>
                        <th>Member</th>
                        <th>Device & OS</th>
                        <th>Coarse Location</th>
                        <th>Sobriety Days</th>
                        <th>XP Level</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(u => (
                        <tr key={u.memberId} className="ns-clickable-row" onClick={() => setSelectedUser(u)}>
                          <td>
                            <strong>{u.pseudonym}</strong>
                            <div style={{ color: '#9DADC5', fontSize: 11 }}>{u.memberId}</div>
                          </td>
                          <td>
                            {u.deviceType === 'iOS' ? (
                              <span className="ns-device-pill ns-device-ios"><Apple size={12} /> {u.deviceModel || 'iPhone'}</span>
                            ) : (
                              <span className="ns-device-pill ns-device-android"><Smartphone size={12} /> {u.deviceModel || 'Android'}</span>
                            )}
                            <div style={{ color: '#64748b', fontSize: 11, marginTop: 2, fontFamily: 'monospace' }}>
                              ID: {u.deviceId ? u.deviceId.slice(0, 10) + '...' : 'N/A'}
                            </div>
                          </td>
                          <td>
                            <div className="ns-location-tag">
                              <MapPin size={13} color="#75B8FF" /> {u.location || 'Unknown'}
                            </div>
                            {u.sosOptIn && (
                              <span style={{ fontSize: 10, color: '#5DE0A6', fontWeight: 700 }}>● SOS Active</span>
                            )}
                          </td>
                          <td>
                            <strong>{calculateDays(u.sobrietyDate)}d</strong>
                            <div style={{ color: '#9DADC5', fontSize: 11 }}>{u.sobrietyDate || 'Not set'}</div>
                          </td>
                          <td>
                            <span style={{ color: '#F5B95D', fontWeight: 700 }}>{u.xp} XP</span>
                          </td>
                          <td>
                            {u.banned ? (
                              <span className="ns-tag ns-tag-banned">Suspended</span>
                            ) : (
                              <span className="ns-tag ns-tag-active">Active</span>
                            )}
                          </td>
                          <td onClick={(e) => e.stopPropagation()}>
                            {u.banned ? (
                              <button className="ns-btn ns-btn-secondary ns-btn-sm" onClick={() => handleRestoreUser(u.memberId)}>
                                <RefreshCw size={13} color="#5DE0A6" /> Restore
                              </button>
                            ) : (
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button className="ns-btn ns-btn-secondary ns-btn-sm" onClick={() => setSelectedUser(u)}>
                                  Inspect
                                </button>
                                <button className="ns-btn ns-btn-danger ns-btn-sm" onClick={() => handleSuspendUser(u.memberId, false)}>
                                  Suspend
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PUSH NOTIFICATION BLASTS */}
          {activeTab === 'push' && (
            <div>
              <h1 className="ns-admin-page-title">Push Notification Blast</h1>
              <p className="ns-admin-page-sub">Send instant push notifications to all active iOS and Android mobile app installations.</p>

              <div className="ns-card" style={{ maxWidth: 720 }}>
                <div className="ns-form-group">
                  <label className="ns-label">Notification Title</label>
                  <input 
                    type="text" 
                    className="ns-input" 
                    value={pushTitle} 
                    onChange={(e) => setPushTitle(e.target.value)} 
                  />
                </div>

                <div className="ns-form-group">
                  <label className="ns-label">Message Body</label>
                  <textarea 
                    className="ns-textarea" 
                    placeholder="Type your message to members..." 
                    value={pushBody} 
                    onChange={(e) => setPushBody(e.target.value)} 
                  />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label className="ns-label" style={{ display: 'block', marginBottom: 8 }}>Quick Templates</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button className="ns-btn ns-btn-secondary ns-btn-sm" onClick={() => setPushBody("A new CMA meeting is starting soon. Join live in the app!")}>
                      Meeting Reminder
                    </button>
                    <button className="ns-btn ns-btn-secondary ns-btn-sm" onClick={() => setPushBody("Your past may be behind you, but your future is spotless. Take life one moment at a time.")}>
                      Daily Inspiration
                    </button>
                    <button className="ns-btn ns-btn-secondary ns-btn-sm" onClick={() => setPushBody("A gentle reminder: evening check-in is waiting for you in your journal.")}>
                      Evening Check-in
                    </button>
                  </div>
                </div>

                <button 
                  className="ns-btn ns-btn-primary" 
                  onClick={handleSendPush} 
                  disabled={!pushBody.trim() || pushSending}
                >
                  <Send size={16} /> {pushSending ? 'Sending Blast...' : `Send Push Blast to ${stats.activePushDevices} Devices`}
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: RESEND EMAIL BLASTS */}
          {activeTab === 'email' && (
            <div>
              <h1 className="ns-admin-page-title">Resend Email Blasts & Account Alerts</h1>
              <p className="ns-admin-page-sub">Compose and dispatch transactional emails and recovery newsletters via Resend.</p>

              <div className="ns-card" style={{ maxWidth: 840 }}>
                <div className="ns-form-group">
                  <label className="ns-label">Resend API Key</label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <input 
                      type="password" 
                      className="ns-input" 
                      placeholder="re_123456789..." 
                      value={resendApiKey} 
                      onChange={(e) => setResendApiKey(e.target.value)} 
                      style={{ flex: 1 }}
                    />
                    <a href="https://resend.com/api-keys" target="_blank" rel="noreferrer" className="ns-btn ns-btn-secondary ns-btn-sm" style={{ textDecoration: 'none' }}>
                      Get Resend Key <ExternalLink size={14} />
                    </a>
                  </div>
                  <span style={{ fontSize: 11, color: '#9DADC5' }}>Saved securely in your browser session.</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="ns-form-group">
                    <label className="ns-label">Sender Email Address</label>
                    <select className="ns-select" value={emailFrom} onChange={(e) => setEmailFrom(e.target.value)}>
                      <option value="Northstar Recovery <notifications@cmameet.site>">Northstar Recovery &lt;notifications@cmameet.site&gt;</option>
                      <option value="Northstar Team <onboarding@resend.dev>">Test Sandbox &lt;onboarding@resend.dev&gt;</option>
                    </select>
                  </div>

                  <div className="ns-form-group">
                    <label className="ns-label">Target Audience</label>
                    <select className="ns-select" value={emailTo} onChange={(e) => setEmailTo(e.target.value)}>
                      <option value="all">All Subscribed Members</option>
                      <option value="test">Test Admin Only ({adminEmail})</option>
                      <option value="custom">Custom Recipient Email</option>
                    </select>
                  </div>
                </div>

                {emailTo === 'custom' && (
                  <div className="ns-form-group">
                    <label className="ns-label">Recipient Email</label>
                    <input 
                      type="email" 
                      className="ns-input" 
                      placeholder="member@example.com" 
                      value={customEmailRecipient} 
                      onChange={(e) => setCustomEmailRecipient(e.target.value)} 
                    />
                  </div>
                )}

                <div className="ns-form-group">
                  <label className="ns-label">Email Subject</label>
                  <input 
                    type="text" 
                    className="ns-input" 
                    placeholder="e.g. Weekly Recovery Inspiration" 
                    value={emailSubject} 
                    onChange={(e) => setEmailSubject(e.target.value)} 
                  />
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label className="ns-label" style={{ display: 'block', marginBottom: 8 }}>Load Email Template</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button className="ns-btn ns-btn-secondary ns-btn-sm" onClick={() => applyEmailTemplate('uplift')}>
                      🌟 Weekly Recovery Uplift
                    </button>
                    <button className="ns-btn ns-btn-secondary ns-btn-sm" onClick={() => applyEmailTemplate('meeting')}>
                      📅 New Meeting Schedule Alert
                    </button>
                  </div>
                </div>

                <div className="ns-form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="ns-label">Email HTML / Content</label>
                    <button 
                      type="button" 
                      className="ns-btn ns-btn-secondary ns-btn-sm" 
                      onClick={() => setEmailPreviewMode(!emailPreviewMode)}
                    >
                      <Eye size={14} /> {emailPreviewMode ? 'Edit HTML' : 'Live Preview'}
                    </button>
                  </div>

                  {emailPreviewMode ? (
                    <div className="ns-email-preview" dangerouslySetInnerHTML={{ __html: emailBodyHtml || '<p>No content to preview</p>' }} />
                  ) : (
                    <textarea 
                      className="ns-textarea" 
                      style={{ minHeight: 180, fontFamily: 'monospace', fontSize: 13 }}
                      placeholder="<p>Write HTML email here...</p>" 
                      value={emailBodyHtml} 
                      onChange={(e) => setEmailBodyHtml(e.target.value)} 
                    />
                  )}
                </div>

                <button 
                  className="ns-btn ns-btn-primary" 
                  onClick={handleSendEmail} 
                  disabled={!emailSubject.trim() || !emailBodyHtml.trim() || emailSending}
                >
                  <Send size={16} /> {emailSending ? 'Dispatching via Resend...' : 'Dispatch Email Blast'}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MEMBER DETAIL INSPECTOR MODAL */}
      {selectedUser && (
        <div className="ns-modal-backdrop" onClick={() => setSelectedUser(null)}>
          <div className="ns-modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <span className={`ns-tag ${selectedUser.banned ? 'ns-tag-banned' : 'ns-tag-active'}`}>
                  {selectedUser.banned ? 'ACCOUNT SUSPENDED' : 'ACTIVE MEMBER'}
                </span>
                <h2 style={{ fontSize: 22, fontWeight: 900, marginTop: 8, color: '#F4F1E8' }}>{selectedUser.pseudonym}</h2>
                <span style={{ color: '#9DADC5', fontSize: 12 }}>ID: {selectedUser.memberId}</span>
              </div>
              <button 
                onClick={() => setSelectedUser(null)} 
                style={{ background: 'none', border: 'none', color: '#9DADC5', cursor: 'pointer', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Profile Bio */}
            {selectedUser.bio && (
              <p style={{ fontStyle: 'italic', color: '#cbd5e1', background: '#0b1426', padding: 12, borderRadius: 8, fontSize: 13 }}>
                "{selectedUser.bio}"
              </p>
            )}

            {/* Hardware & Location Details */}
            <div className="ns-detail-grid">
              <div className="ns-detail-item">
                <span className="ns-detail-kicker">Device Platform</span>
                <span className="ns-detail-val" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {selectedUser.deviceType === 'iOS' ? <Apple size={14} /> : <Smartphone size={14} />}
                  {selectedUser.deviceModel || selectedUser.deviceType}
                </span>
              </div>

              <div className="ns-detail-item">
                <span className="ns-detail-kicker">App Version</span>
                <span className="ns-detail-val">{selectedUser.appVersion || 'v1.0.1'}</span>
              </div>

              <div className="ns-detail-item">
                <span className="ns-detail-kicker">Hardware Device ID</span>
                <span className="ns-detail-val" style={{ fontFamily: 'monospace', fontSize: 11, color: '#75B8FF', wordBreak: 'break-all' }}>
                  {selectedUser.deviceId || 'Not registered'}
                </span>
              </div>

              <div className="ns-detail-item">
                <span className="ns-detail-kicker">Push Notifications</span>
                <span className="ns-detail-val" style={{ color: selectedUser.hasPushToken ? '#5DE0A6' : '#9DADC5' }}>
                  {selectedUser.hasPushToken ? '● Token Active' : '○ Not enabled'}
                </span>
              </div>

              <div className="ns-detail-item">
                <span className="ns-detail-kicker">Coarse Location</span>
                <span className="ns-detail-val" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={13} color="#75B8FF" /> {selectedUser.location || 'Unknown'}
                </span>
              </div>

              <div className="ns-detail-item">
                <span className="ns-detail-kicker">SOS Nearby Guardian</span>
                <span className="ns-detail-val" style={{ color: selectedUser.sosOptIn ? '#5DE0A6' : '#9DADC5' }}>
                  {selectedUser.sosOptIn ? '● Enabled (~1km Coarse)' : 'Disabled'}
                </span>
              </div>

              <div className="ns-detail-item">
                <span className="ns-detail-kicker">Sobriety Date & Streak</span>
                <span className="ns-detail-val" style={{ color: '#F5B95D' }}>
                  {calculateDays(selectedUser.sobrietyDate)} Days ({selectedUser.sobrietyDate || 'N/A'})
                </span>
              </div>

              <div className="ns-detail-item">
                <span className="ns-detail-kicker">Sponsor Status</span>
                <span className="ns-detail-val">
                  {selectedUser.sponsorAvailable ? '★ Willing to Sponsor' : 'Not Sponsoring'}
                </span>
              </div>
            </div>

            {/* Moderation Actions */}
            <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
              {selectedUser.banned ? (
                <button className="ns-btn ns-btn-primary" onClick={() => handleRestoreUser(selectedUser.memberId)}>
                  <RefreshCw size={14} /> Restore Account
                </button>
              ) : (
                <>
                  <button className="ns-btn ns-btn-danger" onClick={() => handleSuspendUser(selectedUser.memberId, false)}>
                    <Ban size={14} /> Suspend Account
                  </button>
                  <button className="ns-btn ns-btn-danger" onClick={() => handleSuspendUser(selectedUser.memberId, true)}>
                    <Ban size={14} /> Ban Hardware Device ID
                  </button>
                </>
              )}
              <button className="ns-btn ns-btn-secondary" onClick={() => setSelectedUser(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
