import React, {useEffect, useState} from 'react';
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

import ScreenNavActions from '../components/ScreenNavActions';
import {fetchProducts} from '../services/api';
import {palette} from '../theme';

function FavoritesScreen({navigation, onAddToCart, favoritesIds, onToggleFavorite}) {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError('');
        const products = await fetchProducts();
        setAllProducts(products);
      } catch (err) {
        setError(err.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const favoritedProducts = allProducts.filter(product =>
    favoritesIds.includes(product.id),
  );

  const handleQuickAddToCart = async product => {
    try {
      await onAddToCart(product, 1);
      Alert.alert('Added to Cart', `${product.name} added to your cart.`);
    } catch (cartError) {
      Alert.alert(
        'Add to Cart Failed',
        cartError.message || 'Unable to add item to cart.',
      );
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
          <Text style={styles.headerBrand}>PERFUME TREASURE</Text>
          <Text style={styles.headerTitle}>My Favorites</Text>
        </View>

        {loading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator color={palette.gold} />
          </View>
        ) : error ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Unable to load favorites</Text>
            <Text style={styles.emptyText}>{error}</Text>
          </View>
        ) : favoritedProducts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyHeart}>🤍</Text>
            <Text style={styles.emptyTitle}>No favorites yet</Text>
            <Text style={styles.emptyText}>
              Tap the heart on any product to save it here.
            </Text>
            <Pressable
              onPress={() => navigation.navigate('ProductList', {category: 'Shop All'})}
              style={({pressed}) => [
                styles.browseButton,
                pressed ? styles.browseButtonPressed : null,
              ]}>
              <Text style={styles.browseButtonText}>Browse Collection</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Text style={styles.resultsSubtitle}>
              {favoritedProducts.length} saved fragrance
              {favoritedProducts.length === 1 ? '' : 's'}
            </Text>
            {favoritedProducts.map(product => (
              <Pressable
                key={product.id}
                onPress={() => navigation.navigate('ProductDetail', {product})}
                style={({pressed}) => [
                  styles.productCard,
                  pressed ? styles.productCardPressed : null,
                ]}>
                <Image source={{uri: product.image}} style={styles.productImage} />
                <View style={styles.productInfo}>
                  <View style={styles.productTopRow}>
                    <View style={styles.productTextWrap}>
                      <Text style={styles.productCategory}>{product.category}</Text>
                      <Text style={styles.productName}>{product.name}</Text>
                      <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
                    </View>
                    <Pressable
                      onPress={event => {
                        event.stopPropagation?.();
                        onToggleFavorite(product);
                      }}
                      style={styles.heartButton}
                      hitSlop={8}>
                      <Text style={styles.heartIcon}>❤️</Text>
                    </Pressable>
                  </View>
                  <Pressable
                    onPress={event => {
                      event.stopPropagation?.();
                      handleQuickAddToCart(product);
                    }}
                    style={({pressed}) => [
                      styles.addToCartButton,
                      pressed ? styles.addToCartButtonPressed : null,
                    ]}>
                    <Text style={styles.addToCartText}>+ Add to Cart</Text>
                  </Pressable>
                </View>
              </Pressable>
            ))}
          </>
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
    paddingBottom: 32,
  },
  header: {
    backgroundColor: palette.black,
    paddingTop: 46,
    paddingHorizontal: 18,
    paddingBottom: 24,
  },
  backText: {
    color: palette.goldSoft,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 14,
  },
  headerBrand: {
    color: palette.goldSoft,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  headerTitle: {
    color: palette.white,
    fontSize: 34,
    fontWeight: '700',
  },
  resultsSubtitle: {
    color: '#8b7d63',
    fontSize: 14,
    marginTop: 16,
    marginBottom: 4,
    marginHorizontal: 16,
  },
  emptyState: {
    marginHorizontal: 16,
    marginTop: 40,
    backgroundColor: palette.cream,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 32,
    alignItems: 'center',
  },
  emptyHeart: {
    fontSize: 48,
    marginBottom: 14,
  },
  emptyTitle: {
    color: palette.charcoal,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    color: '#8b7d63',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  browseButton: {
    height: 50,
    borderRadius: 14,
    backgroundColor: palette.gold,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  browseButtonPressed: {
    opacity: 0.9,
  },
  browseButtonText: {
    color: palette.white,
    fontSize: 15,
    fontWeight: '700',
  },
  productCard: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: palette.white,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ede3ca',
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  productCardPressed: {
    opacity: 0.94,
  },
  productImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f1e9dc',
  },
  productInfo: {
    padding: 16,
  },
  productTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  productTextWrap: {
    flex: 1,
    marginRight: 12,
  },
  productCategory: {
    color: '#8e7a53',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  productName: {
    color: palette.charcoal,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  productPrice: {
    color: palette.gold,
    fontSize: 18,
    fontWeight: '700',
  },
  heartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff0f0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f8cece',
  },
  heartIcon: {
    fontSize: 18,
  },
  addToCartButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: palette.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToCartButtonPressed: {
    opacity: 0.9,
  },
  addToCartText: {
    color: palette.white,
    fontSize: 15,
    fontWeight: '700',
  },
});

export default FavoritesScreen;
