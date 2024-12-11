import toastNotification from "@/components/common/ToastNotification";
import axios from "axios";
import { t } from "i18next";

const API_URL = import.meta.env.VITE_API_PUBLIC_URL ?? 'http://localhost:8080/api'
const token = localStorage.getItem('token');
const AUTH_HEADER = {
    accept: 'application/json',
    Authorization:
        `Bearer ${token}`,
}

export const fetchDocuments = async (query?: string) => {
    try {
        const response = await axios.get(`${API_URL}/documents?${query ? query + '&' : ''}size=10000`, {
            headers: AUTH_HEADER,
        })
        console.log(response.data)
        return response.data
    } catch (error) {
        console.error('Error fetching documents:', error)
        toastNotification.error('Nu s-au putut găsi documentele');
        throw error;
    }
}

export const fetchFileById = async (id: string) => {
    try {
        const response = await axios.get(`${API_URL}/files/${id}`, {
            headers: {
                ...AUTH_HEADER,
                'Accept': 'application/octet-stream', // Expect binary response
            },
            responseType: 'blob', // Ensure the response is treated as binary (blob)
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching file:', error);
        // toastNotification.error('Nu s-au putut găsi documentele');
        throw error;
    }
}


export const saveDocument = async (documentData: any) => {
    try {
        const response = await axios.post(`${API_URL}/documents`, documentData, {
            headers: {
                ...AUTH_HEADER,
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
        })
        return response.data
    } catch (error) {
        toastNotification.error('Nu s-au putut salva documentul');
        console.error('Error saving document:', error)
        throw error;
    }
}

export const saveFile = async (formData: any) => {
    try {
        const response = await axios.post(`${API_URL}/files/upload`, formData, {
            headers: {
                ...AUTH_HEADER,
            },
        })
        return response.data
    } catch (error) {
        console.error('Error saving document:', error)
        toastNotification.error('Nu s-au putut salva documentul');
        throw error;
    }
}

export const deleteFile = async (fileId: any) => {
    try {
        const response = await axios.delete(`${API_URL}/files/${fileId}`, {
            headers: {
                ...AUTH_HEADER,
            },
        })
        return response.data
    } catch (error) {
        console.error('Error deleting file:', error)
        toastNotification.error('Nu s-au putut șterge documentul');
        throw error;
    }
}

export const downloadFile = async (fileId: any, documentName?: string) => {
    try {
        const response = await axios.get(`${API_URL}/files/${fileId}`, {
            headers: {
                ...AUTH_HEADER,
                'Accept': 'application/octet-stream', // Specify the acceptable representation
            },
            responseType: 'blob', // Set the response type to blob for binary data
        });
        return response
    } catch (error) {
        console.error('Error fetching documents:', error)
        toastNotification.error('Nu s-au putut descărca documentul');
        throw error;
    }
}

export const updateDocument = async (documentId: any, documentData: any) => {
    try {
        const response = await axios.put(`${API_URL}/documents/${documentId}`, documentData, {
            headers: {
                ...AUTH_HEADER,
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
        })
        return response.data.content
    } catch (error) {
        console.error('Error saving document:', error)
        toastNotification.error('Nu s-au putut salva documentul');
        throw error;
    }
}

export const deleteDocument = async (documentId: any) => {
    try {
        const response = await axios.delete(`${API_URL}/documents/${documentId}`, {
            headers: {
                ...AUTH_HEADER,
            },
        })
        return response
    } catch (error) {
        console.error('Error saving document:', error)
        toastNotification.error('Nu s-a putut șterge documentul');
        throw error;
    }
}

export const generateDocument = async (documentId: any, variableData: any) => {
    try {
        const response = await axios.post(`${API_URL}/documents/${documentId}/generate`, variableData, {
            headers: {
                ...AUTH_HEADER,
                'Accept': 'application/octet-stream', // Expect binary response
            },
            responseType: 'blob'
        })
        console.log('RES1', response);
        return response
    } catch (error) {
        console.error('Error saving document:', error)
        toastNotification.error('Nu s-a putut genera documentul');
        throw error;
    }
}

export const signDocument = async (documentId: any, signaturePng: any, height: number, width: number) => {
    try {
        const response = await axios.post(`${API_URL}/documents/${documentId}/signature?width=${height}&height=${width}`, signaturePng, {
            headers: {
                ...AUTH_HEADER,
                'Accept': 'application/octet-stream', // Expect binary response
            },
            responseType: 'blob'
        })
        console.log('RES2', response);
        return response
    } catch (error) {
        console.error('Error saving document:', error)
        toastNotification.error('Nu s-a putut semna documentul');
        throw error;
    }
}