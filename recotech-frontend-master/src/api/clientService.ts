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
export const fetchClients = async () => {
    try {
        const response = await axios.get(`${API_URL}/clients?size=10000`, { headers: AUTH_HEADER })
        return response.data.content // Adjust this based on your API structure
    } catch (error) {
        toastNotification.error('Nu s-au putut găsi clienții');
        throw error
    }
}

export const fetchClientProjects = async (clientId: any) => {
    try {
        const response = await axios.get(`${API_URL}/projects/clients/${clientId}?size=10000`, { headers: AUTH_HEADER })
        return response.data.content // Adjust this based on your API structure
    } catch (error) {
        throw error
    }
}

// Add a new client
export const addClient = async (clientData: any) => {
    try {
        const response = await axios.post(`${API_URL}/clients`, clientData, {
            headers: AUTH_HEADER,
        })
        toastNotification.success('Clientul a fost adaugat cu succes');
        return response.data
    } catch (error: any) {
        console.error(
            'Error adding client:',
            error.response ? error.response.data : error.message,
        )
        toastNotification.error('Nu s-a putut adauga clientul');
        throw error
    }
}

export const updateClient = async (clientId: number, updatedClient: any) => {
    try {
        const response = await fetch(
            `${API_URL}/clients/${clientId}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization:
                        `Bearer ${token}`,
                },
                body: JSON.stringify(updatedClient),
            },
        )

        // Check if response is successful
        if (!response.ok) {
            toastNotification.error('Nu s-a putut actualiza clientul');
        }

        toastNotification.success('Clientul a fost actualizat cu succes!');
        return await response.json() // return response if successful
    } catch (error) {
        console.error('Error:', error)
        toastNotification.error('Nu s-a putut actualiza clientul');
        throw error
    }
}

export const deleteClient = async (clientId: any) => {
    try {
        const response = await axios.delete(`${API_URL}/clients/${clientId}`, {
            headers: AUTH_HEADER,
        })
        return response.data
    } catch (error: any) {
        console.error(
            'Error deleting client:',
            error.response ? error.response.data : error.message,
        )
        throw error
    }
}
