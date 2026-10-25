import React, { useEffect, useId, useState } from 'react';
import { 
  Building2, Factory, Phone, Mail, Clock, Send, AlertCircle,
  Copy, Check, Navigation, Package, Truck, Handshake, MessageSquare, Boxes,
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

const SUBJECT_ICONS = [Package, Boxes, Truck, Handshake, MessageSquare];
const MESSAGE_MAX = 600;

// Office hours in Tehran time (minutes from midnight); keys are Intl short weekday names. Friday is closed.
const OFFICE_HOURS: Record<string, [number, number]> = {
  Sat: [450, 990],
  Sun: [450, 990],
  Mon: [450, 990],
  Tue: [450, 990],
  Wed: [450, 990],
  Thu: [450, 750],
};

// Map coordinates (viewBox 100 × 60) for the two sites.
const SITES = {
  office: { x: 28, y: 22 },
  factory: { x: 74, y: 44 },
};
const ROUTE = `M ${SITES.office.x} ${SITES.office.y} C 44 12, 50 52, 62 46 S ${SITES.factory.x - 4} ${SITES.factory.y}, ${SITES.factory.x} ${SITES.factory.y}`;

const toLatinDigits = (s: string) =>
  s.replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0)).replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));
const telHref = (phone: string) => `tel:${toLatinDigits(phone).replace(/[^0-9+]/g, '')}`;
const mapsHref = (address: string, city: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${address}, ${city}`)}`;

function getOfficeOpen(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Tehran',
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  const hours = OFFICE_HOURS[get('weekday')];
  const minutes = Number(get('hour')) * 60 + Number(get('minute'));
  return !!hours && minutes >= hours[0] && minutes < hours[1];
}

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (value: string) => {
    navigator.clipboard?.writeText(value).then(() => {
      setCopied(value);
      window.setTimeout(() => setCopied((c) => (c === value ? null : c)), 1600);
    });
  };
  return { copied, copy };
}

const CopyButton: React.FC<{ copied: boolean; onCopy: () => void; label: string }> = ({ copied, onCopy, label }) => (
  <button
    type="button"
    onClick={onCopy}
    aria-label={label}
    title={label}
    className={`p-1.5 rounded-md transition-colors ${copied ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 hover:text-blue-700 hover:bg-blue-50'}`}
  >
    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
  </button>
);

const FloatingField: React.FC<{
  label: string;
  required?: boolean;
  multiline?: boolean;
  type?: string;
  value: string;
  maxLength?: number;
  dir?: 'ltr' | 'rtl';
  onChange: (value: string) => void;
}> = ({ label, required, multiline, type = 'text', value, maxLength, dir, onChange }) => {
  const id = useId();
  const fieldClass =
    'peer w-full px-3.5 pt-6 pb-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none transition-all focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 hover:border-slate-300';
  return (
    <div className="relative">
      {multiline ? (
        <textarea
          id={id}
          required={required}
          rows={4}
          placeholder=" "
          maxLength={maxLength}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${fieldClass} resize-none`}
        />
      ) : (
        <input
          id={id}
          type={type}
          required={required}
          placeholder=" "
          dir={dir}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${fieldClass} ${dir === 'ltr' ? 'text-start' : ''}`}
        />
      )}
      <label
        htmlFor={id}
        className="absolute start-3.5 top-2 text-[10px] font-bold text-slate-500 pointer-events-none transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:font-medium peer-placeholder-shown:text-slate-400 peer-focus:top-2 peer-focus:text-[10px] peer-focus:font-bold peer-focus:text-blue-700"
      >
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </label>
      {multiline && maxLength && (
        <span className="absolute bottom-2 end-3 text-[10px] font-mono text-slate-400 tabular-nums">
          {value.length}/{maxLength}
        </span>
      )}
    </div>
  );
};

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
  const isFa = lang === 'fa';
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: subjectOptions[0] || '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [ticket, setTicket] = useState<{ ref: string; subject: string; name: string } | null>(null);
  const [activeSite, setActiveSite] = useState<'office' | 'factory'>('office');
  const [isOpen, setIsOpen] = useState(() => getOfficeOpen());
  const [animateRoute] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const { copied, copy } = useCopy();

  useEffect(() => {
    const id = window.setInterval(() => setIsOpen(getOfficeOpen()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  // Keep the selected subject valid when the language (and so the option list) changes.
  useEffect(() => {
    setFormData((f) => (subjectOptions.includes(f.subject) ? f : { ...f, subject: subjectOptions[0] || '' }));
  }, [subjectOptions]);

  const update = (key: keyof typeof formData) => (value: string) => setFormData((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.message.trim()) {
      setStatus('error');
      setErrorMessage(
        isFa
          ? 'لطفاً نام، شماره تماس و متن پیام را تکمیل فرمایید.'
          : 'Please provide your name, phone number, and message.'
      );
      return;
    }

    setStatus('submitting');
    setTimeout(() => {
      setTicket({
        ref: `AKK-${Date.now().toString(36).slice(-6).toUpperCase()}`,
        subject: formData.subject,
        name: formData.name.trim(),
      });
      setStatus('success');
      setFormData({ name: '', phone: '', email: '', subject: subjectOptions[0] || '', message: '' });
    }, 900);
  };

  const site = activeSite === 'office' ? info.centralOffice : info.factory;
  const siteMeta = [
    { key: 'office' as const, data: info.centralOffice, Icon: Building2, ...SITES.office },
    { key: 'factory' as const, data: info.factory, Icon: Factory, ...SITES.factory },
  ];

  return (
    <section id="contact" className="py-20 lg:py-28 bg-white relative border-b border-slate-200 overflow-hidden">
      <div aria-hidden="true" className="absolute -top-40 end-0 w-[520px] h-[520px] rounded-full bg-blue-100/50 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">
              <span>{kicker}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
              {title}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* Live office status */}
          <div
            className={`inline-flex items-center gap-2.5 self-start md:self-end px-3.5 py-2 rounded-full border text-xs font-bold ${
              isOpen ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}
          >
            <span className="relative flex w-2.5 h-2.5">
              {isOpen && <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping motion-reduce:animate-none" />}
              <span className={`relative w-2.5 h-2.5 rounded-full ${isOpen ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            </span>
            {isOpen
              ? isFa ? 'هم‌اکنون پاسخگو هستیم' : 'Open now — we’re answering'
              : isFa ? 'خارج از ساعت کاری — پیام بگذارید' : 'Closed now — leave us a message'}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: dispatch map + channels */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Route map */}
            <div className="rounded-3xl bg-slate-950 text-white overflow-hidden shadow-xl shadow-slate-900/10">
              <div className="relative aspect-[5/3]">
                <svg aria-hidden="true" viewBox="0 0 100 60" className="absolute inset-0 w-full h-full">
                  <defs>
                    <pattern id="contact-grid" width="5" height="5" patternUnits="userSpaceOnUse">
                      <path d="M 5 0 L 0 0 0 5" fill="none" stroke="rgb(59 130 246 / 0.12)" strokeWidth="0.2" />
                    </pattern>
                  </defs>
                  <rect width="100" height="60" fill="url(#contact-grid)" />
                  {/* Abstract city blocks and arterial roads */}
                  <g fill="rgb(148 163 184 / 0.08)">
                    <rect x="12" y="10" width="14" height="8" rx="1" />
                    <rect x="30" y="28" width="10" height="12" rx="1" />
                    <rect x="16" y="34" width="10" height="10" rx="1" />
                    <rect x="64" y="30" width="18" height="10" rx="1" />
                    <rect x="80" y="44" width="12" height="9" rx="1" />
                    <rect x="62" y="48" width="8" height="7" rx="1" />
                  </g>
                  <g stroke="rgb(148 163 184 / 0.18)" strokeWidth="0.8" fill="none" strokeLinecap="round">
                    <path d="M 0 25 Q 40 20 100 34" />
                    <path d="M 20 0 Q 30 30 24 60" />
                    <path d="M 55 0 Q 60 30 78 60" />
                  </g>
                  {/* Route */}
                  <path id="contact-route" d={ROUTE} fill="none" stroke="rgb(59 130 246 / 0.25)" strokeWidth="2.4" strokeLinecap="round" />
                  <path d={ROUTE} fill="none" stroke="#60a5fa" strokeWidth="0.7" strokeDasharray="2 1.6" strokeLinecap="round">
                    {animateRoute && <animate attributeName="stroke-dashoffset" from="0" to="-7.2" dur="1s" repeatCount="indefinite" />}
                  </path>
                  {animateRoute && (
                    <g>
                      <circle r="1.6" fill="#fbbf24" />
                      <circle r="3" fill="#fbbf24" opacity="0.25" />
                      <animateMotion dur="7s" repeatCount="indefinite" rotate="auto" keyPoints="0;1;0" keyTimes="0;0.5;1" calcMode="linear">
                        <mpath href="#contact-route" />
                      </animateMotion>
                    </g>
                  )}
                </svg>

                {/* Site pins */}
                {siteMeta.map(({ key, data, Icon, x, y }) => {
                  const isActive = activeSite === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setActiveSite(key)}
                      aria-pressed={isActive}
                      className="group absolute -translate-x-1/2 -translate-y-full flex flex-col items-center focus:outline-none"
                      style={{ left: `${x}%`, top: `${(y / 60) * 100}%` }}
                    >
                      <span
                        className={`mb-1 whitespace-nowrap px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                          isActive ? 'bg-white text-slate-900 shadow-lg' : 'bg-slate-800/80 text-slate-300 group-hover:bg-slate-700'
                        }`}
                      >
                        {data.title}
                      </span>
                      <span
                        className={`relative w-9 h-9 rounded-full rounded-br-none rotate-45 flex items-center justify-center border-2 transition-all duration-300 group-focus-visible:ring-2 group-focus-visible:ring-white ${
                          isActive
                            ? 'bg-blue-500 border-white scale-110 shadow-[0_0_24px_rgba(59,130,246,0.8)]'
                            : 'bg-slate-800 border-slate-600 group-hover:border-slate-400'
                        }`}
                      >
                        <Icon className="w-4 h-4 -rotate-45" />
                      </span>
                    </button>
                  );
                })}

                <div className="absolute bottom-2.5 start-3 text-[10px] font-mono text-slate-500 tracking-wider">
                  KERMAN · IRAN
                </div>
              </div>

              {/* Selected site */}
              <div key={activeSite} className="p-4 sm:p-5 border-t border-white/10 flex items-start justify-between gap-3 animate-[vc-in_350ms_ease-out] motion-reduce:animate-none">
                <div className="min-w-0">
                  <div className="text-xs font-bold text-blue-300 mb-1">{site.title}</div>
                  <p className="text-sm text-slate-200 leading-relaxed">{site.address}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{site.city}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => copy(`${site.address}, ${site.city}`)}
                    aria-label={isFa ? 'کپی نشانی' : 'Copy address'}
                    title={isFa ? 'کپی نشانی' : 'Copy address'}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
                  >
                    {copied === `${site.address}, ${site.city}` ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <a
                    href={mapsHref(site.address, site.city)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    {isFa ? 'مسیریابی' : 'Directions'}
                  </a>
                </div>
              </div>
            </div>

            {/* Direct channels */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {info.phoneNumbers.map((phone) => (
                <div key={phone} className="group flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-white transition-all">
                  <a href={telHref(phone)} className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 group-hover:rotate-12 transition-transform">
                      <Phone className="w-4 h-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[10px] font-bold text-slate-500">{isFa ? 'تماس مستقیم' : 'Call directly'}</span>
                      <span dir="ltr" className="block text-sm font-mono font-bold text-slate-900 truncate">{phone}</span>
                    </span>
                  </a>
                  <CopyButton
                    copied={copied === phone}
                    onCopy={() => copy(phone)}
                    label={isFa ? 'کپی شماره' : 'Copy number'}
                  />
                </div>
              ))}

              <div className="sm:col-span-2 group flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-white transition-all">
                <a href={`mailto:${info.email}`} className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 group-hover:-rotate-12 transition-transform">
                    <Mail className="w-4 h-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[10px] font-bold text-slate-500">{isFa ? 'پست الکترونیکی رسمی' : 'Official corporate email'}</span>
                    <span dir="ltr" className="block text-sm font-mono font-bold text-blue-700 truncate text-start">{info.email}</span>
                  </span>
                </a>
                <CopyButton
                  copied={copied === info.email}
                  onCopy={() => copy(info.email)}
                  label={isFa ? 'کپی ایمیل' : 'Copy email'}
                />
              </div>

              <div className="sm:col-span-2 flex items-start gap-3 px-3 py-2.5 rounded-2xl border border-dashed border-slate-200">
                <Clock className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{info.workingHours}</p>
              </div>
            </div>
          </div>

          {/* Right: work-order form */}
          <div className="lg:col-span-7">
            <div className="relative rounded-3xl bg-white border border-slate-200 shadow-[0_30px_60px_-30px_rgba(30,64,175,0.25)] overflow-hidden">
              {/* Ticket header */}
              <div className="flex items-center justify-between gap-4 px-6 sm:px-8 py-4 bg-slate-50 border-b border-dashed border-slate-300">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900">{formTitle}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{formDesc}</p>
                </div>
                <div className="hidden sm:flex flex-col items-end shrink-0 text-[10px] font-mono text-slate-400" dir="ltr">
                  <span className="font-bold text-slate-500">WORK ORDER</span>
                  <span>{new Date().toISOString().slice(0, 10)}</span>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                {status === 'success' && ticket ? (
                  <div className="relative py-6 text-center animate-[vc-in_450ms_ease-out] motion-reduce:animate-none">
                    <div className="mx-auto w-fit -rotate-6 px-5 py-2 rounded-lg border-[3px] border-emerald-600 text-emerald-700 font-black text-xl tracking-widest uppercase animate-[stamp_500ms_cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:animate-none">
                      {isFa ? 'ثبت شد' : 'Received'}
                    </div>
                    <p className="mt-6 text-sm font-bold text-slate-900 max-w-md mx-auto">{successMsg}</p>
                    <dl className="mt-6 mx-auto max-w-sm grid grid-cols-2 gap-px rounded-xl overflow-hidden border border-slate-200 bg-slate-200 text-start">
                      <div className="bg-white p-3">
                        <dt className="text-[10px] font-bold text-slate-400">{isFa ? 'کد پیگیری' : 'Reference'}</dt>
                        <dd dir="ltr" className="text-sm font-mono font-bold text-blue-700 text-start">{ticket.ref}</dd>
                      </div>
                      <div className="bg-white p-3">
                        <dt className="text-[10px] font-bold text-slate-400">{subjectLabel}</dt>
                        <dd className="text-xs font-bold text-slate-800 truncate">{ticket.subject}</dd>
                      </div>
                    </dl>
                    <button
                      type="button"
                      onClick={() => setStatus('idle')}
                      className="mt-6 px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      {isFa ? 'ارسال پیام جدید' : 'Send Another Message'}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate className="space-y-5">
                    {status === 'error' && (
                      <div role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-800 font-medium animate-[vc-in_300ms_ease-out]">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    {/* Subject as selectable chips */}
                    <fieldset>
                      <legend className="text-xs font-bold text-slate-700 mb-2.5">{subjectLabel}</legend>
                      <div className="flex flex-wrap gap-2">
                        {subjectOptions.map((opt, idx) => {
                          const Icon = SUBJECT_ICONS[idx % SUBJECT_ICONS.length];
                          const checked = formData.subject === opt;
                          return (
                            <label
                              key={opt}
                              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold cursor-pointer transition-all has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-blue-600 ${
                                checked
                                  ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/25'
                                  : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-700'
                              }`}
                            >
                              <input
                                type="radio"
                                name="subject"
                                value={opt}
                                checked={checked}
                                onChange={() => update('subject')(opt)}
                                className="sr-only"
                              />
                              <Icon className="w-3.5 h-3.5" />
                              {opt}
                            </label>
                          );
                        })}
                      </div>
                    </fieldset>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FloatingField label={nameLabel} required value={formData.name} onChange={update('name')} />
                      <FloatingField label={phoneLabel} required type="tel" dir="ltr" value={formData.phone} onChange={update('phone')} />
                    </div>
                    <FloatingField label={emailLabel} type="email" dir="ltr" value={formData.email} onChange={update('email')} />
                    <FloatingField
                      label={messageLabel}
                      required
                      multiline
                      maxLength={MESSAGE_MAX}
                      value={formData.message}
                      onChange={update('message')}
                    />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                      <p className="text-[11px] text-slate-400">
                        <span className="text-rose-500">*</span> {isFa ? 'فیلدهای الزامی' : 'Required fields'}
                      </p>
                      <button
                        type="submit"
                        disabled={status === 'submitting'}
                        className="group relative overflow-hidden inline-flex items-center justify-center gap-2 px-7 py-3 text-sm font-bold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-80 rounded-xl shadow-lg shadow-blue-700/25 transition-all"
                      >
                        <span>{status === 'submitting' ? sendingText : submitBtn}</span>
                        <Send
                          className={`w-4 h-4 transition-transform duration-700 rtl:-scale-x-100 ${
                            status === 'submitting'
                              ? 'translate-x-24 -translate-y-8 rtl:-translate-x-24 opacity-0'
                              : 'group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:group-hover:-translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
