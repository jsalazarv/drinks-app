export type RootTabParamList = {
  DrinkCalculator: undefined;
  OrderHistory: undefined;
  Cashouts: undefined;
};

export type MainStackParamList = {
  Main: undefined;
  OrderDetail: {
    orderId: number;
  };
};
