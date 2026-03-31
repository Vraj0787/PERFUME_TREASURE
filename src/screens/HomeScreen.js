import React from 'react';
import {Image, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {logoImage, palette} from '../theme';

function HomeScreen({navigation, route}) {
  const userName = route.params?.name || 'Guest';
  const categories = [
    {icon: '🌸', title: "Women's", note: 'Floral & Soft'},
    {icon: '🌲', title: "Men's", note: 'Woody & Bold'},
    {icon: '✨', title: 'Unisex', note: 'Fresh & Unique'},
  ];

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
          <View style={styles.statusPill}>
            <Text style={styles.statusText}>Signed In</Text>
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
          <Text style={styles.welcomeEmail}>{route.params?.email || `${userName}@perfume.com`}</Text>

          <Pressable
            onPress={() => navigation.replace('Login')}
            style={({pressed}) => [styles.button, pressed ? styles.buttonPressed : null]}>
            <Text style={styles.buttonText}>Log Out</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionLabel}>SHOP BY CATEGORY</Text>
        <View style={styles.categoryRow}>
          {categories.map(category => (
            <View key={category.title} style={styles.categoryCard}>
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={styles.categoryTitle}>{category.title}</Text>
              <Text style={styles.categoryNote}>{category.note}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>FEATURED FRAGRANCES</Text>
        <View style={styles.featureCard}>
          <View style={styles.featureImage}>
            <Text style={styles.featureEmoji}>🌹</Text>
          </View>
          <View style={styles.featureCopy}>
            <Text style={styles.featureTitle}>Rose Elegante</Text>
            <Text style={styles.featureMeta}>{"Women's · Floral"}</Text>
            <Text style={styles.featureDescription}>
              A timeless bouquet of Bulgarian rose and jasmine.
            </Text>
            <Text style={styles.featurePrice}>$89.00</Text>
          </View>
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
  statusText: {
    color: palette.goldSoft,
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
    justifyContent: 'space-between',
    paddingHorizontal: 14,
  },
  categoryCard: {
    width: '31.5%',
    backgroundColor: '#2a1a16',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6f5427',
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
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: '#251714',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  featureEmoji: {
    fontSize: 28,
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
});

export default HomeScreen;
