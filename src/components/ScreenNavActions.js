import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

function ScreenNavActions({navigation, color, style}) {
  return (
    <View style={[styles.row, style]}>
      <Pressable onPress={() => navigation.goBack()}>
        <Text style={[styles.linkText, {color}]}>Back</Text>
      </Pressable>
      <Pressable
        onPress={() => navigation.reset({index: 0, routes: [{name: 'Home'}]})}>
        <Text style={[styles.linkText, {color}]}>Home</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 14,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '700',
  },
});

export default ScreenNavActions;
