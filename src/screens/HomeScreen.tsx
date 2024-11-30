import React from 'react';
import {Box, Button, ButtonText, Heading} from '@gluestack-ui/themed';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

type RootStackParamList = {
  Home: undefined;
  DrinkCalculator: undefined;
};

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export const HomeScreen = ({navigation}: HomeScreenProps) => {
  return (
    <Box flex={1} bg="$black" p="$4" justifyContent="center">
      <Heading color="$white" size="xl" mb="$4" textAlign="center">
        Welcome to Drink App
      </Heading>
      <Button
        size="lg"
        variant="solid"
        action="primary"
        onPress={() => navigation.navigate('DrinkCalculator')}>
        <ButtonText>Go to Drink Calculator</ButtonText>
      </Button>
    </Box>
  );
};

export default HomeScreen;
