import React, { useEffect, useState } from 'react'
import { Button, Checkbox, Dialog, FormContainer, FormItem, Input, Select, Upload } from '@/components/ui'
import { HiMinus, HiPlus } from 'react-icons/hi'
import * as Yup from 'yup'
import { Field, FieldArray, Form, Formik, FieldProps, FormikErrors } from 'formik'
import { saveDocument } from '@/api/documentsService'
import { fetchProjectTypes } from '@/api/projectTypeService'

interface ModalSabloaneDocumenteProps {
    isOpen: boolean
    selectedDocument: any
    onClose: () => void
    onSubmit: (values: any) => Promise<void>
}

interface FormValues {
    id?: any
    name: string
    status: string
    projectType: string
    documentFile: File | null
    containsVariables: boolean
    variables: any
    requiresClientSignature: boolean
}

const validationSchema = Yup.object().shape({
    name: Yup.string().required('Numele șablonului este necesar'),
    projectType: Yup.string().required('Tipul proiectului este necesar'),
    documentFile: Yup.mixed().required('Fisierul șablonului este necesar'),
    containsVariables: Yup.boolean().optional(),
    requiresClientSignature: Yup.boolean().optional(),
    variables: Yup.array().optional(),
});



const ModalSabloaneDocumente: React.FC<ModalSabloaneDocumenteProps> = ({
    isOpen,
    onClose,
    onSubmit,
    selectedDocument,
}) => {
    const statuses = [
        { value: 'DRAFT', label: 'DRAFT' }
    ]
    const [projectTypes, setProjectTypes] = useState<any>([]);

    const fetchProjectTypeData = async () => {
        const result = await fetchProjectTypes();
        setProjectTypes(result);
    }

    useEffect(() => {
        const fetchData = async () => {
            await fetchProjectTypeData();
        };
        fetchData();
    }, [])

    const initialValues: FormValues = {
        id: selectedDocument?.id ?? null,
        name: selectedDocument?.name ?? '',
        status: 'DRAFT',
        projectType: selectedDocument?.projectType ?? '',
        documentFile: null,
        containsVariables: selectedDocument?.isUsingVariables ? true : false,
        variables: selectedDocument?.variables
            ? Object.entries(selectedDocument.variables).map(([syntax, label]) => {
                console.log(syntax, label);
                return { syntax: syntax, label: label }
            })
            : [{ syntax: '', label: '' }],
        requiresClientSignature: selectedDocument?.isClientSignatureRequired ?? false,
    }

    return (
        <div>
            <Dialog isOpen={isOpen} onClose={onClose}>
                <div className='max-h-[80svh] overflow-y-auto space-y-5'>
                    <h5>{initialValues.id ? 'Editeză șablon' : 'Șablon nou'}</h5>
                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={onSubmit}
                    >
                        {({ setFieldValue, errors, touched, values }) => (
                            <Form>
                                <FormContainer layout='horizontal' className='text-left'>
                                    <FormItem
                                        labelWidth={140}
                                        label='Denumire'
                                        invalid={Boolean(errors.name && touched.name)}
                                        errorMessage={errors.name}
                                    >
                                        <Field
                                            type="text"
                                            autoComplete="off"
                                            name="name"
                                            placeholder="Denumire"
                                            component={Input}
                                        />
                                    </FormItem>
                                    {/* <FormItem
                                        labelWidth={140}
                                        label="Status"
                                        invalid={Boolean(errors.status && touched.status)}
                                        errorMessage={errors.status as string}
                                    >
                                        <Field name="status">
                                            {({ field, form }: FieldProps) => (
                                                <Select
                                                    {...field}
                                                    options={statuses}
                                                    value={statuses.find(option => option.value === field.value)}
                                                    onChange={(option: any) => form.setFieldValue(field.name, option?.value)}
                                                />
                                            )}
                                        </Field>
                                    </FormItem> */}
                                    <FormItem
                                        labelWidth={140}
                                        label="Tip Proiect"
                                        invalid={Boolean(errors.projectType && touched.projectType)}
                                        errorMessage={errors.projectType as string}
                                    >
                                        <Field name="projectType">
                                            {({ field, form }: FieldProps) => {
                                                const projectTypeOptions = projectTypes.map((projectType: any) => ({ value: projectType.name, label: projectType.name }));
                                                return (
                                                    <Select
                                                        {...field}
                                                        options={projectTypeOptions}
                                                        value={projectTypeOptions.find((option: any) => option.value === field.value)}
                                                        onChange={(option: any) => form.setFieldValue(field.name, option?.value)}
                                                    />
                                                )
                                            }}
                                        </Field>
                                    </FormItem>
                                </FormContainer>
                                <div className="mb-4">
                                    <FormItem
                                        invalid={Boolean(errors.documentFile && touched.documentFile)}
                                    >
                                        <Field name="documentFile">
                                            {({ field, form }: FieldProps) => (
                                                <Upload
                                                    draggable
                                                    accept='.docx'
                                                    fileList={field.value ? [field.value] : []} // Show the current file if available
                                                    onChange={(files, fileList) => {
                                                        // Formik field value should be updated with the latest file
                                                        form.setFieldValue('documentFile', files[0] || null)
                                                    }}
                                                    onFileRemove={() => {
                                                        form.setFieldValue('documentFile', null) // Clear the Formik field when removing the file
                                                    }}
                                                >
                                                    <p className="font-semibold">
                                                        <span className={`${!errors.documentFile ? 'text-gray-800' : '!text-red-500'} dark:text-white`}>
                                                            {errors.documentFile ? errors.documentFile as string : 'Încarcă Document'}
                                                        </span>
                                                    </p>
                                                </Upload>
                                            )}
                                        </Field>
                                    </FormItem>
                                </div>
                                <FormItem
                                    invalid={Boolean(errors.containsVariables && touched.containsVariables)}
                                    errorMessage={errors.containsVariables as string}
                                >
                                    <Field name="containsVariables">
                                        {({ field, form }: FieldProps) => (
                                            <Checkbox {...field} checked={field.value} onChange={(checked) => {
                                                form.setFieldValue('containsVariables', checked);
                                                if (checked) {
                                                    if (form.values.variables.length === 0) {
                                                        form.setFieldValue('variables', [{ syntax: '', label: '' }]);
                                                    }
                                                }
                                            }}>
                                                <p>
                                                    Documentul conține variabile
                                                </p>
                                            </Checkbox>
                                        )}
                                    </Field>
                                </FormItem>
                                {values.containsVariables && (
                                    <FormContainer className='text-left mb-4'>
                                        <FieldArray name="variables">
                                            {({ remove, push }) => (
                                                <div>
                                                    <div className="max-h-[20rem] overflow-y-auto">
                                                        {values.variables && values.variables.length > 0
                                                            ? values.variables.map((variable: any, index: any) => (
                                                                <div key={index} className="flex flex-row items-center mb-4 gap-4">
                                                                    <FormItem
                                                                        className="mb-0"
                                                                        label={`Syntax ${index + 1}`}
                                                                        invalid={Boolean(
                                                                            errors.variables &&
                                                                            Array.isArray(errors.variables) &&
                                                                            errors.variables[index] &&
                                                                            typeof errors.variables[index] === 'object' &&
                                                                            touched.variables &&
                                                                            touched.variables[index] &&
                                                                            touched.variables[index].syntax
                                                                        )}
                                                                        errorMessage={
                                                                            Array.isArray(errors.variables) &&
                                                                                typeof errors.variables[index] === 'object'
                                                                                ? errors.variables[index]?.syntax
                                                                                : undefined
                                                                        }
                                                                    >
                                                                        <Field
                                                                            placeholder={`Syntax ${index + 1}`}
                                                                            name={`variables[${index}].syntax`}
                                                                            type="text"
                                                                            component={Input}
                                                                        />
                                                                    </FormItem>

                                                                    <FormItem
                                                                        className="mb-0"
                                                                        label={`Label ${index + 1}`}
                                                                        invalid={Boolean(
                                                                            errors.variables &&
                                                                            Array.isArray(errors.variables) &&
                                                                            errors.variables[index] &&
                                                                            typeof errors.variables[index] === 'object' &&
                                                                            touched.variables &&
                                                                            touched.variables[index] &&
                                                                            touched.variables[index].label
                                                                        )}
                                                                        errorMessage={
                                                                            Array.isArray(errors.variables) &&
                                                                                typeof errors.variables[index] === 'object'
                                                                                ? errors.variables[index]?.label
                                                                                : undefined
                                                                        }
                                                                    >
                                                                        <Field
                                                                            placeholder={`Label ${index + 1}`}
                                                                            name={`variables[${index}].label`}
                                                                            type="text"
                                                                            component={Input}
                                                                        />
                                                                    </FormItem>
                                                                    <Button
                                                                        className='mt-[1.7rem]'
                                                                        size="xs"
                                                                        shape="circle"
                                                                        icon={<HiMinus />}
                                                                        onClick={() => remove(index)}
                                                                    />
                                                                </div>
                                                            ))
                                                            : null}
                                                    </div>
                                                    <div className="flex justify-center mt-4">
                                                        <Button
                                                            size="xs"
                                                            shape="circle"
                                                            icon={<HiPlus />}
                                                            type="button"
                                                            onClick={() => push({ syntax: '', label: '' })}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </FieldArray>
                                    </FormContainer>
                                )}
                                <FormItem
                                    invalid={Boolean(errors.requiresClientSignature && touched.requiresClientSignature)}
                                    errorMessage={errors.requiresClientSignature as string}
                                >
                                    <Field name="requiresClientSignature" component={Checkbox}>
                                        Documentul necesită semnătura clientului
                                    </Field>
                                </FormItem>
                                <div className="flex justify-between mt-6">
                                    <Button variant="plain" onClick={onClose}>
                                        Închide
                                    </Button>
                                    <Button variant="solid" type="submit">
                                        Creeaza
                                    </Button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </Dialog>
        </div>
    )
}

export default ModalSabloaneDocumente
