'use client';

import React, { useState } from 'react';
import { Sparkles, Shield, User, Mail, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

interface RegistrationFormProps {
  sessionId: string;
  sessionTitle: string;
  onSuccess: (participant: { name: string; email: string }) => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ sessionId, sessionTitle, onSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [consentLgpd, setConsentLgpd] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || name.trim().length < 2) {
      setError('Por favor, informe seu nome completo.');
      return;
    }

    if (!email.trim() || !EMAIL_REGEX.test(email.trim())) {
      setError('Por favor, informe um e-mail válido.');
      return;
    }

    if (!consentLgpd) {
      setError('Você deve aceitar os termos de consentimento LGPD para acessar o workshop.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/session/${sessionId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          consentLgpd,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Falha ao registrar.');
      }

      // Store in localStorage for seamless reconnection (RF-08)
      localStorage.setItem(`livedeck_user_${sessionId}`, JSON.stringify(data.participant));
      onSuccess(data.participant);
    } catch (err: any) {
      setError(err.message || 'Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 md:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-6">
      {/* Header */}
      <div className="space-y-3 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          Acesso ao LiveDeck
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-white leading-tight">
          Acompanhar Workshop ao Vivo
        </h2>
        <p className="text-xs md:text-sm text-slate-400 line-clamp-2">
          {sessionTitle}
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-xs md:text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Field */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-indigo-400" />
            Seu Nome Completo
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Kauê Victor"
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
          />
        </div>

        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-indigo-400" />
            Seu E-mail (para envio do material pós-evento)
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ex: kaue@exemplo.com"
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
          />
        </div>

        {/* LGPD Checkbox */}
        <div className="pt-2">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={consentLgpd}
              onChange={(e) => setConsentLgpd(e.target.checked)}
              className="mt-1 w-4 h-4 rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
            />
            <span className="text-xs text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
              Concordo em fornecer meu nome e e-mail para acompanhar a apresentação ao vivo e receber os slides/materiais do workshop por e-mail (em conformidade com a LGPD).
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Conectando à Sala...</span>
            </>
          ) : (
            <>
              <span>Entrar na Apresentação</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="flex items-center justify-center gap-1.5 text-slate-500 text-xs">
        <Shield className="w-3.5 h-3.5 text-emerald-500" />
        <span>Seus dados estão protegidos e não serão compartilhados com terceiros.</span>
      </div>
    </div>
  );
};
