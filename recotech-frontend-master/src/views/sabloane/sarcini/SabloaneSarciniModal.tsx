import Button from '@/components/ui/Button';
import Dialog from '@/components/ui/Dialog';
import Upload from '@/components/ui/Upload'; // Assuming this is your Upload component
import Input from '@/components/ui/Input'; // Assuming this is your Input component
import { FormItem, FormContainer } from '@/components/ui/Form';
import { Field, FieldProps, FieldArray, Form, Formik } from 'formik';
import * as Yup from 'yup';
import { Badge, Select } from '@/components/ui';
import { useEffect, useState } from 'react';
import { fetchProjectTypes } from '@/api/projectTypeService';


interface FormValues {
    taskTitle: string
    description: string
    type: string
}

const validationSchema = Yup.object().shape({
    taskTitle: Yup.string().required('Denumirea Sarcinii este necesară'),
    type: Yup.string().required('Tipul proiectului este necesar'),
    description: Yup.string().optional(),
});

// todo add proper types
export default function SabloaneSarciniModal({ isOpen, onClose, handleSubmit, data }: any) {
    const [projectTypes, setProjectTypes] = useState([]);

    const initialValues: FormValues = {
        taskTitle: data?.name ?? '',
        description: data?.description ?? '',
        type: data?.type ?? '',
    }

    const fetchProjectTypesData = async () => {
        const projectTypes = await fetchProjectTypes();
        setProjectTypes(projectTypes);
    }

    useEffect(() => {
        const fetchData = async () => {
            await fetchProjectTypesData();
        }
        fetchData();
    }, [])

    return (
        <div>
            <Dialog isOpen={isOpen} onClose={onClose} width={900}>
                {/* Formik form setup */}
                <Formik
                    initialValues={initialValues}
                    // todo add back validation schema
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ setFieldValue, errors, touched, values }) => (
                        <Form className='p-4'>
                            <FormContainer className='text-left'>
                                <h5 className="mb-4">
                                    <FormItem
                                        className='w-fit'
                                        invalid={Boolean(errors.taskTitle && touched.taskTitle)}
                                    >
                                        <Field
                                            placeholder={`Denumire Sarcină`}
                                            name={`taskTitle`}
                                            component={Input}
                                        />
                                        {errors.taskTitle && touched.taskTitle && (
                                            <p className="text-sm text-red-600 mt-1">
                                                {errors.taskTitle}
                                            </p>
                                        )}
                                    </FormItem>
                                </h5>

                                {/* Buttons at opposite corners */}
                            </FormContainer>
                            <div className='mb-10'>
                                <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 gap-x-10 '>
                                    <div className='flex items-center gap-5 justify-between'>
                                        <label className='text-sm text-muted-foreground'>ID</label>
                                        <p className='text-base'>--------</p>
                                    </div>
                                    <div className='flex items-center gap-5 justify-between'>
                                        <label className='text-sm text-muted-foreground'>Asignat de</label>
                                        <p className='text-base'>--------</p>
                                    </div>
                                    <div className='flex items-center gap-5 justify-between'>
                                        <label className='text-sm text-muted-foreground'>Status</label>
                                        <p className='text-base'>
                                            <Badge
                                                className='p-2 rounded-lg bg-[#AAAAAA] text-white hover:cursor-not-allowed'
                                                content={'None >'}
                                            />
                                        </p>
                                    </div>
                                    <div className='flex items-center gap-5 justify-between'>
                                        <label className='text-sm text-muted-foreground'>Asignat Către</label>
                                        <p className='text-base'>--------</p>
                                    </div>
                                    <div className='flex items-center gap-5 justify-between'>
                                        <FormContainer className='w-full' layout='horizontal'>
                                            <FormItem
                                                labelWidth={140}
                                                label="Tip Proiect"
                                                invalid={Boolean(errors.type && touched.type)}
                                                errorMessage={errors.type as string}
                                            >
                                                <Field name="type">
                                                    {({ field, form }: FieldProps) => {
                                                        const projectTypeOptions = projectTypes.map((projectType: any) => ({ label: projectType.name, value: projectType.name }));
                                                        return (
                                                            <Select
                                                                {...field}
                                                                options={projectTypeOptions}
                                                                value={projectTypeOptions.find((option: any) => option.value === field.value)}
                                                                onChange={(option: any) => form.setFieldValue(field.name, option?.value)}
                                                                isDisabled={data && data.id !== undefined}
                                                            />
                                                        )
                                                    }}
                                                </Field>
                                            </FormItem>
                                        </FormContainer>
                                    </div>
                                    <div className='flex items-center gap-5 justify-between'>
                                        <label className='text-sm text-muted-foreground'>Până la data</label>
                                        <p className='text-base'>--------</p>
                                    </div>
                                </div>
                            </div>
                            <FormContainer>
                                <FormItem
                                    className='w-full'
                                    label='Descriere'
                                >
                                    <Input
                                        textArea
                                        name={`description`}
                                        value={values.description}
                                        onChange={(e) => setFieldValue('description', e.target.value)}
                                    />
                                </FormItem>
                            </FormContainer>
                            <div className="flex justify-end mt-6">
                                <Button variant="plain" onClick={onClose}>
                                    Închide
                                </Button>
                                <Button variant="solid" type="submit">
                                    Salvează
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </Dialog>
        </div>
    )
}