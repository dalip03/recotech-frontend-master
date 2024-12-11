import { Button } from '@/components/ui'
import { useState } from 'react'
import { HiPencil, HiTrash } from 'react-icons/hi'
import CustomTable from '../../components/common/CustomTable'
import ModalAddStatus from './components/modals/ModalAddStatus'
import { t } from 'i18next'

const Statusuri = () => {
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleEdit = () => {
        console.log('Edit')
    }

    const handleDelete = () => {
        console.log('Delete')
    }

    const handleOpenModal = () => {
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
    }
    const columns = [
        {
            header: 'Numele statusului',
            accessorKey: 'numeleStatusului',
        },
        {
            header: 'Tabela de proveniente',
            accessorKey: 'tabelaDeProvenienta',
        },
        {
            header: 'Ordine',
            accessorKey: 'ordine',
        },
        {
            header: 'Culoare',
            accessorKey: 'culoare',
        },
        {
            header: 'Status Principal',
            accessorKey: 'statusPrincipal',
        },
        {
            header: t("Actions"),
            accessorKey: 'actiuni',
            cell: () => (
                <div className="flex space-x-2">
                    <button
                        onClick={() => handleEdit()}
                        className="text-blue-500 hover:text-blue-700"
                    >
                        <HiPencil />
                    </button>
                    <button
                        onClick={() => handleDelete()}
                        className="text-red-500 hover:text-red-700"
                    >
                        <HiTrash />
                    </button>
                </div>
            ),
        },
    ]

    const data = [
        {
            numeleStatusului: 'valid',
            tabelaDeProvenienta: 'key_storage',
            ordine: '1',
            culoare: 'green',
            statusPrincipal: 'Da',
            actions: '',
        },
        {
            numeleStatusului: 'inProgress',
            tabelaDeProvenienta: 'task_storage',
            ordine: '2',
            culoare: 'blue',
            statusPrincipal: 'Da',
            actions: '',
        },
        {
            numeleStatusului: 'pendingApproval',
            tabelaDeProvenienta: 'approval_queue',
            ordine: '3',
            culoare: 'yellow',
            statusPrincipal: 'Nu',
            actions: '',
        },
        {
            numeleStatusului: 'rejected',
            tabelaDeProvenienta: 'review_table',
            ordine: '4',
            culoare: 'red',
            statusPrincipal: 'Nu',
            actions: '',
        },
        {
            numeleStatusului: 'completed',
            tabelaDeProvenienta: 'task_storage',
            ordine: '5',
            culoare: 'green',
            statusPrincipal: 'Da',
            actions: '',
        },
        {
            numeleStatusului: 'onHold',
            tabelaDeProvenienta: 'task_storage',
            ordine: '6',
            culoare: 'orange',
            statusPrincipal: 'Nu',
            actions: '',
        },
        {
            numeleStatusului: 'archived',
            tabelaDeProvenienta: 'archive_storage',
            ordine: '7',
            culoare: 'grey',
            statusPrincipal: 'Nu',
            actions: '',
        },
        {
            numeleStatusului: 'underReview',
            tabelaDeProvenienta: 'review_table',
            ordine: '8',
            culoare: 'purple',
            statusPrincipal: 'Da',
            actions: '',
        },
        {
            numeleStatusului: 'approved',
            tabelaDeProvenienta: 'approval_queue',
            ordine: '9',
            culoare: 'green',
            statusPrincipal: 'Da',
            actions: '',
        },
        {
            numeleStatusului: 'canceled',
            tabelaDeProvenienta: 'task_storage',
            ordine: '10',
            culoare: 'red',
            statusPrincipal: 'Nu',
            actions: '',
        },
        {
            numeleStatusului: 'inTesting',
            tabelaDeProvenienta: 'test_storage',
            ordine: '11',
            culoare: 'blue',
            statusPrincipal: 'Nu',
            actions: '',
        },

        // more data...
    ]

    return (
        <div>
            <div>
                <h3 className="text-3xl font-semibold mb-4">Statusuri</h3>
            </div>
            <div className="flex flex-row justify-between gap-4 "></div>
            <div
                className="mt-4"
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
                            Adauga status
                        </Button>
                    }
                />
            </div>
            <div>
                <ModalAddStatus
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                />
            </div>
        </div>
    )
}

export default Statusuri
