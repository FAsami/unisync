"use client";

import { ApolloProvider as ApolloProviderBase } from "@apollo/client/react";
import { apolloClient } from "@/lib/apollo";

const ApolloProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ApolloProviderBase client={apolloClient}>{children}</ApolloProviderBase>
  );
};
export { ApolloProvider };
