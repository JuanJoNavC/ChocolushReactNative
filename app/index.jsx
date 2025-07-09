import { ActivityIndicator, Button, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'

const Home = () => {
    const router = useRouter();
    let [isLoading, setIsLoading] = useState(true);
    let [error, setError] = useState();
    let [response, setresponse] = useState();
   const getContent = async () => {
    // try {
    //   const response = await fetch('https://jsonplaceholder.typicode.com/posts/1');
    //   const data = await response.json();
    //     console.log('Data fetched:', data);
    // } catch (error) {
    //   console.error('Error fetching data:', error);
    // }
    return <ActivityIndicator size="large" color="#0000ff" />
  };

    useEffect(() => {
    getContent();
  }, []);

  return (
    console.log('Home Component Loaded'),

    <View style={styles.container}>
      <Text>{getContent()}</Text>
      <Text>Welcome to Chocolush React Native App</Text>
      <Button
        title="Go to Home Screen"
        onPress={() => router.push('/screens/IndexScreen')}
        color="#A65300" // Example button color
      />
    </View>
  )
}

export default Home

const styles = StyleSheet.create({
    container:{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
})