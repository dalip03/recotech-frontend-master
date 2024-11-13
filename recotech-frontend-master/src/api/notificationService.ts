
const token = localStorage.getItem('token');
const API_URL = import.meta.env.VITE_API_PUBLIC_URL ?? 'http://localhost:8080/api'

export const sendNotification = async (notificationData: any) => {
    const notificationObject = notificationData.object;
    notificationData.object = JSON.stringify(notificationObject);

    try {
        const response = await fetch(`${API_URL}/notifications`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // If required for authentication
            },
            body: JSON.stringify(notificationData)
        });

        if (!response.ok) {
            console.error('Failed to send notification:', response.statusText);
        }
    } catch (error) {
        console.error('Error sending notification:', error);
    }
}


