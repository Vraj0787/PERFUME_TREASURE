import React from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';

import {palette} from '../theme';

function LoyaltyPointsScreen({navigation}) {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>

        <Text style={styles.eyebrow}>PERFUME TREASURE</Text>
        <Text style={styles.title}>Loyalty Points</Text>
        <Text style={styles.subtitle}>
          Reward your fragrance journey with points on every purchase.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Current Balance</Text>
          <Text style={styles.pointsValue}>320 Points</Text>
          <Text style={styles.cardNote}>
            Keep shopping to unlock exclusive samples, member pricing, and gift sets.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>How It Works</Text>
          <Text style={styles.listItem}>Earn 1 point for every $1 spent.</Text>
          <Text style={styles.listItem}>Redeem points on future orders and seasonal rewards.</Text>
          <Text style={styles.listItem}>Exclusive launches may include bonus point events.</Text>
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
  content: {
    paddingHorizontal: 18,
    paddingTop: 46,
    paddingBottom: 28,
  },
  backText: {
    color: palette.gold,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 16,
  },
  eyebrow: {
    color: palette.gold,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.4,
    marginBottom: 10,
  },
  title: {
    color: palette.charcoal,
    fontSize: 34,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: '#7b6b51',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  card: {
    backgroundColor: palette.cream,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
  },
  cardTitle: {
    color: palette.charcoal,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
  },
  pointsValue: {
    color: palette.gold,
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 10,
  },
  cardNote: {
    color: '#7b6b51',
    fontSize: 14,
    lineHeight: 21,
  },
  listItem: {
    color: '#7b6b51',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 8,
  },
});

export default LoyaltyPointsScreen;
