import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {fetchProducts} from '../services/api';
import {palette} from '../theme';

const sortOptions = [
  {label: 'Price Low-High', value: 'price_asc'},
  {label: 'Price High-Low', value: 'price_desc'},
  {label: 'Name A-Z', value: 'name_asc'},
];

function ProductListScreen({navigation, route}) {
  const selectedCategory = route.params?.category || 'Shop All';
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('price_asc');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        setLoading(true);
        setErrorMessage('');
        const result = await fetchProducts({
          category: selectedCategory,
          search: searchQuery,
          sort: sortBy,
        });

        if (isMounted) {
          setProducts(result);
        }
      } catch (error) {
        if (isMounted) {
          setProducts([]);
          setErrorMessage(error.message || 'Unable to load products.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [searchQuery, selectedCategory, sortBy]);

  const filteredProducts = useMemo(() => {
    return products;
  }, [products]);

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
          <Text style={styles.headerBrand}>PERFUME TREASURE</Text>
          <Text style={styles.headerTitle}>Browse Collection</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{selectedCategory}</Text>
          </View>
        </View>

        <View style={styles.controlsCard}>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setSearchQuery}
            placeholder="Search by fragrance name"
            placeholderTextColor={palette.textMuted}
            style={styles.searchInput}
            value={searchQuery}
          />

          <Text style={styles.sortLabel}>Sort By</Text>
          <View style={styles.sortRow}>
            {sortOptions.map(option => {
              const isSelected = sortBy === option.value;

              return (
                <Pressable
                  key={option.value}
                  onPress={() => setSortBy(option.value)}
                  style={[
                    styles.sortChip,
                    isSelected ? styles.sortChipActive : null,
                  ]}>
                  <Text
                    style={[
                      styles.sortChipText,
                      isSelected ? styles.sortChipTextActive : null,
                    ]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Text style={styles.resultsTitle}>{selectedCategory}</Text>
        <Text style={styles.resultsSubtitle}>
          {filteredProducts.length} fragrance
          {filteredProducts.length === 1 ? '' : 's'} available
        </Text>

        {loading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator color={palette.gold} />
          </View>
        ) : errorMessage ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Unable to load products</Text>
            <Text style={styles.emptyText}>{errorMessage}</Text>
          </View>
        ) : filteredProducts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No products found</Text>
            <Text style={styles.emptyText}>
              Try a different search term or switch to another category.
            </Text>
          </View>
        ) : (
          filteredProducts.map(product => (
            <Pressable
              key={product.id}
              onPress={() => navigation.navigate('ProductDetail', {product})}
              style={({pressed}) => [
                styles.productCard,
                pressed ? styles.productCardPressed : null,
              ]}>
              <Image source={{uri: product.image}} style={styles.productImage} />
              <View style={styles.productInfo}>
                <Text style={styles.productCategory}>{product.category}</Text>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
              </View>
            </Pressable>
          ))
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
    marginBottom: 14,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#2a1a16',
    borderWidth: 1,
    borderColor: palette.gold,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  categoryBadgeText: {
    color: palette.goldSoft,
    fontSize: 13,
    fontWeight: '700',
  },
  controlsCard: {
    marginHorizontal: 14,
    marginTop: 14,
    padding: 16,
    backgroundColor: palette.cream,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 18,
  },
  searchInput: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.white,
    paddingHorizontal: 16,
    color: palette.black,
    fontSize: 15,
    marginBottom: 14,
  },
  sortLabel: {
    color: '#7f6f51',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 10,
  },
  sortRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sortChip: {
    backgroundColor: palette.ivory,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  sortChipActive: {
    backgroundColor: palette.gold,
    borderColor: palette.gold,
  },
  sortChipText: {
    color: '#6c5f47',
    fontSize: 12,
    fontWeight: '700',
  },
  sortChipTextActive: {
    color: palette.white,
  },
  resultsTitle: {
    color: palette.charcoal,
    fontSize: 26,
    fontWeight: '700',
    marginTop: 20,
    marginHorizontal: 16,
  },
  resultsSubtitle: {
    color: '#8b7d63',
    fontSize: 14,
    marginTop: 4,
    marginBottom: 12,
    marginHorizontal: 16,
  },
  emptyState: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: palette.cream,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    color: palette.charcoal,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    color: '#8b7d63',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
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
    height: 220,
    backgroundColor: '#f1e9dc',
  },
  productInfo: {
    padding: 16,
  },
  productCategory: {
    color: '#8e7a53',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 6,
  },
  productName: {
    color: palette.charcoal,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  productPrice: {
    color: palette.gold,
    fontSize: 20,
    fontWeight: '700',
  },
});

export default ProductListScreen;
