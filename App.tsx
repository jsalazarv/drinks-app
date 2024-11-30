import React from 'react';
import {StatusBar, useColorScheme} from 'react-native';
import {config} from '@gluestack-ui/config';
import {GluestackUIProvider} from '@gluestack-ui/themed';
import DrinkCalculator from './src/screens/DrinkCalculator';

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <GluestackUIProvider config={config}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <DrinkCalculator />
    </GluestackUIProvider>
  );
}

export default App;
