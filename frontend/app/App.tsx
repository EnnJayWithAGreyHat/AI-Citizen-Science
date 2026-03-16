import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import Prompt from './components/Prompt';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Prompt />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f7f4',
  },
});
