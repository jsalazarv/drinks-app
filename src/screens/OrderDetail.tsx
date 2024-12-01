import React, {useEffect, useState} from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Button,
  ButtonText,
  Input,
  InputField,
  Spinner,
  ButtonIcon,
  AddIcon,
  RemoveIcon,
} from '@gluestack-ui/themed';
import {ScrollView, Alert} from 'react-native';
import {
  getOrderById,
  updateOrder,
  Order,
  OrderItem,
  DrinkType,
} from '../services/sales';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {MainStackParamList} from '../navigation/types';

const HALF_LITER_PRICE = 30;
const ONE_LITER_PRICE = 50;

type Props = NativeStackScreenProps<MainStackParamList, 'OrderDetail'>;

export const OrderDetail = ({route, navigation}: Props) => {
  const {orderId} = route.params;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [halfLiterCount, setHalfLiterCount] = useState(0);
  const [oneLiterCount, setOneLiterCount] = useState(0);
  const [fee, setFee] = useState(0);
  const [tip, setTip] = useState(0);

  const loadOrder = async () => {
    try {
      const orderData = await getOrderById(orderId);
      if (orderData) {
        setOrder(orderData);
        setFee(orderData.fee);
        setTip(orderData.tip);
        // Establecer contadores iniciales
        orderData.items?.forEach(item => {
          if (item.drink_type === 'half') {
            setHalfLiterCount(item.count);
          } else {
            setOneLiterCount(item.count);
          }
        });
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar la orden');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!order) {
      return;
    }

    setSaving(true);
    try {
      const items: OrderItem[] = [];

      if (halfLiterCount > 0) {
        items.push({
          drink_type: 'half',
          count: halfLiterCount,
          price: HALF_LITER_PRICE,
          total: halfLiterCount * HALF_LITER_PRICE,
        });
      }

      if (oneLiterCount > 0) {
        items.push({
          drink_type: 'one',
          count: oneLiterCount,
          price: ONE_LITER_PRICE,
          total: oneLiterCount * ONE_LITER_PRICE,
        });
      }

      await updateOrder(order.id, items, fee, tip);
      Alert.alert('Éxito', 'Orden actualizada correctamente');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar la orden');
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = (size: DrinkType) => {
    if (size === 'half') {
      setHalfLiterCount(prev => prev + 1);
    } else {
      setOneLiterCount(prev => prev + 1);
    }
  };

  const handleSubtract = (size: DrinkType) => {
    if (size === 'half') {
      setHalfLiterCount(prev => Math.max(0, prev - 1));
    } else {
      setOneLiterCount(prev => Math.max(0, prev - 1));
    }
  };

  useEffect(() => {
    loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  if (loading) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center">
        <Spinner size="large" />
      </Box>
    );
  }

  const subtotal =
    halfLiterCount * HALF_LITER_PRICE + oneLiterCount * ONE_LITER_PRICE;
  const total = subtotal + fee + tip;

  return (
    <Box flex={1} bg="$white">
      <ScrollView>
        <Box p="$4">
          <VStack space="lg">
            <Box bg="$black" p="$4" borderRadius="$xl">
              <Text fontSize="$xl" fontWeight="$bold" color="$white" mb="$4">
                Editar Orden #{orderId}
              </Text>

              <VStack space="md">
                <HStack justifyContent="space-between">
                  <Text color="$white">Medio Litro × {halfLiterCount}</Text>
                  <HStack space="sm">
                    <Button
                      variant="outline"
                      borderColor="$white"
                      onPress={() => handleSubtract('half')}
                      size="sm">
                      <ButtonIcon as={RemoveIcon} color="$white" />
                    </Button>
                    <Button
                      variant="outline"
                      borderColor="$white"
                      onPress={() => handleAdd('half')}
                      size="sm">
                      <ButtonIcon as={AddIcon} color="$white" />
                    </Button>
                  </HStack>
                </HStack>

                <HStack justifyContent="space-between">
                  <Text color="$white">Un Litro × {oneLiterCount}</Text>
                  <HStack space="sm">
                    <Button
                      variant="outline"
                      borderColor="$white"
                      onPress={() => handleSubtract('one')}
                      size="sm">
                      <ButtonIcon as={RemoveIcon} color="$white" />
                    </Button>
                    <Button
                      variant="outline"
                      borderColor="$white"
                      onPress={() => handleAdd('one')}
                      size="sm">
                      <ButtonIcon as={AddIcon} color="$white" />
                    </Button>
                  </HStack>
                </HStack>

                <VStack space="sm">
                  <Text color="$white">Cargo adicional</Text>
                  <Input variant="outline" size="md" borderColor="$white">
                    <InputField
                      keyboardType="numeric"
                      color="$white"
                      value={fee.toString()}
                      onChangeText={text => setFee(Number(text) || 0)}
                    />
                  </Input>
                </VStack>

                <VStack space="sm">
                  <Text color="$white">Propina</Text>
                  <Input variant="outline" size="md" borderColor="$white">
                    <InputField
                      keyboardType="numeric"
                      color="$white"
                      value={tip.toString()}
                      onChangeText={text => setTip(Number(text) || 0)}
                    />
                  </Input>
                </VStack>

                <HStack justifyContent="space-between" mt="$4">
                  <Text color="$white" fontSize="$lg">
                    Total:
                  </Text>
                  <Text color="$white" fontSize="$xl" fontWeight="$bold">
                    ${total}
                  </Text>
                </HStack>
              </VStack>
            </Box>

            <Button
              size="lg"
              bg="$black"
              onPress={handleSave}
              isDisabled={saving}>
              <ButtonText>
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </ButtonText>
            </Button>
          </VStack>
        </Box>
      </ScrollView>
    </Box>
  );
};

export default OrderDetail;
