'use client'
import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

interface TrackingData {
    tracking: Array<{
        status: string;
        timestamp: string;
        message?: string;
        location?: {
            lat: number;
            lng: number;
        };
    }>;
}

interface OrderTrackingProps {
    orderId: string;
    session: { user: { isAdmin: boolean } } | null; // Add session prop
}

const OrderTracking: React.FC<OrderTrackingProps> = ({ orderId, session }) => {
    const [tracking, setTracking] = useState<TrackingData['tracking']>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [newMessage, setNewMessage] = useState('');

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
            } catch (error) {
                setError(error instanceof Error ? error.message : 'An error occurred');
            } finally {
                setIsLoading(false);
            }
        };

        fetchTracking();
    }, [orderId]);

    // Handle form submission for adding tracking data
    const handleUpdateTracking = async () => {
        const payload = {
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

    const latestLocation = tracking.find(item => item.location);

    return (
        <div>
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Tracking Information</h2>
                {session?.user.isAdmin && (
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                        onClick={() => setIsModalOpen(true)}
                    >
                        Update
                    </button>
                )}
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

            {/* Google Map for showing the location */}
            {latestLocation && latestLocation.location && (
                <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
                    <GoogleMap
                        mapContainerStyle={{ width: '100%', height: '400px' }}
                        center={latestLocation.location}
                        zoom={10}
                    >
                        <Marker position={latestLocation.location} />
                    </GoogleMap>
                </LoadScript>
            )}

            {/* Modal for adding tracking updates */}
            {session?.user.isAdmin && (
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
                        <button
                            className="bg-green-500 text-white px-4 py-2 rounded"
                            onClick={handleUpdateTracking}
                        >
                            Submit
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default OrderTracking;