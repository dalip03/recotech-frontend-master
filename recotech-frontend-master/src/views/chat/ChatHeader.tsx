import { Avatar } from "@/components/ui";
import { getTranslatedRole } from "@/utils/sharedHelpers";
import { useTranslation } from "react-i18next";

const ChatHeader = ({ selectedContact }: { selectedContact: any }) => {
    const { user } = selectedContact;
    const { t } = useTranslation();
    const { firstName, lastName, username, role } = user;
    const fullName = [firstName, lastName].filter(Boolean).join(' ');
    const initials = [firstName, lastName]
        .map((name) => name?.[0].toUpperCase())
        .join('');


    return (
        <div className="w-full bg-gray-400 p-4 flex justify-between items-center lg:rounded-tr-xl overflow-hidden">
            <div className="flex items-center gap-2">
                {user?.profilePicture && (
                    <Avatar shape="circle" className="mr-4" src={user.profilePicture} />
                ) || (
                        <div className="bg-gray-600 rounded-full h-10 w-10 flex items-center justify-center text-white">{initials}</div>
                    )}
                <p className="font-bold">{fullName || username} - {getTranslatedRole(role)}</p>
            </div>
        </div>
    );
};

export default ChatHeader;

