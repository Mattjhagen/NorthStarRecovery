import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Compass, ExternalLink, Shield, Sparkles } from 'lucide-react';
import './PublicSite.css';

const CMA_DIRECTORY = 'https://www.crystalmeth.org/cma-meeting-directory/';

function AppLink({ className = 'ns-button ns-button-primary', children }) {
  return <a className={className} href="northstar-recovery://" aria-label="Open Northstar Recovery app">{children}<ArrowUpRight size={17} aria-hidden="true" /></a>;
}

function Wordmark() {
  return <Link className="ns-wordmark" to="/" aria-label="Northstar CMA Meet home"><span className="ns-mark" aria-hidden="true"><span /><i /></span><span>northstar <b>/ CMA MEET</b></span></Link>;
}

export default function PublicSite() {
  return <main className="ns-site">
    <div className="ns-sky" aria-hidden="true"><span className="ns-star ns-star-a" /><span className="ns-star ns-star-b" /><span className="ns-star ns-star-c" /><span className="ns-grid" /></div>
    <header className="ns-header">
      <Wordmark />
      <nav aria-label="Main navigation"><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link><AppLink className="ns-open-app">Open the app <ArrowUpRight size={15} aria-hidden="true" /></AppLink></nav>
    </header>

    <section className="ns-hero" aria-labelledby="hero-title">
      <div className="ns-eyebrow"><span /> A quiet place to begin</div>
      <div className="ns-hero-copy">
        <h1 id="hero-title">Find your way<br />to a <em>meeting.</em><span className="ns-compass-star" aria-hidden="true">✦</span></h1>
        <p>Northstar helps you find Crystal Meth Anonymous meeting listings and stay close to the recovery resources that matter.</p>
      </div>
      <div className="ns-actions"><AppLink>Open Northstar iOS</AppLink><a className="ns-button ns-button-quiet" href="https://github.com/Mattjhagen/NorthStarRecovery/releases/download/v1-APK/NorthStarRecoveryAPK.apk" target="_blank" rel="noreferrer">Download Android APK <ExternalLink size={16} aria-hidden="true" /></a><a className="ns-button ns-button-quiet" href={CMA_DIRECTORY} target="_blank" rel="noreferrer">Official CMA directory <ExternalLink size={16} aria-hidden="true" /></a></div>
      <p className="ns-fine-print">Meeting listings are sourced from the official CMA directory.</p>
      <div className="ns-aurora" aria-hidden="true"><div className="ns-ribbon ns-ribbon-one" /><div className="ns-ribbon ns-ribbon-two" /><div className="ns-ribbon ns-ribbon-three" /><div className="ns-northstar">✦</div></div>
    </section>

    <section className="ns-ways" aria-label="What Northstar is building">
      <article><span className="ns-number">01</span><Compass aria-hidden="true" /><h2>Official meeting directory</h2><p>Find listings from the official Crystal Meth Anonymous directory, with links back to the source.</p></article>
      <article><span className="ns-number">02</span><Shield aria-hidden="true" /><h2>Private connection</h2><p>Thoughtful member connection features are <strong>in development</strong>. This site does not ask you to create an account.</p></article>
      <article><span className="ns-number">03</span><Sparkles aria-hidden="true" /><h2>Meeting resources</h2><p>Meeting tools and recovery resources are <strong>in development</strong>, designed to support—not replace—human connection.</p></article>
    </section>

    <section className="ns-boundaries" aria-labelledby="boundaries-title">
      <div><p className="ns-kicker">A clear boundary</p><h2 id="boundaries-title">Your next right direction<br />can stay <em>your own.</em></h2></div>
      <div className="ns-boundary-copy"><p>Northstar is designed to be anonymous-friendly. Links to meetings take you to official CMA listings or the meeting provider chosen by that group.</p><p>Northstar / CMA Meet is an independent project and is not affiliated with, endorsed by, or sponsored by Crystal Meth Anonymous.</p><aside><strong>If you are in immediate danger or considering harming yourself:</strong> call or text <a href="tel:988">988</a> in the U.S., call <a href="tel:911">911</a>, or use local emergency services where you are.</aside></div>
    </section>

    <footer className="ns-footer"><Wordmark /><div><a href="mailto:support@cmameet.site">support@cmameet.site</a><span aria-hidden="true">·</span><Link to="/privacy">Privacy</Link><span aria-hidden="true">·</span><Link to="/terms">Terms</Link><span aria-hidden="true">·</span><a href={CMA_DIRECTORY} target="_blank" rel="noreferrer">Official CMA <ExternalLink size={13} aria-hidden="true" /></a></div><p>© 2026 Northstar. Support address shown for future support requests.</p></footer>
  </main>;
}
