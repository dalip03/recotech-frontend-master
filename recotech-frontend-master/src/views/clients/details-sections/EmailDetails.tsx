import toastNotification from "@/components/common/ToastNotification";
import { RichTextEditor } from "@/components/shared";
import { Button, FormContainer, FormItem, Input, Spinner, Upload } from "@/components/ui";
import { Field, FieldProps, Form, Formik } from "formik";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as Yup from "yup";

import { HiDownload } from "react-icons/hi";
import { fetchEmailById, sendEmail } from "@/api/emailService";
import { downloadFile } from "@/api/documentsService";

const validationSchema = Yup.object({
    subject: Yup.string().required('Subiectul este obligatoriu'),
    content: Yup.string()
        .test('not-empty', 'Continutul este obligatoriu', (value) => {
            return value !== '<p><br></p>' && value !== ''; // Ensure it's not empty or just <p><br></p>
        })
        .required('Continutul este obligatoriu'),
    attachment: Yup.mixed().notRequired(),
});

export default function NewEmail() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState<any>({
        subject: '',
        content: '',
        attachment: null,
    });

    const navigate = useNavigate();
    const { emailId } = useParams();
    const isNewEmail = !emailId; // Determine if the email is new
    const initialValues = {
        subject: email?.subject ?? '',
        // content: email?.content ?? '',
        content: email?.content && email?.content !== '<p><br></p>' ? email?.content : '',
        attachment: email?.attachmentKey ?? null, // Change this line to correctly set attachments
    };

    const fetchEmailData = async () => {
        await fetchEmailById(Number(emailId) || 0)
            .then((res: any) => {
                setEmail({
                    subject: res.subject,
                    content: res.content,
                    attachmentKey: res.attachmentKey,
                });
            }).catch((error) => {
                toastNotification.error('Email could not be fetched!');
                console.error('Error fetching email:', error);
            })

    };

    useEffect(() => {
        const fetchUserEmailData = async () => {
            setLoading(true);
            await fetchEmailData();
            setLoading(false);
        };
        if (!isNewEmail) {
            fetchUserEmailData();
        }
    }, [isNewEmail]);

    const onCancel = () => {
        navigate(-1);
    };


    const onSubmit = async (values: any) => {
        setIsSubmitting(true);
        values.content = values.content === '<p><br></p>' ? null : values.content;

        const formData = new FormData();

        // Create DTO blob with HTML content
        const dtoBlob = new Blob([JSON.stringify({
            to: "muresan.sebastian12@yahoo.com",
            subject: values.subject,
            content: values.content,  // HTML string here

        })], { type: 'application/json' });

        formData.append('dto', dtoBlob);
        if (values.attachment) {
            formData.append('file', values.attachment[0]);
        }

        await sendEmail(formData).then(() => {
            toastNotification.success('Email sent with success!');
        }).catch((error) => {
            toastNotification.error('Email could not be sent!');
            console.error('Error sending email:', error);
        }).finally(() => {
            setIsSubmitting(false);
            onCancel();
        });
    };

    const handleDownload = async (id: any) => {
        const result: any = await downloadFile(id)
        const url = window.URL.createObjectURL(result.data);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'attachment'); // Use the filename from headers or a fallback
        document.body.appendChild(link);
        link.click();
        link.remove();
    }

    if (loading) {
        return (
            <div className='flex justify-center items-center h-full w-full'>
                <Spinner size={40} />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-10">
            <h3>Email nou</h3>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={onSubmit}
                enableReinitialize={true}
            >
                {({ values, setFieldValue, errors, touched }) => (
                    <div className="flex flex-col items-center">
                        <Form className="w-full lg:w-1/2">
                            <FormContainer>
                                <FormItem
                                    label="Subiect"
                                    invalid={Boolean(errors.subject && touched.subject)}
                                    errorMessage={errors.subject as string}
                                >
                                    <Field name={'subject'}>
                                        {({ field, form }: FieldProps) => {
                                            return (
                                                <Input
                                                    {...field}
                                                    name="subject"
                                                    placeholder="Subiect"
                                                    disabled={isNewEmail ? false : true}
                                                />
                                            )
                                        }}
                                    </Field>
                                </FormItem>
                                {/* <FormItem
                                    label="Continut"
                                    invalid={Boolean(errors.content && (touched.content || values.content == '<p><br></p>'))}
                                    errorMessage={errors.content as string}
                                >
                                    <Field name="content">
                                        {({ field, form  }: FieldProps) => (
                                            <RichTextEditor
                                                value={field.value || ''}
                                                onChange={(value) => {
                                                    // console.log("Editor Value Updated:", value);
                                                    console.log(field.name, value);
                                                    setFieldValue(field.name, value);
                                                
                                                    
                                                }}
                                                className={`${email?.content ? '[&_.ql-editor]:bg-gray-100 [&_.ql-editor]:rounded-b-lg' : ''}`}
                                                readOnly={email?.content ? true : false}
                                            />
                                        )}
                                    </Field>
                                </FormItem> */}

                                <FormItem
                                    label="Continut"
                                    invalid={Boolean(errors.content && (touched.content || values.content === '<p><br></p>'))}
                                    errorMessage={errors.content as string}
                                >
                                    <Field name="content">
                                        {({ field, form }: FieldProps) => (
                                           <RichTextEditor
                                           value={field.value || ''}  // Ensure there's always a valid value passed
                                           onChange={(value) => {
                                            const sanitizedValue = value?.trim() || '';  // Trim the value to remove extra spaces

                                            // Compare against multiple conditions to handle "empty" content
                                            if (sanitizedValue !== '' && sanitizedValue !== '<p><br></p>' && sanitizedValue !== '<p><br>' && sanitizedValue !== '<p></p>') {
                                                // Update Formik value only if it's not empty or just placeholder
                                                setFieldValue(field.name, value);
                                            } else {
                                                // If it's empty content, set it to an empty string
                                                setFieldValue(field.name, ''); 
                                            }
                                           }}
                                           className={`${email?.content ? '[&_.ql-editor]:bg-gray-100 [&_.ql-editor]:rounded-b-lg' : ''}`}
                                           readOnly={email?.content ? true : false} // Make it read-only if there's existing content
                                       />
                                       

                                        )}
                                    </Field>
                                </FormItem>





                                {/* Conditional Rendering for Attachment */}
                                {isNewEmail ? (
                                    <FormItem label="Atasamente">
                                        <Field name="attachment">
                                            {({ field, form }: FieldProps) => (
                                                <Upload
                                                    draggable
                                                    fileList={field.value || []}
                                                    onChange={(files, fileList) => {
                                                        setFieldValue('attachment', files || []);
                                                    }}
                                                    onFileRemove={(remainingFiles) => {
                                                        setFieldValue('attachment', remainingFiles);
                                                    }}
                                                >
                                                    <p className="font-semibold">
                                                        <span className={`${!errors.attachment ? 'text-gray-800' : '!text-red-500'} dark:text-white`}>
                                                            {errors.attachment ? errors.attachment as string : 'Încarcă Document'}
                                                        </span>
                                                    </p>
                                                </Upload>
                                            )}
                                        </Field>
                                    </FormItem>
                                ) : (
                                    // Render existing attachments if not a new email
                                    email?.attachmentKey && (
                                        <FormItem label="Atasamente">
                                            <div className="flex flex-col">

                                                <div className="flex items-center justify-between border-b border-gray-300 py-2">
                                                    <Button onClick={() => handleDownload(email.attachmentKey)} type="button" size="sm" className="flex gap-2 justify-center items-center ">Download <HiDownload color="green" /> </Button>
                                                </div>

                                            </div>
                                        </FormItem>
                                    ) || ('')
                                )}
                            </FormContainer>
                            <div className="flex justify-end mt-6">
                                <Button type="button" variant="plain" onClick={onCancel}>
                                    Înapoi
                                </Button>
                                {isNewEmail && (
                                    <Button loading={isSubmitting} variant="solid" type="submit">
                                        Trimite
                                    </Button>
                                )}
                            </div>
                        </Form>
                    </div>
                )}
            </Formik>
        </div>
    );
}
