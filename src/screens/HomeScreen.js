import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {fetchCategories, fetchFeaturedProducts} from '../services/api';
import {logoImage, palette} from '../theme';

function HomeScreen({navigation, route, cartCount, onLogout, currentUser}) {
  const displayName = currentUser?.profile?.full_name || route.params?.name || 'Guest';
  const displayEmail = currentUser?.email || route.params?.email || `${displayName}@perfume.com`;
  const [categoryCards, setCategoryCards] = useState([]);
  const [featuredProduct, setFeaturedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);

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
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => setMenuVisible(true)}
              style={({pressed}) => [
                styles.menuButton,
                pressed ? styles.menuButtonPressed : null,
              ]}>
              <View style={styles.menuLine} />
              <View style={styles.menuLine} />
              <View style={styles.menuLine} />
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate('Cart')}
              style={({pressed}) => [styles.cartPill, pressed ? styles.cartPillPressed : null]}>
              <Text style={styles.cartText}>Cart {cartCount}</Text>
            </Pressable>
          </View>
          <View style={styles.statusRow}>
            <View style={styles.statusPill}>
              <Text style={styles.statusText}>Signed In</Text>
            </View>
          </View>
        </View>

        <View style={styles.brandShowcase}>
          <Image source={logoImage} style={styles.heroLogo} resizeMode="contain" />
          <Text style={styles.heroEyebrow}>Discover Your</Text>
          <Text style={styles.heroTitle}>Signature Scent</Text>
          <View style={styles.heroDivider} />
          <Text style={styles.heroSubtitle}>
            Luxury fragrances crafted for every moment
          </Text>
        </View>

        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Welcome back!</Text>
          <Text style={styles.welcomeEmail}>{displayEmail}</Text>
                <Text style={styles.welcomePoints}>
                  Loyalty Points: {Number(currentUser?.loyalty_points_balance || 0)}
                </Text>

          <Pressable
            onPress={() => {
              onLogout?.();
              navigation.replace('Login');
            }}
            style={({pressed}) => [styles.button, pressed ? styles.buttonPressed : null]}>
            <Text style={styles.buttonText}>Log Out</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionLabel}>SHOP BY CATEGORY</Text>
        <View style={styles.categoryRow}>
          {categoryCards.map(category => (
            <Pressable
              key={category.title}
              onPress={() =>
                navigation.navigate('ProductList', {category: category.title})
              }
              style={({pressed}) => [
                styles.categoryCard,
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

      <Modal
        animationType="fade"
        transparent
        visible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}>
        <Pressable style={styles.menuOverlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuSheet}>
            <Pressable
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('FAQ');
              }}
              style={styles.menuItem}>
              <Text style={styles.menuItemText}>FAQ</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('LoyaltyPoints');
              }}
              style={styles.menuItem}>
              <Text style={styles.menuItemText}>Loyalty Points</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('Review');
              }}
              style={styles.menuItem}>
              <Text style={styles.menuItemText}>Review</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('OrderHistory');
              }}
              style={styles.menuItem}>
              <Text style={styles.menuItemText}>Orders</Text>
            </Pressable>
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
  topBar: {
    backgroundColor: palette.black,
    paddingTop: 44,
    paddingHorizontal: 16,
    paddingBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerActions: {
    alignItems: 'flex-start',
  },
  statusRow: {
    alignItems: 'flex-end',
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#7c6330',
    backgroundColor: '#2a1a16',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  menuButtonPressed: {
    opacity: 0.9,
  },
  menuLine: {
    width: 18,
    height: 2,
    borderRadius: 999,
    backgroundColor: '#f0dfb1',
    marginVertical: 2,
  },
  statusPill: {
    borderWidth: 1,
    borderColor: palette.gold,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  statusText: {
    color: palette.goldSoft,
    fontSize: 12,
    fontWeight: '700',
  },
  cartPill: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#7c6330',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: '#2a1a16',
  },
  cartPillPressed: {
    opacity: 0.92,
  },
  cartText: {
    color: '#f0dfb1',
    fontSize: 12,
    fontWeight: '700',
  },
  brandShowcase: {
    backgroundColor: palette.black,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 30,
  },
  heroLogo: {
    width: 250,
    height: 138,
    marginBottom: 10,
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
    marginTop: 4,
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
  welcomePoints: {
    color: '#7b6b51',
    fontSize: 14,
    marginBottom: 12,
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
    justifyContent: 'space-between',
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
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    paddingTop: 92,
    paddingHorizontal: 16,
    alignItems: 'flex-start',
  },
  menuSheet: {
    width: 210,
    backgroundColor: palette.cream,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.border,
    overflow: 'hidden',
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  menuItemText: {
    color: palette.charcoal,
    fontSize: 15,
    fontWeight: '700',
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
