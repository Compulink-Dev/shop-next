import { GetServerSideProps } from 'next';
import shopifyClient from '@/lib/shopify';

interface Product {
    title: string;
    descriptionHtml: string;
    price: string;
}

interface Props {
    product: Product;
}

const ProductPage = ({ product }: Props) => {
    return (
        <div>
            <h1>{product.title}</h1>
            <div dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
            <p>{product.price}</p>
        </div>
    );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { id } = context.params!;
    try {
        const response = await shopifyClient.post('', {
            query: `
        {
          node(id: "${id}") {
            ... on Product {
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
      `,
        });

        const product = response.data.data.node;

        return {
            props: {
                product: {
                    title: product.title,
                    descriptionHtml: product.descriptionHtml,
                    price: product.variants.edges[0].node.price,
                },
            },
        };
    } catch (error) {
        console.error(error);
        return {
            props: {
                product: null,
            },
        };
    }
};

export default ProductPage;
