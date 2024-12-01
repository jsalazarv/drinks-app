import React, {useEffect, useState} from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  ScrollView,
  Divider,
  Spinner,
  Pressable,
} from '@gluestack-ui/themed';
import {SafeAreaView, StyleSheet} from 'react-native';
import {getOrders, Order, subscribeToOrders} from '../services/sales';
import type {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import type {CompositeScreenProps} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {MainStackParamList, RootTabParamList} from '../navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<RootTabParamList, 'OrderHistory'>,
  NativeStackScreenProps<MainStackParamList>
>;

export const OrderHistory = ({navigation}: Props) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = async () => {
    try {
      setError(null);
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      setError('Error al cargar las órdenes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();

    // Suscribirse a cambios en tiempo real
    const unsubscribe = subscribeToOrders(updatedOrders => {
      setOrders(updatedOrders);
    });

    // Limpiar suscripción al desmontar
    return () => {
      unsubscribe();
    };
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center">
        <Spinner size="large" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center">
        <Text color="$red500">{error}</Text>
      </Box>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Box p="$4">
          <Text fontSize="$2xl" fontWeight="$bold" mb="$4">
            Historial de Órdenes
          </Text>

          <VStack space="md">
            {orders.map(order => (
              <Pressable
                key={order.id}
                onPress={() =>
                  navigation.navigate('OrderDetail', {orderId: order.id})
                }>
                <Box
                  bg="$white"
                  borderRadius="$lg"
                  borderWidth={1}
                  borderColor="$gray200"
                  p="$4">
                  <VStack space="sm">
                    <HStack justifyContent="space-between">
                      <Text fontSize="$sm" color="$gray600">
                        {formatDate(order.created_at)}
                      </Text>
                      <Text fontWeight="$bold" color="$black">
                        #{order.id}
                      </Text>
                    </HStack>

                    <Divider my="$2" />

                    {order.items?.map(item => (
                      <HStack
                        key={item.id}
                        justifyContent="space-between"
                        py="$1">
                        <Text>
                          {item.drink_type === 'half'
                            ? 'Medio Litro'
                            : 'Un Litro'}{' '}
                          × {item.count}
                        </Text>
                        <Text>${item.total}</Text>
                      </HStack>
                    ))}

                    <Divider my="$2" />

                    {order.fee > 0 && (
                      <HStack justifyContent="space-between">
                        <Text>Cargo adicional</Text>
                        <Text>${order.fee}</Text>
                      </HStack>
                    )}

                    {order.tip > 0 && (
                      <HStack justifyContent="space-between">
                        <Text>Propina</Text>
                        <Text>${order.tip}</Text>
                      </HStack>
                    )}

                    <HStack justifyContent="space-between" mt="$2">
                      <Text fontSize="$lg" fontWeight="$medium">
                        Total
                      </Text>
                      <Text fontSize="$xl" fontWeight="$bold">
                        ${order.total_amount}
                      </Text>
                    </HStack>
                  </VStack>
                </Box>
              </Pressable>
            ))}
          </VStack>
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

export default OrderHistory;
