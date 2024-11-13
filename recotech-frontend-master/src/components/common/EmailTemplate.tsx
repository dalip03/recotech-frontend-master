// components/common/EmailTemplate.tsx
import React from 'react';

interface EmailTemplateProps {
    content: string;
}

const EmailTemplate: React.FC<EmailTemplateProps> = ({ content }) => (
    <html>
        <body style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px', color: '#333' }}>
            <table width="100%" cellPadding="0" cellSpacing="0">
                <tr>
                    <td style={{ padding: '20px', textAlign: 'center', backgroundColor: '#f4f4f4' }}>
                        <table width="600px" cellPadding="0" cellSpacing="0" style={{ maxWidth: '600px', backgroundColor: '#ffffff' }}>
                            <tr>
                                <td style={{ padding: '20px', fontSize: '16px', lineHeight: '1.6' }}>
                                    <div dangerouslySetInnerHTML={{ __html: content }} />
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
    </html>
);


export default EmailTemplate;
