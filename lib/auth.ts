import type { Session, User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { supabase } from './supabase';

type AuthState = {
  session: Session | null;
  user: User | null;
  loading: boolean;
};

let globalSession: Session | null = null;
let globalUser: User | null = null;
let globalLoading = false;
let listeners: Set<() => void> = new Set();

function notify() {
  listeners.forEach((l) => l());
}

export function setAuth(session: Session | null) {
  globalSession = session;
  globalUser = session?.user ?? null;
  globalLoading = false;
  notify();
}

export function useAuth(): AuthState {
  const [, forceRender] = useState(0);

  useEffect(() => {
    const listener = () => forceRender((n) => n + 1);
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, []);

  return {
    session: globalSession,
    user: globalUser,
    loading: globalLoading,
  };
}

export async function signUp(email: string, password: string) {
  try {
    console.log('REGISTERING:', email);
    console.log(
      'SUPABASE URL:',
      process.env.EXPO_PUBLIC_SUPABASE_URL
    );
    console.log(
      'SUPABASE KEY EXISTS:',
      !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    console.log('REGISTER DATA:', data);
    console.log('REGISTER ERROR:', error);

    if (!error && data.session) {
      setAuth(data.session);
    }

    return { data, error };
  } catch (error) {
    console.error('REGISTER NETWORK ERROR:', error);
    throw error;
  }
}


export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (!error && data.session) {
    setAuth(data.session);
  }
  return { data, error };
}

export async function signOut() {
  setAuth(null);
  supabase.auth.signOut().catch(() => {});
  return { error: null };
}