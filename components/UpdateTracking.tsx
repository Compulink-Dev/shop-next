'use client';

import { useState, useEffect } from 'react';

interface TrackingItem {
    status: string;
    timestamp: string;
    message?: string;
}

interface TrackingProps {
    productId: string;
}

const Tracking: React.FC<TrackingProps> = ({ productId }) => {
    const [trackingData, setTrackingData] = useState<TrackingItem[]>([]);
    const [newStatus, setNewStatus] = useState('');
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchTrackingData = async () => {
            try {
                const response = await fetch(`/api/products/${productId}/tracking`);
                if (!response.ok) throw new Error('Failed to fetch tracking data');
                const data = await response.json();
                setTrackingData(data.tracking || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setIsLoading(false);
            }
        };
        fetchTrackingData();
    }, [productId]);

    const handleAddTracking = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/products/${productId}/tracking`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus, message: newMessage }),
            });

            if (!response.ok) throw new Error('Failed to update tracking');

            const data = await response.json();
            setTrackingData(data.tracking);
            setNewStatus('');
            setNewMessage('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsSubmitting(false);
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
            <h2>Tracking Information</h2>
            {trackingData.length > 0 ? (
                <ul>
                    {trackingData.map((item, index) => (
                        <li key={index}>
                            <strong>Status:</strong> {item.status} <br />
                            <strong>Timestamp:</strong> {new Date(item.timestamp).toLocaleString()} <br />
                            {item.message && <strong>Message:</strong>} {item.message}
                        </li>
                    ))}
                </ul>
            ) : (
                <div>No tracking data available</div>
            )}

            <h3>Add Tracking Update</h3>
            <div className="flex flex-col gap-2 mt-4">
                <input
                    type="text"
                    placeholder="Status"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="border p-2 rounded"
                />
                <input
                    type="text"
                    placeholder="Message"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="border p-2 rounded"
                />
                <button
                    onClick={handleAddTracking}
                    disabled={isSubmitting}
                    className="bg-blue-500 text-white p-2 rounded"
                >
                    {isSubmitting ? 'Submitting...' : 'Add Tracking'}
                </button>
            </div>
        </div>
    );
};

export default Tracking;
