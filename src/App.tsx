import React, { useState, useEffect } from 'react';
import { Language } from './types';
import { content } from './data/content';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AboutIntro } from './components/AboutIntro';
import { ValueChain } from './components/ValueChain';
import { ActivityDomains } from './components/ActivityDomains';
import { IndustrialCapacities } from './components/IndustrialCapacities';
import { BrandsSection } from './components/BrandsSection';
import { CoreValues } from './components/CoreValues';
import { FinalCTA } from './components/FinalCTA';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';

export default function App() {
  // Initialize language from URL hash or default to 'fa'
  const [lang, setLang] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('lang=en') || hash === '#en') return 'en';
      if (hash.includes('lang=fa') || hash === '#fa') return 'fa';
      const search = window.location.search.toLowerCase();
      if (search.includes('lang=en')) return 'en';
    }
    return 'fa';
  });

  const t = content[lang];

  // Sync HTML attributes & document title whenever language changes
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    document.title = t.meta.title;

    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', t.meta.description);
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', t.meta.title);
    }

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.setAttribute('content', t.meta.description);
    }
  }, [lang, t.meta.title, t.meta.description]);

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    // Update hash without triggering reload
    const currentHash = window.location.hash.replace(/#?(lang=(fa|en)|fa|en)/g, '').replace(/^#/, '');
    const newHash = currentHash ? `#${newLang}&${currentHash}` : `#${newLang}`;
    window.history.replaceState(null, '', newHash);
  };

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans ${lang === 'fa' ? 'rtl' : 'ltr'}`}>
      
      {/* 3-Zone Sticky Navigation Bar */}
      <Navbar
        lang={lang}
        onLanguageChange={handleLanguageChange}
        brandMark={t.brandMark}
        navItems={t.nav}
        ctaText={lang === 'fa' ? 'ارتباط با ما' : 'Contact Us'}
      />

      {/* Main Page Flow */}
      <main className="flex-1">
        
        {/* 1. Hero Section */}
        <Hero
          lang={lang}
          tag={t.hero.tag}
          title={t.hero.title}
          subtitle={t.hero.subtitle}
          description={t.hero.description}
          ctaPrimary={t.hero.ctaPrimary}
          ctaSecondary={t.hero.ctaSecondary}
          stats={t.hero.stats}
        />

        {/* 2. About & History Timeline (1364 Anchor) */}
        <AboutIntro
          lang={lang}
          kicker={t.about.kicker}
          title={t.about.title}
          yearBadge={t.about.yearBadge}
          yearLabel={t.about.yearLabel}
          paragraphs={t.about.paragraphs}
          milestones={t.about.milestones}
        />

        {/* 3. Interactive Value Chain (9 Stages) */}
        <ValueChain
          lang={lang}
          kicker={t.valueChain.kicker}
          title={t.valueChain.title}
          subtitle={t.valueChain.subtitle}
          steps={t.valueChain.steps}
        />

        {/* 4. Activity Domains (8 Visual Cards) */}
        <ActivityDomains
          lang={lang}
          kicker={t.activityDomains.kicker}
          title={t.activityDomains.title}
          subtitle={t.activityDomains.subtitle}
          domains={t.activityDomains.domains}
        />

        {/* 5. Industrial Capacities & 4 Sites */}
        <IndustrialCapacities
          lang={lang}
          kicker={t.capacities.kicker}
          title={t.capacities.title}
          subtitle={t.capacities.subtitle}
          facilities={t.capacities.facilities}
        />

        {/* 6. Core Brands (Arian Khodro & MIBA) */}
        <BrandsSection
          lang={lang}
          kicker={t.brands.kicker}
          title={t.brands.title}
          subtitle={t.brands.subtitle}
          brands={t.brands.brandsList}
        />

        {/* 7. Core Principles & Values */}
        <CoreValues
          lang={lang}
          kicker={t.values.kicker}
          title={t.values.title}
          subtitle={t.values.subtitle}
          values={t.values.list}
        />

        {/* 8. Final Full-Width Industrial CTA */}
        <FinalCTA
          lang={lang}
          title={t.finalCta.title}
          subtitle={t.finalCta.subtitle}
          buttonText={t.finalCta.buttonText}
          contactQuick={t.finalCta.contactQuick}
        />

        {/* 9. Contact & Inquiries */}
        <ContactSection
          lang={lang}
          kicker={t.contact.kicker}
          title={t.contact.title}
          subtitle={t.contact.subtitle}
          formTitle={t.contact.formTitle}
          formDesc={t.contact.formDesc}
          nameLabel={t.contact.nameLabel}
          phoneLabel={t.contact.phoneLabel}
          emailLabel={t.contact.emailLabel}
          subjectLabel={t.contact.subjectLabel}
          subjectOptions={t.contact.subjectOptions}
          messageLabel={t.contact.messageLabel}
          submitBtn={t.contact.submitBtn}
          sendingText={t.contact.sendingText}
          successMsg={t.contact.successMsg}
          info={t.contact.info}
        />

      </main>

      {/* Corporate Quiet Footer */}
      <Footer
        lang={lang}
        companyName={t.footer.companyName}
        tagline={t.footer.tagline}
        copyright={t.footer.copyright}
        websiteNote={t.footer.websiteNote}
        navItems={t.nav}
      />

    </div>
  );
}
