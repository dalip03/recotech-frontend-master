import React from 'react';
import { Button, Dialog, FormContainer, FormItem, Input } from '@/components/ui';
import * as Yup from 'yup';
import { Field, FieldArray, Form, Formik } from 'formik';
import { HiMinus, HiPlus } from 'react-icons/hi';

interface ModalSabloaneDocumenteProps {
    isOpen: boolean;
    selectedProjectType: any; // Adjust with the proper type if possible
    onClose: () => void;
    onSubmit: (values: any) => Promise<void>; // Adjust with the proper type if possible
}

interface FormValues {
    id: number | null;
    name: string;
    createDate: string; // Adjust type if needed
    checkpoints: any; // Only value field needs user input
}

// Validation schema
const validationSchema = Yup.object().shape({
    name: Yup.string().required('Numele tipului de proiect este necesar'),
    checkpoints: Yup.array()
        .of(
            Yup.object().shape({
                value: Yup.string().required('Valoarea este necesară'), // Validate value is required
            })
        )
        .required('Cel puțin un pas este necesar'), // At least one checkpoint should be required
});

const TipProiecteModal: React.FC<ModalSabloaneDocumenteProps> = ({
    isOpen,
    onClose,
    onSubmit,
    selectedProjectType,
}) => {
    const initialValues: FormValues = {
        id: selectedProjectType?.id ?? null,
        name: selectedProjectType?.name ?? '',
        createDate: selectedProjectType?.createDate || new Date().toISOString(),
        checkpoints: Object.entries(selectedProjectType?.variables || {}).map(([key, value]) => ({
            value: value, // Get value from variables
        })) || [{ value: '' }], // Default to one empty checkpoint if none
    };

    return (
        <div>
            <Dialog isOpen={isOpen} onClose={onClose}>
                <div className='max-h-[80svh] overflow-y-auto space-y-5'>
                    <h5>{initialValues.id ? "Editeză tip proiect" : "Tip proiect nou"}</h5>
                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={(values) => {
                            // Preparing payload as per ProjectTypeDto
                            const payload = {
                                id: values.id,
                                createDate: values.createDate,
                                name: values.name,
                                variables: values.checkpoints.reduce((acc: any, checkpoint: any, index: any) => {
                                    // Create an entry in variables with automatic label as `Pas {index + 1}`
                                    acc[`Pas ${index + 1}`] = checkpoint.value; // Use the label format
                                    return acc;
                                }, {} as Record<string, string>),
                            };
                            onSubmit(payload);
                        }}
                    >
                        {({ errors, touched, values }) => (
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
                                </FormContainer>

                                <FormContainer className='text-left mb-4'>
                                    <FieldArray name="checkpoints">
                                        {({ remove, push }) => (
                                            <div>
                                                <div className="max-h-[20rem] overflow-y-auto">
                                                    {values.checkpoints && values.checkpoints.length > 0
                                                        ? values.checkpoints.map((checkpoint: any, index: any) => (
                                                            <div key={index} className="flex flex-row items-center mb-4 gap-4">
                                                                <FormItem
                                                                    className="mb-0 flex-1"
                                                                    label={`Pas ${index + 1}`}
                                                                    invalid={Boolean(
                                                                        errors.checkpoints &&
                                                                        // @ts-expect-error
                                                                        errors.checkpoints[index] &&
                                                                        // @ts-expect-error
                                                                        errors.checkpoints[index]?.value &&
                                                                        // @ts-expect-error
                                                                        (touched.checkpoints && touched.checkpoints[index])
                                                                    )}
                                                                    // @ts-expect-error
                                                                    errorMessage={errors.checkpoints && errors.checkpoints[index]?.value}
                                                                >
                                                                    <Field
                                                                        placeholder={`Valoare pentru Pas ${index + 1}`} // Placeholder for value
                                                                        name={`checkpoints[${index}].value`} // Field for value
                                                                        type="text"
                                                                        component={Input}
                                                                        value={checkpoint.value} // Set value for the input
                                                                    />
                                                                </FormItem>
                                                                <Button
                                                                    className='mt-[1.7rem]'
                                                                    size="xs"
                                                                    shape="circle"
                                                                    icon={<HiMinus />}
                                                                    onClick={() => remove(index)} // Remove checkpoint
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
                                                        onClick={() => push({ value: '' })} // Add new checkpoint with empty value
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </FieldArray>
                                </FormContainer>

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
    );
}

export default TipProiecteModal;
