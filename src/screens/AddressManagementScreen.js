import React, {useCallback, useState} from 'react';
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
import {useFocusEffect} from '@react-navigation/native';

import {
  createAddress,
  deleteAddress,
  fetchAddresses,
  updateAddress,
} from '../services/api';
import {palette} from '../theme';

function AddressManagementScreen({navigation}) {
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    phone: '',
    is_default: false,
  });

  const loadAddresses = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const data = await fetchAddresses();
      setAddresses(data);
    } catch (error) {
      setErrorMessage(error.message || 'Unable to load addresses.');
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAddresses();
    }, [loadAddresses]),
  );

  const resetForm = () => {
    setFormData({
      full_name: '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
      phone: '',
      is_default: false,
    });
    setEditingAddress(null);
    setShowForm(false);
  };

  const handleEdit = (address) => {
    setFormData({
      full_name: address.full_name || '',
      line1: address.line1 || '',
      line2: address.line2 || '',
      city: address.city || '',
      state: address.state || '',
      postal_code: address.postal_code || '',
      country: address.country || '',
      phone: address.phone || '',
      is_default: address.is_default || false,
    });
    setEditingAddress(address);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    const required = ['full_name', 'line1', 'city', 'postal_code', 'country'];
    const missing = required.filter(field => !formData[field].trim());
    if (missing.length > 0) {
      Alert.alert('Missing Fields', `Please fill in: ${missing.join(', ')}`);
      return;
    }

    try {
      setProcessing(true);
      if (editingAddress) {
        await updateAddress(editingAddress.id, formData);
      } else {
        await createAddress(formData);
      }
      resetForm();
      loadAddresses();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to save address');
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = (address) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setProcessing(true);
              await deleteAddress(address.id);
              loadAddresses();
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to delete address');
            } finally {
              setProcessing(false);
            }
          },
        },
      ],
    );
  };

  const handleSetDefault = async (address) => {
    try {
      setProcessing(true);
      await updateAddress(address.id, {is_default: true});
      loadAddresses();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to set default address');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <Text style={styles.brandText}>PERFUME TREASURE</Text>
          <Text style={styles.title}>Addresses</Text>
        </View>

        {loading ? (
          <View style={styles.stateWrap}>
            <ActivityIndicator color={palette.gold} />
          </View>
        ) : errorMessage ? (
          <View style={styles.stateWrap}>
            <Text style={styles.stateTitle}>Unable to load addresses</Text>
            <Text style={styles.stateText}>{errorMessage}</Text>
            <Pressable
              onPress={loadAddresses}
              style={({pressed}) => [
                styles.retryButton,
                pressed ? styles.buttonPressed : null,
              ]}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.contentWrap}>
            <Pressable
              onPress={() => setShowForm(true)}
              style={({pressed}) => [
                styles.addButton,
                pressed ? styles.buttonPressed : null,
              ]}>
              <Text style={styles.addButtonText}>+ Add New Address</Text>
            </Pressable>

            {addresses.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyTitle}>No addresses yet</Text>
                <Text style={styles.emptyText}>
                  Add your shipping addresses to speed up checkout.
                </Text>
              </View>
            ) : (
              addresses.map(address => (
                <View key={address.id} style={styles.addressCard}>
                  <View style={styles.addressHeader}>
                    <Text style={styles.addressName}>{address.full_name}</Text>
                    {address.is_default && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultText}>Default</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.addressLine}>{address.line1}</Text>
                  {address.line2 && (
                    <Text style={styles.addressLine}>{address.line2}</Text>
                  )}
                  <Text style={styles.addressLine}>
                    {address.city}, {address.state || ''} {address.postal_code}
                  </Text>
                  <Text style={styles.addressLine}>{address.country}</Text>
                  {address.phone && (
                    <Text style={styles.addressLine}>{address.phone}</Text>
                  )}

                  <View style={styles.addressActions}>
                    {!address.is_default && (
                      <Pressable
                        onPress={() => handleSetDefault(address)}
                        disabled={processing}
                        style={styles.actionButton}>
                        <Text style={styles.actionText}>Set as Default</Text>
                      </Pressable>
                    )}
                    <Pressable
                      onPress={() => handleEdit(address)}
                      disabled={processing}
                      style={styles.actionButton}>
                      <Text style={styles.actionText}>Edit</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => handleDelete(address)}
                      disabled={processing}
                      style={styles.actionButton}>
                      <Text style={styles.deleteText}>Delete</Text>
                    </Pressable>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {showForm && (
          <View style={styles.formOverlay}>
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </Text>

              <ScrollView style={styles.formScroll}>
                <Text style={styles.label}>FULL NAME</Text>
                <TextInput
                  style={styles.input}
                  value={formData.full_name}
                  onChangeText={(text) => setFormData({...formData, full_name: text})}
                  placeholder="Enter full name"
                />

                <Text style={styles.label}>ADDRESS LINE 1</Text>
                <TextInput
                  style={styles.input}
                  value={formData.line1}
                  onChangeText={(text) => setFormData({...formData, line1: text})}
                  placeholder="Street address"
                />

                <Text style={styles.label}>ADDRESS LINE 2 (OPTIONAL)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.line2}
                  onChangeText={(text) => setFormData({...formData, line2: text})}
                  placeholder="Apartment, suite, etc."
                />

                <Text style={styles.label}>CITY</Text>
                <TextInput
                  style={styles.input}
                  value={formData.city}
                  onChangeText={(text) => setFormData({...formData, city: text})}
                  placeholder="City"
                />

                <Text style={styles.label}>STATE/PROVINCE (OPTIONAL)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.state}
                  onChangeText={(text) => setFormData({...formData, state: text})}
                  placeholder="State or province"
                />

                <Text style={styles.label}>POSTAL CODE</Text>
                <TextInput
                  style={styles.input}
                  value={formData.postal_code}
                  onChangeText={(text) => setFormData({...formData, postal_code: text})}
                  placeholder="Postal code"
                />

                <Text style={styles.label}>COUNTRY</Text>
                <TextInput
                  style={styles.input}
                  value={formData.country}
                  onChangeText={(text) => setFormData({...formData, country: text})}
                  placeholder="Country"
                />

                <Text style={styles.label}>PHONE (OPTIONAL)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.phone}
                  onChangeText={(text) => setFormData({...formData, phone: text})}
                  placeholder="Phone number"
                  keyboardType="phone-pad"
                />

                <Pressable
                  onPress={() => setFormData({...formData, is_default: !formData.is_default})}
                  style={styles.checkboxRow}>
                  <View style={[styles.checkbox, formData.is_default && styles.checkboxChecked]}>
                    {formData.is_default && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>Set as default address</Text>
                </Pressable>
              </ScrollView>

              <View style={styles.formActions}>
                <Pressable
                  onPress={resetForm}
                  style={({pressed}) => [
                    styles.cancelButton,
                    pressed ? styles.buttonPressed : null,
                  ]}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleSubmit}
                  disabled={processing}
                  style={({pressed}) => [
                    styles.saveButton,
                    pressed ? styles.buttonPressed : null,
                  ]}>
                  {processing ? (
                    <ActivityIndicator color={palette.white} size="small" />
                  ) : (
                    <Text style={styles.saveText}>
                      {editingAddress ? 'Update' : 'Save'}
                    </Text>
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        )}
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
    paddingBottom: 20,
  },
  backText: {
    color: palette.goldSoft,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
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
    fontSize: 32,
    fontWeight: '700',
  },
  stateWrap: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 22,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.cream,
    alignItems: 'center',
  },
  stateTitle: {
    color: palette.charcoal,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  stateText: {
    color: '#7f6f51',
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: palette.gold,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: palette.white,
    fontSize: 16,
    fontWeight: '700',
  },
  contentWrap: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  addButton: {
    backgroundColor: palette.gold,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  addButtonText: {
    color: palette.white,
    fontSize: 16,
    fontWeight: '700',
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    color: palette.charcoal,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    color: '#7f6f51',
    textAlign: 'center',
    fontSize: 14,
  },
  addressCard: {
    backgroundColor: palette.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 16,
    marginBottom: 12,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressName: {
    color: palette.charcoal,
    fontSize: 16,
    fontWeight: '700',
  },
  defaultBadge: {
    backgroundColor: palette.gold,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultText: {
    color: palette.white,
    fontSize: 12,
    fontWeight: '700',
  },
  addressLine: {
    color: '#6f6047',
    fontSize: 14,
    marginBottom: 2,
  },
  addressActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 16,
  },
  actionButton: {
    paddingVertical: 8,
  },
  actionText: {
    color: palette.gold,
    fontSize: 14,
    fontWeight: '600',
  },
  deleteText: {
    color: '#d32f2f',
    fontSize: 14,
    fontWeight: '600',
  },
  formOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    backgroundColor: palette.white,
    borderRadius: 16,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
  },
  formTitle: {
    color: palette.charcoal,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  formScroll: {
    padding: 20,
  },
  label: {
    color: palette.charcoal,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: palette.cream,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: palette.gold,
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: palette.gold,
  },
  checkmark: {
    color: palette.white,
    fontSize: 14,
    fontWeight: '700',
  },
  checkboxLabel: {
    color: palette.charcoal,
    fontSize: 14,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: palette.border,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  cancelText: {
    color: '#7f6f51',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: palette.gold,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  saveText: {
    color: palette.white,
    fontSize: 16,
    fontWeight: '700',
  },
  buttonPressed: {
    opacity: 0.7,
  },
});

export default AddressManagementScreen;