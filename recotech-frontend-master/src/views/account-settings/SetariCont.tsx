import React, { useEffect, useState } from 'react';
import { HiUserCircle } from 'react-icons/hi';
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui';
import Avatar from '@/components/ui/Avatar';
import { deleteFile, fetchFileById, saveFile } from '@/api/documentsService';
import { fetchUserById, updateUser } from '@/api/userService';
import { useAppSelector } from '@/store';
import Spinner from '@/components/ui/Spinner';
import { setUser as setUserStore } from '@/store';
import { useDispatch } from 'react-redux';
import { t } from 'i18next';
const SetariCont = () => {
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [user, setUser] = useState<any>({});
    const [loading, setLoading] = useState(true); // Loading state
    const dispatch = useDispatch(); // Initialize Redux dispatch

    const userState = useAppSelector((state) => state.auth.user);

    const validationSchema = Yup.object({
        name: Yup.string()
            .required('Numele este obligatoriu.')
            .test('two-words', 'Este nevoie de nume si prenume.', (value) => {
                if (!value) return false;
                const words = value.trim().split(/\s+/);
                return words.length >= 2; // Check for at least 2 words
            }),
        email: Yup.string().email('Emailul nu este valid.').required('Emailul este obligatoriu.'),
        newPassword: Yup.string().nullable().min(6, 'Parola trebuie să aibă minim 6 caractere.').notRequired(),
        confirmPassword: Yup.string()
            .optional()
            .when('newPassword', {
                is: (val: any) => val !== null && val !== undefined && val !== '',
                then: (schema) =>
                    schema
                        .required('Trebuie să confirmi parola.')
                        .oneOf([Yup.ref('newPassword')], 'Parolele nu se potrivesc.'),
                otherwise: (schema) => schema.notRequired(), // If newPassword is empty, confirmPassword can be empty
            })
    });

    useEffect(() => {
        async function fetchData() {
            setLoading(true); // Start loading
            try {
                const result = await fetchUserById(userState.id);
                setUser(result);
                const profilePicture = await fetchFileById(result?.profilePictureKey);
                if (profilePicture) {
                    setProfileImage(URL.createObjectURL(profilePicture));
                }
            } catch (error) {
                console.error('Error fetching user:', error);
            } finally {
                setLoading(false); // Stop loading
            }
        }
        fetchData();
    }, [userState.id]);

    const handleSubmit = async (values: any) => {
        const userUpdateData: any = {
            lastName: values.name.split(' ')[0],
            firstName: values.name.split(' ')[1],
            username: values.email,
        }

        if (values.newPassword && values.newPassword !== '') {
            userUpdateData.password = values.newPassword;
        };

        const result = await updateUser(userUpdateData, userState.id);
    }

    const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];


        if (file) {
            const reader = new FileReader();
            reader.onloadend = async (event) => {
                const arrayBuffer = event.target?.result;
                if (arrayBuffer) {
                    const binaryBlob = new Blob([arrayBuffer], { type: file.type });
                    const formData = new FormData();
                    formData.append('file', binaryBlob, file.name);
                    try {
                        // Save file via API
                        const result = await saveFile(formData);

                        // Update local state for immediate UI feedback
                        setProfileImage(URL.createObjectURL(file));

                        // Prepare user update data
                        const userUpdateData = { profilePictureKey: result.uuid };
                        await updateUser(userUpdateData, userState.id);

                        // Dispatch the new image to Redux store
                        dispatch(setUserStore({
                            ...userState,  // spread existing userState
                            profilePicture: URL.createObjectURL(file), // Set the new image blob URL here
                        }));

                    } catch (error) {
                        console.error('Upload error:', error);
                    }
                }
            };
            reader.readAsArrayBuffer(file);
        }
    };

    const handleImageDelete = async () => {
        const imgId = user?.profilePictureKey;
        const userUpdateData = { "profilePictureKey": null };
        await updateUser(userUpdateData, userState.id);
        await deleteFile(imgId);
        setProfileImage(null);
    };

    if (loading) {
        return (
            <div className='flex justify-center items-center h-full w-full'>
                <Spinner size={40} />
            </div>
        )
    }

    const initialValues = {
        name: user.lastName && user.firstName ? `${user.lastName} ${user.firstName}` : '',
        email: user?.username ?? '',
        newPassword: null,
        confirmPassword: null,
    };

    return (
        <>
            <h3 className="text-3xl font-semibold mb-4">{t("Account Settings")}</h3>
            <div className="flex items-center mb-4">
                {profileImage ? (
                    <Avatar shape="circle" size={60} src={profileImage} className="mr-2" />
                ) : (
                    <Avatar shape="circle" size={60} icon={<HiUserCircle />} className="mr-2" />
                )}
                <div className="ml-4 flex flex-col">
                    <p>{t("Profile Picture")}</p>
                    <p>PNG, JPEG, {t("under")} 15 MB</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <input
                        id="profileImageInput"
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleImageChange}
                    />
                    <Button shape="circle" onClick={() => document.getElementById('profileImageInput')?.click()}>
                        {t("Upload Image")}
                    </Button>
                    <Button shape="circle" onClick={handleImageDelete}>
                        {t("Delete")}
                    </Button>
                </div>
            </div>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ errors, touched, values, setFieldValue }) => (
                    <Form className="space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col">
                                <label className="mb-2" htmlFor="name">
                                    {`${t("Last Name")} ${t("First Name")}`}
                                </label>
                                <Field
                                    id="name"
                                    name="name"
                                    placeholder={`${t("Last Name")} ${t("First Name")}`}
                                    as={Input}
                                />
                                {touched.name && errors.name && <p className="text-red-500">{errors.name}</p>}
                            </div>
                            <div className="flex flex-col">
                                <label className="mb-2" htmlFor="email">
                                    Email
                                </label>
                                <Field
                                    id="email"
                                    name="email"
                                    placeholder="Email"
                                    as={Input}
                                />
                                {touched.email && errors.email && <p className="text-red-500">{errors.email as string}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col">
                                <label className="mb-2" htmlFor="newPassword">
                                    {t("New Password")}
                                </label>
                                <Field
                                    id="newPassword"
                                    name="newPassword"
                                    type="password"
                                    placeholder={t("New Password")}
                                    as={Input}
                                />
                                {touched.newPassword && errors.newPassword && <p className="text-red-500">{errors.newPassword}</p>}
                            </div>
                            {values.newPassword && (
                                <div className="flex flex-col">
                                    <label className="mb-2" htmlFor="confirmPassword">
                                        {t("Confirm new password")}
                                    </label>
                                    <Field
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        placeholder={t("Confirm new password")}
                                        as={Input}
                                    />
                                    {touched.confirmPassword && errors.confirmPassword && <p className="text-red-500">{errors.confirmPassword}</p>}
                                </div>
                            )}
                        </div>

                        <div className='text-right'>
                            <Button className='w-full lg:w-fit' type="submit">
                                {t("Save")}
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </>
    );
};

export default SetariCont;
