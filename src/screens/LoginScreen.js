import React, {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {loginUser} from '../services/api';
import {logoImage, palette} from '../theme';

function LoginScreen({navigation, onLoginSuccess}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please enter your email and password.');
      return;
    }

    setLoading(true);

    try {
      const loginPayload = await loginUser({
        email: email.trim().toLowerCase(),
        password,
      });

      onLoginSuccess?.(loginPayload?.user || null);

      navigation.replace('Home', {
        name: loginPayload?.user?.profile?.full_name || 'Guest',
        email: loginPayload?.user?.email || email.trim().toLowerCase(),
      });
    } catch (error) {
      Alert.alert('Invalid Login', error.message || 'The email or password is incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}>
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.brandRow}>
            <Image source={logoImage} style={styles.logo} resizeMode="contain" />
            <View style={styles.brandTextWrap}>
              <Text style={styles.brandName}>PERFUME TREASURE</Text>
              <Text style={styles.brandTag}>Fine Fragrances</Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>Welcome Back</Text>
          <Text style={styles.heroSubtitle}>Sign in to your account</Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>EMAIL ADDRESS</Text>
          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="your@email.com"
            placeholderTextColor={palette.textMuted}
            style={styles.input}
            value={email}
          />

          <Text style={styles.label}>PASSWORD</Text>
          <TextInput
            onChangeText={setPassword}
            placeholder="Enter your password"
            placeholderTextColor={palette.textMuted}
            secureTextEntry
            style={styles.input}
            value={password}
          />

          <Pressable
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotPasswordLink}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </Pressable>

          <Pressable
            onPress={handleLogin}
            style={({pressed}) => [
              styles.button,
              pressed && !loading ? styles.buttonPressed : null,
              loading ? styles.buttonDisabled : null,
            ]}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color={palette.white} />
            ) : (
              <Text style={styles.buttonText}>Log In</Text>
            )}
          </Pressable>

          <Pressable onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.footerText}>
              {"Don't have an account? "}
              <Text style={styles.linkText}>Sign Up</Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.cream,
  },
  scrollContent: {
    flexGrow: 1,
  },
  hero: {
    backgroundColor: palette.black,
    paddingTop: 48,
    paddingHorizontal: 22,
    paddingBottom: 28,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },
  logo: {
    width: 74,
    height: 52,
    marginRight: 12,
  },
  brandTextWrap: {
    flex: 1,
  },
  brandName: {
    color: palette.goldSoft,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1.6,
  },
  brandTag: {
    marginTop: 2,
    color: '#e7dcc2',
    fontSize: 12,
  },
  heroTitle: {
    color: palette.white,
    fontSize: 38,
    fontWeight: '700',
    marginBottom: 6,
  },
  heroSubtitle: {
    color: '#dbcda9',
    fontSize: 15,
  },
  formSection: {
    flex: 1,
    backgroundColor: palette.cream,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 40,
  },
  label: {
    color: '#786848',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.1,
    marginBottom: 8,
    marginTop: 14,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: palette.black,
    backgroundColor: palette.white,
  },
  button: {
    height: 54,
    borderRadius: 14,
    backgroundColor: palette.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 18,
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  forgotPasswordText: {
    color: palette.gold,
    fontSize: 13,
    fontWeight: '700',
  },
  buttonPressed: {
    opacity: 0.92,
  },
  buttonDisabled: {
    opacity: 0.75,
  },
  buttonText: {
    color: palette.white,
    fontSize: 16,
    fontWeight: '700',
  },
  footerText: {
    textAlign: 'center',
    color: '#806f4d',
    fontSize: 14,
  },
  linkText: {
    color: palette.black,
    fontWeight: '700',
  },
});

export default LoginScreen;
