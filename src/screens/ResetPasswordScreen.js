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

function ResetPasswordScreen({navigation, onResetPassword, route}) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const email = route.params?.email || '';

  const handleResetPassword = () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert('Missing Fields', 'Please enter and confirm your new password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Password Error', 'Passwords do not match.');
      return;
    }

    onResetPassword(newPassword);

    Alert.alert('Password Updated', 'Your password has been changed successfully.', [
      {
        text: 'Back to Login',
        onPress: () => navigation.navigate('Login'),
      },
    ]);
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
              <Text style={styles.brandTag}>Secure your fragrance account</Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>Reset Password</Text>
          <Text style={styles.heroSubtitle}>
            {email ? `Create a new password for ${email}` : 'Create your new password'}
          </Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>NEW PASSWORD</Text>
          <TextInput
            onChangeText={setNewPassword}
            placeholder="Create a new password"
            placeholderTextColor={palette.textMuted}
            secureTextEntry
            style={styles.input}
            value={newPassword}
          />

          <Text style={styles.label}>CONFIRM PASSWORD</Text>
          <TextInput
            onChangeText={setConfirmPassword}
            placeholder="Repeat your new password"
            placeholderTextColor={palette.textMuted}
            secureTextEntry
            style={styles.input}
            value={confirmPassword}
          />

          <Pressable
            onPress={handleResetPassword}
            style={({pressed}) => [styles.button, pressed ? styles.buttonPressed : null]}>
            <Text style={styles.buttonText}>Update Password</Text>
          </Pressable>

          <Pressable onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerText}>
              Back to <Text style={styles.linkText}>Log In</Text>
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

export default ResetPasswordScreen;
