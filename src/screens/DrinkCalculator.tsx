import React, {useState} from 'react';
import {
  Box,
  Text,
  VStack,
  Image,
  HStack,
  Button,
  ButtonIcon,
  AddIcon,
  RemoveIcon,
} from '@gluestack-ui/themed';
import {ScrollView, SafeAreaView, StatusBar} from 'react-native';
import {PintGlass} from 'phosphor-react-native';

const HALF_LITER_PRICE = 30;
const ONE_LITER_PRICE = 50;

type DrinkSize = 'half' | 'one';

interface SizeOptionProps {
  size: string;
  price: number;
  count: number;
  onAdd: () => void;
  onSubtract: () => void;
}

const SizeOption = ({
  size,
  price,
  count,
  onAdd,
  onSubtract,
}: SizeOptionProps) => {
  const [imageError, setImageError] = useState(false);

  return (
    <Box
      bg="$white"
      borderRadius="$2xl"
      p="$4"
      mb="$4"
      borderWidth={1}
      borderColor="$black">
      <HStack alignItems="center" space="md">
        <Box width={50} height={50}>
          {!imageError ? (
            <Image
              source={require('../assets/drink.svg')}
              alt="cup"
              width={50}
              height={50}
              tintColor="$black"
              onError={() => setImageError(true)}
            />
          ) : (
            <PintGlass size={50} color="black" weight="thin" />
          )}
        </Box>
        <VStack flex={1}>
          <Text fontSize="$xl" color="$black">
            {size}
          </Text>
          <Text fontSize="$lg" fontWeight="$bold" color="$black">
            ${price}
          </Text>
        </VStack>
        <HStack alignItems="center" space="sm">
          <Button
            variant="outline"
            borderColor="$black"
            borderRadius="$full"
            backgroundColor="$black"
            size="sm"
            width={36}
            height={36}
            onPress={onSubtract}
            isDisabled={count === 0}>
            <ButtonIcon as={RemoveIcon} color="$white" />
          </Button>
          <Text fontSize="$xl" fontWeight="$bold" color="$black" mx="$2">
            {count}
          </Text>
          <Button
            variant="outline"
            borderColor="$black"
            borderRadius="$full"
            backgroundColor="$black"
            size="sm"
            width={36}
            height={36}
            onPress={onAdd}>
            <ButtonIcon as={AddIcon} color="$white" />
          </Button>
        </HStack>
      </HStack>
    </Box>
  );
};

export const DrinkCalculator = () => {
  const [halfLiterCount, setHalfLiterCount] = useState(0);
  const [oneLiterCount, setOneLiterCount] = useState(0);

  const handleAdd = (size: DrinkSize) => {
    if (size === 'half') {
      setHalfLiterCount(prev => prev + 1);
    } else {
      setOneLiterCount(prev => prev + 1);
    }
  };

  const handleSubtract = (size: DrinkSize) => {
    if (size === 'half') {
      setHalfLiterCount(prev => (prev > 0 ? prev - 1 : 0));
    } else {
      setOneLiterCount(prev => (prev > 0 ? prev - 1 : 0));
    }
  };

  const totalAmount =
    halfLiterCount * HALF_LITER_PRICE + oneLiterCount * ONE_LITER_PRICE;

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <Box flex={1} bg="$white">
        <ScrollView>
          <Box p="$4">
            <Box bg="$black" p="$4" borderRadius="$xl" mb="$4">
              <Box mb="$4">
                <Text fontSize="$3xl" fontWeight="$bold" color="$white">
                  Ponchito
                </Text>
              </Box>

              {/* Order Summary */}
              <Box>
                <Text fontSize="$lg" fontWeight="$bold" color="$white" mb="$2">
                  Resumen de venta
                </Text>

                <HStack justifyContent="space-between" mb="$2">
                  <Text color="$white">Medio Litro × {halfLiterCount}</Text>
                  <Text color="$white" fontWeight="$bold">
                    ${halfLiterCount * HALF_LITER_PRICE}
                  </Text>
                </HStack>

                <HStack justifyContent="space-between" mb="$2">
                  <Text color="$white">Un Litro × {oneLiterCount}</Text>
                  <Text color="$white" fontWeight="$bold">
                    ${oneLiterCount * ONE_LITER_PRICE}
                  </Text>
                </HStack>

                <HStack
                  justifyContent="space-between"
                  alignItems="center"
                  mt="$2">
                  <Text fontSize="$lg" fontWeight="$medium" color="white">
                    Total
                  </Text>
                  <Text fontSize="$5xl" fontWeight="$bold" color="$white">
                    ${totalAmount}
                  </Text>
                </HStack>
              </Box>
            </Box>

            <VStack>
              <SizeOption
                size="Medio Litro"
                price={30}
                count={halfLiterCount}
                onAdd={() => handleAdd('half')}
                onSubtract={() => handleSubtract('half')}
              />
              <SizeOption
                size="Un Litro"
                price={50}
                count={oneLiterCount}
                onAdd={() => handleAdd('one')}
                onSubtract={() => handleSubtract('one')}
              />
            </VStack>
          </Box>
        </ScrollView>
        <Box p="$4">
          <Button
            variant="solid"
            bg="$black"
            size="lg"
            borderRadius="$xl"
            onPress={() => {}}>
            <Text
              color="$white"
              fontSize="$lg"
              fontWeight="$bold"
              textTransform="uppercase">
              Hacer corte
            </Text>
          </Button>
        </Box>
      </Box>
    </SafeAreaView>
  );
};

export default DrinkCalculator;