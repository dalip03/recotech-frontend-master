import toastNotification from '@/components/common/ToastNotification';
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_PUBLIC_URL ?? 'http://localhost:8080/api'
const token = localStorage.getItem('token');
const AUTH_HEADER = {
    accept: 'application/json',
    Authorization:
        `Bearer ${token}`,
}

export const fetchConversations = async (): Promise<any> => {
    try {
        const response = await axios.get(`${API_URL}/conversation/friends`, {
            headers: AUTH_HEADER,
        })
        return response.data
    } catch (error) {
        toastNotification.error('Nu s-au putut găsi conversațiile');
        throw error;
    }
}

export const fetchUnreadMessages = async (): Promise<any> => {
    try {
        const response = await axios.get(`${API_URL}/conversation/unseenMessages`, {
            headers: AUTH_HEADER,
        })
        return response.data;
    } catch (error) {
        toastNotification.error('Nu s-au putut găsi conversațiile');
        throw error;
    }
}

export const fetchUnreadMessagesByContactId = async (id: any): Promise<any> => {
    try {
        const response = await axios.get(`${API_URL}/conversation/unseenMessages/${id}`, {
            headers: AUTH_HEADER,
        })
        return response.data;
    } catch (error) {
        toastNotification.error('Nu s-au putut găsi conversația');
        throw error;
    }
}