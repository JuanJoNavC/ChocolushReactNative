import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function ProductsScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>LogIn Screen</Text>
      <Button title="Go Back" onPress={() => router.back()} />
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold' },
});