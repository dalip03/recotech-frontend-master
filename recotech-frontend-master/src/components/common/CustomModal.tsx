import { Button, Input } from '@/components/ui'
import React from 'react'
import { HiPlusCircle } from 'react-icons/hi'
import ReactModal from 'react-modal'

interface CustomModalProps {
    isOpen: boolean
    onClose: () => void
}

const CustomModal: React.FC<CustomModalProps> = ({ isOpen, onClose }) => {
    return (
        <div>
            <ReactModal
                style={{
                    content: {
                        top: '50%',
                        left: '50%',
                        right: 'auto',
                        bottom: 'auto',
                        marginRight: '-50%',
                        transform: 'translate(-50%, -50%)',
                        width: '90%',
                        maxWidth: '900px',
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
                isOpen={isOpen}
                ariaHideApp={false}
                contentLabel="Example Modal"
                onRequestClose={onClose}
            >
                <div style={{ padding: '10px' }}>
                    <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>
                        Adauga piese
                    </h2>
                    <div className="flex items-center justify-start gap-2">
                        <label>Adaugat de</label>
                        <Input className="w-[400px] h-[30px] rounded-full mb-4 mt-4" />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center justify-start gap-2">
                            <label>Categorie</label>
                            <Input
                                className="w-[200px] h-[30px] rounded-full mb-4 mt-4"
                                placeholder="Categorie"
                            />
                        </div>
                        <div className="flex items-center justify-start gap-2">
                            <label>Piesa</label>
                            <Input
                                className="w-[200px] h-[30px] rounded-full mb-4 mt-4"
                                placeholder="Piesa"
                            />
                        </div>
                        <div className="flex items-center justify-start gap-2">
                            <label>Cantitate</label>
                            <Input
                                className="w-[200px] h-[30px] rounded-full mb-4 mt-4"
                                placeholder="Cantitate"
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center justify-start gap-2">
                            <label>Categorie</label>
                            <Input
                                className="w-[200px] h-[30px] rounded-full mb-4 mt-4"
                                placeholder="Categorie"
                            />
                        </div>
                        <div className="flex items-center justify-start gap-2">
                            <label>Piesa</label>
                            <Input
                                className="w-[200px] h-[30px] rounded-full mb-4 mt-4"
                                placeholder="Piesa"
                            />
                        </div>
                        <div className="flex items-center justify-start gap-2">
                            <label>Cantitate</label>
                            <Input
                                className="w-[200px] h-[30px] rounded-full mb-4 mt-4"
                                placeholder="Cantitate"
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center justify-start gap-2">
                            <label>Categorie</label>
                            <Input
                                className="w-[200px] h-[30px] rounded-full mb-4 mt-4"
                                placeholder="Categorie"
                            />
                        </div>
                        <div className="flex items-center justify-start gap-2">
                            <label>Piesa</label>
                            <Input
                                className="w-[200px] h-[30px] rounded-full mb-4 mt-4"
                                placeholder="Piesa"
                            />
                        </div>
                        <div className="flex items-center justify-start gap-2">
                            <label>Cantitate</label>
                            <Input
                                className="w-[200px] h-[30px] rounded-full mb-4 mt-4"
                                placeholder="Cantitate"
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center justify-start gap-2">
                            <label>Categorie</label>
                            <Input
                                className="w-[200px] h-[30px] rounded-full mb-4 mt-4"
                                placeholder="Categorie"
                            />
                        </div>
                        <div className="flex items-center justify-start gap-2">
                            <label>Piesa</label>
                            <Input
                                className="w-[200px] h-[30px] rounded-full mb-4 mt-4"
                                placeholder="Piesa"
                            />
                        </div>
                        <div className="flex items-center justify-start gap-2">
                            <label>Cantitate</label>
                            <Input
                                className="w-[200px] h-[30px] rounded-full mb-4 mt-4"
                                placeholder="Cantitate"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-center">
                        <Button
                            style={{ border: 'none', background: '#f8f9fa' }}
                            className="flex justify-center items-center hover:text-blue-700 mt-4 w-[180px] h-[40px]"
                            shape="circle"
                            onClick={onClose}
                        >
                            <HiPlusCircle className="w-[30px] h-[30px]" />{' '}
                            Adauga piesa
                        </Button>
                    </div>

                    <div className="flex items-center justify-between">
                        <Button
                            className="flex justify-center items-center hover:text-blue-700 mt-4 w-[300px] h-[40px]"
                            shape="circle"
                            onClick={onClose}
                        >
                            Inchide
                        </Button>
                        <Button
                            className="flex justify-center items-center hover:text-blue-700 mt-4 w-[300px] h-[40px]"
                            shape="circle"
                        >
                            Salveaza
                        </Button>
                    </div>
                </div>
            </ReactModal>
        </div>
    )
}

export default CustomModal
