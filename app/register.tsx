import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AppButton from '@/components/AppButton';
import Header from '@/components/Header';
import { COLORS } from '@/constants/colors';
import { supabase } from '@/lib/supabase';

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError(null);

    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            fullName,
            role,
          },
        },
      });

      if (authError) {
        setError(authError.message);
      } else if (data?.session) {
        // Auto-login success -> go directly to dashboard
        router.replace('/(tabs)');
      } else {
        // If Supabase has email confirmation enabled, attempt immediate login
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (signInError) {
          setError('Account created, but email confirmation may be required.');
        } else {
          router.replace('/(tabs)');
        }
      }
    } catch (_err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerContainer}>
            <Header title="QR Attendance" />
          </View>

          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Register to start recording attendance</Text>

          <View style={styles.form}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your full name"
              placeholderTextColor={COLORS.textSecondary}
              editable={!loading}
            />

            <Text style={styles.label}>I am a...</Text>
            <View style={styles.roleRow}>
              <Pressable
                style={[
                  styles.roleChip,
                  role === 'student' && styles.roleChipActive,
                ]}
                onPress={() => setRole('student')}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.roleChipText,
                    role === 'student' && styles.roleChipTextActive,
                  ]}
                >
                  Student
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.roleChip,
                  role === 'teacher' && styles.roleChipActive,
                ]}
                onPress={() => setRole('teacher')}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.roleChipText,
                    role === 'teacher' && styles.roleChipTextActive,
                  ]}
                >
                  Teacher
                </Text>
              </Pressable>
            </View>

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="your.email@school.edu"
              placeholderTextColor={COLORS.textSecondary}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="At least 6 characters"
              placeholderTextColor={COLORS.textSecondary}
              secureTextEntry
              editable={!loading}
            />

            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter your password"
              placeholderTextColor={COLORS.textSecondary}
              secureTextEntry
              editable={!loading}
            />

            {error && <Text style={styles.error}>{error}</Text>}

            {loading ? (
              <ActivityIndicator
                size="large"
                color={COLORS.primary}
                style={styles.loader}
              />
            ) : (
              <AppButton
                theme="primary"
                title="Sign Up"
                icon="person-add-outline"
                onPress={handleRegister}
              />
            )}
          </View>

          <Link href="/login" style={styles.link}>
            Already have an account? Sign In
          </Link>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 75,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  form: {
    marginBottom: 16,
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: -4,
  },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  roleRow: {
    flexDirection: 'row',
  },
  roleChip: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 10,
    alignItems: 'center',
    marginRight: 8,
  },
  roleChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '14',
  },
  roleChipText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  roleChipTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  error: {
    fontSize: 14,
    color: (COLORS as any).danger || '#DC2626',
    textAlign: 'left',
    marginTop: 2,
  },
  loader: {
    marginVertical: 12,
  },
  link: {
    fontSize: 14,
    color: COLORS.primary,
    textAlign: 'center',
    fontWeight: '600',
  },
});