'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

export default function PaynowButton({ orderId }: any) {
    const [loading, setLoading] = useState(false);
    const [paymentUrl, setPaymentUrl] = useState(null);

    const initiatePayment = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/orders/${orderId}/create-paynow-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (response.ok) {
                setPaymentUrl(data.link);
                window.location.href = data.link;
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Error initiating payment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='p-8'>
            <button onClick={initiatePayment} disabled={loading}>
                {loading ? 'Processing...' : <img src={'https://www.paynow.co.zw/Content/buttons/medium_buttons/button_add-to-cart_medium.png'} width={150} height={150} alt='' />}
            </button>
            {paymentUrl && <p>Redirecting to: {paymentUrl}</p>}
        </div>
    );
}
