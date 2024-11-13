import React, { ChangeEvent } from 'react'
import { Button, Checkbox, Input } from '@/components/ui'
import ReactModal from 'react-modal'
import { HiUserCircle } from 'react-icons/hi'

interface ModalAddStatusProps {
    isOpen: boolean
    onClose: () => void
}

const ModalAddStatus: React.FC<ModalAddStatusProps> = ({ isOpen, onClose }) => {
    const onCheck = (value: boolean, e: ChangeEvent<HTMLInputElement>) => {
        console.log(value, e)
    }
    return (
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
            onRequestClose={onClose}
        >
            <div className="flex">
                {/* Sidebar */}
                <div className="w-1/3 bg-gray-100 p-8">
                    <div className="flex flex-col items-center relative">
                        <div className="w-24 h-24 bg-gray-300 rounded-full mb-4 flex items-center justify-center">
                            <HiUserCircle className="text-7xl text-gray-500" />
                        </div>

                        <h3 className="text-xl font-semibold">Account Info</h3>
                        <p className="text-gray-600">
                            Add here the user account info.
                        </p>
                    </div>
                </div>

                {/* Main Form */}
                <div className="w-2/3 p-8">
                    <form>
                        <div className="grid grid-cols-1 gap-4 mb-6">
                            <div>
                                <label className="block text-gray-700">
                                    Nume
                                </label>
                                <Input
                                    readOnly
                                    className="w-full"
                                    defaultValue="Nume"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700">
                                    Tabela de provenienta
                                </label>
                                <Input
                                    className="w-full"
                                    placeholder="Tabela de provenienta"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700">
                                    Ordine
                                </label>
                                <Input
                                    className="w-full"
                                    placeholder="Ordine"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700">
                                    Culoare
                                </label>
                                <Input
                                    className="w-full"
                                    defaultValue="Culoare"
                                />
                            </div>
                            <div className="flex flex-row items-center gap-4">
                                <label className="block text-gray-700">
                                    Status principal?
                                </label>
                                <Checkbox
                                    defaultChecked
                                    onChange={onCheck}
                                ></Checkbox>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4">
                            <Button
                                style={{
                                    background: '#0188cc',
                                    color: 'white',
                                }}
                                className="bg-blue-600 text-white hover:grey-700 rounded px-4 py-2"
                                onClick={onClose}
                            >
                                Salvează Status
                            </Button>
                            <Button
                                className="bg-gray-200 text-gray-700 rounded px-4 py-2"
                                onClick={onClose}
                            >
                                Înapoi
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </ReactModal>
    )
}

export default ModalAddStatus
