import { User } from '@/@types/user'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_PUBLIC_URL ?? 'http://localhost:8080/api'
const token = localStorage.getItem('token');
const AUTH_HEADER = {
    accept: 'application/json',
    Authorization:
        `Bearer ${token}`,
}

// Fetch total users from the dashboard statistics
export const fetchTotalUsers = async (): Promise<number> => {
    try {
        const response = await axios.get(`${API_URL}/dashboard/statistics`, { headers: AUTH_HEADER })
        return response.data.totalUsers
    } catch (error) {
        console.error('Error fetching total users:', error)
        throw error
    }
}

// Fetch total expanses from the dashboard statistics
export const fetchTotalExpenses = async (): Promise<number> => {
    try {
        const response = await axios.get(`${API_URL}/dashboard/statistics`, { headers: AUTH_HEADER })
        return response.data.totalExpenses
    } catch (error) {
        console.error('Error fetching total expenses:', error)
        throw error
    }
}

// Fetch total incomes from the dashboard statistics
export const fetchTotalIncomes = async (): Promise<number> => {
    try {
        const response = await axios.get(`${API_URL}/dashboard/statistics`, { headers: AUTH_HEADER })
        return response.data.totalIncomes
    } catch (error) {
        console.error('Error fetching total incomes:', error)
        throw error
    }
}

// Fetch total projects statistics
export const fetchTotalProjects = async () => {
    const response = await axios.get(`${API_URL}/projects/statistics`, {
        headers: AUTH_HEADER,
    })
    return response.data.total // Adjust this based on your API structure
}