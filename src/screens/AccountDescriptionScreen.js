import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function AccountDescriptionScreen({ route }) {
  const user = route.params?.user;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account Description</Text>

      <Text style={styles.text}>
        Name: {user?.name || 'N/A'}
      </Text>

      <Text style={styles.text}>
        Email: {user?.email || 'N/A'}
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