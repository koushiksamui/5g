import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import PhoneInfoScreen from './PhoneInfoScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <PhoneInfoScreen />
    </SafeAreaProvider>
  );
}
