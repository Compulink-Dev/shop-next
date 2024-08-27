// CartContext.tsx

import React, { createContext, useState, useContext, ReactNode } from 'react';

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

interface CartContextType {
    cart: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (id: string) => void;
    increaseQuantity: (id: string) => void;
    decreaseQuantity: (id: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [cart, setCart] = useState<CartItem[]>([]);

    const addToCart = (item: CartItem) => {
        setCart((prevCart) => {
            const existingItemIndex = prevCart.findIndex(cartItem => cartItem.product.id === item.product.id);
            if (existingItemIndex >= 0) {
                const updatedCart = [...prevCart];
                updatedCart[existingItemIndex].quantity += item.quantity;
                return updatedCart;
            } else {
                return [...prevCart, item];
            }
        });
    };

    const removeFromCart = (id: string) => {
        setCart((prevCart) => prevCart.filter(item => item.product.id !== id));
    };

    const increaseQuantity = (id: string) => {
        setCart((prevCart) => {
            const updatedCart = [...prevCart];
            const itemIndex = updatedCart.findIndex(item => item.product.id === id);
            if (itemIndex >= 0) {
                updatedCart[itemIndex].quantity += 1;
            }
            return updatedCart;
        });
    };

    const decreaseQuantity = (id: string) => {
        setCart((prevCart) => {
            const updatedCart = [...prevCart];
            const itemIndex = updatedCart.findIndex(item => item.product.id === id);
            if (itemIndex >= 0 && updatedCart[itemIndex].quantity > 1) {
                updatedCart[itemIndex].quantity -= 1;
            }
            return updatedCart;
        });
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, increaseQuantity, decreaseQuantity }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
