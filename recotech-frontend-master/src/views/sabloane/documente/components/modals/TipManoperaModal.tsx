import React from 'react';
import { Button, Dialog, FormContainer, FormItem, Input } from '@/components/ui';
import * as Yup from 'yup';
import { Field, FieldArray, Form, Formik } from 'formik';
import { HiMinus, HiPlus } from 'react-icons/hi';

interface ModalSabloaneDocumenteProps {
    isOpen: boolean;
    selectedStatement: any; // Adjust with the proper type if possible
    onClose: () => void;
    onSubmit: (values: any) => Promise<void>; // Adjust with the proper type if possible
}

interface FormValues {
    id: number | null;
    name: string;
    createDate: string; // Adjust type if needed
}

// Validation schema
const validationSchema = Yup.object().shape({
    name: Yup.string().required('Numele tipului de manopera este necesar'),
});

const TipManoperaModal: React.FC<ModalSabloaneDocumenteProps> = ({
    isOpen,
    onClose,
    onSubmit,
    selectedStatement,
}) => {
    const initialValues: FormValues = {
        id: selectedStatement?.id ?? null,
        name: selectedStatement?.name ?? '',
        createDate: selectedStatement?.createDate || new Date().toISOString(),
    };

    return (
        <div>
            <Dialog isOpen={isOpen} onClose={onClose}>
                <div className='max-h-[80svh] overflow-y-auto space-y-5'>
                    <h5>{initialValues.id ? "Editeză tip manopera" : "Tip manopera nou"}</h5>
                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={(values) => {
                            const payload = {
                                id: values.id,
                                createDate: values.createDate,
                                name: values.name,
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

export default TipManoperaModal;
