import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {fetchCategories, fetchFeaturedProducts} from '../services/api';
import {logoImage, palette} from '../theme';

function HomeScreen({navigation, route, cartCount}) {
  const userName = route.params?.name || 'Guest';
  const [categoryCards, setCategoryCards] = useState([]);
  const [featuredProduct, setFeaturedProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadHomeData = async () => {
      try {
        const [categoryResponse, featuredResponse] = await Promise.all([
          fetchCategories(),
          fetchFeaturedProducts(),
        ]);

        if (!isMounted) {
          return;
        }

        const iconMap = {
          Men: '🌲',
          Women: '🌸',
          Sets: '🎁',
          'Shop All': '🛍️',
        };

        const noteMap = {
          Men: 'Woody & Bold',
          Women: 'Floral & Soft',
          Sets: 'Curated Gifts',
          'Shop All': 'Entire Collection',
        };

        setCategoryCards(
          categoryResponse.map(category => ({
            icon: iconMap[category.name] || '🛍️',
            title: category.name,
            note: noteMap[category.name] || 'Luxury Fragrances',
          })),
        );
        setFeaturedProduct(featuredResponse[0] || null);
      } catch (_error) {
        if (!isMounted) {
          return;
        }

        setCategoryCards([
          {icon: '🌲', title: 'Men', note: 'Woody & Bold'},
          {icon: '🌸', title: 'Women', note: 'Floral & Soft'},
          {icon: '🎁', title: 'Sets', note: 'Curated Gifts'},
          {icon: '🛍️', title: 'Shop All', note: 'Entire Collection'},
        ]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadHomeData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <View style={styles.brandWrap}>
            <Image source={logoImage} style={styles.logo} resizeMode="contain" />
            <View>
              <Text style={styles.brandName}>PERFUME TREASURE</Text>
              <Text style={styles.brandTag}>Fine Fragrances</Text>
            </View>
          </View>
          <View style={styles.statusRow}>
            <View style={styles.statusPill}>
              <Text style={styles.statusText}>Signed In</Text>
            </View>
            <View style={styles.cartPill}>
              <Text style={styles.cartText}>Cart {cartCount}</Text>
            </View>
          </View>
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroEyebrow}>Discover Your</Text>
          <Text style={styles.heroTitle}>Signature Scent</Text>
          <View style={styles.heroDivider} />
          <Text style={styles.heroSubtitle}>
            Luxury fragrances crafted for every moment
          </Text>
        </View>

        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Welcome back!</Text>
          <Text style={styles.welcomeEmail}>
            {route.params?.email || `${userName}@perfume.com`}
          </Text>

          <Pressable
            onPress={() => navigation.replace('Login')}
            style={({pressed}) => [styles.button, pressed ? styles.buttonPressed : null]}>
            <Text style={styles.buttonText}>Log Out</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionLabel}>SHOP BY CATEGORY</Text>
        <View style={styles.categoryRow}>
          {categoryCards.map((category, index) => (
            <Pressable
              key={category.title}
              onPress={() =>
                navigation.navigate('ProductList', {category: category.title})
              }
              style={({pressed}) => [
                styles.categoryCard,
                index === categoryCards.length - 1 ? styles.categoryCardFull : null,
                pressed ? styles.categoryCardPressed : null,
              ]}>
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={styles.categoryTitle}>{category.title}</Text>
              <Text style={styles.categoryNote}>{category.note}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionLabel}>FEATURED FRAGRANCES</Text>
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={palette.gold} />
          </View>
        ) : featuredProduct ? (
          <Pressable
            onPress={() =>
              navigation.navigate('ProductDetail', {
                product: featuredProduct,
              })
            }
            style={({pressed}) => [
              styles.featureCard,
              pressed ? styles.featureCardPressed : null,
            ]}>
            <Image source={{uri: featuredProduct.image}} style={styles.featureImage} />
            <View style={styles.featureCopy}>
              <Text style={styles.featureTitle}>{featuredProduct.name}</Text>
              <Text style={styles.featureMeta}>{featuredProduct.category}</Text>
              <Text numberOfLines={2} style={styles.featureDescription}>
                {featuredProduct.description}
              </Text>
              <Text style={styles.featurePrice}>${featuredProduct.price.toFixed(2)}</Text>
            </View>
          </Pressable>
        ) : (
          <View style={styles.loadingWrap}>
            <Text style={styles.emptyText}>Featured fragrances will appear here.</Text>
          </View>
        )}

        <Text style={styles.sectionLabel}>QUICK SHOP</Text>
        <View style={styles.quickShopWrap}>
          {categoryCards.map(category => (
            <Pressable
              key={category.title}
              onPress={() => navigation.navigate('ProductList', {category: category.title})}
              style={({pressed}) => [
                styles.quickShopChip,
                pressed ? styles.quickShopChipPressed : null,
              ]}>
              <Text style={styles.quickShopText}>{category.title}</Text>
            </Pressable>
          ))}
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
  scrollContent: {
    paddingBottom: 28,
  },
  topBar: {
    backgroundColor: palette.black,
    paddingTop: 44,
    paddingHorizontal: 16,
    paddingBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  logo: {
    width: 58,
    height: 40,
    marginRight: 10,
  },
  brandName: {
    color: palette.goldSoft,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  brandTag: {
    color: '#eadcbb',
    fontSize: 11,
    marginTop: 1,
  },
  statusPill: {
    borderWidth: 1,
    borderColor: palette.gold,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  statusRow: {
    alignItems: 'flex-end',
  },
  statusText: {
    color: palette.goldSoft,
    fontSize: 12,
    fontWeight: '700',
  },
  cartPill: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#7c6330',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: '#2a1a16',
  },
  cartText: {
    color: '#f0dfb1',
    fontSize: 12,
    fontWeight: '700',
  },
  hero: {
    backgroundColor: palette.black,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 30,
  },
  heroEyebrow: {
    color: '#eadcbb',
    fontSize: 18,
    fontStyle: 'italic',
    marginBottom: 6,
  },
  heroTitle: {
    color: palette.gold,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  heroDivider: {
    width: 64,
    height: 2,
    borderRadius: 999,
    backgroundColor: '#a8863e',
    marginBottom: 12,
  },
  heroSubtitle: {
    color: '#eadcbb',
    fontSize: 14,
    textAlign: 'center',
  },
  welcomeCard: {
    marginHorizontal: 14,
    marginTop: 14,
    backgroundColor: palette.cream,
    borderWidth: 1,
    borderColor: palette.gold,
    borderRadius: 16,
    padding: 16,
  },
  welcomeTitle: {
    color: palette.charcoal,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  welcomeEmail: {
    color: '#8b7d63',
    fontSize: 14,
    marginBottom: 14,
  },
  button: {
    height: 52,
    borderRadius: 14,
    backgroundColor: palette.ivory,
    borderWidth: 1,
    borderColor: palette.gold,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonText: {
    color: palette.gold,
    fontSize: 16,
    fontWeight: '700',
  },
  sectionLabel: {
    color: '#8e7a53',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.4,
    textAlign: 'center',
    marginTop: 18,
    marginBottom: 10,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
  },
  categoryCard: {
    width: '48.5%',
    backgroundColor: '#2a1a16',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6f5427',
    marginBottom: 10,
  },
  categoryCardFull: {
    width: '100%',
  },
  categoryCardPressed: {
    opacity: 0.9,
  },
  categoryIcon: {
    fontSize: 22,
    marginBottom: 10,
  },
  categoryTitle: {
    color: palette.white,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  categoryNote: {
    color: '#dbcda9',
    fontSize: 10,
    textAlign: 'center',
  },
  featureCardPressed: {
    opacity: 0.95,
  },
  featureCard: {
    marginHorizontal: 14,
    backgroundColor: palette.white,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ede3ca',
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  featureImage: {
    width: 72,
    height: 72,
    borderRadius: 10,
    marginRight: 14,
    backgroundColor: '#f1e9dc',
  },
  featureCopy: {
    flex: 1,
  },
  featureTitle: {
    color: palette.charcoal,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  featureMeta: {
    color: '#8e7a53',
    fontSize: 13,
    marginBottom: 6,
  },
  featureDescription: {
    color: '#756a57',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  featurePrice: {
    color: palette.gold,
    fontSize: 20,
    fontWeight: '700',
  },
  loadingWrap: {
    marginHorizontal: 14,
    paddingVertical: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.cream,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
  },
  emptyText: {
    color: '#8b7d63',
    fontSize: 14,
  },
  quickShopWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    marginTop: 2,
  },
  quickShopChip: {
    backgroundColor: palette.cream,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginRight: 10,
    marginBottom: 10,
  },
  quickShopChipPressed: {
    opacity: 0.92,
  },
  quickShopText: {
    color: '#6f5f44',
    fontSize: 13,
    fontWeight: '700',
  },
});

export default HomeScreen;
