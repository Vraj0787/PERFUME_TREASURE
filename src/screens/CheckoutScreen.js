import React, {useCallback, useMemo, useState} from 'react';
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
  createCheckout,
  fetchAddresses,
  fetchCheckoutQuote,
} from '../services/api';
import {palette} from '../theme';

const initialForm = {
  full_name: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postal_code: '',
  country: '',
  phone: '',
};

function CheckoutScreen({navigation, onCartUpdated, onLoyaltyEarned}) {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [totals, setTotals] = useState(null);

  const loadAddresses = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchAddresses();
      setAddresses(data);

      const defaultAddress =
        data.find(address => address.is_default) || data[0] || null;
      setSelectedAddressId(defaultAddress?.id || null);
    } catch (error) {
      Alert.alert('Address Error', error.message || 'Unable to load addresses.');
      setAddresses([]);
      setSelectedAddressId(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadQuote = useCallback(
    async addressId => {
      if (!addressId) {
        setTotals(null);
        return;
      }

      try {
        setQuoteLoading(true);
        const quote = await fetchCheckoutQuote({
          addressId,
          discountCode: discountCode.trim(),
        });
        setTotals(quote);
      } catch (error) {
        setTotals(null);
        Alert.alert(
          'Totals Unavailable',
          error.message || 'Unable to refresh checkout totals.',
        );
      } finally {
        setQuoteLoading(false);
      }
    },
    [discountCode],
  );

  useFocusEffect(
    useCallback(() => {
      loadAddresses();
    }, [loadAddresses]),
  );

  useFocusEffect(
    useCallback(() => {
      if (selectedAddressId) {
        loadQuote(selectedAddressId);
      }
    }, [loadQuote, selectedAddressId]),
  );

  const canCreateAddress = useMemo(() => {
    return (
      form.full_name.trim() &&
      form.line1.trim() &&
      form.city.trim() &&
      form.postal_code.trim() &&
      form.country.trim()
    );
  }, [form]);

  const handleCreateAddress = async () => {
    if (!canCreateAddress) {
      Alert.alert('Missing Fields', 'Please complete all required address fields.');
      return;
    }

    try {
      const createdAddress = await createAddress({
        ...form,
        is_default: addresses.length === 0,
      });

      setForm(initialForm);
      setAddresses(current => [createdAddress, ...current]);
      setSelectedAddressId(createdAddress.id);
      await loadQuote(createdAddress.id);
      Alert.alert('Address Added', 'Your address was saved for checkout.');
    } catch (error) {
      Alert.alert('Save Failed', error.message || 'Unable to save address.');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      Alert.alert(
        'Address Required',
        'Please select an address before placing the order.',
      );
      return;
    }

    try {
      setPlacingOrder(true);
      const order = await createCheckout({
        addressId: selectedAddressId,
        discountCode,
      });
      onCartUpdated?.({items: []});
      onLoyaltyEarned?.(order?.points_earned || 0);
      navigation.replace('OrderConfirmation', {order});
    } catch (error) {
      Alert.alert('Checkout Failed', error.message || 'Unable to place order.');
    } finally {
      setPlacingOrder(false);
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
          <Text style={styles.title}>Checkout</Text>
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={palette.gold} />
          </View>
        ) : (
          <View style={styles.contentWrap}>
            <Text style={styles.sectionLabel}>Select Address</Text>
            {addresses.length === 0 ? (
              <Text style={styles.helperText}>No saved addresses yet. Add one below.</Text>
            ) : (
              addresses.map(address => {
                const isSelected = selectedAddressId === address.id;

                return (
                  <Pressable
                    key={address.id}
                    onPress={() => {
                      setSelectedAddressId(address.id);
                      loadQuote(address.id);
                    }}
                    style={[
                      styles.addressCard,
                      isSelected ? styles.addressCardActive : null,
                    ]}>
                    <Text style={styles.addressName}>{address.full_name}</Text>
                    <Text style={styles.addressLine}>{address.line1}</Text>
                    {address.line2 ? (
                      <Text style={styles.addressLine}>{address.line2}</Text>
                    ) : null}
                    <Text style={styles.addressLine}>
                      {address.city}, {address.state || '-'} {address.postal_code}
                    </Text>
                    <Text style={styles.addressLine}>{address.country}</Text>
                  </Pressable>
                );
              })
            )}

            <Text style={styles.sectionLabel}>Add New Address</Text>
            <View style={styles.formCard}>
              <TextInput
                style={styles.input}
                placeholder="Full Name*"
                placeholderTextColor={palette.textMuted}
                value={form.full_name}
                onChangeText={value => setForm(current => ({...current, full_name: value}))}
              />
              <TextInput
                style={styles.input}
                placeholder="Address Line 1*"
                placeholderTextColor={palette.textMuted}
                value={form.line1}
                onChangeText={value => setForm(current => ({...current, line1: value}))}
              />
              <TextInput
                style={styles.input}
                placeholder="Address Line 2"
                placeholderTextColor={palette.textMuted}
                value={form.line2}
                onChangeText={value => setForm(current => ({...current, line2: value}))}
              />
              <TextInput
                style={styles.input}
                placeholder="City*"
                placeholderTextColor={palette.textMuted}
                value={form.city}
                onChangeText={value => setForm(current => ({...current, city: value}))}
              />
              <TextInput
                style={styles.input}
                placeholder="State"
                placeholderTextColor={palette.textMuted}
                value={form.state}
                onChangeText={value => setForm(current => ({...current, state: value}))}
              />
              <TextInput
                style={styles.input}
                placeholder="Postal Code*"
                placeholderTextColor={palette.textMuted}
                value={form.postal_code}
                onChangeText={value =>
                  setForm(current => ({...current, postal_code: value}))
                }
              />
              <TextInput
                style={styles.input}
                placeholder="Country*"
                placeholderTextColor={palette.textMuted}
                value={form.country}
                onChangeText={value => setForm(current => ({...current, country: value}))}
              />
              <TextInput
                style={styles.input}
                placeholder="Phone"
                placeholderTextColor={palette.textMuted}
                value={form.phone}
                onChangeText={value => setForm(current => ({...current, phone: value}))}
              />

              <Pressable
                onPress={handleCreateAddress}
                style={({pressed}) => [
                  styles.secondaryButton,
                  pressed ? styles.buttonPressed : null,
                ]}>
                <Text style={styles.secondaryButtonText}>Save Address</Text>
              </Pressable>
            </View>

            <Text style={styles.sectionLabel}>Discount Code</Text>
            <View style={styles.formCard}>
              <TextInput
                style={styles.input}
                placeholder="Enter code"
                placeholderTextColor={palette.textMuted}
                autoCapitalize="characters"
                value={discountCode}
                onChangeText={setDiscountCode}
              />
              <Pressable
                onPress={() => loadQuote(selectedAddressId)}
                style={({pressed}) => [
                  styles.secondaryButton,
                  pressed ? styles.buttonPressed : null,
                ]}
                disabled={!selectedAddressId || quoteLoading}>
                <Text style={styles.secondaryButtonText}>
                  {quoteLoading ? 'Refreshing...' : 'Apply Code'}
                </Text>
              </Pressable>
            </View>

            <Text style={styles.sectionLabel}>Order Summary</Text>
            <View style={styles.formCard}>
              <Text style={styles.summaryRow}>
                Subtotal: ${Number(totals?.subtotal || 0).toFixed(2)}
              </Text>
              {Number(totals?.discount_amount || 0) > 0 ? (
                <Text style={styles.summaryRow}>
                  Discount
                  {totals?.discount_code ? ` (${totals.discount_code})` : ''}: -$
                  {Number(totals?.discount_amount || 0).toFixed(2)}
                </Text>
              ) : null}
              <Text style={styles.summaryRow}>
                Shipping: ${Number(totals?.shipping_amount || 0).toFixed(2)}
              </Text>
              <Text style={styles.summaryRow}>
                Tax: ${Number(totals?.tax_amount || 0).toFixed(2)}
              </Text>
              <Text style={styles.summaryTotal}>
                Total: ${Number(totals?.total_amount || 0).toFixed(2)}
              </Text>
            </View>

            <Pressable
              onPress={handlePlaceOrder}
              style={({pressed}) => [
                styles.primaryButton,
                pressed ? styles.buttonPressed : null,
              ]}
              disabled={placingOrder}>
              {placingOrder ? (
                <ActivityIndicator color={palette.white} />
              ) : (
                <Text style={styles.primaryButtonText}>Place Order</Text>
              )}
            </Pressable>
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
  loadingWrap: {
    marginTop: 24,
    alignItems: 'center',
  },
  contentWrap: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionLabel: {
    color: '#7f6f51',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 10,
  },
  helperText: {
    color: '#7f6f51',
    marginBottom: 16,
  },
  addressCard: {
    backgroundColor: palette.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 12,
    marginBottom: 10,
  },
  addressCardActive: {
    borderColor: palette.gold,
    backgroundColor: palette.cream,
  },
  addressName: {
    color: palette.charcoal,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  addressLine: {
    color: '#675a43',
    fontSize: 13,
    marginBottom: 2,
  },
  formCard: {
    backgroundColor: palette.cream,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 12,
    marginBottom: 14,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.white,
    paddingHorizontal: 14,
    color: palette.black,
    marginBottom: 10,
  },
  summaryRow: {
    color: palette.charcoal,
    fontSize: 15,
    marginBottom: 8,
  },
  summaryTotal: {
    color: palette.black,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  primaryButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: palette.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: palette.white,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: palette.black,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  secondaryButtonText: {
    color: palette.white,
    fontSize: 15,
    fontWeight: '700',
  },
  buttonPressed: {
    opacity: 0.92,
  },
});

export default CheckoutScreen;
