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

import {fetchOrder} from '../services/api';
import {palette} from '../theme';

function OrderDetailScreen({navigation, route}) {
  const orderId = route.params?.orderId;
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const loadOrder = async () => {
        if (!orderId) {
          setErrorMessage('Order not found.');
          setLoading(false);
          return;
        }

        try {
          setLoading(true);
          setErrorMessage('');
          const data = await fetchOrder(orderId);
          if (isMounted) {
            setOrder(data);
          }
        } catch (error) {
          if (isMounted) {
            setOrder(null);
            setErrorMessage(error.message || 'Unable to load order details.');
          }
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      };

      loadOrder();

      return () => {
        isMounted = false;
      };
    }, [orderId]),
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
          <Text style={styles.title}>Order Details</Text>
        </View>

        {loading ? (
          <View style={styles.stateWrap}>
            <ActivityIndicator color={palette.gold} />
          </View>
        ) : errorMessage ? (
          <View style={styles.stateWrap}>
            <Text style={styles.stateTitle}>Unable to load order</Text>
            <Text style={styles.stateText}>{errorMessage}</Text>
          </View>
        ) : order ? (
          <View style={styles.contentWrap}>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Order #{order.id}</Text>
              <Text style={styles.metaText}>
                Placed: {new Date(order.created_at).toLocaleString()}
              </Text>
              <Text style={styles.metaText}>Status: {order.status}</Text>
              <Text style={styles.metaText}>Payment: {order.payment_status}</Text>
              <Text style={styles.metaText}>Method: {order.payment_method || 'N/A'}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Shipping Address</Text>
              {order.address ? (
                <>
                  <Text style={styles.metaText}>{order.address.full_name}</Text>
                  <Text style={styles.metaText}>{order.address.line1}</Text>
                  {order.address.line2 ? (
                    <Text style={styles.metaText}>{order.address.line2}</Text>
                  ) : null}
                  <Text style={styles.metaText}>
                    {order.address.city}, {order.address.state || '-'} {order.address.postal_code}
                  </Text>
                  <Text style={styles.metaText}>{order.address.country}</Text>
                </>
              ) : (
                <Text style={styles.metaText}>No address snapshot available.</Text>
              )}
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Items</Text>
              {(order.items || []).map(item => (
                <View key={item.id} style={styles.itemRow}>
                  <View style={styles.itemCopy}>
                    <Text style={styles.itemName}>{item.product_name}</Text>
                    <Text style={styles.metaText}>Qty: {item.quantity}</Text>
                  </View>
                  <Text style={styles.itemPrice}>
                    ${Number(item.unit_price || 0).toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Totals</Text>
              <Text style={styles.metaText}>
                Subtotal: ${Number(order.subtotal || 0).toFixed(2)}
              </Text>
              <Text style={styles.metaText}>
                Shipping: ${Number(order.shipping_amount || 0).toFixed(2)}
              </Text>
              <Text style={styles.metaText}>Tax: ${Number(order.tax_amount || 0).toFixed(2)}</Text>
              <Text style={styles.totalText}>
                Total: ${Number(order.total_amount || 0).toFixed(2)}
              </Text>
              <Text style={styles.pointsText}>
                Points Earned: {Number(order.points_earned || 0)}
              </Text>
            </View>
          </View>
        ) : null}
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
  card: {
    backgroundColor: palette.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 14,
    marginBottom: 12,
  },
  sectionTitle: {
    color: palette.charcoal,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
  },
  metaText: {
    color: '#6f6047',
    fontSize: 13,
    marginBottom: 4,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
    paddingVertical: 10,
  },
  itemCopy: {
    flex: 1,
    marginRight: 8,
  },
  itemName: {
    color: palette.charcoal,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  itemPrice: {
    color: palette.gold,
    fontSize: 14,
    fontWeight: '700',
  },
  totalText: {
    color: palette.charcoal,
    fontSize: 17,
    fontWeight: '700',
    marginTop: 6,
  },
  pointsText: {
    color: '#6f6047',
    fontSize: 13,
    marginTop: 6,
  },
});

export default OrderDetailScreen;
