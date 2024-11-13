import React from 'react'
import ReactModal from 'react-modal'
import { Button } from '../ui'
import { t } from 'i18next'

interface ModalDeleteProps {
    isOpen: boolean
    onClose: () => void
    onConfirmDelete: () => void
    message: string // Add a message prop to accept dynamic text
}

const ModalDelete: React.FC<ModalDeleteProps> = ({
    isOpen,
    onClose,
    onConfirmDelete,
    message,
}) => {
    return (
        <ReactModal
            isOpen={isOpen}
            style={{
                content: {
                    top: '50%',
                    left: '50%',
                    right: 'auto',
                    bottom: 'auto',
                    marginRight: '-50%',
                    transform: 'translate(-50%, -50%)',
                    width: '90%',
                    maxWidth: '400px',
                    padding: '20px',
                    borderRadius: '10px',
                    background: '#f8f9fa',
                    border: '1px solid #dee2e6',
                    zIndex: 1001, // Ensure content is above the overlay
                },
                overlay: {
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                    zIndex: 1000, // Ensure overlay is above other content
                },
            }}
            ariaHideApp={false}
            contentLabel="Delete Confirmation Modal"
            onRequestClose={onClose}
        >
            <div style={{ padding: '10px', textAlign: 'center' }}>
                <h2 style={{ marginBottom: '20px' }}>{t("Delete Confirmation")}</h2>
                <p style={{ marginBottom: '20px' }}>{message}</p>{' '}
                <div className="flex justify-between">
                    <Button
                        style={{ backgroundColor: '#dc3545', color: '#fff' }}
                        className="w-[120px] h-[40px]"
                        onClick={onConfirmDelete}
                    >
                        {t("Delete")}
                    </Button>
                    <Button
                        style={{ backgroundColor: '#6c757d', color: '#fff' }}
                        className="w-[120px] h-[40px]"
                        onClick={onClose}
                    >
                        {t("Cancel")}
                    </Button>
                </div>
            </div>
        </ReactModal>
    )
}

export default ModalDelete
