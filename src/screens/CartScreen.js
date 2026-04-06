import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';

import {
  clearCart,
  fetchCart,
  removeCartItem,
  updateCartItem,
} from '../services/api';
import {palette} from '../theme';

function CartScreen({navigation, onCartUpdated}) {
  const [loading, setLoading] = useState(true);
  const [processingItemId, setProcessingItemId] = useState(null);
  const [cart, setCart] = useState({items: [], totals: null});
  const [errorMessage, setErrorMessage] = useState('');

  const loadCart = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const data = await fetchCart();
      setCart(data);
      onCartUpdated?.(data);
    } catch (error) {
      setErrorMessage(error.message || 'Unable to load cart.');
      setCart({items: [], totals: null});
      onCartUpdated?.({items: []});
    } finally {
      setLoading(false);
    }
  }, [onCartUpdated]);

  useFocusEffect(
    useCallback(() => {
      loadCart();
    }, [loadCart]),
  );

  const handleQuantityChange = async (item, nextQuantity) => {
    if (nextQuantity < 1) {
      return;
    }

    try {
      setProcessingItemId(item.id);
      await updateCartItem(item.id, nextQuantity);
      await loadCart();
    } catch (error) {
      Alert.alert('Update Failed', error.message || 'Unable to update quantity.');
    } finally {
      setProcessingItemId(null);
    }
  };

  const handleRemoveItem = async itemId => {
    try {
      setProcessingItemId(itemId);
      await removeCartItem(itemId);
      await loadCart();
    } catch (error) {
      Alert.alert('Remove Failed', error.message || 'Unable to remove item.');
    } finally {
      setProcessingItemId(null);
    }
  };

  const handleClearCart = () => {
    Alert.alert('Clear Cart', 'Remove all items from your cart?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          try {
            setProcessingItemId('all');
            await clearCart();
            await loadCart();
          } catch (error) {
            Alert.alert('Clear Failed', error.message || 'Unable to clear cart.');
          } finally {
            setProcessingItemId(null);
          }
        },
      },
    ]);
  };

  const itemCount = cart.items.reduce((total, item) => total + item.quantity, 0);

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
          <Text style={styles.title}>Your Cart</Text>
          <Text style={styles.subtitle}>{itemCount} item{itemCount === 1 ? '' : 's'}</Text>
        </View>

        {loading ? (
          <View style={styles.stateWrap}>
            <ActivityIndicator color={palette.gold} />
          </View>
        ) : errorMessage ? (
          <View style={styles.stateWrap}>
            <Text style={styles.stateTitle}>Unable to load cart</Text>
            <Text style={styles.stateText}>{errorMessage}</Text>
            <Text style={styles.hintText}>Your session may have expired. Please log in again.</Text>
            <Pressable
              onPress={() => navigation.replace('Login')}
              style={({pressed}) => [
                styles.errorActionButton,
                pressed ? styles.buttonPressed : null,
              ]}>
              <Text style={styles.errorActionText}>Go to Login</Text>
            </Pressable>
          </View>
        ) : cart.items.length === 0 ? (
          <View style={styles.stateWrap}>
            <Text style={styles.stateTitle}>Your cart is empty</Text>
            <Text style={styles.stateText}>Add fragrances from the collection to continue.</Text>
          </View>
        ) : (
          <View style={styles.contentWrap}>
            {cart.items.map(item => (
              <View key={item.id} style={styles.itemCard}>
                <Image source={{uri: item.product?.image}} style={styles.itemImage} />
                <View style={styles.itemInfo}>
                  <Text numberOfLines={2} style={styles.itemName}>{item.product?.name}</Text>
                  <Text style={styles.itemPrice}>${Number(item.line_total || 0).toFixed(2)}</Text>

                  <View style={styles.quantityRow}>
                    <Pressable
                      onPress={() => handleQuantityChange(item, item.quantity - 1)}
                      style={styles.qtyButton}
                      disabled={processingItemId === item.id}>
                      <Text style={styles.qtyButtonText}>-</Text>
                    </Pressable>
                    <Text style={styles.qtyValue}>{item.quantity}</Text>
                    <Pressable
                      onPress={() => handleQuantityChange(item, item.quantity + 1)}
                      style={styles.qtyButton}
                      disabled={processingItemId === item.id}>
                      <Text style={styles.qtyButtonText}>+</Text>
                    </Pressable>
                  </View>

                  <Pressable onPress={() => handleRemoveItem(item.id)}>
                    <Text style={styles.removeText}>Remove</Text>
                  </Pressable>
                </View>
              </View>
            ))}

            <View style={styles.summaryCard}>
              <Text style={styles.summaryRow}>Subtotal: ${Number(cart.totals?.subtotal || 0).toFixed(2)}</Text>
              <Text style={styles.summaryRow}>Shipping: ${Number(cart.totals?.shipping_amount || 0).toFixed(2)}</Text>
              <Text style={styles.summaryRow}>Tax: ${Number(cart.totals?.tax_amount || 0).toFixed(2)}</Text>
              <Text style={styles.summaryTotal}>Total: ${Number(cart.totals?.total_amount || 0).toFixed(2)}</Text>
            </View>

            <Pressable
              onPress={() => navigation.navigate('Checkout')}
              style={({pressed}) => [styles.primaryButton, pressed ? styles.buttonPressed : null]}>
              <Text style={styles.primaryButtonText}>Proceed to Checkout</Text>
            </Pressable>

            <Pressable
              onPress={handleClearCart}
              style={({pressed}) => [styles.secondaryButton, pressed ? styles.buttonPressed : null]}
              disabled={processingItemId === 'all'}>
              <Text style={styles.secondaryButtonText}>Clear Cart</Text>
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
  subtitle: {
    color: '#dbcda9',
    marginTop: 6,
    fontSize: 14,
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
  hintText: {
    marginTop: 8,
    color: '#7f6f51',
    textAlign: 'center',
    fontSize: 12,
  },
  errorActionButton: {
    marginTop: 14,
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.gold,
  },
  errorActionText: {
    color: palette.white,
    fontSize: 14,
    fontWeight: '700',
  },
  contentWrap: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  itemCard: {
    backgroundColor: palette.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    marginBottom: 12,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  itemImage: {
    width: 112,
    height: 112,
    backgroundColor: '#f1e9dc',
  },
  itemInfo: {
    flex: 1,
    padding: 12,
  },
  itemName: {
    color: palette.charcoal,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  itemPrice: {
    color: palette.gold,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  qtyButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: palette.gold,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.ivory,
  },
  qtyButtonText: {
    color: palette.gold,
    fontSize: 20,
    fontWeight: '700',
    marginTop: -2,
  },
  qtyValue: {
    marginHorizontal: 14,
    color: palette.charcoal,
    fontSize: 18,
    fontWeight: '700',
  },
  removeText: {
    color: '#9f2f2f',
    fontSize: 13,
    fontWeight: '700',
  },
  summaryCard: {
    backgroundColor: palette.cream,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  summaryRow: {
    color: '#6e5f45',
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
    marginBottom: 12,
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

export default CartScreen;
