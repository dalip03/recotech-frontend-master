import { lazy } from 'react'
import authRoute from './authRoute'
import type { Routes } from '@/@types/routes'

export const publicRoutes: Routes = [...authRoute]

export const protectedRoutes = [
    {
        key: 'dashboard',
        path: '/dashboard',
        component: lazy(() => import('@/views/dashboard/Dashboard')),
        authority: ['SUPER_ADMIN', 'ADMIN', 'PIESAR', 'MAGAZIE', 'VANZATOR', 'OPERATOR', 'RECEPTION'],
        meta: {
            title: 'Dashboard',
        },

    },
    {
        key: 'reports',
        path: '/reports',
        component: lazy(() => import('@/views/reports/Reports')),
        authority: ['SUPER_ADMIN', 'ADMIN'],
        meta: {
            title: 'Reports',
        },

    },
    /** Example purpose only, please remove */
    {
        key: 'proiecte',
        path: '/proiecte',
        component: lazy(() => import('@/views/projects/Proiecte')),
        authority: ['SUPER_ADMIN', 'ADMIN', 'PIESAR', 'MAGAZIE', 'VANZATOR', 'OPERATOR', 'RECEPTION'],
        meta: {
            title: 'Dashboard',
        },

    },
    {
        key: 'proiecteDetails',
        path: '/proiecte/:id',
        component: lazy(() => import('@/views/projects/ProiecteDetails')),
        authority: ['SUPER_ADMIN', 'ADMIN', 'PIESAR', 'VANZATOR', 'RECEPTION', 'OPERATOR', 'MAGAZIE'],
        meta: {
            title: 'Dashboard',
        },

    },
    {
        key: 'documente',
        path: '/documente',
        component: lazy(() => import('@/views/documente/Documente')),
        authority: ['SUPER_ADMIN', 'ADMIN', 'VANZATOR', 'RECEPTION'],
        meta: {
            title: 'Dashboard',
        },

    },
    {
        key: 'sarcini',
        path: '/sarcini',
        component: lazy(() => import('@/views/sarcini/Sarcini')),
        authority: ['SUPER_ADMIN', 'ADMIN', 'VANZATOR', 'OPERATOR'],
        meta: {
            title: 'Dashboard',
        },

    },
    {
        key: 'constatari',
        path: '/constatari/:id?',
        component: lazy(() => import('@/views/constatari/Constatari')),
        authority: ['SUPER_ADMIN', 'ADMIN', 'RECEPTION', 'OPERATOR'],
        meta: {
            title: 'Dashboard',
        },

    },
    {
        key: 'piese',
        path: '/piese',
        component: lazy(() => import('@/views/piese/Piese')),
        authority: ['SUPER_ADMIN', 'ADMIN', 'PIESAR', 'MAGAZIE'],
        meta: {
            title: 'Dashboard',
        },

    },
    {
        key: 'Magazie',
        path: '/magazie',
        component: lazy(() => import('@/views/magazie/Magazie')),
        authority: ['SUPER_ADMIN', 'ADMIN', 'PIESAR', 'MAGAZIE'],
        meta: {
            title: 'Magazie',
        },

    },
    {
        key: 'clienti',
        path: '/clienti',
        component: lazy(() => import('@/views/clients/Clienti')),
        authority: ['SUPER_ADMIN', 'ADMIN', 'VANZATOR', 'RECEPTION'],
        meta: {
            title: 'Dashboard',
        },

    },
    {
        key: 'clienti-details',
        path: '/clienti/:id',
        component: lazy(() => import('@/views/clients/ClientDetalii')),
        authority: [],
        meta: {
            title: 'Dashboard',
        },
    },
    {
        key: 'clienti-details-new-email',
        path: '/clienti/:clientId/new-email',
        component: lazy(() => import('@/views/clients/details-sections/EmailDetails')),
        authority: [],
        meta: {
            title: 'Dashboard',
        },
    },
    {
        key: 'clienti-details-email',
        path: '/clienti/:clientId/email/:emailId',
        component: lazy(() => import('@/views/clients/details-sections/EmailDetails')),
        authority: [],
        meta: {
            title: 'Dashboard',
        },
    },
    {
        key: 'chat',
        path: '/chat/ChatPage',
        component: lazy(() => import('@/views/chat/ChatPage')),
        authority: ['SUPER_ADMIN', 'ADMIN', 'PIESAR', 'MAGAZIE', 'VANZATOR', 'OPERATOR', 'RECEPTION'],
        meta: {
            title: 'Dashboard',
        },

    },
    {
        key: 'utilizatori',
        path: '/utilizatori',
        component: lazy(() => import('@/views/users/Utilizatori')),
        authority: ['SUPER_ADMIN', 'ADMIN'],
        meta: {
            title: 'Dashboard',
        },

    },
    // {
    //     key: 'statusuri',
    //     path: '/statusuri',
    //     component: lazy(() => import('@/views/statuses/Statusuri')),
    //     authority: [],
    //     subMenu: [],
    //     meta: {
    //         title: 'Dashboard',
    //     },

    // },
    {
        key: 'tip-proiecte.item1',
        path: '/tip-proiecte',
        component: lazy(() => import('@/views/sabloane/TipProiecte')),
        authority: ['SUPER_ADMIN', 'ADMIN'],
        meta: {
            title: 'Dashboard',
        },

    },
    {
        key: 'tip-manopera.item1',
        path: '/tip-manopera',
        component: lazy(() => import('@/views/sabloane/TipManopera')),
        authority: ['SUPER_ADMIN', 'ADMIN'],
        meta: {
            title: 'Dashboard',
        },

    },
    {
        key: 'sabloane-documente.item2',
        path: '/sabloane/documente',
        component: lazy(() => import('@/views/sabloane/SabloaneDocumente')),
        authority: ['SUPER_ADMIN', 'ADMIN', 'RECEPTION'],
        meta: {
            title: 'Dashboard',
        },

    },
    {
        key: 'sabloane-sarcini.item3',
        path: '/sabloane/sarcini',
        component: lazy(() => import('@/views/sabloane/SabloaneSarcini')),
        authority: ['SUPER_ADMIN', 'ADMIN'],
        meta: {
            title: 'Dashboard',
        },

    },
    {
        key: 'logs.item4',
        path: '/logs',
        component: lazy(() => import('@/views/logs/Logs')),
        authority: ['SUPER_ADMIN'],
        meta: {
            title: 'Dashboard',
        },

    },
    {
        key: 'setari-cont.item5',
        path: '/setari-cont',
        component: lazy(() => import('@/views/account-settings/SetariCont')),
        authority: ['SUPER_ADMIN', 'ADMIN', 'PIESAR', 'MAGAZIE', 'VANZATOR', 'OPERATOR', 'RECEPTION'],
        meta: {
            title: 'Dashboard',
        },

    },
]
