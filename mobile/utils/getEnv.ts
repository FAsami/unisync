import Constants from "expo-constants";

const getEnv = (title: string) => {
  return Constants.expoConfig?.extra?.[title];
};

export { getEnv };
