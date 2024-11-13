import React, { useState } from 'react'
import { Button, Input } from '../../../../components/ui'
import ReactModal from 'react-modal'
import { addProject } from '../../../../api/projectService'

interface ModalAddProjectsProps {
    isOpen: boolean
    onClose: () => void
}

const ModalAddProjects: React.FC<ModalAddProjectsProps> = ({
    isOpen,
    onClose,
}) => {
    const [projectData, setProjectData] = useState({
        name: '',
        description: '',
        type: '',
        status: 'NEW',
        checkpoint: '',
        materialCost: 0,
        laborCost: 0,
        discount: 0,
        discountType: 'PERCENTAGE',
        paymentType: 'CASH',
        paymentDate: '',
        vat: 0,
    })

    const formatDateForInput = (dateString: string) => {
        // Extracts the date part in yyyy-MM-dd format
        const date = new Date(dateString)
        const year = date.getFullYear()
        const month = `0${date.getMonth() + 1}`.slice(-2)
        const day = `0${date.getDate()}`.slice(-2)
        return `${year}-${month}-${day}`
    }

    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
    ) => {
        const { name, value, type } = e.target
        if (type === 'number') {
            setProjectData((prev) => ({
                ...prev,
                [name]: parseFloat(value) || 0, // Parse to float or default to 0
            }))
        } else if (name === 'paymentDate') {
            setProjectData((prev) => ({
                ...prev,
                [name]: new Date(value).toISOString(), // Format as ISO string
            }))
        } else if (type === 'select-one') {
            setProjectData((prev) => ({
                ...prev,
                [name]: value,
            }))
        } else {
            setProjectData((prev) => ({ ...prev, [name]: value }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        console.log('Submitting project data:', projectData)
        try {
            await addProject(projectData)
            alert('Project added successfully!')
            onClose() // Close the modal after successful submission
        } catch (error) {
            console.error('Error adding project:', error)
            alert('Failed to add project.')
        }
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
                {/*  <div className="w-1/3 bg-gray-100 p-8">
                    <div className="flex flex-col items-center relative">
                        <div className="w-24 h-24 bg-gray-300 rounded-full mb-4 flex items-center justify-center">
                            <HiUserCircle className="text-7xl text-gray-500" />
                        </div>
                        <h3 className="text-xl font-semibold">Account Info</h3>
                        <p className="text-gray-600">
                            Add here the user account info.
                        </p>
                    </div>
                </div> */}

                {/* Main Form */}

                <div
                    className="w-full p-8 overflow-y-auto"
                    style={{ maxHeight: '80vh' }}
                >
                    <div className="flex justify-start items-center mb-4">
                        <h1>Adauga proiect nou</h1>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <h4>Nume proiect</h4>
                            <Input
                                name="name"
                                className="w-full h-[40px] rounded-full mt-2"
                                placeholder="Project Name"
                                value={projectData.name}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="mb-4">
                            <h4>Descriere</h4>
                            <Input
                                textArea
                                name="description"
                                className="w-full h-[40px] rounded-xl mt-2"
                                placeholder="Description"
                                value={projectData.description}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="mb-4">
                            <h4>Tip proiect</h4>
                            <Input
                                name="type"
                                className="w-full h-[40px] rounded-full mt-2"
                                placeholder="Type"
                                value={projectData.type}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="mb-4">
                            <h4>Status</h4>

                            <select
                                name="status"
                                className="w-full h-[40px] rounded-full mt-2"
                                value={projectData.status}
                                onChange={handleInputChange}
                            >
                                <option value="NEW">NEW</option>
                                <option value="APPROVED">APPROVED</option>
                                <option value="IN PROGRESS">IN PROGRESS</option>
                                <option value="DECLINED">DECLINED</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <h4>Checkpoint</h4>
                            <Input
                                name="checkpoint"
                                className="w-full h-[40px] rounded-full mt-2"
                                placeholder="Checkpoint"
                                value={projectData.checkpoint}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="mb-4">
                            <h4> Cost Materiale</h4>
                            <Input
                                name="materialCost"
                                className="w-full h-[40px] rounded-full mt-2"
                                placeholder="Material Cost"
                                value={projectData.materialCost}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="mb-4">
                            <h4>Cost Manopera</h4>
                            <Input
                                name="laborCost"
                                className="w-full h-[40px] rounded-full mt-2"
                                placeholder="Labor Cost"
                                value={projectData.laborCost}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="mb-4">
                            <h4>Discount</h4>
                            <Input
                                name="discount"
                                className="w-full h-[40px] rounded-full mt-2"
                                placeholder="Discount"
                                value={projectData.discount}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="mb-4">
                            <h4>Tip Discount</h4>
                            <select
                                name="discountType"
                                className="w-full h-[40px] rounded-full mt-2"
                                value={projectData.discountType}
                                onChange={handleInputChange}
                            >
                                <option value="PERCENTAGE">Procent</option>
                                <option value="FIXED">FIX</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <h4>Metoda de plata</h4>
                            <select
                                name="paymentType"
                                className="w-full h-[40px] rounded-full mt-2"
                                value={projectData.paymentType}
                                onChange={handleInputChange}
                            >
                                <option value="CASH">CASH</option>
                                <option value="CREDIT">CREDIT</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <h4>Data platii</h4>
                            <Input
                                name="paymentDate"
                                type="date"
                                className="w-full h-[40px] rounded-full mt-2"
                                placeholder="Payment Date"
                                value={formatDateForInput(
                                    projectData.paymentDate,
                                )}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="mb-4">
                            <h4>TVA</h4>
                            <Input
                                name="vat"
                                className="w-full h-[40px] rounded-full mt-2"
                                placeholder="VAT"
                                value={projectData.vat}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="flex justify-between space-x-4">
                            <Button
                                style={{
                                    background: '#0188cc',
                                    color: 'white',
                                }}
                                className="bg-blue-600 text-white hover:grey-700 rounded px-4 py-2"
                                type="submit"
                            >
                                Salveaza Proiect
                            </Button>
                            <Button
                                className="bg-gray-200 text-gray-700 hover:grey-700 rounded px-4 py-2"
                                onClick={onClose}
                            >
                                Inchide
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </ReactModal>
    )
}

export default ModalAddProjects
