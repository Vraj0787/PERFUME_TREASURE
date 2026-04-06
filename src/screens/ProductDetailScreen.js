import React, {useState} from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {palette} from '../theme';

function ProductDetailScreen({navigation, route, onAddToCart, isFavorited, onToggleFavorite}) {
  const product = route.params?.product;
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const favorited = isFavorited?.(product?.id);

  if (!product) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Product not found.</Text>
      </View>
    );
  }

  const handleDecrease = () => {
    setQuantity(currentQuantity => Math.max(1, currentQuantity - 1));
  };

  const handleIncrease = () => {
    setQuantity(currentQuantity => currentQuantity + 1);
  };

  const handleAddToCart = async () => {
    try {
      setAdding(true);
      await onAddToCart(product, quantity);
      Alert.alert('Added to Cart', `${quantity} x ${product.name} added to your cart.`);
    } catch (error) {
      Alert.alert('Add to Cart Failed', error.message || 'Unable to add item to cart.');
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    try {
      setAdding(true);
      await onAddToCart(product, quantity);
      navigation.navigate('Cart');
    } catch (error) {
      Alert.alert('Buy Now Failed', error.message || 'Unable to continue to checkout.');
    } finally {
      setAdding(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => navigation.goBack()}>
              <Text style={styles.backText}>Back</Text>
            </Pressable>
            <Pressable
              onPress={() => onToggleFavorite?.(product)}
              style={[styles.heartButton, favorited ? styles.heartButtonActive : null]}
              hitSlop={8}>
              <Text style={styles.heartIcon}>
                {favorited ? '❤️' : '🤍'}
              </Text>
            </Pressable>
          </View>
          <Text style={styles.brandText}>PERFUME TREASURE</Text>
        </View>

        <Image source={{uri: product.image}} style={styles.productImage} />

        <View style={styles.contentCard}>
          <Text style={styles.categoryText}>{product.category}</Text>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
          <Text style={styles.description}>{product.description}</Text>

          <Text style={styles.sectionLabel}>Quantity</Text>
          <View style={styles.quantityRow}>
            <Pressable onPress={handleDecrease} style={styles.quantityButton}>
              <Text style={styles.quantityButtonText}>-</Text>
            </Pressable>
            <View style={styles.quantityValueWrap}>
              <Text style={styles.quantityValue}>{quantity}</Text>
            </View>
            <Pressable onPress={handleIncrease} style={styles.quantityButton}>
              <Text style={styles.quantityButtonText}>+</Text>
            </Pressable>
          </View>

          <Pressable
            onPress={handleAddToCart}
            style={({pressed}) => [
              styles.primaryButton,
              pressed ? styles.buttonPressed : null,
            ]}
            disabled={adding}>
            <Text style={styles.primaryButtonText}>{adding ? 'Adding...' : 'Add to Cart'}</Text>
          </Pressable>

          <Pressable
            onPress={handleBuyNow}
            style={({pressed}) => [
              styles.secondaryButton,
              pressed ? styles.buttonPressed : null,
            ]}
            disabled={adding}>
            <Text style={styles.secondaryButtonText}>Buy Now</Text>
          </Pressable>
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.ivory,
  },
  emptyText: {
    color: palette.charcoal,
    fontSize: 18,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    backgroundColor: palette.black,
    paddingTop: 46,
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  heartButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartButtonActive: {
    backgroundColor: '#fff0f0',
    borderColor: '#f8cece',
  },
  heartIcon: {
    fontSize: 22,
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
  },
  productImage: {
    width: '100%',
    height: 340,
    backgroundColor: '#f1e9dc',
  },
  contentCard: {
    marginHorizontal: 14,
    marginTop: -24,
    backgroundColor: palette.cream,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 18,
  },
  categoryText: {
    color: '#8e7a53',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  productName: {
    color: palette.charcoal,
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 8,
  },
  productPrice: {
    color: palette.gold,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 14,
  },
  description: {
    color: '#756a57',
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 22,
  },
  sectionLabel: {
    color: '#7f6f51',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 12,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },
  quantityButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.gold,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.ivory,
  },
  quantityButtonText: {
    color: palette.gold,
    fontSize: 24,
    fontWeight: '700',
    marginTop: -2,
  },
  quantityValueWrap: {
    width: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityValue: {
    color: palette.charcoal,
    fontSize: 22,
    fontWeight: '700',
  },
  primaryButton: {
    height: 54,
    borderRadius: 14,
    backgroundColor: palette.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: palette.white,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    height: 54,
    borderRadius: 14,
    backgroundColor: palette.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: palette.white,
    fontSize: 16,
    fontWeight: '700',
  },
  buttonPressed: {
    opacity: 0.92,
  },
});

export default ProductDetailScreen;