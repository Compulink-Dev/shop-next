'use client'
import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';

interface TrackingData {
    tracking: Array<{
        status: string;
        timestamp: string;
        message?: string;
    }>;
}

interface OrderTrackingProps {
    orderId: string;
}

const OrderTracking: React.FC<OrderTrackingProps> = ({ orderId }) => {
    const [tracking, setTracking] = useState<TrackingData['tracking']>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [newMessage, setNewMessage] = useState('');
    const [products, setProducts] = useState<any[]>([]); // Added to store product data

    // Fetch order and tracking data
    useEffect(() => {
        const fetchTracking = async () => {
            try {
                const response = await fetch(`/api/orders/${orderId}/tracking`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch tracking data. Status: ${response.status}`);
                }

                const data = await response.json();
                setTracking(data.tracking || []);

                // Fetch products in the order (assuming you have product details in the order)
                const orderResponse = await fetch(`/api/orders/${orderId}`);
                const orderData = await orderResponse.json();
                setProducts(orderData.items); // assuming `items` has product details
            } catch (error) {
                setError(error instanceof Error ? error.message : 'An error occurred');
            } finally {
                setIsLoading(false);
            }
        };

        fetchTracking();
    }, [orderId]);

    // Handle form submission for adding tracking data
    const handleUpdateTracking = async (productId: string) => {
        const payload = {
            productId,  // Use dynamically passed productId
            status: newStatus,
            message: newMessage,
        };

        console.log("Payload being sent:", payload);

        try {
            const response = await fetch(`/api/orders/${orderId}/tracking`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error('Failed to update tracking');
            }

            const data = await response.json();
            setTracking(data.tracking); // Update the tracking data
            setIsModalOpen(false); // Close the modal after successful submission
            setNewStatus('');
            setNewMessage('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
    };

    if (isLoading) {
        return <div>Loading tracking data...</div>;
    }

    if (error) {
        return <div className="text-red-500">Error: {error}</div>;
    }

    return (
        <div>
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Tracking Information</h2>
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={() => setIsModalOpen(true)}
                >
                    Update
                </button>
            </div>

            {tracking.length > 0 ? (
                <ul className="my-4">
                    {tracking.map((item, index) => (
                        <li key={index} className="space-y-2 mt-4">
                            <strong>Status:</strong> {item.status} <br />
                            <strong>Timestamp:</strong>{' '}
                            {new Date(item.timestamp).toLocaleString()} <br />
                            {item.message && (
                                <>
                                    <strong>Message:</strong> {item.message}
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="mt-2 text-red-500">No tracking data available</div>
            )}

            {/* Modal for adding tracking updates */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <h3 className="text-lg font-bold">Add Tracking Update</h3>
                <div className="flex flex-col gap-4 mt-4">
                    <select
                        onChange={(e) => setNewStatus(e.target.value)}
                        value={newStatus}
                        className="border p-2 rounded"
                    >
                        <option value="">Select Status</option>
                        <option value="Shipped">Shipped</option>
                        <option value="In Transit">In Transit</option>
                        <option value="Delivered">Delivered</option>
                    </select>
                    <textarea
                        placeholder="Message (optional)"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="border p-2 rounded"
                    ></textarea>
                    {products.length > 0 && (
                        <select
                            className="border p-2 rounded"
                            onChange={(e) => handleUpdateTracking(e.target.value)} // Pass productId dynamically
                        >
                            <option value="">Select Product</option>
                            {products.map((product) => (
                                <option key={product.product._id} value={product.product._id}>
                                    {product.product.name}
                                </option>
                            ))}
                        </select>
                    )}
                    <button
                        className="bg-green-500 text-white px-4 py-2 rounded"
                        onClick={() => handleUpdateTracking('675c375459293f8af7f2c03b')} // Pass productId dynamically
                    >
                        Submit
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default OrderTracking;
