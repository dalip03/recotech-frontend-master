import toastNotification from '@/components/common/ToastNotification';
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_PUBLIC_URL ?? 'http://localhost:8080/api'
const token = localStorage.getItem('token');
const AUTH_HEADER = {
    accept: 'application/json',
    Authorization:
        `Bearer ${token}`,
}

// Fetch total tasks from the dashboard statistics
export const fetchTaskStatistics = async () => {
    try {
        const response = await axios.get(`${API_URL}/tasks/statistics`, { headers: AUTH_HEADER })
        return response.data
    } catch (error) {
        console.error('Error fetching total tasks:', error)
        toastNotification.error('Nu s-au găsit statisticile sarcinilor');
        throw error
    }
}

// Fetch tasks from the API
export const fetchTasks = async () => {
    try {
        const response = await axios.get(`${API_URL}/tasks?size=100000&sort=id,desc`, {
            headers: AUTH_HEADER,
        })
        return response.data.content
    } catch (error) {
        console.error('Error fetching tasks:', error)
        toastNotification.error('Nu s-au găsit sarcinile');
        throw error
    }
}

export const saveTask = async (taskData: any) => {
    try {
        const response = await axios.post(`${API_URL}/tasks`, taskData, {
            headers: AUTH_HEADER,
        })
        toastNotification.success('Sarcină salvată cu succes!');
        return response
    } catch (error) {
        console.error('Error saving tasks:', error)
        toastNotification.error('Nu s-a putut salva sarcina');
        throw error
    }
}

export const updateTask = async (taskData: any, id: any) => {
    try {
        const response = await axios.put(`${API_URL}/tasks/${id}`, taskData, {
            headers: AUTH_HEADER,
        })
        toastNotification.success('Sarcină actualizată cu succes!');
        return response
    } catch (error) {
        console.error('Error saving tasks:', error)
        toastNotification.error('Nu s-a putut salva sarcina');
        throw error
    }
}

export const updateTaskStatus = async (status: any, id: any) => {
    try {
        console.log(status);
        const response = await axios.patch(`${API_URL}/tasks/${id}/status`, { status }, {
            headers: {
                ...AUTH_HEADER,
                'Content-Type': 'application/json',
            },
        })
        return response
    } catch (error) {
        console.error('Error saving tasks:', error)
        throw error
    }
}

export const updateTaskPriority = async (priority: any, id: any) => {
    try {
        const response = await axios.patch(`${API_URL}/tasks/${id}/priority`, { priority }, {
            headers: {
                ...AUTH_HEADER,
                'Content-Type': 'application/json',
            },
        })
        return response
    } catch (error) {
        console.error('Error saving tasks:', error)
        throw error
    }
}

export const updateTaskAssignee = async (userId: any, id: any) => {
    try {
        const response = await axios.patch(`${API_URL}/tasks/${id}/assign`, { userId }, {
            headers: {
                ...AUTH_HEADER,
                'Content-Type': 'application/json',
            },
        })
        return response
    } catch (error) {
        console.error('Error saving tasks:', error)
        throw error
    }
}

export const removeTaskAssignee = async (userId: any, id: any) => {
    try {
        const response = await axios.patch(`${API_URL}/tasks/${id}/unassign`, { userId }, {
            headers: {
                ...AUTH_HEADER,
                'Content-Type': 'application/json',
            },
        })
        return response
    } catch (error) {
        console.error('Error saving tasks:', error)
        throw error
    }
}

export const finishTask = async (status: string, id: string) => {
    try {
        const response = await axios.patch(`${API_URL}/tasks/${id}/status`, { status }, {
            headers: AUTH_HEADER,
        })
        toastNotification.success('Sarcina finalizată cu succes!');
        return response
    } catch (error) {
        console.error('Error finishing task:', error)
        toastNotification.error('Nu s-a putut finaliza sarcina');
        throw error
    }
}

export const deleteTask = async (taskId: string) => {
    try {
        const response = await axios.delete(`${API_URL}/tasks/${taskId}`, {
            headers: AUTH_HEADER,
        })
        toastNotification.success('Sarcina a fost șterse cu succes!');
        return response.status
    } catch (error) {
        console.error('Error deleting tasks:', error)
        toastNotification.error('Nu s-a putut sterge sarcina');
        throw error
    }
}