export type RootTabParamList = {
  DrinkCalculator: undefined;
  OrderHistory: undefined;
  Cashouts: undefined;
};

export type MainStackParamList = {
  OrderHistory: undefined;
  OrderDetail: {
    orderId: number;
  };
};
