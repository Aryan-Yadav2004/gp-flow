import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

const Auth = () => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) toast.error(error.message);
    else toast.success('Welcome back!');
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) { toast.error('Full name is required'); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) toast.error(error.message);
    else toast.success('Check your email to verify your account!');
    setLoading(false);
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error(error.message);
    else toast.success('Password reset link sent to your email');
    setLoading(false);
  };

  const handleGoogle = async () => {
    setLoading(true);
    const { error } = await lovable.auth.signInWithOAuth('google', {
      redirect_uri: window.location.origin,
    });
    if (error) toast.error(error instanceof Error ? error.message : 'Google sign-in failed');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[hsl(220,25%,10%)] to-[hsl(220,25%,18%)] p-12 flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-display font-bold text-lg">G</span>
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-white">Gharpayy</h1>
            <p className="text-xs text-white/60">Lead Management CRM</p>
          </div>
        </div>
        <div>
          <h2 className="font-display text-3xl font-bold text-white leading-tight mb-4">
            Never miss a lead.<br />Close more deals.
          </h2>
          <p className="text-white/60 text-sm max-w-md">
            Track every lead from first contact to closing. Automated follow-ups, smart scoring, and real-time pipeline visibility for your entire team.
          </p>
          <div className="grid grid-cols-3 gap-4 mt-8">
            {[
              { label: 'Avg Response', value: '<5 min' },
              { label: 'Lead Score AI', value: 'Auto' },
              { label: 'Pipeline Stages', value: '8' },
            ].map(s => (
              <div key={s.label} className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="font-display font-bold text-white text-lg">{s.value}</p>
                <p className="text-[10px] text-white/50 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-[10px] text-white/30">© 2026 Gharpayy. All rights reserved.</p>
      </div>

      {/* Right auth form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[400px]">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold">G</span>
            </div>
            <h1 className="font-display font-bold text-lg text-foreground">Gharpayy</h1>
          </div>

          <h2 className="font-display font-bold text-2xl text-foreground mb-1">
            {mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create account' : 'Reset password'}
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            {mode === 'login' ? 'Sign in to your CRM dashboard' : mode === 'signup' ? 'Join your team on Gharpayy CRM' : 'Enter your email to reset password'}
          </p>

          {mode !== 'forgot' && (
            <>
              <Button variant="outline" className="w-full gap-2 mb-4" onClick={handleGoogle} disabled={loading}>
                <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Continue with Google
              </Button>
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                <div className="relative flex justify-center text-xs"><span className="bg-background px-2 text-muted-foreground">or</span></div>
              </div>
            </>
          )}

          <form onSubmit={mode === 'login' ? handleLogin : mode === 'signup' ? handleSignup : handleForgot} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <Label className="text-xs">Full Name</Label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input className="pl-9" placeholder="Your full name" value={fullName} onChange={e => setFullName(e.target.value)} />
                </div>
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-9" type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>
            {mode !== 'forgot' && (
              <div className="space-y-1.5">
                <Label className="text-xs">Password</Label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input className="pl-9 pr-9" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'login' && (
              <button type="button" onClick={() => setMode('forgot')} className="text-xs text-primary hover:underline">
                Forgot password?
              </button>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
            </Button>
          </form>

          <p className="text-xs text-center text-muted-foreground mt-6">
            {mode === 'login' ? (
              <>Don't have an account? <button onClick={() => setMode('signup')} className="text-primary hover:underline">Sign up</button></>
            ) : (
              <>Already have an account? <button onClick={() => setMode('login')} className="text-primary hover:underline">Sign in</button></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
