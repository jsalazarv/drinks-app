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
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  ButtonGroup,
  Pressable,
} from '@gluestack-ui/themed';
import {SafeAreaView, StyleSheet, Alert} from 'react-native';
import {
  generateCashout,
  getCashouts,
  deleteCashout,
  Cashout,
} from '../services/cashouts';
import {Trash} from 'phosphor-react-native';
import {formatDisplayDate} from '../utils/date';

export const Cashouts = () => {
  const [cashouts, setCashouts] = useState<Cashout[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedCashoutId, setSelectedCashoutId] = useState<number | null>(
    null,
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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

  const handleDeletePress = (cashoutId: number) => {
    setSelectedCashoutId(cashoutId);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCashoutId) {
      return;
    }

    setDeleting(true);
    setShowDeleteDialog(false);
    try {
      await deleteCashout(selectedCashoutId);
      loadCashouts();
      Alert.alert('Éxito', 'Corte de caja eliminado correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar el corte de caja');
    } finally {
      setDeleting(false);
      setSelectedCashoutId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return formatDisplayDate(dateString);
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
                isDisabled={generating || deleting}
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
                    <HStack justifyContent="space-between" alignItems="center">
                      <HStack space="md" alignItems="center">
                        <Text fontSize="$lg" fontWeight="$bold">
                          Corte Diario
                        </Text>
                        <Text color="$gray600">#{cashout.id}</Text>
                      </HStack>
                      <Pressable
                        onPress={() => handleDeletePress(cashout.id)}
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

      <AlertDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}>
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <AlertDialogHeader>
            <Text fontSize="$lg" fontWeight="$bold">
              Confirmar Eliminación
            </Text>
          </AlertDialogHeader>
          <AlertDialogBody>
            <Text>
              ¿Estás seguro que deseas eliminar este corte de caja? Esta acción
              no se puede deshacer.
            </Text>
          </AlertDialogBody>
          <AlertDialogFooter>
            <ButtonGroup space="md">
              <Button
                variant="outline"
                onPress={() => setShowDeleteDialog(false)}
                borderColor="$black">
                <ButtonText color="$black">Cancelar</ButtonText>
              </Button>
              <Button bg="$red500" onPress={handleDeleteConfirm}>
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

export default Cashouts;
