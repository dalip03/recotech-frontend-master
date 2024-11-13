import toastNotification from '@/components/common/ToastNotification';
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_PUBLIC_URL ?? 'http://localhost:8080/api'
const token = localStorage.getItem('token');
const AUTH_HEADER = {
    accept: 'application/json',
    Authorization:
        `Bearer ${token}`,
}

export const fetchProjectClients = async () => {
    const response = await axios.get(`${API_URL}/project-clients`, { headers: AUTH_HEADER })
    return response.data.content // Adjust this based on your API structure
}

// export const getProjectClientByReferenceId = async (id: number) => {
//     try {
//         const response = await axios.get(`${API_URL}/project-clients/reference/${id}`, { headers: AUTH_HEADER })
//         return response.data
//     } catch (error: any) {
//         console.error('Error:', error)
//         if (error.message.includes('Request failed with status code 404')) {
//             return false
//         }
//         return error.message;
//     }
// }

export const getProjectClientById = async (id: number) => {
    try {
        const response = await axios.get(`${API_URL}/project-clients/${id}`, { headers: AUTH_HEADER })
        return response.data
    } catch (error: any) {
        console.error('Error:', error)
        toastNotification.error('Nu s-a putut găsi clientul');
        if (error.message.includes('Request failed with status code 404')) {
            return false
        }
        throw error;
    }
}

export const addProjectClient = async (clientData: any) => {
    try {
        const response = await axios.post(`${API_URL}/project-clients`, clientData, {
            headers: AUTH_HEADER,
        })
        toastNotification.success('Clientul a fost adaugat cu succes');
        return response.data
    } catch (error: any) {
        console.error(
            'Error adding client:',
            error.response ? error.response.data : error.message,
        )
        toastNotification.error('Nu s-a putut adăuga clientul');
        throw error
    }
}

export const updateProjectClient = async (clientId: number, updatedClient: any) => {
    try {
        const response = await fetch(
            `${API_URL}/project-clients/${clientId}`,
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

        if (!response.ok) {
            toastNotification.error('Nu s-a putut salva clientul');
            throw new Error('Failed to update client')
        }

        toastNotification.success('Clientul a fost actualizat cu succes!');
        return await response.json()
    } catch (error) {
        console.error('Error:', error)
        toastNotification.error('Nu s-a putut salva clientul');
        throw new Error('Failed to update client')
    }
}
