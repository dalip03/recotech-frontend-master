import { fetchRequestedParts } from "@/api/partsService";
import CustomTable from "@/components/common/CustomTable";
import ModalConfirm from "@/components/common/ModalConfirm";
import { Button } from "@/components/ui";
import { useEffect, useState } from "react";
import { HiCheck, HiOutlineBan, HiPencil } from "react-icons/hi"
import { mockData } from '@/utils/mockPartData'
import { t } from "i18next"
import CustomDropdown from "@/components/common/CustomDropdown";

export default function Magazie() {
    const [data, setData] = useState<any>([]);
    const [modalData, setModalData] = useState<any>({
        isOpen: false,
        isOpenDelete: false,
        selectedStatement: null,
        confirmAction: {
            isOpen: false,
            actionType: '',
            message: '',
        }
    })

    const fetchPartRequestData = async () => {
        // TODO uncomment this when we have the API
        await fetchRequestedParts()
            .then((result) => {
                setData(result);
            })
        // setData(mockData);
    }

    useEffect(() => {
        const getPartReqData = async () => {
            await fetchPartRequestData();
        }

        getPartReqData()
    }, [])

    const handleConfirmAction = async (actionType: any, id: any) => {
        const selectedStatement = mockData.find((part: any) => part.id == id) || null;
        setModalData((prev: any) => ({
            ...prev,
            selectedStatement,
            confirmAction: {
                ...prev.confirmAction,
                isOpen: true,
                actionType,
                message: actionType === 'APPROVED' ? t("confirmMessage.approve-part") : t("confirmMessage.deny-part"),
            }
        }));
    }

    const handleConfirmActionSubmit = async () => {
        switch (modalData.confirmAction.actionType) {
            case 'APPROVED':
                await handlePartApproval(modalData.confirmAction.actionType)
                break;
            case 'REJECTED':
                await handlePartApproval(modalData.confirmAction.actionType)
                break;
            default:
                break;
        }
        setModalData((prev: any) => ({
            ...prev,
            selectedStatement: null,
            confirmAction: {
                ...prev.confirmAction,
                isOpen: false,
                actionType: '',
                message: '',
            }
        }));
    }

    const handlePartApproval = async (type: string) => {
        const selectedStatement = modalData.selectedStatement;
        setData((prev: any) => prev.filter((item: any) => item.id !== selectedStatement?.id));
        // const statementParts = await fetchStatementParts(selectedStatement?.id);
        // let success = true;
        // for (const part of statementParts) {
        //     const objectToSubmit = {
        //         quantity: part.quantity,
        //         cost: part.cost,
        //         partName: part.partName,
        //         partId: part.partId,
        //         projectId: part.projectId,
        //         statementId: part.statementId,
        //         status: type
        //     }
        //     await updatePartRequest(objectToSubmit, part.id)
        //         .catch(() => {
        //             success = false;
        //             return;
        //         })
        // }
        // success
        //     ? toastNotification.success('Piesele au fost aprobate cu succes!')
        //     : toastNotification.error('Nu s-au putut aproba piesele!');
        // fetchStatementData();
    }

    const columns = [
        {
            header: t("Part Code"),
            accessorKey: 'partCode',
        },
        {
            header: t("Part"),
            accessorKey: 'name',
            cell: ({ row }: any) => {
                return (
                    <div>
                        <span className='font-bold'>{row.original.name}</span> ({row.original.quantity} buc.)
                    </div>
                )
            }
        },
        {
            header: t("Qlty"),
            accessorKey: 'quality',
        },
        {
            header: `${t("Brand")} / ${t("Model")}`,
            accessorKey: 'brandOrModel',
        },
        {
            header: t("Fuel-Shorthand"),
            accessorKey: 'fuel',
        },
        {
            header: 'Cmc',
            accessorKey: 'cmc',
        },
        {
            header: 'KW',
            accessorKey: 'kw',
        },
        {
            header: t("Engine Code"),
            accessorKey: 'engineCode',
        },
        {
            header: t("Chassis"),
            accessorKey: 'chassy',
        },
        {
            header: t("Localization"),
            accessorKey: 'location',
        },
        {
            header: 'PO',
            accessorKey: 'po',
        },
        {
            header: t("Actions"),
            accessorKey: 'actiuni',
            cell: ({ row }: any) => {
                const rowActions = [
                    { eventKey: `${row.original.id}_approve`, label: t("Approve"), onClick: () => handleConfirmAction("APPROVED", row.original.id) },
                    { eventKey: `${row.original.id}_deny`, label: t("Deny"), onClick: () => handleConfirmAction("REJECTED", row.original.id) },
                ]
                return (
                    <div className="flex space-x-2">
                        <CustomDropdown items={rowActions} />
                    </div>
                )
            },
        },
    ]

    return (
        <div>
            <div>
            <h3 className="pb-4 pt-4 font-bold ">{t("Storage")}</h3>
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
                // actionButton={
                //     <Button
                //         style={{ background: '#0188cc', color: 'white' }}
                //         // onClick={handleOpenModal}
                //     >
                //         Adauga clienti
                //     </Button>
                // }
                />
            </div>
            {modalData.confirmAction.isOpen && (
                <ModalConfirm
                    isOpen={modalData.confirmAction.isOpen}
                    message={modalData.confirmAction.message}
                    onConfirm={handleConfirmActionSubmit}
                    onClose={() => setModalData({ ...modalData, confirmAction: { ...modalData.confirmAction, isOpen: false, message: '' } })}
                />
            )}
        </div>
    )
}