import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { Language } from '../types';

interface ScrollToTopProps {
  lang: Language;
}

export const ScrollToTop: React.FC<ScrollToTopProps> = ({ lang }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label={lang === 'fa' ? 'بازگشت به بالا' : 'Back to top'}
      tabIndex={visible ? 0 : -1}
      className={`fixed bottom-6 left-6 z-40 w-11 h-11 rounded-full bg-slate-900 text-white shadow-lg shadow-slate-900/20 border border-slate-700/50 flex items-center justify-center transition-all duration-300 hover:bg-blue-600 hover:border-blue-500 hover:shadow-blue-600/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
        visible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-3 pointer-events-none'
      }`}
    >
      <ArrowUp className="w-5 h-5" strokeWidth={2.25} />
    </button>
  );
};
