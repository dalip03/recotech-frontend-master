import Button from '@/components/ui/Button';
import Dialog from '@/components/ui/Dialog';
import Upload from '@/components/ui/Upload';
import Input from '@/components/ui/Input';
import { FormItem, FormContainer } from '@/components/ui/Form';
import { Field, FieldProps, FieldArray, Form, Formik } from 'formik';
import * as Yup from 'yup';
import { Select } from '@/components/ui';
import { useEffect, useRef, useState } from 'react';
import { fetchProjects } from '@/api/projectService';
import { fetchClients } from '@/api/clientService';
import { deleteDocument, deleteFile, fetchDocuments, generateDocument, saveDocument, saveFile, signDocument } from '@/api/documentsService';
import ReactSignatureCanvas from 'react-signature-canvas';
import { useTranslation } from 'react-i18next';


interface Label {
    label: string
    syntax: string
}

interface FormValues {
    documentType: string
    projectData: string
    clientData: string
    labels: Label[]
    documentFile: File | null
    clientSignature: File | null
}

export default function ModalAddDocuments({ onClose, isOpen, projectId = null }: { onClose: () => void, isOpen: boolean, projectId?: string | null }) {

    const validationSchema = Yup.object({
        projectData: Yup.string().required('Project Data is required'),
        clientData: Yup.string().required('Client Data is required'),
        documentFile: Yup.mixed().when('documentType', {
            is: (documentType: any) => {
                console.log('documentType:', documentType); // Debug log
                return typeof documentType == 'undefined' || documentType === ''; // Trigger validation when documentType is an empty string
            },
            then: (schema) => schema.required('Document File is required'),
            otherwise: (schema) => schema.notRequired(),
        }),
        labels: Yup.array().when('documentType', {
            is: (documentType: any) => {
                const document = documents.find((doc: any) => doc.id === documentType);
                return document?.isUsingVariables; // Check if variables are used
            },
            then: (schema) => schema.of(
                Yup.object().shape({
                    value: Yup.string().required('Acest câmp este necesar'),
                })
            ),
            otherwise: (schema) => schema.notRequired(),
        }),
        clientSignature: Yup.mixed().when('documentType', {
            is: (documentType: any) => {
                const document = documents.find((doc: any) => doc.id === documentType);
                return document?.isClientSignatureRequired; // Check if client signature is required
            },
            then: (schema) => schema.required('Client Signature is required'),
            otherwise: (schema) => schema.notRequired(),
        }),
    });
    console.log(projectId);
    const initialValues: FormValues = {
        documentType: '',
        projectData: projectId ?? '',
        clientData: '',
        documentFile: null, // For the file upload
        labels: [], // For dynamic fields
        clientSignature: null,
    }

    const [projects, setProjects] = useState<any>([]);
    const [clients, setClients] = useState<any>([]);
    const [documents, setDocuments] = useState<any>([]);
    const [isSignaturePadVisible, setIsSignaturePadVisible] = useState(false);

    const [selectedDocumentType, setSelectedDocumentType] = useState<any>(null);

    const signatureCanvasRef = useRef<any>(null);
    const { t } = useTranslation();

    const fetchData = async () => {
        const projects = await fetchProjects();
        const clients = await fetchClients();
        const documents = await fetchDocuments();
        console.log('dc',documents.content)
        const filteredDocuments = documents.content.filter((doc: { status: string }) => doc.status.trim().toUpperCase() == "DRAFT");
        setProjects(projects);
        setClients(clients);
        setDocuments(filteredDocuments);
    }

    useEffect(() => {
        const fetchModalData = async () => {
            await fetchData();
        }
        fetchModalData();
    }, [])

    const transformPayload = (labelsArray: any) => {
        const variables = labelsArray.reduce((acc: any, item: any) => {
            // Use `placeholder` as the key and `label` as the value
            acc[item.syntax] = item.value;
            return acc;
        }, {});

        return {
            variables,
        };
    };

    const saveUploadedFile = async (formData: FormData) => {
        try {
            const uploadResult = await saveFile(formData);
            return uploadResult; // Return the file key
        } catch (error) {
            console.error('Error saving file:', error);
            throw error; // Rethrow the error to handle it in the calling function
        }
    };

    // Method to save document metadata
    const saveDocumentMetadata = async (documentObject: any) => {
        try {
            const result = await saveDocument(documentObject);
            return result;
        } catch (error) {
            console.error('Error saving document metadata:', error);
            throw error; // Rethrow the error to handle it in the calling function
        }
    };

    // Main function logic
    const handleSubmit = async (values: any, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
        setSubmitting(true);
        let finalFileKey: any;
        let finalDocumentKey: any;

        try {
            const documentTemplate = documents.find((document: any) => document.id === values.documentType) ?? null;

            const createFormData = (file: File) => {
                const formData = new FormData();
                formData.append('file', file, file.name);
                return formData;
            };

            const uploadAndSaveDocument = async (file: File, documentObject: any) => {
                const formData = createFormData(file);
                finalFileKey = await saveUploadedFile(formData);
                documentObject.fileKey = finalFileKey.uuid;
                return await saveDocumentMetadata(documentObject);
            };

            const getDocumentObject = (name: string, isUsingVariables: boolean, isClientSignatureRequired: boolean) => ({
                name,
                status: "PUBLISHED",
                projectType: values.documentType,
                isUsingVariables,
                isClientSignatureRequired,
                projectId: values.projectData,
                clientId: values.clientData,
            });

            // 1. Handle variables logic (if applicable)
            if (documentTemplate?.isUsingVariables) {
                const result = await generateDocument(values.documentType, transformPayload(values.labels));
                const generatedFile = new File([result.data], `${documentTemplate.name}.docx`, {
                    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                });

                const documentObject = getDocumentObject(generatedFile.name, true, documentTemplate.isClientSignatureRequired);
                finalDocumentKey = await uploadAndSaveDocument(generatedFile, documentObject);
            }

            // 2. Handle client signature (if required)
            if (documentTemplate?.isClientSignatureRequired && values.clientSignature) {
                const formData = createFormData(values.clientSignature);
                const signedResult = await signDocument(finalDocumentKey?.id ?? values.documentType, formData, 50, 50);
                const signedFile = new File([signedResult.data], `${documentTemplate.name}.docx`, {
                    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                });

                if (finalFileKey?.uuid) {
                    await deleteFile(finalFileKey.uuid);
                    await deleteDocument(finalDocumentKey.id);
                }

                const documentObject = getDocumentObject(signedFile.name, documentTemplate.isUsingVariables, true);
                finalDocumentKey = await uploadAndSaveDocument(signedFile, documentObject);
            }

            // 3. Handle file upload (no variables or signature)
            if (!documentTemplate || (!documentTemplate.isUsingVariables && !documentTemplate.isClientSignatureRequired && values.documentFile instanceof File)) {
                const documentObject = getDocumentObject(values.documentFile.name, false, false);
                finalDocumentKey = await uploadAndSaveDocument(values.documentFile, documentObject);
            }

            onClose(); // Close modal after all async operations
        } catch (error) {
            console.error('Submission error:', error);
        } finally {
            setSubmitting(false); // Ensure the button is enabled even on error
        }
    };



    return (
        <div>
            <Dialog isOpen={isOpen} onClose={onClose}>
                <h5 className="mb-4">{t("New Document")}</h5>
                {/* Formik form setup */}
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ setFieldValue, errors, touched, values }) => (
                        <Form>
                            <FormContainer layout='horizontal' className='text-left'>
                                {isSignaturePadVisible ? (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {t("Add Client Signature")}:
                                        </label>
                                        <div className="border rounded-md overflow-hidden">
                                            <ReactSignatureCanvas
                                                penColor="black"
                                                canvasProps={{ width: 500, height: 200, className: 'sigCanvas' }}
                                                ref={signatureCanvasRef}
                                                onEnd={() => {
                                                    signatureCanvasRef.current?.getTrimmedCanvas().toBlob((blob: any) => {
                                                        if (blob) {
                                                            const file = new File([blob], 'signature.png', { type: 'image/png' });
                                                            setFieldValue('clientSignature', file);
                                                        }
                                                    }, 'image/png');
                                                }}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            className="mt-2 text-sm text-red-500"
                                            onClick={() => {
                                                signatureCanvasRef.current?.clear();
                                                setFieldValue('clientSignature', '');
                                            }}
                                        >
                                            {t("Delete")}
                                        </button>

                                        <div className="flex justify-between mt-6">
                                            <Button variant="plain" onClick={() => setIsSignaturePadVisible(false)}>
                                                {t("Back")}
                                            </Button>
                                            {values.clientSignature && (
                                                <Button
                                                    variant="solid"
                                                    onClick={() => {
                                                        // Handle adding the signature logic if needed
                                                        setIsSignaturePadVisible(false);
                                                    }}
                                                >
                                                    {t("Add Signature")}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <FormItem
                                            labelWidth={140}
                                            label={t("Select Template")}
                                            invalid={Boolean(errors.documentType && touched.documentType)}
                                            errorMessage={typeof errors.documentType === 'string' ? errors.documentType : undefined}
                                        >
                                            {/* TODO rework this to include all document types from Sabloane when that data is available from the backend */}
                                            <Field name="documentType">
                                                {({ field, form }: FieldProps) => {
                                                    const documentTypeOptions = documents.map((document: any) => ({ value: document.id, label: document.name, isUsingVariables: document.isUsingVariables, isClientSignatureRequired: document.isClientSignatureRequired }));
                                                    return (
                                                        <Select
                                                            {...field}
                                                            options={documentTypeOptions}
                                                            value={documentTypeOptions.find((option: any) => option.value === field.value)}
                                                            onChange={(option: any) => {
                                                                console.log(option)
                                                                setSelectedDocumentType(option);
                                                                form.setFieldValue(field.name, option?.value);
                                                                const document = documents.find((document: any) => document.id === option?.value);
                                                                if (document.isUsingVariables) {
                                                                    const variables = Object.entries(document.variables).map(([syntax, label]) => ({
                                                                        label: label,
                                                                        syntax: syntax,
                                                                        value: ''
                                                                    }));
                                                                    setFieldValue('labels', variables);
                                                                } else {
                                                                    setFieldValue('labels', []); // Clear labels for 'normal'
                                                                }
                                                            }}
                                                        />
                                                    )
                                                }}
                                            </Field>
                                        </FormItem>

                                        <FormItem
                                            labelWidth={140}
                                            label={t("Project")}
                                            invalid={Boolean(errors.projectData && touched.projectData)}
                                            errorMessage={typeof errors.projectData === 'string' ? errors.projectData : undefined}
                                        >
                                            <Field name="projectData">
                                                {({ field, form }: FieldProps) => {
                                                    const options = projects.map((option: any) => ({ label: option.name, value: option.id }));
                                                    return (
                                                        <Select
                                                            {...field}
                                                            options={options}
                                                            value={options.find((option: any) => option.value == field.value)}
                                                            onChange={(option: any) => form.setFieldValue(field.name, option?.value)}
                                                            isDisabled={projectId != null}
                                                        />
                                                    )
                                                }}
                                            </Field>
                                        </FormItem>

                                        <FormItem
                                            labelWidth={140}
                                            label={t("Client")}
                                            invalid={Boolean(errors.clientData && touched.clientData)}
                                            errorMessage={typeof errors.clientData === 'string' ? errors.clientData : undefined}
                                        >
                                            <Field name="clientData">
                                                {({ field, form }: FieldProps) => {
                                                    const clientOptions = clients.map((client: any) => ({ label: client.name, value: client.id }));
                                                    return (
                                                        <Select
                                                            {...field}
                                                            options={clientOptions}
                                                            value={clientOptions.find((option: any) => option.value === field.value)}
                                                            onChange={(option: any) => form.setFieldValue(field.name, option?.value)}
                                                        />
                                                    )
                                                }}
                                            </Field>
                                        </FormItem>

                                        {/* Conditional rendering for dynamic fields */}
                                        {documents.find((document: any) => document.id === values.documentType)?.isUsingVariables && (
                                            <div>
                                                <div className="max-h-[20rem] overflow-y-auto">
                                                    <FieldArray name="labels">
                                                        {() => (
                                                            values.labels.map((label, index) => (
                                                                <FormItem
                                                                    labelWidth={140}
                                                                    label={`${t(label.label)}`}
                                                                    key={index}
                                                                    invalid={Boolean(
                                                                        errors.labels &&
                                                                        Array.isArray(errors.labels) &&
                                                                        errors.labels[index] &&
                                                                        typeof errors.labels[index] === 'object' &&
                                                                        touched.labels &&
                                                                        touched.labels[index] &&
                                                                        // @ts-expect-error
                                                                        touched.labels[index].value
                                                                    )}
                                                                    errorMessage={
                                                                        Array.isArray(errors.labels) &&
                                                                            typeof errors.labels[index] === 'object'
                                                                            // @ts-expect-error
                                                                            ? errors.labels[index]?.value  // Access error on `value`
                                                                            : undefined
                                                                    }
                                                                >
                                                                    <Field
                                                                        placeholder={`${t(label.label)}`}
                                                                        name={`labels[${index}].value`}  // Field name should be `value`
                                                                        component={Input}
                                                                    />
                                                                </FormItem>
                                                            ))
                                                        )}
                                                    </FieldArray>
                                                </div>
                                            </div>
                                        )}
                                        {/* File Upload */}
                                        {(values.documentType == '' || documents.find((document: any) => document.id === values.documentType && !document.isUsingVariables && !document.isClientSignatureRequired)) && (
                                            <div className="mb-4">
                                                <Upload
                                                    draggable
                                                    onChange={(file) => setFieldValue('documentFile', file[0])} // Set the file in Formik state
                                                >
                                                    <p className="font-semibold">
                                                        <span className="text-gray-800 dark:text-white">
                                                            {t("Upload Document")}
                                                        </span>
                                                    </p>
                                                </Upload>
                                                {errors.documentFile && touched.documentFile && (
                                                    <div className="text-red-500 text-sm mt-1">
                                                        {errors.documentFile}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {documents.find((document: any) => document.id === values.documentType)?.isClientSignatureRequired && (
                                            <div className="mb-4">
                                                <Button
                                                    type="button"
                                                    variant="plain"
                                                    onClick={() => setIsSignaturePadVisible(true)}
                                                >
                                                    {t("Add Client Signature")}
                                                </Button>
                                                {errors.clientSignature && touched.clientSignature && (
                                                    <div className="text-red-500 text-sm mt-1">
                                                        {errors.clientSignature}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Buttons at opposite corners */}
                                        <div className="flex justify-between mt-6">
                                            <Button type='button' variant="plain" onClick={onClose}>
                                                {t("Close")}
                                            </Button>
                                            <Button variant="solid" type="submit">
                                                {`${documents.find((document: any) => document.id === values.documentType)?.isUsingVariables ? 'Generează' : 'Creează'}`}
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </FormContainer>
                        </Form>
                    )}
                </Formik>
            </Dialog>
        </div>
    );
}
