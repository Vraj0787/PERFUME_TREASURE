import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';

import {fetchOrders} from '../services/api';
import {palette} from '../theme';

function OrderHistoryScreen({navigation}) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const result = await fetchOrders();
      setOrders(result);
    } catch (error) {
      setOrders([]);
      setErrorMessage(error.message || 'Unable to load orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders]),
  );

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
          <Text style={styles.title}>Order History</Text>
        </View>

        {loading ? (
          <View style={styles.stateWrap}>
            <ActivityIndicator color={palette.gold} />
          </View>
        ) : errorMessage ? (
          <View style={styles.stateWrap}>
            <Text style={styles.stateTitle}>Unable to load orders</Text>
            <Text style={styles.stateText}>{errorMessage}</Text>
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.stateWrap}>
            <Text style={styles.stateTitle}>No orders yet</Text>
            <Text style={styles.stateText}>Your completed checkouts will appear here.</Text>
          </View>
        ) : (
          <View style={styles.contentWrap}>
            {orders.map(order => (
              <Pressable
                key={order.id}
                onPress={() => navigation.navigate('OrderDetail', {orderId: order.id})}
                style={({pressed}) => [
                  styles.orderCard,
                  pressed ? styles.orderCardPressed : null,
                ]}>
                <Text style={styles.orderId}>Order #{order.id}</Text>
                <Text style={styles.orderMeta}>
                  Placed: {new Date(order.created_at).toLocaleString()}
                </Text>
                <Text style={styles.orderMeta}>Status: {order.status}</Text>
                <Text style={styles.orderMeta}>Payment: {order.payment_status}</Text>
                <Text style={styles.orderTotal}>
                  Total: ${Number(order.total_amount || 0).toFixed(2)}
                </Text>
              </Pressable>
            ))}
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
  },
  contentWrap: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  orderCard: {
    backgroundColor: palette.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 14,
    marginBottom: 10,
  },
  orderCardPressed: {
    opacity: 0.9,
  },
  orderId: {
    color: palette.charcoal,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  orderMeta: {
    color: '#6f6047',
    fontSize: 13,
    marginBottom: 3,
  },
  orderTotal: {
    color: palette.gold,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
});

export default OrderHistoryScreen;