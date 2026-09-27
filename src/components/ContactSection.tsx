import React, { useState } from 'react';
import { 
  Building2, Factory, Phone, Mail, Clock, 
  Send, CheckCircle, AlertCircle, ArrowUpRight 
} from 'lucide-react';
import { Language, ContactInfo } from '../types';

interface ContactSectionProps {
  lang: Language;
  kicker: string;
  title: string;
  subtitle: string;
  formTitle: string;
  formDesc: string;
  nameLabel: string;
  phoneLabel: string;
  emailLabel: string;
  subjectLabel: string;
  subjectOptions: string[];
  messageLabel: string;
  submitBtn: string;
  sendingText: string;
  successMsg: string;
  info: ContactInfo;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  lang,
  kicker,
  title,
  subtitle,
  formTitle,
  formDesc,
  nameLabel,
  phoneLabel,
  emailLabel,
  subjectLabel,
  subjectOptions,
  messageLabel,
  submitBtn,
  sendingText,
  successMsg,
  info,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: subjectOptions[0] || '',
    message: '',
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.message.trim()) {
      setStatus('error');
      setErrorMessage(
        lang === 'fa' 
          ? 'لطفاً نام، شماره تماس و متن پیام را تکمیل فرمایید.'
          : 'Please provide your name, phone number, and message.'
      );
      return;
    }

    setStatus('submitting');
    // Simulate real submission
    setTimeout(() => {
      setStatus('success');
      setFormData({
        name: '',
        phone: '',
        email: '',
        subject: subjectOptions[0] || '',
        message: '',
      });
    }, 800);
  };

  return (
    <section id="contact" className="py-20 lg:py-28 bg-slate-900/60 relative border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-wider mb-2">
            <span>{kicker}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
            {title}
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Direct Contact Info & Locations (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Headquarters Card */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-md">
              <div className="flex items-center gap-3 text-amber-400 font-bold text-sm mb-3">
                <Building2 className="w-4 h-4" />
                <span>{info.centralOffice.title}</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-2">
                {info.centralOffice.address}
              </p>
              <div className="text-xs text-slate-400 font-medium">
                {info.centralOffice.city}
              </div>
            </div>

            {/* Industrial Plant Card */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-md">
              <div className="flex items-center gap-3 text-amber-400 font-bold text-sm mb-3">
                <Factory className="w-4 h-4" />
                <span>{info.factory.title}</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-2">
                {info.factory.address}
              </p>
              <div className="text-xs text-slate-400 font-medium">
                {info.factory.city}
              </div>
            </div>

            {/* Phone & Direct Communications */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-md space-y-4">
              
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
                  <Phone className="w-3.5 h-3.5 text-amber-500" />
                  <span>{lang === 'fa' ? 'تلفن‌های تماس مستقیم' : 'Direct Phone Numbers'}</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {info.phoneNumbers.map((phone, pIdx) => (
                    <a
                      key={pIdx}
                      href={`tel:${phone.replace(/[^0-9+]/g, '')}`}
                      className="text-xs sm:text-sm font-mono font-bold text-white hover:text-amber-400 transition-colors bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800"
                    >
                      {phone}
                    </a>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-500" />
                  <span>{lang === 'fa' ? 'پست الکترونیکی رسمی' : 'Official Corporate Email'}</span>
                </div>
                <a
                  href={`mailto:${info.email}`}
                  className="text-xs sm:text-sm font-mono text-amber-400 hover:underline block"
                >
                  {info.email}
                </a>
              </div>

              <div className="pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>{lang === 'fa' ? 'ساعات کاری رسمی' : 'Operating Hours'}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {info.workingHours}
                </p>
              </div>

            </div>

          </div>

          {/* Right Column: Inquiry & Partnership Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-xl">
              
              <div className="mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
                  {formTitle}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400">
                  {formDesc}
                </p>
              </div>

              {status === 'success' ? (
                <div className="p-6 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-3">
                  <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
                  <p className="text-sm font-medium text-emerald-200">
                    {successMsg}
                  </p>
                  <button
                    type="button"
                    onClick={() => setStatus('idle')}
                    className="mt-2 px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
                  >
                    {lang === 'fa' ? 'ارسال پیام جدید' : 'Send Another Message'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {status === 'error' && (
                    <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 flex items-center gap-2 text-xs text-rose-300">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        {nameLabel} *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        {phoneLabel} *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        {emailLabel}
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        {subjectLabel}
                      </label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                      >
                        {subjectOptions.map((opt, oIdx) => (
                          <option key={oIdx} value={opt} className="bg-slate-900 text-white">
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {messageLabel} *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 text-xs sm:text-sm font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 disabled:opacity-50 rounded-lg shadow-md transition-all duration-200"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{status === 'submitting' ? sendingText : submitBtn}</span>
                  </button>
                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
