import toastNotification from '@/components/common/ToastNotification';
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_PUBLIC_URL ?? 'http://localhost:8080/api'
const token = localStorage.getItem('token');
const AUTH_HEADER = {
    accept: 'application/json',
    Authorization:
        `Bearer ${token}`,
}

// Fetch all projects
export const fetchProjects = async (page?: number, pageSize?: number, sort: string[] = ['id', 'desc']) => {
    try {
        const response = await axios.get(`${API_URL}/projects?size=${pageSize ?? 10000}&page=${page ?? 0}&sort=${sort}`, { headers: AUTH_HEADER })
        return response.data.content // Adjust this based on your API structure
    } catch (error) {
        toastNotification.error('Nu s-au putut găsi proiectele');
    }
}

export const fetchUserProjects = async (page?: number, pageSize?: number, sort: string[] = ['id', 'desc']) => {
    // TODO redo this when route for getting operator based projects is ready
    try {
        const response = await axios.get(`${API_URL}/projects/assigned?&size=${pageSize ?? 1000}&page=${page ?? 0}&sort=${sort}`, { headers: AUTH_HEADER })
        return response.data.content // Adjust this based on your API structure
    } catch (error) {
        toastNotification.error('Nu s-au putut găsi proiectele');
    }
}



export const getProjectById = async (id: string) => {
    if (id === '') {
        toastNotification.error('ID proiect invalid');
        throw new Error('Invalid project ID');
    }

    try {
        const response = await axios.get(`${API_URL}/projects/${id}`, {
            headers: AUTH_HEADER,
        });
        return response.data
    } catch (e: any) {
        console.error('Failed getting project.')
        toastNotification.error('Nu s-a putut găsi proiectul');
        return e.message;
    }
};

// Fetch total projects statistics
export const fetchTotalProjects = async () => {
    const response = await axios.get(`${API_URL}/projects/statistics`, {
        headers: AUTH_HEADER,
    })
    return response.data.total // Adjust this based on your API structure
}

// Fetch new projects statistics
export const fetchNewProjects = async () => {
    const response = await axios.get(`${API_URL}/projects/statistics`, {
        headers: AUTH_HEADER,
    })
    return response.data.newProjects // Adjust this based on your API structure
}

// Fetch projects in progress statistics
export const fetchProgressProjects = async () => {
    const response = await axios.get(`${API_URL}/projects/statistics`, {
        headers: AUTH_HEADER,
    })
    return response.data.approved // Adjust this based on your API structure
}

// Fetch finished projects statistics
export const fetchFinishedProjects = async () => {
    const response = await axios.get(`${API_URL}/projects/statistics`, {
        headers: AUTH_HEADER,
    })
    return response.data.complete // Adjust this based on your API structure
}

const AUTH_HEADER_COMM = {
    accept: 'application/json',
    Authorization:
        `Bearer ${token}`,
}

export const updateProjectDescription = async (
    projectId: number,
    description: string,
): Promise<void> => {
    try {
        const response = await axios.put(
            `${API_URL}/projects/${projectId}`,
            { description }, // send only the description
            { headers: AUTH_HEADER_COMM },
        )

        if (response.status !== 200 && response.status !== 204) {
            toastNotification.error('Nu s-au putut salva descrierea proiectului');
            throw new Error(
                `Failed to update project description: ${response.statusText}`,
            )
        }

        toastNotification.success('Descrierea proiectului a fost actualizata cu succes!');
    } catch (error: any) {
        // Improved error logging
        console.error(
            'Error updating project description:',
            error.response?.data || error.message || error,
        )
        toastNotification.error('Nu s-au putut salva descrierea proiectului');
        throw error
    }
}

export const updateProjectType = async (
    projectId: number,
    type: string,
): Promise<void> => {
    try {
        const response = await axios.put(
            `${API_URL}/projects/${projectId}`,
            { type }, // Send only the type
            { headers: AUTH_HEADER_COMM },
        )

        if (response.status !== 200 && response.status !== 204) {
            toastNotification.error('Nu s-a putut salva tipul de proiect');
            throw new Error(
                `Failed to update project type: ${response.statusText}`,
            )
        }
    } catch (error: any) {
        // Improved error logging
        console.error(
            'Error updating project type:',
            error.response?.data || error.message || error,
        )
        toastNotification.error('Nu s-a putut salva tipul de proiect');
        throw error
    }
}

export const updateProject = async (projectId: number, updatedData: any) => {
    try {
        const response = await fetch(
            `${API_URL}/projects/${projectId}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization:
                        `Bearer ${token}`,
                },
                body: JSON.stringify(updatedData),
            },
        )

        // Check if response is successful
        if (!response.ok) {
            toastNotification.error('Nu s-a putut salva proiectul');
            throw new Error('Failed to update project')
        }
        toastNotification.success('Proiectul a fost actualizat cu succes!');
        return await response.json() // return response if successful
    } catch (error: any) {
        console.error('Error:', error)
        toastNotification.error('Nu s-a putut salva proiectul');
        throw new Error('Failed to update project')
    }
}

export const addProject = async (newProjectData: any) => {
    try {
        const response = await fetch(`${API_URL}/projects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization:
                    `Bearer ${token}`,
            },
            body: JSON.stringify(newProjectData), // Send new project data in the body
        })

        // Check if the response is successful
        if (!response.ok) {
            toastNotification.error('Nu s-a putut salva proiectul');
            throw new Error('Failed to add new project')
        }

        toastNotification.success('Proiectul a fost adaugat cu succes!');
        return await response.json()
    } catch (error: any) {
        console.error('Error:', error)
        toastNotification.error('Nu s-a putut salva proiectul');
        throw new Error('Failed to add new project')
    }
}

export const deleteProject = async (projectId: any) => {
    try {
        const response = await axios.delete(`${API_URL}/projects/${projectId}`, {
            headers: AUTH_HEADER,
        });
        toastNotification.success('Proiectul a fost șters cu succes!');
        return response.data
    } catch (e: any) {
        console.error('Failed getting project.')
        toastNotification.error('Nu s-a putut șterge proiectul');
        return e.message;
    }
}

export const fetchUserFavoriteProjects = async () => {
    try {
        const response = await axios.get(`${API_URL}/favorites`, { headers: AUTH_HEADER })
        return response.data
    } catch (error) {
        toastNotification.error('Nu s-au putut găsi proiectele favorite');
    }
}

export const fetchUserFavoriteProjectsByUserId = async (id: any) => {
    try {
        const response = await axios.get(`${API_URL}/favorites/${id}`, { headers: AUTH_HEADER })
        return response.data
    } catch (error) {
        console.error(error);
        // toastNotification.error('Nu s-au putut găsi proiectele favorite');
    }
}

export const addFavoriteProject = async (projectIds: string[], userId?: string) => {
    const payload: any = {
        projects: projectIds,
        projectTypes: []
    }

    if (userId) {
        payload.userId = userId;
    }

    console.log(payload);

    try {
        const response = await axios.put(`${API_URL}/favorites/add`, payload, { headers: AUTH_HEADER })
        return response
    } catch (error) {
        toastNotification.error('Nu s-au putut găsi proiectele favorite');
    }
}

export const removeFavoriteProject = async (projectIds: string[]) => {
    const payload = {
        projects: projectIds,
        projectTypes: []
    }

    try {
        const response = await axios.put(`${API_URL}/favorites/remove`, payload, { headers: AUTH_HEADER })
        return response
    } catch (error) {
        toastNotification.error('Nu s-au putut găsi proiectele favorite');
    }
}

export const addFavoriteProjectType = async (projectTypeIds: string[], userId?: string) => {
    const payload: any = {
        projects: [],
        projectTypes: projectTypeIds
    }

    if (userId) {
        payload.userId = userId;
    }

    try {
        const response = await axios.put(`${API_URL}/favorites/add`, payload, { headers: AUTH_HEADER })
        return response
    } catch (error) {
        toastNotification.error('Nu s-au putut găsi proiectele favorite');
    }
}

export const removeFavoriteProjectType = async (projectTypeIds: string[], userId?: string) => {
    const payload: any = {
        projects: [],
        projectTypes: projectTypeIds
    }

    if (userId) {
        payload.userId = userId;
    }

    try {
        const response = await axios.put(`${API_URL}/favorites/remove`, payload, { headers: AUTH_HEADER })
        return response
    } catch (error) {
        toastNotification.error('Nu s-au putut găsi proiectele favorite');
    }
}