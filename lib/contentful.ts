// Contentful client utility for fetching blog data
import { createClient } from 'contentful';

const space = process.env.CONTENTFUL_SPACE_ID;
const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;

if (!space || !accessToken) {
  throw new Error('Contentful space ID and access token must be provided.');
}

export const contentfulClient = createClient({
  space,
  accessToken,
});
