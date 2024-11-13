import axios from "axios";

const API_URL = import.meta.env.VITE_API_PUBLIC_URL ?? 'http://localhost:8080/api'
const token = localStorage.getItem('token');
const AUTH_HEADER = {
    accept: 'application/json',
    Authorization:
        `Bearer ${token}`,
}

export const fetchEmailHistory = async () => {
    try {
        const response = await axios.get(`${API_URL}/email?size=10000`, { headers: AUTH_HEADER })
        return response.data.content // Adjust this based on your API structure
    } catch (error) {
        throw error
    }
}

export const fetchEmailById = async (id: number) => {
    try {
        const response = await axios.get(`${API_URL}/email/${id}`, { headers: AUTH_HEADER })
        return response.data
    } catch (error) {
        throw error
    }
}


export const sendEmail = async (formData: any) => {
    try {
        const response = await axios.post(`${API_URL}/email`, formData, {
            headers: {
                ...AUTH_HEADER,
                'Content-Type': 'multipart/form-data'
            },

        })
        // toastNotification.success('Piesă salvată cu succes!');
        return response
    } catch (error) {
        console.error('Error fetching parts:', error)
        // toastNotification.error('Nu s-a putut salva piesa!');
        throw error;
    }
}