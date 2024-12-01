import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import DrinkCalculator from '../screens/DrinkCalculator';
import OrderHistory from '../screens/OrderHistory';
import OrderDetail from '../screens/OrderDetail';
import {House, ClockCounterClockwise} from 'phosphor-react-native';
import {MainStackParamList, RootTabParamList} from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<MainStackParamList>();

const TabNavigator = () => {
  return (
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
  );
};

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Main"
          component={TabNavigator}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="OrderDetail"
          component={OrderDetail}
          options={{title: 'Detalle de Orden'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
