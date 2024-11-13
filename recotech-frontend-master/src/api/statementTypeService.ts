import toastNotification from '@/components/common/ToastNotification';
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_PUBLIC_URL ?? 'http://localhost:8080/api'
const token = localStorage.getItem('token');
const AUTH_HEADER = {
    accept: 'application/json',
    Authorization:
        `Bearer ${token}`,
}

export const fetchStatementTypes = async (): Promise<any> => {
    try {
        const response = await axios.get(`${API_URL}/statement-types?size=10000`, {
            headers: AUTH_HEADER,
        })
        return response.data.content
    } catch (error) {
        toastNotification.error('Nu s-au găsit tipurile de manopera');
        throw error
    }
}

export const saveStatementType = async (typeData: any) => {
    try {
        const response = await axios.post(`${API_URL}/statement-types`, typeData, {
            headers: AUTH_HEADER,
        })
        toastNotification.success('Tip manopera salvata cu succes!');
        return response
    } catch (error) {
        console.error('Error saving tasks:', error)
        toastNotification.error('Nu s-a putut salva tipul de manopera');
        throw error
    }
}

export const updateStatementType = async (id: any, typeData: any) => {
    try {
        const response = await axios.put(`${API_URL}/statement-types/${id}`, typeData, {
            headers: AUTH_HEADER,
        })
        toastNotification.success('Tip manopera actualizata cu succes!');
        return response
    } catch (error) {
        console.error('Error saving tasks:', error)
        toastNotification.error('Nu s-a putut actualiza tipul de manopera');
        throw error
    }
}

export const deleteStatementType = async (id: any) => {
    try {
        const response = await axios.delete(`${API_URL}/statement-types/${id}`, {
            headers: AUTH_HEADER,
        })
        toastNotification.success('Tip manopera stearsă cu succes!');
        return response
    } catch (error) {
        console.error('Error saving tasks:', error)
        toastNotification.error('Nu s-a putut sterge tipul de manopera');
        throw error
    }
}