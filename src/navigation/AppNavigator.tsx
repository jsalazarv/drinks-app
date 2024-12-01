import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import DrinkCalculator from '../screens/DrinkCalculator';
import OrderHistory from '../screens/OrderHistory';
import OrderDetail from '../screens/OrderDetail';
import Cashouts from '../screens/Cashouts';
import {Calculator, ClockCounterClockwise, Money} from 'phosphor-react-native';
import {MainStackParamList, RootTabParamList} from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<MainStackParamList>();

const OrderStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="OrderHistory"
        component={OrderHistory}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="OrderDetail"
        component={OrderDetail}
        options={{
          headerTitle: 'Detalle de Orden',
          headerBackTitle: 'Volver',
        }}
      />
    </Stack.Navigator>
  );
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: '#666666',
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
          tabBarLabel: 'Calculadora',
          tabBarIcon: ({color, size}) => (
            <Calculator color={color} size={size} weight="bold" />
          ),
        }}
      />
      <Tab.Screen
        name="OrderHistory"
        component={OrderStack}
        options={{
          tabBarLabel: 'Historial',
          tabBarIcon: ({color, size}) => (
            <ClockCounterClockwise color={color} size={size} weight="bold" />
          ),
        }}
      />
      <Tab.Screen
        name="Cashouts"
        component={Cashouts}
        options={{
          tabBarLabel: 'Cortes',
          tabBarIcon: ({color, size}) => (
            <Money color={color} size={size} weight="bold" />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <TabNavigator />
    </NavigationContainer>
  );
};

export default AppNavigator;
