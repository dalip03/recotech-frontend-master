import React, { useEffect, useState } from 'react'
import { Button, Dialog, FormContainer, FormItem, Input, Select } from '@/components/ui'
import * as Yup from 'yup'
import { Field, Form, Formik, FieldProps } from 'formik'
import { saveUser, updateUser } from '@/api/userService'
import { getTranslatedRole } from '@/utils/sharedHelpers'
import { t } from 'i18next'
import { fetchProjectTypes } from '@/api/projectTypeService'
import { addFavoriteProject, addFavoriteProjectType } from '@/api/projectService'

interface ModalAddUserProps {
    isOpen: boolean
    onClose: (refetch: boolean) => void
    userData?: any // Optional prop to handle existing user data for editing
}

interface FormValues {
    username: string
    firstName: string
    lastName: string
    password: string
    confirmPassword: string
    role: string
    projectTypes: string[],
}

const ModalAddUser: React.FC<ModalAddUserProps> = ({ isOpen, onClose, userData }) => {
    const roleOptions = [
        { value: 'SUPER_ADMIN', label: getTranslatedRole('SUPER_ADMIN') },
        { value: 'ADMIN', label: getTranslatedRole('ADMIN') },
        { value: 'PIESAR', label: getTranslatedRole('PIESAR') },
        { value: 'MAGAZIE', label: getTranslatedRole('MAGAZIE') },
        { value: 'OPERATOR', label: getTranslatedRole('OPERATOR') },
        { value: 'VANZATOR', label: getTranslatedRole('VANZATOR') },
        { value: 'RECEPTION', label: getTranslatedRole('RECEPTION') },
    ]

    const [projectTypes, setProjectTypes] = useState<any>([]);

    useEffect(() => {
        const fetchData = async () => {
            const projectTypesData = await fetchProjectTypes();
            console.log(projectTypesData);
            setProjectTypes(projectTypesData);
        }
        fetchData();
    }, [])

    console.log('ud', userData);

    const initialValues: FormValues = {
        username: userData?.username || '',
        firstName: userData?.firstName || '',
        lastName: userData?.lastName || '',
        password: '',
        confirmPassword: '',
        role: userData?.role || '',
        projectTypes: userData?.userFavoriteProjects || [],
    }

    const validationSchema = Yup.object().shape({
        username: Yup.string().required('Email is required'),
        firstName: Yup.string().required('First name is required'),
        lastName: Yup.string().required('Last name is required'),
        password: Yup.string().test(
            'password-length',
            'Password must be at least 6 characters',
            (val) => !val || val.length >= 6,
        ),
        confirmPassword: Yup.string().oneOf([Yup.ref('password'), ''], 'Passwords must match'),
        role: Yup.string().required('Role is required'),
        projectTypes: Yup.array(),
    })

    const onSubmit = async (values: FormValues, actions: any) => {
        const projecTypes = values.projectTypes;
        const dataToSubmit: any = {
            username: values.username,
            firstName: values.firstName,
            lastName: values.lastName,
            password: values.password || undefined, // Don't send password if it's blank for edits
            role: values.role,
            // projectTypes: values.projectTypes
        }

        console.log(dataToSubmit);

        if (userData) {
            // Update user (exclude role if necessary)
            await updateUser(dataToSubmit, userData.id)
            if (projecTypes) {
                await addFavoriteProjectType(projecTypes, userData.id);
            }
        } else {
            // Save new user
            const result = await saveUser(dataToSubmit)
            if (projecTypes) {
                await addFavoriteProjectType(projecTypes, response?.id);
            }
        }

        onClose(true)
    }

    return (
        <Dialog isOpen={isOpen} onClose={() => onClose(false)}>
            <div>
                <h5>{userData ? 'Editează Utilizator' : 'Utilizator Nou'}</h5>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={onSubmit}
                >
                    {({ setFieldValue, errors, touched }) => (
                                                <div className="max-h-[70vh] w-full overflow-y-auto space-y-5 p-5">

                        <Form>
                            <FormContainer layout="horizontal" className="text-left">
                                <FormItem
                                    labelWidth={140}
                                    label={`${t("Username")}`}
                                    invalid={Boolean(errors.username && touched.username)}
                                    errorMessage={errors.username}
                                >
                                    <Field
                                        type="text"
                                        autoComplete="off"
                                        name="username"
                                        placeholder="johndoe@email.com"
                                        component={Input}
                                    />
                                </FormItem>
                                <FormItem
                                    labelWidth={140}
                                    label={t("First Name")}
                                    invalid={Boolean(errors.firstName && touched.firstName)}
                                    errorMessage={errors.firstName}
                                >
                                    <Field
                                        type="text"
                                        autoComplete="off"
                                        name="firstName"
                                        placeholder="John"
                                        component={Input}
                                    />
                                </FormItem>
                                <FormItem
                                    labelWidth={140}
                                    label={t("Last Name")}
                                    invalid={Boolean(errors.lastName && touched.lastName)}
                                    errorMessage={errors.lastName}
                                >
                                    <Field
                                        type="text"
                                        autoComplete="off"
                                        name="lastName"
                                        placeholder="Doe"
                                        component={Input}
                                    />
                                </FormItem>
                                <FormItem
                                    labelWidth={140}
                                    label={t("Password")}
                                    invalid={Boolean(errors.password && touched.password)}
                                    errorMessage={errors.password}
                                >
                                    <Field
                                        type="password"
                                        name="password"
                                        placeholder={"********"}
                                        component={Input}
                                    />
                                </FormItem>
                                <FormItem
                                    labelWidth={140}
                                    label={t("Confirm Password")}
                                    invalid={Boolean(errors.confirmPassword && touched.confirmPassword)}
                                    errorMessage={errors.confirmPassword}
                                >
                                    <Field
                                        type="password"
                                        name="confirmPassword"
                                        placeholder="********"
                                        component={Input}
                                    />
                                </FormItem>
                                <FormItem
                                    labelWidth={140}
                                    label={t("Role")}
                                    invalid={Boolean(errors.role && touched.role)}
                                    errorMessage={errors.role}
                                >
                                    <Field name="role">
                                        {({ field, form }: FieldProps) => (
                                            <Select
                                                {...field}
                                                options={roleOptions}
                                                value={roleOptions.find(
                                                    (option) => option.value === field.value
                                                )}
                                                onChange={(option: any) =>
                                                    form.setFieldValue(field.name, option?.value)
                                                }
                                            />
                                        )}
                                    </Field>
                                </FormItem>
                                <FormItem
                                    labelWidth={140}
                                    label={t("Project Type")}
                                    invalid={Boolean(errors.projectTypes && touched.projectTypes)}
                                    errorMessage={errors.projectTypes}
                                >
                                    <Field name="projectTypes">
                                        {({ field, form }: FieldProps) => {
                                            // Map project types to options
                                            const projectTypeOptions = projectTypes.map((projectType: any) => ({
                                                value: projectType.id,
                                                label: projectType.name
                                            }));

                                            // Prepare the selected values as an array of option objects
                                            const selectedOptions = projectTypeOptions.filter(option =>
                                                field.value.includes(option.value)  // Check if the option's value is in the selected IDs array
                                            );

                                            return (
                                                <Select
                                                    {...field}
                                                    isMulti
                                                    options={projectTypeOptions}
                                                    value={selectedOptions} // Pass the array of selected option objects
                                                    onChange={(selectedOptions) => {
                                                        const selectedProjectTypeIds = selectedOptions.map((option: any) => option.value);
                                                        form.setFieldValue(field.name, selectedProjectTypeIds); // Set the selected IDs in the form
                                                    }}
                                                />
                                            );
                                        }}
                                    </Field>
                                </FormItem>
                            </FormContainer>
                            <div className="flex justify-between mt-6">
                                <Button variant="plain" onClick={() => onClose(false)}>
                                    Înapoi
                                </Button>
                                <Button variant="solid" type="submit">
                                    {userData ? t("Update") : t("Save")}
                                </Button>
                            </div>
                        </Form>
                        </div>
                    )}
                </Formik>
            </div>
        </Dialog>
    )
}

export default ModalAddUser
