import React, {useEffect, useState, useMemo} from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  ScrollView,
  Divider,
  Spinner,
  Pressable,
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  ButtonGroup,
  Button,
  ButtonText,
  Checkbox,
  CheckboxIndicator,
  CheckboxIcon,
  CheckIcon,
  CheckboxLabel,
} from '@gluestack-ui/themed';
import {SafeAreaView, StyleSheet, Alert} from 'react-native';
import {
  getOrders,
  Order,
  subscribeToOrders,
  deleteOrder,
  updateOrderPaymentStatus,
} from '../services/sales';
import type {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import type {CompositeScreenProps} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {MainStackParamList, RootTabParamList} from '../navigation/types';
import {Trash} from 'phosphor-react-native';

type Props = CompositeScreenProps<
  BottomTabScreenProps<RootTabParamList, 'OrderHistory'>,
  NativeStackScreenProps<MainStackParamList>
>;

const OrderHistory: React.FC<Props> = ({navigation}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingPayment, setUpdatingPayment] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'paid' | 'unpaid'>(
    'all',
  );

  const filteredOrders = useMemo(() => {
    switch (activeFilter) {
      case 'paid':
        return orders.filter(order => order.is_paid);
      case 'unpaid':
        return orders.filter(order => !order.is_paid);
      default:
        return orders;
    }
  }, [orders, activeFilter]);

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

    const unsubscribe = subscribeToOrders(updatedOrders => {
      setOrders(updatedOrders);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleDeletePress = (orderId: number) => {
    setSelectedOrderId(orderId);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedOrderId) {
      return;
    }

    setDeleting(true);
    setShowDeleteDialog(false);

    try {
      await deleteOrder(selectedOrderId);
      Alert.alert('Éxito', 'Orden eliminada correctamente');
    } catch (deleteError) {
      Alert.alert('Error', 'No se pudo eliminar la orden');
    } finally {
      setDeleting(false);
      setSelectedOrderId(null);
    }
  };

  const handlePaymentToggle = async (orderId: number, newStatus: boolean) => {
    setUpdatingPayment(orderId);
    try {
      await updateOrderPaymentStatus(orderId, newStatus);
    } catch (err) {
      Alert.alert('Error', 'No se pudo actualizar el estado de pago');
    } finally {
      setUpdatingPayment(null);
    }
  };

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

          <HStack space="sm" mb="$4">
            <Button
              variant={activeFilter === 'all' ? 'solid' : 'outline'}
              bg={activeFilter === 'all' ? '$black' : 'transparent'}
              borderColor="$black"
              onPress={() => setActiveFilter('all')}
              flex={1}>
              <ButtonText color={activeFilter === 'all' ? '$white' : '$black'}>
                Todos
              </ButtonText>
            </Button>
            <Button
              variant={activeFilter === 'paid' ? 'solid' : 'outline'}
              bg={activeFilter === 'paid' ? '$black' : 'transparent'}
              borderColor="$black"
              onPress={() => setActiveFilter('paid')}
              flex={1}>
              <ButtonText color={activeFilter === 'paid' ? '$white' : '$black'}>
                Pagadas
              </ButtonText>
            </Button>
            <Button
              variant={activeFilter === 'unpaid' ? 'solid' : 'outline'}
              bg={activeFilter === 'unpaid' ? '$black' : 'transparent'}
              borderColor="$black"
              onPress={() => setActiveFilter('unpaid')}
              flex={1}>
              <ButtonText
                color={activeFilter === 'unpaid' ? '$white' : '$black'}>
                Sin pagar
              </ButtonText>
            </Button>
          </HStack>

          <VStack space="md">
            {filteredOrders.map(order => (
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
                    <HStack
                      justifyContent="space-between"
                      alignItems="center"
                      mb="$2">
                      <HStack space="md" alignItems="center" flex={1}>
                        <Text fontSize="$sm" color="$gray600">
                          {formatDate(order.created_at)}
                        </Text>
                        <Text fontWeight="$bold" color="$black">
                          #{order.id}
                        </Text>
                      </HStack>
                      <HStack space="md" alignItems="center">
                        <Checkbox
                          size="md"
                          value={order.id.toString()}
                          isChecked={order.is_paid}
                          isDisabled={updatingPayment === order.id}
                          onChange={newValue =>
                            handlePaymentToggle(order.id, newValue)
                          }
                          aria-label={order.is_paid ? 'Pagada' : 'Sin pagar'}
                          sx={{
                            _checked: {
                              bg: '$black',
                              borderColor: '$black',
                              _icon: {color: '$white'},
                            },
                          }}>
                          <CheckboxIndicator mr="$2">
                            <CheckboxIcon as={CheckIcon} />
                          </CheckboxIndicator>
                          <CheckboxLabel
                            color={order.is_paid ? '$black' : '$gray600'}>
                            {order.is_paid ? 'Pagada' : 'Sin pagar'}
                          </CheckboxLabel>
                        </Checkbox>
                        <Pressable
                          onPress={() => handleDeletePress(order.id)}
                          disabled={deleting}
                          style={({pressed}) => [
                            {
                              opacity: pressed || deleting ? 0.5 : 1,
                              padding: 8,
                            },
                          ]}>
                          <Trash size={24} color="#ef4444" weight="bold" />
                        </Pressable>
                      </HStack>
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

      <AlertDialog isOpen={showDeleteDialog}>
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <AlertDialogHeader>
            <Text size="lg" fontWeight="$bold">
              Eliminar Orden
            </Text>
          </AlertDialogHeader>
          <AlertDialogBody>
            <Text size="sm">
              ¿Estás seguro que deseas eliminar esta orden? Esta acción no se
              puede deshacer.
            </Text>
          </AlertDialogBody>
          <AlertDialogFooter>
            <ButtonGroup space="lg">
              <Button
                variant="outline"
                action="secondary"
                onPress={() => setShowDeleteDialog(false)}>
                <ButtonText>Cancelar</ButtonText>
              </Button>
              <Button
                bg="$red500"
                action="negative"
                onPress={handleDeleteConfirm}>
                <ButtonText>Eliminar</ButtonText>
              </Button>
            </ButtonGroup>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
