import { useState, useEffect } from 'react'
import { Card, Dropdown, Input } from '@/components/ui'
import CustomDropdown from '../../components/common/CustomDropdown'
import Button from '@/components/ui/Button'
import SabloaneSarciniModal from './sarcini/SabloaneSarciniModal'
import ModalDelete from '@/components/common/ModalDelete'
import { deleteTask, fetchTasks, saveTask, updateTask } from '@/api/sarciniService'
import { fetchUsers } from '@/api/userService'
import { fetchProjectTypes } from '@/api/projectTypeService'
import { string } from 'yup'
import { useTranslation } from 'react-i18next'

export default function SabloaneSarcini() {
    const [sarcini, setSarcini] = useState<any[]>([]); // useState for the task list
    const [filteredSarcini, setFilteredSarcini] = useState<any[]>([]);
    const [modalSettings, setModalSettings] = useState<any>({
        isOpen: false,
        selectedTemplate: null,
    });
    const [projectTypes, setProjectTypes] = useState<any>([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [users, setUsers] = useState<any>([]);

    const [filters, setFilters] = useState({
        search: '',
        type: '',
    });

    const { t } = useTranslation();


    const fetchData = async () => {
        const result = await fetchProjectTypes();
        setProjectTypes(result);
        const initialSarcini = await fetchTasks();
        const filteredInitialSarcini = initialSarcini.filter((sarcina: any) => sarcina.template);
        if (filteredInitialSarcini && filteredInitialSarcini.length) {
            const users = await fetchUsers();
            setUsers(users.data.content);
            const updatedSarcini = filteredInitialSarcini.map((sarcina: any) => {
                // Find the user who matches the createdById of the task
                const user = users.data.content.find((user: any) => String(user.id) === String(sarcina.createdBy));
                // If a user is found, replace `createdById` with the full `user` object, otherwise leave it unchanged
                return {
                    ...sarcina,
                    createdBy: user || sarcina.createdById // Include the full user object or null if no match is found
                };
            });
            setSarcini(updatedSarcini); // Populate the state
            setFilteredSarcini(updatedSarcini);
        }
    }

    // Simulate fetching data
    useEffect(() => {
        fetchData();
    }, []);

    const handleNewTemplate = () => {
        setModalSettings({ ...modalSettings, isOpen: true });
    };

    const handleSubmit = async (e: any) => {
        const formSubmissionData = {
            name: e.taskTitle,
            description: e.description ?? '',
            type: e.type ?? '',
        };

        if (modalSettings.selectedTemplate) {
            delete formSubmissionData.type;
            const result = await updateTask(formSubmissionData, modalSettings.selectedTemplate.id);
        } else {
            // Adding a new task
            const newTask = {
                name: e.taskTitle,
                description: e.description ?? '',
                status: 'DRAFT',
                template: true,
                type: e.type ?? '',
            };

            const result = await saveTask(newTask);
            if (result && result.status === 200) {
                fetchData();
                setModalSettings({ ...modalSettings, isOpen: false, selectedTemplate: null });

            }
        }
        await fetchData();
        setModalSettings({ ...modalSettings, isOpen: false, selectedTemplate: null });
    };


    const handleEdit = (taskId: number) => {
        setModalSettings({
            ...modalSettings,
            isOpen: true,
            selectedTemplate: sarcini.find((sarcina) => sarcina.id === taskId),
        });
    };

    const handleDelete = (taskId: number) => {
        setIsDeleteModalOpen(true);
        setModalSettings({
            ...modalSettings,
            selectedTemplate: sarcini.find((sarcina) => sarcina.id === taskId),
        })
        // Handle the delete logic, such as opening a confirmation dialog
    };

    const handleConfirmDelete = async () => {
        const taskId = modalSettings?.selectedTemplate?.id;
        if (!taskId) return; // Safety check if no taskId

        const resultStatus = await deleteTask(taskId);
        if (resultStatus) {
            // Directly update the state by removing the deleted task
            setSarcini((prevSarcini) => prevSarcini.filter((sarcina) => sarcina.id !== taskId));

            await fetchData();
            setIsDeleteModalOpen(false);
            setModalSettings({ ...modalSettings, selectedTemplate: null });
        }
    }

    const handleProjectTypeFilter = (projectType: string) => {
        setFilters((prev: any) => ({ ...prev, type: projectType }));
        filterTasks(projectType, '');
    }

    const handleSearch = (value: string) => {
        setFilters((prev: any) => ({ ...prev, search: value }));
        filterTasks('', value.toLowerCase());
    }

    const filterTasks = (projectType?: string, search?: string) => {
        const filteredSarcini = sarcini.filter((sarcina: any) => {
            const typeCondition = projectType != '' ? sarcina.type === projectType : true;
            const searchCondition = search != '' ? sarcina.name.toLowerCase().includes(search) : true;
            return typeCondition && searchCondition;
        });
        setFilteredSarcini(filteredSarcini);
    }

    return (
        <div>
            <div>
            <h3 className="pb-4 pt-4 font-bold ">{t("Task Templates")}</h3>
            </div>
            <div className="flex flex-wrap items-center justify-between">
                <Button onClick={handleNewTemplate} className="mb-4" shape="circle">
                    {t("New Template")} +
                </Button>
                <div className="flex flex-wrap items-center ml-auto gap-0 lg:gap-4">
                    <Button className="flex flex-1 items-center mb-4" shape="circle">
                        <Dropdown className="" title={filters.type != '' ? filters.type : t("All Tasks")}>
                            <Dropdown.Item onClick={() => handleProjectTypeFilter('')} eventKey="all">{t("All Tasks")}</Dropdown.Item>
                            {projectTypes && projectTypes.map((projectType: any) => {
                                return (
                                    <Dropdown.Item onClick={() => handleProjectTypeFilter(projectType.name)} eventKey={projectType.id}>{projectType.name}</Dropdown.Item>
                                )
                            })}
                        </Dropdown>
                    </Button>
                    <Input
                        className="lg:w-[240px] h-[40px] rounded-full mb-4"
                        placeholder={`${t("Search")}...`}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                {filteredSarcini && filteredSarcini.map((sarcina) => {
                    const dropdownItems = [
                        { eventKey: 'edit', label: 'Edit', onClick: () => handleEdit(sarcina.id) },
                        { eventKey: 'delete', label: t("Delete"), onClick: () => handleDelete(sarcina.id) },
                    ];

                    const user = users.find((user: any) => user.id === sarcina.createdById)
                    const userFullName = `${user?.firstName} ${user?.lastName}`
                    return (
                        <Card
                            key={sarcina.id}
                            header={
                                <div className="flex justify-between items-center">
                                    <span className="text-xl font-bold text-black">
                                        {sarcina.name}
                                    </span>
                                    <CustomDropdown items={dropdownItems} />
                                </div>
                            }
                            className="hover:shadow-lg transition duration-150 ease-in-out rounded-2xl"
                        >
                            <div className="flex justify-between mt-2">
                                <p>{t("Project Type")}: </p>
                                <p className="text-right">{sarcina.type ?? 'N/A'}</p>
                            </div>
                            <div className="flex justify-between mt-2">
                                <p>{t("Created By")}: </p>
                                <p className="text-right">{sarcina?.createdBy?.lastName ? sarcina?.createdBy?.lastName + ' ' + sarcina?.createdBy?.firstName : 'N/A'}</p>
                            </div>
                            <div className="flex justify-between mt-2">
                                <p>{t("Created On")}: </p>
                                <p className="text-right">{new Date(sarcina.createDate).toLocaleDateString('ro-RO')}</p>
                            </div>
                        </Card>
                    );
                })}
            </div>
            {modalSettings.isOpen && (
                <SabloaneSarciniModal
                    isOpen={modalSettings.isOpen}
                    onClose={() => {
                        setModalSettings({ ...modalSettings, selectedTemplate: null, isOpen: false })
                    }}
                    handleSubmit={handleSubmit}
                    data={modalSettings.selectedTemplate}
                />
            )}
            <div>
                <ModalDelete
                    isOpen={isDeleteModalOpen}
                    message={t("deleteMessage.Are you sure you want to delete this task?")}
                    onConfirmDelete={handleConfirmDelete}
                    onClose={() => {
                        setModalSettings({ ...modalSettings, selectedTemplate: null });
                        setIsDeleteModalOpen(false)
                    }}
                />
            </div>
        </div>
    );
};
