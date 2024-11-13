import { t } from "i18next";

export function parseJwt(token: string) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

export type UserRole =
    | 'SUPER_ADMIN'
    | 'ADMIN'
    | 'PIESAR'
    | 'MAGAZIE'
    | 'VANZATOR'
    | 'OPERATOR'
    | 'RECEPTION';

type NonSuperAdminRoles = Exclude<UserRole, 'SUPER_ADMIN'>;

/**
 * Checks if the user has any of the given roles.
 * If no roles are given, access is granted.
 * If the user is 'SUPER_ADMIN', access is always granted.
 * @param roles The roles to check against. An array of roles excluding 'SUPER_ADMIN'.
 * @returns true if the user has any of the given roles, or is 'SUPER_ADMIN'.
 */
export const hasAccess = (userRole: UserRole, roles: NonSuperAdminRoles[]) => {
    // userRole should also be strictly typed as UserRole
    // Early return if user is 'SUPER_ADMIN', granting automatic access
    if (userRole === 'SUPER_ADMIN') {
        return true;
    }

    // If no roles are specified, grant access (default behavior)
    if (roles.length === 0) {
        return true;
    }

    // Return true if the userRole exists in the list of valid roles
    return roles.includes(userRole);
};

export const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

export const getFileExtensionFromMimeType = (mimeType: string) => {
    const mimeToExtensionMap: any = {
        'application/pdf': 'pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
        'application/x-tika-ooxml': 'docx',
        'application/msword': 'doc',
        'image/png': 'png',
        'image/jpeg': 'jpg',
        // Add more mappings as needed
    };

    return mimeToExtensionMap[mimeType] || ''; // Return empty string if MIME type is unknown
};

export const capitalize = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export const getTranslatedRole = (role: UserRole) => {
    const roleOptions: any = {
        SUPER_ADMIN: t('Super Admin'),
        ADMIN: t('Admin'),
        PIESAR: t('roles.Parts'),
        MAGAZIE: t('roles.Storage'),
        OPERATOR: t('roles.Operator'),
        VANZATOR: t('roles.Sales'),
        RECEPTION: t('roles.Reception'),
    }
    return roleOptions[role]
}