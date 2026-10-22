import React, { useState } from 'react';
import { X, Lock } from 'lucide-react';
import { UserProfile } from '../../types/auth';
import { loginWithPassword, registerClientAccount } from '../../services/authService';

export type AuthReason = 'download' | 'save' | 'order' | 'admin' | 'general';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: AuthReason;
  onSuccess?: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const finish = (user: UserProfile) => {
    onSuccess?.(user);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      if (mode === 'login') {
        finish(loginWithPassword(identifier, password));
      } else {
        finish(registerClientAccount(name, identifier, password));
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Connexion impossible.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl w-full max-w-[400px] shadow-2xl border border-slate-200 p-5 space-y-3"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">
            {mode === 'login' ? 'Connexion' : 'Créer un compte'}
          </h3>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {mode === 'signup' && (
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom complet"
            className="w-full px-3 py-3 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-slate-900"
          />
        )}

        <input
          required
          autoFocus
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder={mode === 'login' ? 'Email ou identifiant' : 'Email'}
          className="w-full px-3 py-3 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-slate-900"
        />
        <div className="relative">
          <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            className="w-full pl-9 pr-3 py-3 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-slate-900"
          />
        </div>

        {errorMsg && <p className="text-xs text-rose-600 font-semibold">{errorMsg}</p>}

        <button
          type="submit"
          className="w-full py-2.5 bg-[#1877F2] hover:bg-[#166fe0] text-white text-sm font-bold rounded-md"
        >
          {mode === 'login' ? 'Se connecter' : 'S’inscrire'}
        </button>

        <button
          type="button"
          className="w-full text-xs text-slate-600 hover:underline"
          onClick={() => {
            setMode(mode === 'login' ? 'signup' : 'login');
            setErrorMsg(null);
          }}
        >
          {mode === 'login' ? 'Créer un nouveau compte' : 'J’ai déjà un compte'}
        </button>
      </form>
    </div>
  );
};
