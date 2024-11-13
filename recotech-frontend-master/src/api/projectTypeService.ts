import toastNotification from "@/components/common/ToastNotification";
import axios from "axios"

const API_URL = import.meta.env.VITE_API_PUBLIC_URL ?? 'http://localhost:8080/api'
const token = localStorage.getItem('token');
const AUTH_HEADER = {
    accept: 'application/json',
    Authorization:
        `Bearer ${token}`,
}


export const fetchProjectTypes = async () => {
    try {
        const response = await axios.get(`${API_URL}/project-types`, { headers: AUTH_HEADER })
        return response.data.content // Adjust this based on your API structure
    } catch (error) {
        toastNotification.error('Nu s-au găsit tipurile de proiect');
        throw error
    }
}

export const saveProjectType = async (projectTypeData: any) => {
    try {
        const response = await axios.post(`${API_URL}/project-types`, projectTypeData, {
            headers: AUTH_HEADER,
        })
        toastNotification.success('Tipul de proiect a fost salvat cu succes!');
        return response
    } catch (error) {
        console.error('Error saving tasks:', error)
        toastNotification.error('Nu s-a putut salva tipul de proiect');
        throw error
    }
}

export const updateProjectTypeTemplate = async (projectTypeData: any, projectTypeId: any) => {
    try {
        const response = await axios.put(`${API_URL}/project-types/${projectTypeId}`, projectTypeData, {
            headers: AUTH_HEADER,
        })
        toastNotification.success('Tipul de proiect a fost actualizat cu succes!');
        return response
    } catch (error) {
        console.error('Error saving tasks:', error)
        toastNotification.error('Nu s-a putut salva tipul de proiect');
        throw error
    }
}

export const deleteProjectTypeTemplate = async (projectTypeId: any) => {
    try {
        const response = await axios.delete(`${API_URL}/project-types/${projectTypeId}`, {
            headers: AUTH_HEADER,
        })
        toastNotification.success('Tipul de proiect a fost șters cu succes!');
        return response
    } catch (error) {
        console.error('Error saving tasks:', error)
        toastNotification.error('Nu s-a putut șterge tipul de proiect');
        throw error
    }
}