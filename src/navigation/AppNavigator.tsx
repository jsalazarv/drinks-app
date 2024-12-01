import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import DrinkCalculator from '../screens/DrinkCalculator';
import OrderHistory from '../screens/OrderHistory';
import {House, ClockCounterClockwise} from 'phosphor-react-native';

export type RootTabParamList = {
  DrinkCalculator: undefined;
  OrderHistory: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#000',
          tabBarInactiveTintColor: '#666',
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
          tabBarStyle: {
            borderTopWidth: 1,
            borderTopColor: '#eee',
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
          headerTitleStyle: {
            fontWeight: 'bold',
            color: 'black',
          },
        }}>
        <Tab.Screen
          name="DrinkCalculator"
          component={DrinkCalculator}
          options={{
            title: 'Inicio',
            tabBarIcon: ({color, size}) => (
              <House size={size} color={color} weight="bold" />
            ),
          }}
        />
        <Tab.Screen
          name="OrderHistory"
          component={OrderHistory}
          options={{
            title: 'Historial',
            tabBarIcon: ({color, size}) => (
              <ClockCounterClockwise size={size} color={color} weight="bold" />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
