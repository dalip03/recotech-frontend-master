import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import Dialog from '@/components/ui/Dialog';
import Input from '@/components/ui/Input';
import { FormItem, FormContainer } from '@/components/ui/Form';
import { Field, FieldProps, Form, Formik } from 'formik';
import * as Yup from 'yup';
import { Badge, Select } from '@/components/ui';
import { fetchUsers } from '@/api/userService';
import { fetchProjects } from '@/api/projectService';
import { useAppSelector } from '@/store';
import { fetchProjectTypes } from '@/api/projectTypeService';
import { useTranslation } from 'react-i18next';
import { hasAccess, UserRole } from '@/utils/sharedHelpers';

interface FormValues {
    id: string;
    taskTitle: string;
    description: string;
    status: string;
    assignedBy: string;
    assignedTo: object;
    projectId: string;
    dueDate: string;
    projectType: string;
}

const validationSchema = Yup.object().shape({
    taskTitle: Yup.string().required('Denumirea Sarcinii este necesară'),
    description: Yup.string().optional(),
    status: Yup.string().optional(),
    assignedBy: Yup.string().required('Asignat de este necesar'),
    assignedTo: Yup.array().of(Yup.string()).required('Asignat către este necesar'), // Validate as array of strings
    projectId: Yup.string().required('Proiectul este necesar'),
    projectType: Yup.string().required('Tipul proiectului este necesar'),
    dueDate: Yup.string()
        // .required('Până la data este necesară')
        .matches(/^\d{4}-\d{2}-\d{2}$/, 'Formatul datei este invalid (AAAA-LL-ZZ)'),
});

export default function ModalSarcini({ isOpen, onClose, handleSubmit, data, projectId }: any) {
    const user = useAppSelector((state) => state.auth.user);
    const [modalData, setModalData] = useState<any>({
        users: [],
        projects: [],
        projectTypes: [],
        statuses: (() => {
            switch (user.authority) {
                case 'OPERATOR':
                    return [
                        { value: 'TODO', label: 'TODO' },
                        { value: 'IN_PROGRESS', label: 'IN PROGRESS' },
                        { value: 'IN_REVIEW', label: 'IN REVIEW' },
                        { value: 'DONE', label: 'DONE' },
                    ];
                default:
                    return [
                        { value: 'TODO', label: 'TODO' },
                        { value: 'APPROVED', label: 'APPROVED' },
                        { value: 'IN_PROGRESS', label: 'IN PROGRESS' },
                        { value: 'IN_REVIEW', label: 'IN REVIEW' },
                        { value: 'DONE', label: 'DONE' },
                        { value: 'REJECTED', label: 'REJECTED' },
                    ];
            }
        })()
    });
    const [formValues, setFormValues] = useState<any>(null);

    const initializeFormValues = (projects: any) => {
        const initProjectType = projectId != null ? projects.find((project: any) => project.id == projectId)?.type : '';
        const initialValues: FormValues = {
            id: data?.id ?? null,
            taskTitle: data?.name ?? '',
            description: data?.description ?? '',
            status: data?.status ?? '',
            assignedBy: data?.assignedBy ?? user.id,
            assignedTo: data?.assignedTo ? data.assignedTo.map((user: any) => user.id) : [],
            projectId: projectId != null ? parseInt(projectId) : data?.projectId ?? '',
            dueDate: data?.dueDate ?? '',
            projectType: data?.type ?? initProjectType ?? '',
        };
        return initialValues;
    }

    const canView = hasAccess(user.authority as UserRole, ['ADMIN']);
    const { t } = useTranslation();

    useEffect(() => {
        async function fetchData() {
            const usersData = await fetchUsers();
            
            const users = usersData.data.content;
            // console.log(users);
            // const updatedUsers = [
            //     { 
            //         id: 2, 
            //         firstName: "abcd", 
            //         lastName: "sdfsdf", 
            //         role: "dsfs", 
            //         username: "sdfsdfs", 
            //         blackPoints: 0, 
            //         whitePoints: 0 
            //     },
            //     ...users,
            // ];
            // console.log(updatedUsers);
            // users = updatedUsers;
            const projects = await fetchProjects();
            const projectTypesData = await fetchProjectTypes();
            const projectTypes = projectTypesData.map((projectType: any) => ({
                id: projectType.id,
                value: projectType.name,
                label: projectType.name,
            }));

            setModalData((prev: any) => ({
                ...prev,
                users,
                projects,
                projectTypes,
            }));
            console.log(modalData)
            const formValues = initializeFormValues(projects);
            setFormValues(formValues);
        }

        if (isOpen) {
            fetchData();
        }
    }, [isOpen]);

    return (
        <Dialog isOpen={isOpen} onClose={onClose} width={900}>
            {formValues && (
                <Formik
                    initialValues={formValues}
                    validationSchema={validationSchema}
                    onSubmit={(values) => handleSubmit(values)}
                    enableReinitialize
                >
                    {({ setFieldValue, errors, touched, values }) => (
                        <Form className="p-4">
                            <FormContainer className="text-left">
                                <h5 className="mb-4">
                                    <FormItem
                                        className="w-fit"
                                        invalid={Boolean(errors.taskTitle && touched.taskTitle)}
                                    >
                                        <Field
                                            placeholder={t("Task Name")}
                                            name="taskTitle"
                                            component={Input}
                                            value={values.taskTitle}
                                            onChange={(e: any) => setFieldValue('taskTitle', e.target.value)}
                                            disabled={!canView}
                                        />
                                        {errors.taskTitle && touched.taskTitle && (
                                            <p className="text-sm text-red-600 mt-1">
                                                {String(errors.taskTitle)}
                                            </p>
                                        )}
                                    </FormItem>
                                </h5>
                            </FormContainer>

                            <div className="mb-10">
                                <FormContainer layout='horizontal' className="text-left">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 gap-x-10">
                                        <div className='flex items-center gap-5 justify-between'>
                                            <label className='text-sm text-muted-foreground'>ID</label>
                                            <p className='text-base'>{`${data?.id ?? '--------'}`}</p>
                                        </div>

                                        {/* Asignat de */}
                                        <FormItem
                                            label={t("Assigned By")}
                                            invalid={Boolean(errors.assignedBy && touched.assignedBy)}
                                            errorMessage={String(errors.assignedBy)}
                                        >
                                            <Field name="assignedBy">
                                                {({ field, form }: FieldProps) => {
                                                    const options = modalData.users.map((user: any) => ({
                                                        value: user.id,
                                                        label: `${user.firstName} ${user.lastName}`,
                                                    }));

                                                    const selectedOption = options.find((option: any) => option.value === field.value);

                                                    return (
                                                        <Select
                                                            {...field}
                                                            options={options}
                                                            value={selectedOption}
                                                            onChange={(option) => form.setFieldValue(field.name, option?.value)}
                                                            isDisabled
                                                        />
                                                    );
                                                }}
                                            </Field>
                                        </FormItem>

                                        {/* Status */}
                                        {data?.id && (
                                            <FormItem
                                                label={t("Status")}
                                                invalid={Boolean(errors.assignedTo && touched.assignedTo)}
                                                errorMessage={String(errors.assignedTo)}
                                            >
                                                <Field name="status">
                                                    {({ field, form }: FieldProps) => {
                                                        const options = modalData.statuses;
                                                        const selectedOption = options.find((option: any) => option.value === field.value);

                                                        return (
                                                            <Select
                                                                {...field}
                                                                options={options}
                                                                value={selectedOption}
                                                                onChange={(selectedOption) => {
                                                                    form.setFieldValue(field.name, selectedOption?.value || '');
                                                                }}
                                                                placeholder={t("Status")}
                                                                isDisabled={!canView && user.authority as UserRole !== 'OPERATOR' && user.authority as UserRole !== 'VANZATOR'}
                                                            />
                                                        );
                                                    }}
                                                </Field>
                                            </FormItem>) || (
                                                <div className="flex items-center gap-5 justify-between">
                                                    <label className="text-sm text-muted-foreground">Status</label>
                                                    <Badge
                                                        className="p-2 px-4 rounded-lg bg-[#AAAAAA] text-white hover:cursor-not-allowed"
                                                        content={data?.status || '   TODO   '}
                                                    />
                                                </div>
                                            )}

                                        {/* Asignat Către */}
                                        <FormItem
                                            label={t("Assigned To")}
                                            invalid={Boolean(errors.assignedTo && touched.assignedTo)}
                                            errorMessage={String(errors.assignedTo)}
                                        >
                                        {/* without unassigned  */}
                                           {/* <Field name="assignedTo">
                                                {({ field, form }: FieldProps) => {
                                                    const options = modalData.updatedUsers.map((user: any) => ({
                                                        value: user.id,
                                                        label: `${user.firstName} ${user.lastName}`,
                                                    }));

                                                    const selectedOptions = field.value
                                                        .map((userId: number | string) => options.find((option: any) => option.value === userId))
                                                        .filter(Boolean); // Filter out any undefined values

                                                    return (
                                                        <Select
                                                            {...field}
                                                            options={options}
                                                            value={selectedOptions}
                                                            isMulti
                                                            onChange={(selectedOptions) => {
                                                                const selectedUserIds = selectedOptions.map((option: any) => option.value);
                                                                form.setFieldValue(field.name, selectedUserIds);
                                                            }}
                                                            placeholder={t("Users")}
                                                            isDisabled={!canView}
                                                        />
                                                    );
                                                }}
                                            </Field> */}


                                        {/* with unassign  */}
                                        <Field name="assignedTo">
    {({ field, form }: FieldProps) => {
        // Prepare the dropdown options
        const options = [
            { value: -1, label: "Unassigned", }, // Add "Unassigned" as a dropdown option
            ...modalData.users.map((user: any) => ({
                value: user.id,
                label: `${user.firstName} ${user.lastName}`,
            })),
        ];

        // Map the current value to the selected options
        const selectedOptions = field.value
            .map((userId: number | string) => options.find((option: any) => option.value === userId))
            .filter(Boolean); // Filter out any undefined values

        return (
            <Select
                {...field}
                options={options}
                value={selectedOptions}
                isMulti
                onChange={(selectedOptions) => {
                    const selectedUserIds = selectedOptions.map((option: any) => option.value);

                    // If "Unassigned" is selected, clear other selections
                    if (selectedUserIds.includes("unassigned")) {
                        form.setFieldValue(field.name, ["unassigned"]);
                    } else {
                        // Otherwise, remove "Unassigned" if it exists
                        const filteredUserIds = selectedUserIds.filter((id) => id !== "unassigned");
                        form.setFieldValue(field.name, filteredUserIds);
                    }
                }}
                placeholder="Select "
            />
        );
    }}
</Field>

                                        </FormItem>

                                        {/* Proiect */}
                                        <FormItem
                                            label={t("Project")}
                                            invalid={Boolean(errors.projectId && touched.projectId)}
                                            errorMessage={String(errors.projectId)}
                                        >
                                            <Field name="projectId">
                                                {({ field, form }: FieldProps) => {
                                                    const options = modalData.projects.map((project: any) => ({
                                                        value: project.id,
                                                        label: project.name,
                                                    }));

                                                    const selectedOption = options.find((option: any) => option.value === field.value);

                                                    return (
                                                        <Select
                                                            {...field}
                                                            options={options}
                                                            value={selectedOption}
                                                            placeholder={t("Project")}
                                                            onChange={(option) => {
                                                                form.setFieldValue(field.name, option?.value);

                                                                const selectedProject = modalData.projects.find((p: any) => p.id === option?.value);
                                                                form.setFieldValue('projectType', selectedProject?.type || '');
                                                            }}
                                                            isDisabled={projectId || !canView}
                                                        />
                                                    );
                                                }}
                                            </Field>
                                        </FormItem>

                                        {/* Până la data */}
                                        <FormItem
                                            label={t("Due Date")}
                                            invalid={Boolean(errors.dueDate && touched.dueDate)}
                                            errorMessage={String(errors.dueDate)}
                                        >
                                            <Field name="dueDate">
                                                {({ field, form }: FieldProps) => (
                                                    <Input
                                                        type="date"
                                                        {...field}
                                                        value={values.dueDate}
                                                        onChange={(e) => setFieldValue('dueDate', e.target.value)}
                                                        disabled={!canView}
                                                    />
                                                )}
                                            </Field>
                                        </FormItem>
                                    </div>
                                </FormContainer>

                                {/* Tip Proiect */}
                                <FormItem
                                    label={t("Project Type")}
                                    invalid={Boolean(errors.projectType && touched.projectType)}
                                    errorMessage={String(errors.projectType)}
                                >
                                    <Field name="projectType">
                                        {({ field, form }: FieldProps) => (
                                            <Select
                                                {...field}
                                                options={modalData.projectTypes}
                                                value={modalData.projectTypes.find((option: any) => option.value === field.value)}
                                                onChange={(option) => form.setFieldValue(field.name, option?.value)}
                                                isDisabled={projectId || !canView}
                                                placeholder={t("Project Type")}
                                            />
                                        )}
                                    </Field>
                                </FormItem>
                            </div>

                            <FormContainer>
                                {/* Descriere */}
                                <FormItem className="w-full" label={t("Description")}>
                                    <Input
                                        textArea
                                        name={t("Description")}
                                        value={values.description}
                                        onChange={(e) => setFieldValue('description', e.target.value)}
                                        disabled={!canView && user.authority as UserRole !== 'OPERATOR' && user.authority as UserRole !== 'VANZATOR'}
                                    />
                                </FormItem>
                            </FormContainer>

                            {/* Buttons */}

                            <div className="flex justify-end mt-6">
                                <Button variant="plain" onClick={onClose}>
                                    {t("Close")}
                                </Button>
                                {hasAccess(user.authority as UserRole, ['ADMIN', 'OPERATOR', 'VANZATOR']) && (
                                    <Button variant="solid" type="submit">
                                        {t("Save")}
                                    </Button>
                                )}
                            </div>
                        </Form>
                    )}
                </Formik>
            )}
        </Dialog>
    );
}
