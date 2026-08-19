import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import './PublicSite.css';

const CMA_DIRECTORY = 'https://www.crystalmeth.org/cma-meeting-directory/';
const sections = [
  ['1. Acceptance of Terms and EULA', 'By downloading, accessing, or using Northstar Recovery (the "App") or the website at cmameet.site (the "Site"), you agree to be bound by these Terms of Service and End User License Agreement ("Terms"). If you do not agree to these Terms, do not use the App or Site.'],
  ['2. Non-Clinical Peer Support & Medical Disclaimer', 'Northstar Recovery is an independent, non-clinical companion tool designed for peer connection, personal reflection, and 12-step meeting discovery. Northstar Recovery DOES NOT provide medical advice, diagnosis, psychiatric counseling, or clinical addiction treatment. The App is not an emergency response system. If you or someone you know is experiencing a medical or mental health crisis, immediately call 988 (Suicide & Crisis Lifeline in the US/Canada) or 911, or contact your local emergency services.'],
  ['3. User-Generated Content and Zero Tolerance for Abuse', 'Northstar provides community features including Community Circle posts, comment threads, and direct messages. You agree that you will not post, upload, or transmit any content that is abusive, harassing, threatening, sexually explicit, hateful, defamatory, or promotes illegal substance distribution. Northstar maintains ZERO TOLERANCE for objectionable content and abusive users. Any member can block any user or report objectionable content instantly. Violators will have their posts removed and may be suspended or banned at the account and device level without notice.'],
  ['4. User Accounts and Account Deletion', 'When you create an account, you agree to provide accurate registration information. You are responsible for maintaining the confidentiality of your credentials. You have the unconditional right to delete your account and all associated data at any time directly within the App settings (under You > Delete Account & Data) or by emailing support@cmameet.site.'],
  ['5. Third-Party Services and CMA Independence', 'Northstar Recovery is an independent open project and is not affiliated with, endorsed by, or sponsored by Crystal Meth Anonymous (CMA) World Services. Meeting listings are sourced from public directories. Links to third-party services (such as CMA literature, Jitsi Meet, or external meeting links) are provided for convenience and are subject to their respective terms and policies.'],
  ['6. Device-Level Moderation and Enforcement', 'To maintain a safe recovery environment, Northstar administrators reserve the right to review reported content, remove posts, suspend member privileges, and block repeat offending devices from creating new accounts on the service.'],
  ['7. Limitation of Liability', 'To the maximum extent permitted by applicable law, Northstar Recovery and its developers shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use the service.'],
  ['8. Contact & Changes', 'We may update these Terms periodically. Continued use of the App constitutes acceptance of any revised Terms. For questions or inquiries, contact us at support@cmameet.site.']
];

export default function TermsOfService() {
  return (
    <main className="ns-site ns-policy">
      <header className="ns-header">
        <Link className="ns-back" to="/">
          <ArrowLeft size={17} /> Back to Northstar
        </Link>
        <Link className="ns-wordmark" to="/">
          <span className="ns-mark" aria-hidden="true">
            <span />
            <i />
          </span>
          <span>northstar <b>/ CMA MEET</b></span>
        </Link>
      </header>
      <article className="ns-policy-sheet">
        <p className="ns-kicker">Terms of Service & EULA</p>
        <h1>Respect the circle.<br /><em>Protect the space.</em></h1>
        <div className="ns-dates">
          <span>Effective date: August 19, 2026</span>
          <span>Last updated: August 19, 2026</span>
        </div>
        <p className="ns-policy-intro">
          Northstar Recovery is a community built on mutual respect, privacy, and steady steps forward. These terms govern your use of the application and community circles.
        </p>
        {sections.map(([heading, text]) => (
          <section key={heading}>
            <h2>{heading}</h2>
            <p>{text}</p>
          </section>
        ))}
        <p className="ns-policy-links">
          <Link to="/">Return home</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <a href={CMA_DIRECTORY} target="_blank" rel="noreferrer">
            Official CMA directory <ExternalLink size={14} />
          </a>
        </p>
      </article>
    </main>
  );
}
