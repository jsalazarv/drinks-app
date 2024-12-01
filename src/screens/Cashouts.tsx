import React, {useEffect, useState} from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  ScrollView,
  Button,
  ButtonText,
  Spinner,
  Divider,
} from '@gluestack-ui/themed';
import {SafeAreaView, StyleSheet, Alert} from 'react-native';
import {generateCashout, getCashouts, Cashout} from '../services/cashouts';
import type {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import type {RootTabParamList} from '../navigation/types';

type Props = BottomTabScreenProps<RootTabParamList, 'Cashouts'>;

export const Cashouts = () => {
  const [cashouts, setCashouts] = useState<Cashout[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const loadCashouts = async () => {
    try {
      const data = await getCashouts();
      setCashouts(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los cortes de caja');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCashouts();
  }, []);

  const handleGenerateCashout = async () => {
    setGenerating(true);
    try {
      await generateCashout('daily');
      loadCashouts();
      Alert.alert('Éxito', 'Corte de caja generado correctamente');
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Error', 'No se pudo generar el corte de caja');
      }
    } finally {
      setGenerating(false);
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Box p="$4">
          <VStack space="lg">
            <HStack justifyContent="space-between" alignItems="center">
              <Text fontSize="$2xl" fontWeight="$bold">
                Cortes de Caja
              </Text>
              <Button
                onPress={handleGenerateCashout}
                isDisabled={generating}
                bg="$black">
                <ButtonText>
                  {generating ? 'Generando...' : 'Nuevo Corte'}
                </ButtonText>
              </Button>
            </HStack>

            <VStack space="md">
              {cashouts.map(cashout => (
                <Box
                  key={cashout.id}
                  bg="$white"
                  borderRadius="$lg"
                  borderWidth={1}
                  borderColor="$gray200"
                  p="$4">
                  <VStack space="sm">
                    <HStack justifyContent="space-between">
                      <Text fontSize="$lg" fontWeight="$bold">
                        Corte Diario
                      </Text>
                      <Text color="$gray600">#{cashout.id}</Text>
                    </HStack>

                    <Divider my="$2" />

                    <VStack space="xs">
                      <HStack justifyContent="space-between">
                        <Text color="$gray600">Periodo</Text>
                        <Text>
                          {formatDate(cashout.start_date)} -{' '}
                          {formatDate(cashout.end_date)}
                        </Text>
                      </HStack>

                      <HStack justifyContent="space-between">
                        <Text color="$gray600">Órdenes</Text>
                        <Text>{cashout.total_orders}</Text>
                      </HStack>

                      <HStack justifyContent="space-between">
                        <Text color="$gray600">Total</Text>
                        <Text fontWeight="$bold">${cashout.total_amount}</Text>
                      </HStack>
                    </VStack>
                  </VStack>
                </Box>
              ))}
            </VStack>
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

export default Cashouts;
