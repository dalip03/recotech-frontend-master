import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import Dialog from '@/components/ui/Dialog';
import Input from '@/components/ui/Input';
import { FormItem, FormContainer } from '@/components/ui/Form';
import { Field, FieldArray, FieldProps, Form, Formik } from 'formik';
import * as Yup from 'yup';
import { Badge, Select } from '@/components/ui';
import { fetchUsers } from '@/api/userService';
import { fetchProjects } from '@/api/projectService';
import { useAppSelector } from '@/store';
import { fetchProjectTypes } from '@/api/projectTypeService';
import { fetchParts, fetchPartsCategories } from '@/api/partsService';
import { HiMinus, HiPlus } from 'react-icons/hi';
import { hasAccess, UserRole } from '@/utils/sharedHelpers';
import { useTranslation } from 'react-i18next';
import { fetchStatementTypes } from '@/api/statementTypeService';

interface FormValues {
    id: string;
    name: string;
    description: string;
    status: string;
    projectId: string;
    deadline: string;
    assignedBy: string;
    assignedTo: number[];
    materialCost: string;
    laborCost: string;
    statementType: string;
    parts: any[];
}

const validationSchema = Yup.object().shape({
    name: Yup.string().required('Denumirea constatarii este necesară'),
    description: Yup.string().optional(),
    status: Yup.string().optional(),
    projectId: Yup.string().required('Proiectul este necesar'),
    assignedTo: Yup.array().of(Yup.string()).required('Asignat către este necesar'), // Validate as array of strings
    deadline: Yup.string()
        .required('Până la data este necesară'),
    statementType: Yup.string().required('Tipul manoperei este necesar'),
    laborCost: Yup.string(),
    materialCost: Yup.string().required('Costul de materiale este necesar'),
    parts: Yup.mixed(), // Validate as array of strings
});

export default function ModalConstatari({ isOpen, onClose, handleSubmit, data, projectId }: any) {
    const [modalData, setModalData] = useState<any>({
        users: [],
        projects: [],
        projectTypes: [],
        statuses: [
            { value: 'DRAFT', label: 'DRAFT' },
            { value: 'TODO', label: 'TODO' },
            { value: 'IN_PROGRESS', label: 'IN PROGRESS' },
            { value: 'DONE', label: 'DONE' },
        ],
        statementTypes: [],
        partsCategories: [],
        parts: {},
    });

    // mock number used for initial price adjustment due to a lack of backend support
    // TODO remove
    const magicNumber = 40;

    const user = useAppSelector((state) => state.auth.user);

    const { t } = useTranslation();
    const initialValues: FormValues = {
        id: data?.id ?? null,
        name: data?.name ?? '',
        description: data?.description ?? '',
        status: data?.status ?? '',
        projectId: data?.projectId ?? (projectId ? parseInt(projectId) : null),
        assignedBy: data?.createdById ?? (!data?.id ? user.id : null),
        assignedTo: data?.assignedTo ?? [],
        deadline: data?.deadline ?? '',
        materialCost: data?.parts ? data.parts.reduce((total: any, part: any) => total + (part.requestCost + magicNumber || 0), 0) : 0, // Calculate total requestCost
        laborCost: data?.cost ?? '',
        statementType: data?.type ?? '',
        parts: data?.parts.map((part: any) => ({
            category: part?.category || '',
            part: part,
            quantity: part.quantity || 1,
            cost: part.requestCost + magicNumber || 0,
            partCode: '1234,5678',
            location: 'Hala 1',
            priceAdjustment: magicNumber,
        })) ?? [],
    };

    useEffect(() => {

        async function fetchData() {
            const usersData = await fetchUsers();
            const users = usersData.data.content;
            const projects = await fetchProjects();
            const projectTypesData = await fetchProjectTypes();
            const projectTypes = projectTypesData.map((projectType: any) => ({
                id: projectType.id,
                value: projectType.name,
                label: projectType.name,
            }));
            const statementTypesData = await fetchStatementTypes();
            const statementTypes = statementTypesData.map((statementType: any) => ({
                id: statementType.id,
                value: statementType.name,
                label: statementType.name,
            }))
            const partsCategories = await fetchPartsCategories();

            setModalData((prev: any) => ({
                ...prev,
                users,
                projects,
                projectTypes,
                partsCategories,
                statementTypes,
            }));
        }

        if (isOpen) {
            fetchData();
        }
    }, [isOpen]);

    useEffect(() => {
        const fetchPartsForPreSelectedCategories = async () => {
            if (data && data.parts) {
                for (let index = 0; index < data.parts.length; index++) {
                    const part = data.parts[index];
                    if (part.category) {
                        // Fetch parts for the category at this index
                        const parts = await fetchParts(`category=${part.category}`);
                        setModalData((prev: any) => ({
                            ...prev,
                            parts: {
                                ...prev.parts,
                                [index]: parts, // Store parts for this index
                            },
                        }));
                    }
                }
            }
        };

        if (isOpen && data?.parts?.length) {
            fetchPartsForPreSelectedCategories();
        }
    }, [isOpen, data]);

    return (
        <Dialog isOpen={isOpen} onClose={onClose} className={'!max-w-full !w-10/12'}>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={(values) => handleSubmit(values)}
            >
                {({ setFieldValue, errors, touched, values }) => (
                                            <div className="max-h-[70vh] w-full overflow-y-auto space-y-5 p-5">

                    <Form className="p-4">
                        
                            <FormContainer className="text-left">
                                <h5 className="mb-4">
                                    <FormItem
                                        className="w-fit"
                                        invalid={Boolean(errors.name && touched.name)}
                                    >
                                        <Field
                                            placeholder={t("Statement Name")}
                                            name="name"
                                            component={Input}
                                            value={values.name}
                                            onChange={(e: any) => setFieldValue('name', e.target.value)}
                                            disabled={!hasAccess(user.authority as UserRole, ['ADMIN'])}
                                        />
                                        {errors.name && touched.name && (
                                            <p className="text-sm text-red-600 mt-1">
                                                {errors.name}
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
                                            errorMessage={errors.assignedBy}
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
                                                invalid={Boolean(errors.status && touched.status)}
                                                errorMessage={errors.status}
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
                                                                placeholder="Please Select"
                                                                isDisabled={!hasAccess(user.authority as UserRole, ['ADMIN'])}
                                                            />
                                                        );
                                                    }}
                                                </Field>
                                            </FormItem>) || (
                                                <div className="flex items-center gap-5 justify-between">
                                                    <label className="text-sm text-muted-foreground">Status</label>
                                                    <Badge
                                                        className="p-2 rounded-lg bg-[#AAAAAA] text-white hover:cursor-not-allowed"
                                                        content={data?.status || 'TODO >'}
                                                    />
                                                </div>
                                            )}

                                        {/* Asignat Către */}
                                        <FormItem
                                            label={t("Assigned To")}
                                            invalid={Boolean(errors.assignedTo && touched.assignedTo)}
                                            errorMessage={String(errors.assignedTo)}
                                        >
                                            <Field name="assignedTo">
                                                {({ field, form }: FieldProps) => {
                                                    const options = modalData.users.map((user: any) => ({
                                                        value: user.id,
                                                        label: `${user.firstName} ${user.lastName}`,
                                                    }));

                                                    const selectedOptions = field.value
                                                        .map((userId: number) => options.find((option: any) => option.value === userId))
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
                                                            isDisabled={!hasAccess(user.authority as UserRole, ['ADMIN'])}
                                                        />
                                                    );
                                                }}
                                            </Field>

                                        </FormItem>
                                        {hasAccess(user.authority as UserRole, ['ADMIN', 'VANZATOR', 'MAGAZIE']) && (
                                            <FormItem
                                                label={t("Material Cost")}
                                                invalid={Boolean(errors.materialCost && touched.materialCost)}
                                                errorMessage={errors.materialCost}

                                            >
                                                <Field name="materialCost">
                                                    {({ field }: FieldProps) => (
                                                        <Input
                                                            {...field}
                                                            type="text"
                                                            className="rounded-xl w-full"
                                                            placeholder={t("Material Cost")}
                                                            value={field.value}
                                                            onChange={field.onChange}
                                                            disabled={true}
                                                        />
                                                    )}
                                                </Field>
                                            </FormItem>
                                        )}
                                        {hasAccess(user.authority as UserRole, ['ADMIN', 'VANZATOR', 'MAGAZIE']) && (
                                            <FormItem
                                                label={t("Labour Cost")}
                                                invalid={Boolean(errors.laborCost && touched.laborCost)}
                                                errorMessage={errors.laborCost}
                                            >
                                                <Field name="laborCost">
                                                    {({ field }: FieldProps) => (
                                                        <Input
                                                            {...field}
                                                            type="text"
                                                            className="rounded-xl w-full"
                                                            placeholder={t("Labour Cost")}
                                                            value={field.value}
                                                            onChange={field.onChange}
                                                        />
                                                    )}
                                                </Field>
                                            </FormItem>
                                        )}
                                    </div>
                                    {/* Până la data */}
                                    <FormItem
                                        label={t("Due Date")}
                                        invalid={Boolean(errors.deadline && touched.deadline)}
                                        errorMessage={errors.deadline}
                                    >
                                        <Field name="deadline">
                                            {({ field, form }: FieldProps) => {
                                                // Convert date to YYYY-MM-DD for the input type="date"
                                                const convertToYYYYMMDD = (dateStr: string) => {
                                                    const date = new Date(dateStr);
                                                    const month = String(date.getMonth() + 1).padStart(2, '0');
                                                    const day = String(date.getDate()).padStart(2, '0');
                                                    const year = date.getFullYear();
                                                    return `${year}-${month}-${day}`;
                                                };

                                                const formattedDate = field.value ? convertToYYYYMMDD(field.value) : '';

                                                return (
                                                    <Input
                                                        type="date"
                                                        {...field}
                                                        value={formattedDate} // Pass the correctly formatted YYYY-MM-DD value
                                                        onChange={(e) => form.setFieldValue('deadline', e.target.value)}
                                                        disabled={!hasAccess(user.authority as UserRole, ['ADMIN'])}
                                                    />
                                                );
                                            }}
                                        </Field>
                                    </FormItem>

                                    {/* Proiect */}
                                    <FormItem
                                        label={t("Project")}
                                        invalid={Boolean(errors.projectId && touched.projectId)}
                                        errorMessage={errors.projectId}
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
                                                        onChange={(option) => {
                                                            form.setFieldValue(field.name, option?.value);

                                                            const selectedProject = modalData.projects.find((p: any) => p.id === option?.value);
                                                            form.setFieldValue('projectType', selectedProject?.type || '');
                                                        }}
                                                        isDisabled={projectId ? true : false || !hasAccess(user.authority as UserRole, ['ADMIN'])}
                                                        placeholder={t("Project")}
                                                    />
                                                );
                                            }}
                                        </Field>
                                    </FormItem>
                                    <FormItem
                                        label={t("Statement Type")}
                                        invalid={Boolean(errors.statementType && touched.statementType)}
                                        errorMessage={errors.statementType}
                                    >
                                        <Field name="statementType">
                                            {({ field, form }: FieldProps) => {
                                                return (
                                                    <Select
                                                        {...field}
                                                        options={modalData.statementTypes}
                                                        value={modalData.statementTypes.find((option: any) => option.value === field.value)}
                                                        onChange={(option) => form.setFieldValue(field.name, option?.value)}
                                                        placeholder={t("Statement Type")}
                                                        isDisabled={!hasAccess(user.authority as UserRole, ['ADMIN'])}
                                                    />
                                                );
                                            }}
                                        </Field>
                                    </FormItem>
                                </FormContainer>
                                <FieldArray name="parts">
                                    {({ remove, push }) => (
                                        <div>
                                            {values.parts && values.parts.length > 0 ? (
                                                values.parts.map((part: any, index: any) => {
                                                    const isCategorySelected = !!values.parts[index]?.category;

                                                    return (
                                                        <div key={index} className="flex flex-row items-center mb-4 gap-4">
                                                            {/* Cod Piesa */}
                                                            <FormItem className="mb-0 flex-1" label={t("Part Code")}>
                                                                <Field name={`parts[${index}].partCode`}>
                                                                    {({ field }: FieldProps) => <Input {...field} disabled={!hasAccess(user.authority as UserRole, ['ADMIN', 'OPERATOR', 'VANZATOR'])} type="text" />}
                                                                </Field>
                                                            </FormItem>

                                                            {/* Locatie */}
                                                            <FormItem className="mb-0 flex-1" label={t("Location")}>
                                                                <Field name={`parts[${index}].location`}>
                                                                    {({ field }: FieldProps) => <Input {...field} disabled={!hasAccess(user.authority as UserRole, ['ADMIN', 'OPERATOR', 'VANZATOR'])} type="text" />}
                                                                </Field>
                                                            </FormItem>

                                                            {/* Category Select */}
                                                            <FormItem className="mb-0 flex-1" label={t("Category")}>
                                                                <Field name={`parts[${index}].category`}>
                                                                    {({ field, form }: FieldProps) => {
                                                                        const categoryOptions = modalData.partsCategories.map((category: any) => ({
                                                                            label: category,
                                                                            value: category,
                                                                        }));

                                                                        const selectedCategoryOption = categoryOptions.find(
                                                                            (option: any) => option.value === values.parts[index]?.category
                                                                        );

                                                                        return (
                                                                            <Select
                                                                                {...field}
                                                                                options={categoryOptions}
                                                                                value={selectedCategoryOption}
                                                                                isDisabled={!hasAccess(user.authority as UserRole, ['ADMIN', 'OPERATOR', 'VANZATOR'])}
                                                                                onChange={async (option) => {
                                                                                    form.setFieldValue(field.name, option?.value);
                                                                                    form.setFieldValue(`parts[${index}].part`, null); // Reset part when category changes

                                                                                    // Dynamically fetch parts for this specific index and category
                                                                                    const parts = await fetchParts(`category=${option?.value}`);
                                                                                    setModalData((prev: any) => ({
                                                                                        ...prev,
                                                                                        parts: {
                                                                                            ...prev.parts,
                                                                                            [index]: parts, // Update parts for this index only
                                                                                        },
                                                                                    }));
                                                                                }}
                                                                            />
                                                                        );
                                                                    }}
                                                                </Field>
                                                            </FormItem>

                                                            {/* Part Select */}
                                                            <FormItem className="mb-0 flex-1" label={t("Part")}>
                                                                <Field name={`parts[${index}].part`}>
                                                                    {({ field, form }: FieldProps) => {
                                                                        const partOptions =
                                                                            modalData.parts[index]?.map((part: any) => ({
                                                                                ...part,
                                                                                label: part.name,
                                                                                value: part.id,
                                                                            })) || [];

                                                                        const selectedPartOption = partOptions.find(
                                                                            (option: any) => option.value == values.parts[index]?.part?.partId
                                                                        );

                                                                        return (
                                                                            <Select
                                                                                {...field}
                                                                                options={partOptions}
                                                                                value={selectedPartOption}
                                                                                onChange={(option) => {
                                                                                    form.setFieldValue(field.name, option); // Store selected part

                                                                                    // Set quantity to 1 and priceAdjustment to 0 when part is selected
                                                                                    form.setFieldValue(`parts[${index}].quantity`, 1);
                                                                                    form.setFieldValue(`parts[${index}].priceAdjustment`, 0);

                                                                                    // Calculate the Pret Final (final price)
                                                                                    const partPrice = option?.cost || 0;
                                                                                    const finalCost = partPrice * 1; // Initially quantity is 1 and priceAdjustment is 0
                                                                                    // form.setFieldValue(`parts[${index}].cost`, finalCost);

                                                                                    // Update total materialCost immediately
                                                                                    const updatedMaterialCost = values.parts.reduce((acc: number, p: any, i: number) => {
                                                                                        return acc + (i === index ? finalCost : p.cost || 0);
                                                                                    }, 0);
                                                                                    form.setFieldValue('materialCost', updatedMaterialCost); // Update materialCost
                                                                                    form.setFieldValue(`parts[${index}].partCode`, '1234,5678')
                                                                                    form.setFieldValue(`parts[${index}].location`, 'Hala 1')
                                                                                    form.setFieldValue(`parts[${index}].priceAdjustment`, magicNumber)
                                                                                    form.setFieldValue(`parts[${index}].cost`, finalCost + magicNumber);
                                                                                }}
                                                                                isDisabled={!isCategorySelected || !hasAccess(user.authority as UserRole, ['ADMIN', 'OPERATOR', 'VANZATOR'])} // Disable until category is chosen
                                                                            />
                                                                        );
                                                                    }}
                                                                </Field>
                                                            </FormItem>

                                                            {/* Quantity Input */}
                                                            <FormItem className="mb-0 flex-1" label={t("Quantity")}>
                                                                <Field name={`parts[${index}].quantity`}>
                                                                    {({ field, form }: FieldProps) => {
                                                                        return (
                                                                            <Input
                                                                                {...field}
                                                                                type="number"
                                                                                onChange={(e) => {
                                                                                    const quantity = Math.max(1, Number(e.target.value)); // Ensure quantity is at least 1
                                                                                    form.setFieldValue(field.name, quantity); // Update quantity in the form

                                                                                    // Get part price and price adjustment
                                                                                    const partPrice = values.parts[index]?.part?.cost || 0;
                                                                                    const priceAdjustment = values.parts[index].priceAdjustment || 0;

                                                                                    // Calculate the new Pret Final
                                                                                    const finalCost = (partPrice * quantity) + priceAdjustment;
                                                                                    form.setFieldValue(`parts[${index}].cost`, finalCost); // Set new Pret Final

                                                                                    // Update total materialCost immediately
                                                                                    const updatedMaterialCost = values.parts.reduce((acc: number, p: any, i: number) => {
                                                                                        return acc + (i === index ? finalCost : p.cost || 0);
                                                                                    }, 0);
                                                                                    form.setFieldValue('materialCost', updatedMaterialCost); // Update total materialCost
                                                                                }}
                                                                                disabled={!isCategorySelected || !hasAccess(user.authority as UserRole, ['ADMIN', 'OPERATOR', 'VANZATOR'])}
                                                                            />
                                                                        );
                                                                    }}
                                                                </Field>
                                                            </FormItem>

                                                            {/* Discount / Adaos */}
                                                            {hasAccess(user.authority as UserRole, ['ADMIN']) && (
                                                                <FormItem className="mb-0 flex-1" label={`${t("Discount")} / ${t("Addition")}`}>
                                                                    <Field name={`parts[${index}].priceAdjustment`}>
                                                                        {({ field, form }: FieldProps) => {
                                                                            return (
                                                                                <Input
                                                                                    {...field}
                                                                                    type="number"
                                                                                    onChange={(e) => {
                                                                                        const priceAdjustment = Number(e.target.value); // Get the price adjustment (can be negative or positive)
                                                                                        form.setFieldValue(field.name, priceAdjustment); // Update priceAdjustment in the form

                                                                                        // Get part price and quantity
                                                                                        const partPrice = values.parts[index]?.part?.cost || 0;
                                                                                        const quantity = values.parts[index]?.quantity || 1;

                                                                                        // Calculate the new Pret Final
                                                                                        const finalCost = (partPrice * quantity) + priceAdjustment;
                                                                                        form.setFieldValue(`parts[${index}].cost`, finalCost); // Set new Pret Final

                                                                                        // Update total materialCost immediately
                                                                                        const updatedMaterialCost = values.parts.reduce((acc: number, p: any, i: number) => {
                                                                                            return acc + (i === index ? finalCost : p.cost || 0);
                                                                                        }, 0);
                                                                                        form.setFieldValue('materialCost', updatedMaterialCost); // Update total materialCost
                                                                                    }}
                                                                                    disabled={!isCategorySelected} // Disable input until category is chosen
                                                                                />
                                                                            );
                                                                        }}
                                                                    </Field>
                                                                </FormItem>

                                                            )}

                                                            {/* Pret Final */}
                                                            {hasAccess(user.authority as UserRole, ['ADMIN']) && (
                                                                <FormItem className="mb-0 flex-1" label={t("Final Price")}>
                                                                    <Field name={`parts[${index}].cost`}>
                                                                        {({ field }: FieldProps) => (
                                                                            <Input {...field} disabled={!hasAccess(user.authority as UserRole, ['ADMIN'])} type="number" readOnly />
                                                                        )}
                                                                    </Field>
                                                                </FormItem>
                                                            )}

                                                            {/* Remove Button */}
                                                            {hasAccess(user.authority as UserRole, ['ADMIN', 'OPERATOR', 'VANZATOR']) && (
                                                                <Button
                                                                    className="mt-[1.7rem]"
                                                                    size="xs"
                                                                    shape="circle"
                                                                    type='button'
                                                                    icon={<HiMinus />}
                                                                    onClick={() => {
                                                                        // Update parts and modalData on removal
                                                                        const updatedParts = [...values.parts];
                                                                        updatedParts.splice(index, 1); // Remove the part at the current index

                                                                        // Update modalData parts, shifting indices
                                                                        setModalData((prev: any) => {
                                                                            const updatedModalParts = { ...prev.parts };

                                                                            // Remove part from modal data
                                                                            delete updatedModalParts[index]; // Remove the current index
                                                                            // Shift remaining parts
                                                                            Object.keys(updatedModalParts).forEach((key) => {
                                                                                const currentIndex = parseInt(key, 10);
                                                                                if (currentIndex > index) {
                                                                                    updatedModalParts[currentIndex - 1] = updatedModalParts[currentIndex];
                                                                                    delete updatedModalParts[currentIndex]; // Remove the old key
                                                                                }
                                                                            });

                                                                            return {
                                                                                ...prev,
                                                                                parts: updatedModalParts,
                                                                            };
                                                                        });
                                                                        let totalMaterialCost = 0;
                                                                        setFieldValue('parts', updatedParts);

                                                                        updatedParts.forEach((part, i) => {
                                                                            const partPrice = part.part.cost || 0;
                                                                            const currentQuantity = part.quantity || 1;
                                                                            totalMaterialCost += partPrice * currentQuantity + magicNumber;
                                                                        });

                                                                        setFieldValue('materialCost', totalMaterialCost)
                                                                    }}
                                                                />
                                                            )}
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                null
                                            )}

                                            {/* Add Button */}
                                            {hasAccess(user.authority as UserRole, ['ADMIN', 'OPERATOR', 'VANZATOR']) && (
                                                <div className="flex justify-center mt-4">
                                                    {/* Add new part row */}
                                                    <Button
                                                        size="xs"
                                                        shape="circle"
                                                        icon={<HiPlus />}
                                                        type="button"
                                                        onClick={() =>
                                                            push({
                                                                category: '',
                                                                part: null,
                                                                quantity: null,
                                                                partCode: '',
                                                                location: '',
                                                                priceAdjustment: 0,
                                                            })
                                                        }
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </FieldArray>


                            </div>
                            <FormContainer>
                                {/* Descriere */}
                                <FormItem className="w-full" label={t("Description")}>
                                    <Input
                                        textArea
                                        name="description"
                                        value={values.description}
                                        onChange={(e) => setFieldValue('description', e.target.value)}
                                        disabled={!hasAccess(user.authority as UserRole, ['ADMIN'])}
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
                    </div>
                )}
            </Formik>
        </Dialog>
    );
}
