import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function AccountDescriptionScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account Description</Text>
      <Text style={styles.text}>
        This section provides information about your account, preferences, and activity.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
  },
});

export default AccountDescriptionScreen;