import React, {useState} from 'react';
import {
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
import {logoImage, palette} from '../theme';

function ForgotPasswordScreen({navigation, registeredUser}) {
  const [email, setEmail] = useState('');

  const handleSendResetLink = () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      Alert.alert('Missing Email', 'Please enter your email address.');
      return;
    }

    if (!registeredUser) {
      Alert.alert('No Account Found', 'Please create an account before resetting a password.');
      return;
    }

    if (registeredUser.email.toLowerCase() !== normalizedEmail) {
      Alert.alert('Email Not Found', 'We could not find an account with that email.');
      return;
    }

    Alert.alert(
      'Reset Email Sent',
      'A password reset link has been sent to your email.',
      [
        {
          text: 'Open Reset Link',
          onPress: () =>
            navigation.navigate('ResetPassword', {
              email: registeredUser.email,
            }),
        },
      ],
    );
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
              <Text style={styles.brandTag}>Recover access to your account</Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>Forgot Password</Text>
          <Text style={styles.heroSubtitle}>
            Enter your email to receive a password reset link
          </Text>
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

          <Pressable
            onPress={handleSendResetLink}
            style={({pressed}) => [styles.button, pressed ? styles.buttonPressed : null]}>
            <Text style={styles.buttonText}>Send Reset Link</Text>
          </Pressable>

          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.footerText}>
              Remembered your password? <Text style={styles.linkText}>Log In</Text>
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
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 6,
  },
  heroSubtitle: {
    color: '#dbcda9',
    fontSize: 15,
    lineHeight: 22,
  },
  formSection: {
    flex: 1,
    backgroundColor: palette.cream,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 40,
  },
  label: {
    color: '#786848',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.1,
    marginBottom: 8,
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
  buttonPressed: {
    opacity: 0.92,
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

export default ForgotPasswordScreen;
