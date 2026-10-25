import React, { useState, useEffect } from 'react';
import { Language } from './types';
import { content } from './data/content';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { FactoryGallery } from './components/FactoryGallery';
import { AboutIntro } from './components/AboutIntro';
import { ValueChain } from './components/ValueChain';
import { ProductShowcase } from './components/ProductShowcase';
import { BrandsSection } from './components/BrandsSection';
import { CoreValues } from './components/CoreValues';
import { FinalCTA } from './components/FinalCTA';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';

export default function App() {
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

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    document.title = t.meta.title;

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
    const currentHash = window.location.hash.replace(/#?(lang=(fa|en)|fa|en)/g, '').replace(/^#/, '');
    const newHash = currentHash ? `#${newLang}&${currentHash}` : `#${newLang}`;
    window.history.replaceState(null, '', newHash);
  };

  return (
    <div className={`min-h-screen bg-white text-slate-800 flex flex-col font-sans ${lang === 'fa' ? 'rtl' : 'ltr'}`}>
      
      {/* 3-Zone Sticky Navigation with Official AKK Logo */}
      <Navbar
        lang={lang}
        onLanguageChange={handleLanguageChange}
        brandMark={t.brandMark}
        logoSrc={t.logoSrc}
        navItems={t.nav}
        ctaText={lang === 'fa' ? 'ارتباط با ما' : 'Contact Us'}
      />

      {/* Main Page Flow */}
      <main className="flex-1">
        
        {/* 1. Hero Section with Real Factory Production Hall View */}
        <Hero
          lang={lang}
          tag={t.hero.tag}
          title={t.hero.title}
          subtitle={t.hero.subtitle}
          description={t.hero.description}
          ctaPrimary={t.hero.ctaPrimary}
          ctaSecondary={t.hero.ctaSecondary}
          ctaContact={t.hero.ctaContact}
          stats={t.hero.stats}
          heroImage={t.hero.heroImage}
          factoryBanner={t.hero.factoryBanner}
        />

        {/* 2. Interactive Factory Tour & Photos (Official Site Photography) */}
        <FactoryGallery
          lang={lang}
          kicker={t.gallery.kicker}
          title={t.gallery.title}
          subtitle={t.gallery.subtitle}
          items={t.gallery.items}
        />

        {/* 3. About & 1364 Timeline */}
        <AboutIntro
          lang={lang}
          kicker={t.about.kicker}
          title={t.about.title}
          yearBadge={t.about.yearBadge}
          yearLabel={t.about.yearLabel}
          paragraphs={t.about.paragraphs}
          milestones={t.about.milestones}
        />

        {/* 4. Integrated Value Chain: 9 Steps, 4 Operating Sites & Activity Domains */}
        <ValueChain
          lang={lang}
          kicker={t.valueChain.kicker}
          title={t.valueChain.title}
          subtitle={t.valueChain.subtitle}
          steps={t.valueChain.steps}
          sites={t.valueChain.sites}
        />

        {/* 5. Featured Products Showcase (Official Pars, 206, Saina Bumpers & Grilles) */}
        <ProductShowcase
          lang={lang}
          kicker={t.products.kicker}
          title={t.products.title}
          subtitle={t.products.subtitle}
          items={t.products.items}
        />

        {/* 6. Brand Portfolio (Arian Khodro & MIBA) */}
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

        {/* 8. Final Call to Action */}
        <FinalCTA
          lang={lang}
          title={t.finalCta.title}
          subtitle={t.finalCta.subtitle}
          buttonText={t.finalCta.buttonText}
          contactQuick={t.finalCta.contactQuick}
        />

        {/* 9. Contact & Corporate Form */}
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

      {/* Corporate Footer */}
      <Footer
        lang={lang}
        companyName={t.footer.companyName}
        tagline={t.footer.tagline}
        copyright={t.footer.copyright}
        websiteNote={t.footer.websiteNote}
        logoSrc={t.logoSrc}
        navItems={t.nav}
      />

    </div>
  );
}
