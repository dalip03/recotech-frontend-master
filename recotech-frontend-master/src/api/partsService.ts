import toastNotification from "@/components/common/ToastNotification";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_PUBLIC_URL ?? 'http://localhost:8080/api'
const token = localStorage.getItem('token');
const AUTH_HEADER = {
    accept: 'application/json',
    Authorization:
        `Bearer ${token}`,
}

export const fetchParts = async (queryString?: string) => {
    try {
        const response = await axios.get(`${API_URL}/parts?size=10000&${queryString}`, {
            headers: AUTH_HEADER,
        })
        return response.data.content
    } catch (error) {
        console.error('Error fetching parts:', error)
        toastNotification.error('Nu s-au putut găsi piesele');
        throw error;
    }
}

export const fetchRequestedParts = async (queryString?: string) => {
    try {
        const response = await axios.get(`${API_URL}/part-requests?size=10000&${queryString}`, {
            headers: AUTH_HEADER,
        })
        return response.data.content
    } catch (error) {
        console.error('Error fetching parts:', error)
        toastNotification.error('Nu s-au putut găsi piesele');
        throw error;
    }
}

export const fetchProjectParts = async (projectId: any) => {
    try {
        const response = await axios.get(`${API_URL}/part-requests/project/${projectId}?size=10000`, {
            headers: AUTH_HEADER,
        })
        return response.data.content
    } catch (error) {
        console.error('Error fetching parts:', error)
        toastNotification.error('Nu s-au putut găsi piesele');
        throw error;
    }
}

export const fetchPartById = async (id: any) => {
    try {
        const response = await axios.get(`${API_URL}/parts/${id}`, {
            headers: AUTH_HEADER,
        })
        return response.data
    } catch (error) {
        // console.error('Error fetching parts:', error)
        toastNotification.error('Nu s-a putut găsi piesa');
        throw error;
    }
}

export const fetchPartsCategories = async () => {
    try {
        const response = await axios.get(`${API_URL}/parts/categories`, {
            headers: AUTH_HEADER,
        })
        return response.data
    } catch (error) {
        console.error('Error fetching parts:', error)
        toastNotification.error('Nu s-au putut găsi categoriile pieselor');
        throw error;
    }
}

export const savePart = async (partData: any) => {
    try {
        const response = await axios.post(`${API_URL}/parts`, partData, {
            headers: AUTH_HEADER,
        })
        toastNotification.success('Piesă salvată cu succes!');
        return response
    } catch (error) {
        console.error('Error fetching parts:', error)
        toastNotification.error('Nu s-a putut salva piesa!');
        throw error;
    }
}

export const updatePart = async (id: any, partData: any) => {
    try {
        const response = await axios.put(`${API_URL}/parts/${id}`, partData, {
            headers: AUTH_HEADER,
        })
        toastNotification.success('Piesă actualizată cu succes!');
        return response
    } catch (error) {
        console.error('Error fetching parts:', error)
        toastNotification.error('Nu s-a putut salva piesa!');
        throw error;
    }
}

export const deletePart = async (id: any) => {
    try {
        const response = await axios.delete(`${API_URL}/parts/${id}`, {
            headers: AUTH_HEADER,
        })
        toastNotification.success('Piesă ștearsă cu succes!');
        return response
    } catch (error) {
        console.error('Error fetching parts:', error)
        toastNotification.error('Nu s-a putut șterge piesa!');
        throw error;
    }
}

export const savePartsRequest = async (partData: any) => {
    try {
        const response = await axios.post(`${API_URL}/part-requests`, partData, {
            headers: AUTH_HEADER,
        })
        // toastNotification.success('Piesă salvată cu succes!');
        return response
    } catch (error) {
        // console.error('Error fetching parts:', error)
        // toastNotification.error('Nu s-a putut salva piesa!');
        throw error;
    }
}

export const updatePartRequest = async (partData: any, partId: any) => {
    try {
        const response = await axios.put(`${API_URL}/part-requests/${partId}`, partData, {
            headers: AUTH_HEADER,
        })
        // toastNotification.success('Piesă salvată cu succes!');
        return response
    } catch (error) {
        // console.error('Error fetching parts:', error)
        // toastNotification.error('Nu s-a putut salva piesa!');
        throw error;
    }
}

export const deletePartRequest = async (partId: any) => {
    try {
        const response = await axios.delete(`${API_URL}/part-requests/${partId}`, {
            headers: AUTH_HEADER,
        })
        // toastNotification.success('Piesă salvată cu succes!');
        return response
    } catch (error) {
        // console.error('Error fetching parts:', error)
        // toastNotification.error('Nu s-a putut salva piesa!');
        throw error;
    }
}

export const fetchStatementParts = async (statementId: any) => {
    try {
        const response = await axios.get(`${API_URL}/part-requests/statement/${statementId}`, {
            headers: AUTH_HEADER,
        })
        return response.data.content
    } catch (error) {
        console.error('Error fetching parts:', error)
        // toastNotification.error('Nu s-au putut găsi piesele');
        throw error;
    }
}
