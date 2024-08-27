'use client'
// ProductPage.tsx

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import analytics from '../cart/analytics';

export interface Product {
    id: string;
    name: string;
    image: string;
    price: number;
    description: string;
}

export interface CartItem {
    product: Product;
    quantity: number;
}

interface ProductPageProps {
    product: Product;
}

const ProductPage: React.FC<ProductPageProps> = ({ product }) => {
    const router = useRouter();

    useEffect(() => {
        analytics.trackEvent('Product Viewed', { productId: product.id });
    }, [product]);

    return (
        <div>
            <h1>{product.name}</h1>
            <img src={product.image} alt={product.name} />
            <p>{product.description}</p>
            <p>${product.price}</p>
            {/* Add to Cart button, etc. */}
        </div>
    );
};

export default ProductPage;
