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

import ScreenNavActions from '../components/ScreenNavActions';
import {palette} from '../theme';

function ProductDetailScreen({
  navigation,
  route,
  onAddToCart,
  isFavorited,
  onToggleFavorite,
}) {
  const product = route.params?.product;
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [applyOpen, setApplyOpen] = useState(true);
  const favorited = isFavorited?.(product?.id);
  const howToApplySteps = (product?.howToApply || '')
    .split('\n')
    .map(step => step.trim())
    .filter(Boolean);

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
            <ScreenNavActions
              navigation={navigation}
              color={palette.goldSoft}
              style={styles.navActions}
            />
            <View style={styles.headerActions}>
              <Pressable
                onPress={() => navigation.navigate('Cart')}
                style={styles.cartButton}
                hitSlop={8}>
                <Text style={styles.cartButtonText}>Cart</Text>
              </Pressable>
              <Pressable
                onPress={() => onToggleFavorite?.(product)}
                style={[styles.heartButton, favorited ? styles.heartButtonActive : null]}
                hitSlop={8}>
                <Text style={styles.heartIcon}>{favorited ? '❤️' : '🤍'}</Text>
              </Pressable>
            </View>
          </View>
          <Text style={styles.brandText}>PERFUME TREASURE</Text>
        </View>

        <View style={styles.heroSection}>
          <Image source={{uri: product.image}} style={styles.productImage} />

          <View style={styles.contentCard}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
            <Text style={styles.shippingText}>Shipping calculated at checkout.</Text>
            <Text style={styles.fastShipping}>Fast shipping on all orders</Text>

            <View style={styles.divider} />

            <Text style={styles.sectionLabel}>Size</Text>
            <View style={styles.sizePill}>
              <Text style={styles.sizePillText}>
                {product.sizeLabel || '100ml (3.4oz)'}
              </Text>
            </View>

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

            <View style={styles.benefitsList}>
              <Text style={styles.benefitText}>In stock, ready to ship</Text>
              <Text style={styles.benefitText}>Customer satisfaction</Text>
              <Text style={styles.benefitText}>Quality assurance</Text>
              <Text style={styles.benefitText}>Secure checkout</Text>
            </View>

            <Pressable
              onPress={handleAddToCart}
              style={({pressed}) => [
                styles.primaryButton,
                pressed ? styles.buttonPressed : null,
              ]}
              disabled={adding}>
              <Text style={styles.primaryButtonText}>
                {adding ? 'Adding...' : 'Add to Cart'}
              </Text>
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
        </View>

        <View style={styles.accordionWrap}>
          <Pressable
            onPress={() => navigation.navigate('Review', {product})}
            style={styles.accordionHeader}>
            <Text style={styles.accordionTitle}>View Reviews</Text>
            <Text style={styles.accordionIcon}>⌄</Text>
          </Pressable>

          <Pressable
            onPress={() => setDescriptionOpen(current => !current)}
            style={styles.accordionHeader}>
            <Text style={styles.accordionTitle}>Description</Text>
            <Text style={styles.accordionIcon}>{descriptionOpen ? '⌃' : '⌄'}</Text>
          </Pressable>
          {descriptionOpen ? (
            <Text style={styles.accordionBody}>{product.description}</Text>
          ) : null}

          <Pressable
            onPress={() => setApplyOpen(current => !current)}
            style={styles.accordionHeader}>
            <Text style={styles.accordionTitle}>How To Apply</Text>
            <Text style={styles.accordionIcon}>{applyOpen ? '⌃' : '⌄'}</Text>
          </Pressable>
          {applyOpen ? (
            <View style={styles.applyList}>
              {(howToApplySteps.length > 0
                ? howToApplySteps
                : [
                    "Wrist (Don't rub!)",
                    'Neck & Collarbone',
                    'Behind Ears',
                    'Inside Elbows',
                    'Back of Knees',
                  ]
              ).map(step => (
                <Text key={step} style={styles.applyStep}>
                  ◆ {step}
                </Text>
              ))}
            </View>
          ) : null}
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
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  navActions: {
    marginBottom: 0,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cartButton: {
    height: 42,
    paddingHorizontal: 14,
    borderRadius: 21,
    backgroundColor: '#2a1a16',
    borderWidth: 1,
    borderColor: '#7c6330',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartButtonText: {
    color: palette.goldSoft,
    fontSize: 13,
    fontWeight: '700',
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
    height: 360,
    backgroundColor: '#f1e9dc',
    borderRadius: 24,
  },
  heroSection: {
    paddingHorizontal: 14,
    paddingTop: 18,
  },
  contentCard: {
    marginTop: 18,
    backgroundColor: palette.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 18,
  },
  productName: {
    color: palette.charcoal,
    fontSize: 34,
    fontWeight: '700',
    marginBottom: 8,
  },
  productPrice: {
    color: palette.gold,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 10,
  },
  shippingText: {
    color: '#6f6047',
    fontSize: 14,
    marginBottom: 10,
  },
  fastShipping: {
    color: '#6f6047',
    fontSize: 16,
    marginBottom: 14,
  },
  divider: {
    height: 1,
    backgroundColor: palette.border,
    marginBottom: 18,
  },
  sectionLabel: {
    color: '#7f6f51',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  sizePill: {
    alignSelf: 'flex-start',
    minWidth: 150,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    backgroundColor: palette.ivory,
  },
  sizePillText: {
    color: palette.charcoal,
    fontSize: 16,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
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
  benefitsList: {
    marginBottom: 22,
  },
  benefitText: {
    color: '#5d5d5d',
    fontSize: 15,
    marginBottom: 10,
  },
  primaryButton: {
    height: 54,
    borderRadius: 14,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.black,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: palette.black,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    height: 54,
    borderRadius: 14,
    backgroundColor: palette.gold,
    borderWidth: 1,
    borderColor: '#b78f34',
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
  accordionWrap: {
    marginTop: 18,
    marginHorizontal: 14,
    backgroundColor: palette.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: palette.border,
    overflow: 'hidden',
    marginBottom: 28,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  accordionTitle: {
    color: palette.charcoal,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  accordionIcon: {
    color: palette.charcoal,
    fontSize: 22,
  },
  accordionBody: {
    color: '#675a43',
    fontSize: 15,
    lineHeight: 24,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 22,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  applyList: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 22,
  },
  applyStep: {
    color: palette.charcoal,
    fontSize: 16,
    lineHeight: 28,
    marginBottom: 12,
  },
});

export default ProductDetailScreen;
