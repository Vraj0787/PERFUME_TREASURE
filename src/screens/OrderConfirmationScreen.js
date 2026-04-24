import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import {palette} from '../theme';

function formatStatusLabel(value) {
  return (value || 'pending')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, character => character.toUpperCase());
}

function OrderConfirmationScreen({navigation, route}) {
  const order = route.params?.order;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Order Confirmed</Text>
        <Text style={styles.subtitle}>
          Thank you for shopping with Perfume Treasure.
        </Text>
        <Text style={styles.helperText}>
          Your order has been received and payment will be confirmed in the next fulfillment step.
        </Text>

        <View style={styles.summary}>
          <Text style={styles.summaryLine}>Order ID: #{order?.id || '-'}</Text>
          <Text style={styles.summaryLine}>
            Status: {formatStatusLabel(order?.status)}
          </Text>
          <Text style={styles.summaryLine}>
            Payment: {formatStatusLabel(order?.payment_status)}
          </Text>
          <Text style={styles.summaryLine}>
            Points Earned: {Number(order?.points_earned || 0)}
          </Text>
          <Text style={styles.summaryTotal}>
            Total: ${Number(order?.total_amount || 0).toFixed(2)}
          </Text>
        </View>

        <Pressable
          onPress={() => navigation.replace('OrderHistory')}
          style={({pressed}) => [
            styles.primaryButton,
            pressed ? styles.buttonPressed : null,
          ]}>
          <Text style={styles.primaryButtonText}>View Order History</Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.reset({index: 0, routes: [{name: 'Home'}]})}
          style={({pressed}) => [
            styles.secondaryButton,
            pressed ? styles.buttonPressed : null,
          ]}>
          <Text style={styles.secondaryButtonText}>Back to Home</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.ivory,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.cream,
    padding: 20,
  },
  title: {
    color: palette.charcoal,
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: '#6f6047',
    fontSize: 14,
    marginBottom: 8,
  },
  helperText: {
    color: '#6f6047',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 14,
  },
  summary: {
    backgroundColor: palette.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 14,
    marginBottom: 14,
  },
  summaryLine: {
    color: '#6f6047',
    fontSize: 14,
    marginBottom: 6,
  },
  summaryTotal: {
    color: palette.charcoal,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  primaryButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: palette.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  primaryButtonText: {
    color: palette.white,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: palette.black,
    fontSize: 16,
    fontWeight: '700',
  },
  buttonPressed: {
    opacity: 0.92,
  },
});

export default OrderConfirmationScreen;
