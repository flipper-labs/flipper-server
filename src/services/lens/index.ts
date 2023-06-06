import { Client, cacheExchange, fetchExchange } from "@urql/core";

const APIURL = "https://api-mumbai.lens.dev/graphql"; // TODO: Extract to env variable

export const client = new Client({
  url: APIURL,
  exchanges: [cacheExchange, fetchExchange],
});
