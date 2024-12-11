import { User } from '@/@types/user'
import toastNotification from '@/components/common/ToastNotification';
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_PUBLIC_URL ?? 'http://localhost:8080/api'
const token = localStorage.getItem('token');
const AUTH_HEADER = {
    accept: 'application/json',
    Authorization:
        `Bearer ${token}`,
}


export const fetchUsers = async (page: number = 0, pageSize: number = 1000, sort: string[] = ['id', 'desc']): Promise<User[] | any> => {
    if (token) {
        AUTH_HEADER.Authorization = `Bearer ${token}`
    }
    try {
        const response = await axios.get(`${API_URL}/users?size=${pageSize}&page=${page}&sort=${sort}`, {
            headers: AUTH_HEADER,
        })
        return response
    } catch (error) {
        toastNotification.error('Nu s-au găsit utilizatorii');
        throw error
    }
}

export const fetchUsersWithToken = async (token?: any): Promise<User[] | any> => {
    if (token) {
        AUTH_HEADER.Authorization = `Bearer ${token}`
    }
    try {
        const response = await axios.get(`${API_URL}/users?size=10000`, {
            headers: AUTH_HEADER,
        })
        return response.data.content
    } catch (error) {
        toastNotification.error('Nu s-au găsit utilizatorii');
        throw error
    }
}

export const fetchOperators = async (page: number = 0, pageSize: number = 1000, sort: string[] = ['id', 'desc']): Promise<User[] | any> => {
    if (token) {
        AUTH_HEADER.Authorization = `Bearer ${token}`
    }
    try {
        const response = await axios.get(`${API_URL}/users?size=${pageSize}&page=${page}&sort=${sort}&role=OPERATOR`, {
            headers: AUTH_HEADER,
        })
        return response
    } catch (error) {
        toastNotification.error('Nu s-au găsit utilizatorii');
        throw error
    }
}

export const fetchUserById = async (id: any): Promise<User[] | any> => {
    try {
        const response = await axios.get(`${API_URL}/users/${id}`, {
            headers: AUTH_HEADER,
        })
        return response.data
    } catch (error) {
        toastNotification.error('Nu s-a găsit utilizatorul');
        throw error;
    }
}

export const fetchUserProfilePicture = async (id: string, token: string) => {
    try {
        const response = await axios.get(`${API_URL}/files/${id}`, {
            headers: {
                accept: 'application/json',
                Authorization:
                    `Bearer ${token}`,
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

export const saveUser = async (userData: any) => {
    try {
        const response = await axios.post(`${API_URL}/users/register`, userData, {
            headers: AUTH_HEADER,
        })
        toastNotification.success('Utilizator salvat cu succes!');
        return response
    } catch (error) {
        console.error('Error saving tasks:', error)
        toastNotification.error('Nu s-a putut salva utilizatorul');
        throw error
    }
}

export const updateUser = async (userData: any, userId: any) => {
    try {
        // console.log("working on updating  a user ", userData ,userId);

        const response = await axios.put(`${API_URL}/users/${userId}`, userData, {
            headers: AUTH_HEADER,
        })
        toastNotification.success('Utilizator actualizat cu succes!');
        return response
    } catch (error) {
        console.error('Error saving tasks:', error)
        toastNotification.error('Nu s-a putut salva utilizatorul');
        throw error
    }
}

export const deleteUser = async (userId: any) => {
    try {
        console.log("working on deleting a user ");
        // console.log("API_URL - ",API_URL,"user id - ", userId)

        const response = await axios.delete(`${API_URL}/users/${userId}`, {
            headers: AUTH_HEADER,
        });
        toastNotification.success('Utilizator șters cu succes!');
        return response.data;
    } catch (error) {
        console.error('Error deleting user:', error);
        toastNotification.error('Nu s-a putut șterge utilizatorul');
        throw error;
    }
};


export const updateUserPoints = async (points: any, userId: any) => {
    try {
        const response = await axios.patch(`${API_URL}/users/${userId}/points`, points, {
            headers: AUTH_HEADER,
        })
        return response
    } catch (error) {
        console.error('Error saving tasks:', error)
        toastNotification.error('Nu s-au putut salva bulinele utilizatorul');
        throw error
    }
}


// TODO ask for route to get users by username or for the id to be inserted in the jwt token
// export const fetchUserByUsername = async (): Promise<User | any> => {
//     const response = await axios.get(`${API_URL}/users`, {
//         headers: AUTH_HEADER,
//     })
//     return response.data.content
// }