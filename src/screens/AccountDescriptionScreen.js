import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import ScreenNavActions from '../components/ScreenNavActions';
import {updateCurrentUser} from '../services/api';
import {palette} from '../theme';

const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const PHONE_PATTERN = /^[0-9+\-() ]{7,20}$/;

function isValidEmail(email) {
  if (!EMAIL_PATTERN.test(email)) {
    return false;
  }
  if (email.includes('..')) {
    return false;
  }

  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) {
    return false;
  }

  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return false;
  }

  if (domain.startsWith('.') || domain.endsWith('.') || domain.startsWith('-') || domain.endsWith('-')) {
    return false;
  }

  return true;
}

function isValidPhone(phone) {
  if (!phone.trim()) {
    return true;
  }

  return PHONE_PATTERN.test(phone.trim());
}

function AccountDescriptionScreen({navigation, route, currentUser, onUserUpdated}) {
  const routeUser = route.params?.user || {};
  const profile = currentUser?.profile || {};
  const fallbackName =
    profile.full_name ||
    routeUser.name ||
    currentUser?.email?.split('@')[0] ||
    'Perfume Treasure Member';
  const fallbackEmail = currentUser?.email || routeUser.email || '';
  const fallbackPhone = profile.phone || '';
  const loyaltyPoints = Number(currentUser?.loyalty_points_balance || 0);

  const [fullName, setFullName] = useState(fallbackName);
  const [email, setEmail] = useState(fallbackEmail);
  const [phone, setPhone] = useState(fallbackPhone);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFullName(fallbackName);
    setEmail(fallbackEmail);
    setPhone(fallbackPhone);
  }, [fallbackEmail, fallbackName, fallbackPhone]);

  const trimmedName = fullName.trim();
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedPhone = phone.trim();

  const nameError =
    trimmedName.length === 0
      ? 'Full name is required.'
      : trimmedName.length < 2
        ? 'Enter your full name.'
        : '';
  const emailError =
    trimmedEmail.length === 0
      ? 'Email is required.'
      : !isValidEmail(trimmedEmail)
        ? 'Enter a valid email address.'
        : '';
  const phoneError =
    trimmedPhone && !isValidPhone(trimmedPhone)
      ? 'Enter a valid phone number.'
      : '';

  const isDirty = useMemo(() => {
    return (
      trimmedName !== fallbackName.trim() ||
      trimmedEmail !== fallbackEmail.trim().toLowerCase() ||
      trimmedPhone !== fallbackPhone.trim()
    );
  }, [fallbackEmail, fallbackName, fallbackPhone, trimmedEmail, trimmedName, trimmedPhone]);

  const canSave = !nameError && !emailError && !phoneError && isDirty && !saving;

  const handleSave = async () => {
    if (nameError || emailError || phoneError) {
      Alert.alert(
        'Invalid Details',
        nameError || emailError || phoneError || 'Please correct your details before saving.',
      );
      return;
    }

    try {
      setSaving(true);
      const updatedUser = await updateCurrentUser({
        fullName: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone,
      });
      onUserUpdated?.(updatedUser);
      Alert.alert('Details Updated', 'Your account details were saved successfully.');
    } catch (error) {
      Alert.alert('Update Failed', error.message || 'Unable to update your details.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ScreenNavActions navigation={navigation} color={palette.goldSoft} />
          <Text style={styles.brandText}>PERFUME TREASURE</Text>
          <Text style={styles.title}>Account Details</Text>
          <Text style={styles.subtitle}>
            Review and update the profile details saved to your account.
          </Text>
        </View>

        <View style={styles.contentWrap}>
          <View style={styles.profileCard}>
            <Text style={styles.profileEyebrow}>Member Profile</Text>
            <Text style={styles.profileName}>{trimmedName || fallbackName}</Text>
            <Text style={styles.profileEmail}>{trimmedEmail || 'No email saved yet'}</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>Edit Your Details</Text>

            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={[styles.input, nameError ? styles.inputError : null]}
              placeholder="Enter your full name"
              placeholderTextColor={palette.textMuted}
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
            {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}

            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={[styles.input, emailError ? styles.inputError : null]}
              placeholder="Enter your email"
              placeholderTextColor={palette.textMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
            />
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

            <Text style={styles.inputLabel}>Phone</Text>
            <TextInput
              style={[styles.input, phoneError ? styles.inputError : null]}
              placeholder="Enter your phone number"
              placeholderTextColor={palette.textMuted}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              textContentType="telephoneNumber"
            />
            {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Loyalty Balance</Text>
              <Text style={styles.infoValue}>{loyaltyPoints} Points</Text>
            </View>

            <Pressable
              onPress={handleSave}
              style={({pressed}) => [
                styles.saveButton,
                pressed ? styles.buttonPressed : null,
                !canSave ? styles.buttonDisabled : null,
              ]}
              disabled={!canSave}>
              {saving ? (
                <ActivityIndicator color={palette.black} />
              ) : (
                <Text style={styles.saveButtonText}>Save Details</Text>
              )}
            </Pressable>
          </View>

          <View style={styles.noteCard}>
            <Text style={styles.noteTitle}>Profile checks</Text>
            <Text style={styles.noteText}>
              We validate your name, email, and phone number before saving so your
              order and account information stay accurate.
            </Text>
            <Pressable
              onPress={() => navigation.reset({index: 0, routes: [{name: 'Home'}]})}
              style={({pressed}) => [
                styles.homeButton,
                pressed ? styles.buttonPressed : null,
              ]}>
              <Text style={styles.homeButtonText}>Return Home</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.ivory,
  },
  scrollContent: {
    paddingBottom: 28,
  },
  header: {
    backgroundColor: palette.black,
    paddingTop: 46,
    paddingHorizontal: 18,
    paddingBottom: 24,
  },
  brandText: {
    color: palette.goldSoft,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  title: {
    color: palette.white,
    fontSize: 34,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: '#dbcda9',
    fontSize: 15,
    lineHeight: 22,
  },
  contentWrap: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 14,
  },
  profileCard: {
    backgroundColor: palette.cream,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 18,
    padding: 18,
  },
  profileEyebrow: {
    color: '#7f6f51',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  profileName: {
    color: palette.charcoal,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 6,
  },
  profileEmail: {
    color: '#7b6b51',
    fontSize: 15,
  },
  infoCard: {
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 18,
    padding: 18,
  },
  sectionTitle: {
    color: palette.charcoal,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  inputLabel: {
    color: '#8b7d63',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  input: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.ivory,
    paddingHorizontal: 14,
    color: palette.black,
    marginBottom: 6,
  },
  inputError: {
    borderColor: '#d1735e',
    backgroundColor: '#fff4f1',
  },
  errorText: {
    color: '#b4513c',
    fontSize: 13,
    marginBottom: 12,
  },
  infoRow: {
    borderTopWidth: 1,
    borderTopColor: palette.border,
    marginTop: 10,
    paddingTop: 14,
    marginBottom: 18,
  },
  infoLabel: {
    color: '#8b7d63',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  infoValue: {
    color: palette.charcoal,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: palette.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: palette.black,
    fontSize: 15,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  noteCard: {
    backgroundColor: palette.cream,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 18,
    padding: 18,
  },
  noteTitle: {
    color: palette.charcoal,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  noteText: {
    color: '#7b6b51',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
  homeButton: {
    height: 50,
    borderRadius: 14,
    backgroundColor: palette.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeButtonText: {
    color: palette.white,
    fontSize: 15,
    fontWeight: '700',
  },
  buttonPressed: {
    opacity: 0.92,
  },
});

export default AccountDescriptionScreen;
