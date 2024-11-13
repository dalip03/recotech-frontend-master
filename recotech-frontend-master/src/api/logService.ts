
import toastNotification from '@/components/common/ToastNotification';
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_PUBLIC_URL ?? 'http://localhost:8080/api'
const token = localStorage.getItem('token');
const AUTH_HEADER = {
    accept: 'application/json',
    Authorization:
        `Bearer ${token}`,
}

// Fetch all clients
export const fetchLogs = async () => {
    try {
        const response = await axios.get(`${API_URL}/logs?size=10000`, { headers: AUTH_HEADER })
        return response.data.content
    } catch (error) {
        toastNotification.error('Nu s-au putut găsi log-urile');
        throw error
    }
}
