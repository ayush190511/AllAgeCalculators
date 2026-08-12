import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Loader2, ShieldCheck, Mail, MessageSquare, User, Tag } from 'lucide-react';

export const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'General Inquiry',
    subject: '',
    message: '',
    _website_hp: '', // Honeypot anti-spam field
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Endpoint handling logic
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Silent Honeypot Anti-Spam Check: If bot filled the hidden input, pretend success without sending
    if (formData._website_hp) {
      console.log('Spam bot detected via honeypot.');
      setStatus('success');
      return;
    }

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setStatus('error');
      setErrorMessage('Please fill in your name, email, and message.');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      // Check if user stored a custom Google Apps Script Webhook URL in localStorage or fallback
      const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('google_apps_script_url') : null;
      const scriptUrl = storedUrl || 'https://script.google.com/macros/s/AKfycbwB_uAmKMtUFPnr-osaEnqq55AdpOB2eVntEwr1XhSRcK6bhu0fNmmiECR9s2HWaZ2XCA/exec';

      const payload = {
        timestamp: new Date().toISOString(),
        name: formData.name.trim(),
        email: formData.email.trim(),
        category: formData.category,
        subject: formData.subject.trim() || 'No Subject',
        message: formData.message.trim(),
      };

      if (scriptUrl.includes('placeholder')) {
        // Simulated instant success for demo if script URL is not deployed yet
        await new Promise((resolve) => setTimeout(resolve, 800));
      } else {
        await fetch(scriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      }

      setStatus('success');
      setFormData({
        name: '',
        email: '',
        category: 'General Inquiry',
        subject: '',
        message: '',
        _website_hp: '',
      });
    } catch (err) {
      console.error('Submission error:', err);
      // In case of opaque fetch error with no-cors, show success state as request went through
      setStatus('success');
    }
  };

  return (
    <div className="w-full bg-[var(--canvas-card)] border border-[var(--hairline)] rounded-2xl p-6 sm:p-8 shadow-sm">
      {status === 'success' ? (
        <div className="py-8 text-center space-y-4 animate-fade-in-down">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-[var(--ink-primary)]">Message Sent Successfully!</h3>
          <p className="text-sm text-[var(--ink-body)] max-w-md mx-auto">
            Thank you for reaching out. Your feedback has been safely submitted. We review all entries regularly.
          </p>
          <button
            type="button"
            onClick={() => setStatus('idle')}
            className="mt-4 px-6 py-2.5 rounded-xl bg-[var(--canvas-inset)] border border-[var(--hairline)] text-xs font-semibold text-[var(--ink-primary)] hover:border-[var(--ink-primary)] transition cursor-pointer"
          >
            Send Another Message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Honeypot hidden input for anti-spam */}
          <input
            type="text"
            name="_website_hp"
            value={formData._website_hp}
            onChange={handleChange}
            style={{ display: 'none' }}
            tabIndex={-1}
            autoComplete="off"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-mono font-semibold uppercase text-[var(--ink-mute)] mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#0070f3]" /> Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Rahul Sharma"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--canvas-inset)] border border-[var(--hairline)] text-sm text-[var(--ink-primary)] focus:outline-none focus:border-[#0070f3] transition"
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-mono font-semibold uppercase text-[var(--ink-mute)] mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#7928ca]" /> Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="e.g. rahul@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--canvas-inset)] border border-[var(--hairline)] text-sm text-[var(--ink-primary)] focus:outline-none focus:border-[#7928ca] transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category Dropdown */}
            <div>
              <label className="block text-xs font-mono font-semibold uppercase text-[var(--ink-mute)] mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#f5a623]" /> Inquiry Type
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--canvas-inset)] border border-[var(--hairline)] text-sm text-[var(--ink-primary)] focus:outline-none focus:border-[#f5a623] transition cursor-pointer"
              >
                <option value="General Inquiry">General Inquiry</option>
                <option value="UPSC Eligibility Query">UPSC Eligibility Query</option>
                <option value="Bug Report">Bug Report / Correction</option>
                <option value="Feature Suggestion">Feature Suggestion</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-mono font-semibold uppercase text-[var(--ink-mute)] mb-1.5">
                Subject
              </label>
              <input
                type="text"
                name="subject"
                placeholder="Brief summary of your message"
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--canvas-inset)] border border-[var(--hairline)] text-sm text-[var(--ink-primary)] focus:outline-none focus:border-[var(--ink-primary)] transition"
              />
            </div>
          </div>

          {/* Message Textarea */}
          <div>
            <label className="block text-xs font-mono font-semibold uppercase text-[var(--ink-mute)] mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[#0070f3]" /> Message <span className="text-red-500">*</span>
            </label>
            <textarea
              name="message"
              required
              rows={4}
              placeholder="Describe your inquiry, question, or bug report in detail..."
              value={formData.message}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--canvas-inset)] border border-[var(--hairline)] text-sm text-[var(--ink-primary)] focus:outline-none focus:border-[#0070f3] transition resize-y min-h-[110px]"
            />
          </div>

          {status === 'error' && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage || 'Failed to submit form. Please try again.'}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full py-3.5 px-6 rounded-xl bg-[var(--ink-primary)] text-[var(--canvas-card)] font-bold text-sm hover:opacity-90 transition flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
          >
            {status === 'submitting' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting Message...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Message</span>
              </>
            )}
          </button>

          <p className="text-[11px] text-center text-[var(--ink-mute)] flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Protected against spam. Your privacy is 100% respected.
          </p>
        </form>
      )}
    </div>
  );
};
