import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Slider from '@react-native-community/slider';

import {fetchProducts} from '../services/api';
import {palette} from '../theme';

const sortOptions = [
  {label: 'Featured', value: 'featured'},
  {label: 'Most relevant', value: 'relevance'},
  {label: 'Best selling', value: 'best_selling'},
  {label: 'Alphabetically, A-Z', value: 'name_asc'},
  {label: 'Alphabetically, Z-A', value: 'name_desc'},
  {label: 'Price, low to high', value: 'price_asc'},
  {label: 'Price, high to low', value: 'price_desc'},
  {label: 'Date, old to new', value: 'date_asc'},
  {label: 'Date, new to old', value: 'date_desc'},
];

function ProductListScreen({navigation, route, isFavorited, onToggleFavorite}) {
  const selectedCategory = route.params?.category || 'Shop All';
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('best_selling');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [sortVisible, setSortVisible] = useState(false);
  const [priceRange, setPriceRange] = useState({min: 0, max: 250});

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
          minPrice: priceRange.min,
          maxPrice: priceRange.max,
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
  }, [priceRange.max, priceRange.min, searchQuery, selectedCategory, sortBy]);

  const filteredProducts = useMemo(() => {
    return products;
  }, [products]);

  const selectedSortLabel =
    sortOptions.find(option => option.value === sortBy)?.label || 'Best selling';

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

          <View style={styles.controlHeader}>
            <Text style={styles.sortLabel}>Sort</Text>
            <Pressable
              onPress={() => setSortVisible(true)}
              style={({pressed}) => [
                styles.sortTrigger,
                pressed ? styles.sortTriggerPressed : null,
              ]}>
              <Text style={styles.sortTriggerText}>{selectedSortLabel}</Text>
            </Pressable>
          </View>

          <View style={styles.priceHeader}>
            <Text style={styles.sortLabel}>Price Range</Text>
            <Text style={styles.priceSummary}>
              ${priceRange.min} - ${priceRange.max}
            </Text>
          </View>
          <View style={styles.sliderBlock}>
            <Text style={styles.sliderCaption}>Minimum</Text>
            <Slider
              minimumValue={0}
              maximumValue={250}
              step={1}
              minimumTrackTintColor={palette.gold}
              maximumTrackTintColor={palette.border}
              thumbTintColor={palette.gold}
              value={priceRange.min}
              onValueChange={value =>
                setPriceRange(current => ({
                  ...current,
                  min: Math.min(value, current.max),
                }))
              }
            />
            <Text style={styles.sliderCaption}>Maximum</Text>
            <Slider
              minimumValue={0}
              maximumValue={250}
              step={1}
              minimumTrackTintColor={palette.gold}
              maximumTrackTintColor={palette.border}
              thumbTintColor={palette.gold}
              value={priceRange.max}
              onValueChange={value =>
                setPriceRange(current => ({
                  ...current,
                  max: Math.max(value, current.min),
                }))
              }
            />
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
                <View style={styles.productInfoRow}>
                  <View style={styles.productTextWrap}>
                    <Text style={styles.productCategory}>{product.category}</Text>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
                  </View>
                  <Pressable
                    onPress={event => {
                      event.stopPropagation?.();
                      onToggleFavorite?.(product);
                    }}
                    style={styles.heartButton}
                    hitSlop={8}>
                    <Text style={styles.heartIcon}>
                      {isFavorited?.(product.id) ? '❤️' : '🤍'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>

      <Modal
        visible={sortVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSortVisible(false)}>
        <Pressable
          style={styles.sortOverlay}
          onPress={() => setSortVisible(false)}>
          <View style={styles.sortSheet}>
            <Text style={styles.sortSheetTitle}>Sort</Text>
            {sortOptions.map(option => {
              const isSelected = sortBy === option.value;

              return (
                <Pressable
                  key={option.label}
                  onPress={() => {
                    setSortBy(option.value);
                    setSortVisible(false);
                  }}
                  style={styles.sortSheetItem}>
                  <Text style={styles.sortSheetCheck}>
                    {isSelected ? '✓' : ' '}
                  </Text>
                  <Text style={styles.sortSheetText}>{option.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
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
    marginBottom: 8,
  },
  controlHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sortTrigger: {
    flexShrink: 1,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sortTriggerPressed: {
    opacity: 0.9,
  },
  sortTriggerText: {
    color: '#6c5f47',
    fontSize: 12,
    fontWeight: '700',
  },
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceSummary: {
    color: palette.charcoal,
    fontSize: 13,
    fontWeight: '700',
  },
  sliderBlock: {
    paddingTop: 4,
  },
  sliderCaption: {
    color: '#8b7d63',
    fontSize: 12,
  },
  sortOverlay: {
    flex: 1,
    backgroundColor: 'rgba(18, 18, 18, 0.45)',
    justifyContent: 'center',
    padding: 18,
  },
  sortSheet: {
    backgroundColor: '#5f5f5f',
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  sortSheetTitle: {
    color: palette.white,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  sortSheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  sortSheetCheck: {
    width: 22,
    color: palette.white,
    fontSize: 16,
    fontWeight: '700',
  },
  sortSheetText: {
    color: palette.white,
    fontSize: 17,
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
  productInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  productTextWrap: {
    flex: 1,
    marginRight: 10,
  },
  heartButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: palette.ivory,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  heartIcon: {
    fontSize: 20,
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
