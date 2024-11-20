import { Button, Dropdown } from '../../components/ui'
import React, { useEffect, useState } from 'react'
import { HiPencil, HiTrash } from 'react-icons/hi'
import CustomTable from '../../components/common/CustomTable'
import ModalAddClienti from './ModalAddClienti'
import ModalDelete from '../../components/common/ModalDelete'
import { addClient, fetchClients, updateClient } from '../../api/clientService'
import { useNavigate } from 'react-router-dom'
import { t } from 'i18next'
import CustomDropdown from '@/components/common/CustomDropdown'

interface Client {
    id: number
    type: string
    name: string
    vat: string
    email: string
    phone: string
    billingAddress: string
    billingCity: string
    billingCounty: string
    billingPostalCode: string
    shippingAddress: string
    shippingCity: string
    shippingCounty: string
    shippingPostalCode: string
}

const Clienti = () => {
    const [data, setData] = useState<Client[]>([])

    const navigate = useNavigate();

    const [modalSettings, setModalSettings] = useState<any>({
        isOpen: false,
        isOpenDelete: false,
        selectedClient: null,
    })

    const fetchUserData = async () => {
        const clients: any = await fetchClients();
        setData(clients)
    }

    useEffect(() => {
        const fetchData = async () => {
            await fetchUserData();
        }
        fetchData()
    }, [])

    const handleEdit = (id: any) => {
        navigate(`/clienti/${id}?tab=info-general`)
    }

    const handleOpenModal = () => {
        setModalSettings((prevModalSettings: any) => ({
            ...prevModalSettings,
            isOpen: true,
        }))
    }

    const handleCloseModal = () => {
        setModalSettings((prevModalSettings: any) => ({
            ...prevModalSettings,
            isOpen: false,
            selectedClient: null,
        }))
    }

    const columns = [
        {
            header: 'ID',
            accessorKey: 'id',
        },
        {
            header: t("Name"),
            accessorKey: 'name',
        },
        {
            header: t("Type"),
            accessorKey: 'type',
            cell: ({ row }: any) => {
                return row.original.type == 'COMPANY' ? t("client-company") : t("client-individual")
            }
        },
        {
            header: 'Email',
            accessorKey: 'email',
        },
        {
            header: t("Phone"),
            accessorKey: 'phone',
        },
        {
            header: t("Actions"),
            accessorKey: 'actiuni',
            cell: ({ row }: any) => {
                const rowActions = [
                    { eventKey: `${row.original.id}_edit`, label: t("Edit"), onClick: () => handleEdit(row.original.id) },
                ]
                return (
                    <div className="flex space-x-2">
                        <CustomDropdown items={rowActions} />
                    </div>
                )
            }
        },
    ]

    const handleDeleteClick = (id: string) => {
        const selectedClient = data.find((client: any) => client.id == id)
        setModalSettings((prevModalSettings: any) => ({
            ...prevModalSettings,
            isOpenDelete: true,
            selectedClient: selectedClient,
        }))
    }

    const handleConfirmDelete = () => {

        setModalSettings((prevModalSettings: any) => ({
            ...prevModalSettings,
            isOpenDelete: false,
            selectedClient: null,
        }))
    }

  
    const handleCancelDelete = () => {
        setModalSettings((prevModalSettings: any) => ({
            ...prevModalSettings,
            isOpenDelete: false,
            selectedClient: null,
        }))
    }

    const onSubmit = async (values: any) => {
        try {
            if (modalSettings.selectedClient) {
                await updateClient(modalSettings.selectedClient.id, values)
            } else {
                await addClient(values)
            }
            await fetchUserData();
            setModalSettings((prevModalSettings: any) => ({
                ...prevModalSettings,
                isOpen: false,
                selectedClient: null,
            }))
        } catch (error: any) {
            console.error(
                'Eroare la adăugarea clientului:',
                error.response ? error.response.data : error.message
            )
            alert('A apărut o eroare la adăugarea clientului.')
        }
    }


    return (
        <div>
            <div>
            <h3 className="pb-4 pt-4 font-bold ">{t("Clients")}</h3>
            </div>
            <div
               
                style={{
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    padding: '16px',
                }}
            >
                <CustomTable
                    columns={columns}
                    data={data}
                    actionButton={
                        <Button
                            style={{ background: '#0188cc', color: 'white' }}
                            onClick={handleOpenModal}
                        >
                            {t("Add Clients")}
                        </Button>
                    }
                />
            </div>
            {modalSettings.isOpen && (
                <div>
                    <ModalAddClienti
                        isOpen={modalSettings.isOpen}
                        onClose={handleCloseModal}
                        data={modalSettings.selectedClient}
                        onSubmit={onSubmit}
                    />
                </div>
            )}
            {modalSettings.isOpenDelete && (
                <div>
                    <ModalDelete
                        isOpen={modalSettings.isOpenDelete}
                        message={t("deleteMessage.Are you sure you want to delete this project?")}
                        onConfirmDelete={handleConfirmDelete}
                        onClose={handleCancelDelete}
                    />
                </div>
            )}
        </div>
    )
}

export default Clienti
