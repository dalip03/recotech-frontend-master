import toastNotification from '@/components/common/ToastNotification';
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_PUBLIC_URL ?? 'http://localhost:8080/api'
const token = localStorage.getItem('token');
const AUTH_HEADER = {
    accept: 'application/json',
    Authorization:
        `Bearer ${token}`,
}

export const fetchStatements = async () => {
    try {
        const response = await axios.get(`${API_URL}/statements`, {
            headers: AUTH_HEADER,
        })
        return response.data.content // Adjust based on your API response
    } catch (error) {
        console.error('Error fetching statements:', error)
        toastNotification.error('Nu s-au putut găsi constățările');
        throw error
    }
}

// Fetch comments with dynamic ID
export const fetchComments = async (id: number) => {
    try {
        const response = await axios.get(`${API_URL}/statements/${id}/comments`, {
            headers: AUTH_HEADER,
        })
        return response.data
    } catch (error) {
        console.error('Error fetching comments:', error)
        throw error
    }
}

export const saveStatement = async (statementData: any) => {
    try {
        const response = await axios.post(`${API_URL}/statements`, statementData, {
            headers: AUTH_HEADER,
        })
        toastNotification.success('Constatarea a fost adăugată cu succes!');
        return response
    } catch (error) {
        console.error('Error saving statement:', error)
        throw error
    }
}

export const updateStatement = async (statementData: any, id: any) => {
    try {
        const response = await axios.put(`${API_URL}/statements/${id}`, statementData, {
            headers: AUTH_HEADER,
        })
        toastNotification.success('Constatarea a fost actualizată cu succes!');
        return response
    } catch (error) {
        console.error('Error updating statement:', error)
        throw error
    }
}

export const deleteStatement = async (statementId: any) => {
    try {
        const response = await axios.delete(`${API_URL}/statements/${statementId}`, {
            headers: AUTH_HEADER,
        })
        toastNotification.success('Constatarea a fost ștearsă cu succes!');
        return response
    } catch (error) {
        console.error('Error deleting statement:', error)
        throw error
    }
}

export const updateStatementAssignee = async (userId: any, id: any) => {
    try {
        const response = await axios.patch(`${API_URL}/statements/${id}/assign`, { userId }, {
            headers: {
                ...AUTH_HEADER,
                'Content-Type': 'application/json',
            },
        })
        return response
    } catch (error) {
        console.error('Error saving statement assignees:', error)
        throw error
    }
}

export const removeStatementAssignee = async (userId: any, id: any) => {
    try {
        const response = await axios.patch(`${API_URL}/statements/${id}/unassign`, { userId }, {
            headers: {
                ...AUTH_HEADER,
                'Content-Type': 'application/json',
            },
        })
        return response
    } catch (error) {
        console.error('Error saving statement assignees:', error)
        throw error
    }
}