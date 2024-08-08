import axios from 'axios';

const shopifyClient = axios.create({
    baseURL: `${process.env.SHOPIFY_STORE_URL}/api/2023-04/graphql.json`,
    headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': process.env.SHOPIFY_API_KEY!,
    },
});

export default shopifyClient;
