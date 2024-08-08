import { GetServerSideProps } from 'next';
import shopifyClient from '@/lib/shopify';

interface Product {
    id: string;
    title: string;
    descriptionHtml: string;
    price: string;
}

interface Props {
    products: Product[];
}

const HomePage = ({ products }: Props) => {
    return (
        <div>
            <h1>Products</h1>
            <ul>
                {products.map(product => (
                    <li key={product.id}>
                        <h2>{product.title}</h2>
                        <div dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
                        <p>{product.price}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export const getServerSideProps: GetServerSideProps = async () => {
    try {
        const response = await shopifyClient.post('', {
            query: `
        {
          products(first: 10) {
            edges {
              node {
                id
                title
                descriptionHtml
                variants(first: 1) {
                  edges {
                    node {
                      price
                    }
                  }
                }
              }
            }
          }
        }
      `,
        });

        const products = response.data.data.products.edges.map((edge: any) => ({
            id: edge.node.id,
            title: edge.node.title,
            descriptionHtml: edge.node.descriptionHtml,
            price: edge.node.variants.edges[0].node.price,
        }));

        return {
            props: {
                products,
            },
        };
    } catch (error) {
        console.error(error);
        return {
            props: {
                products: [],
            },
        };
    }
};

export default HomePage;
