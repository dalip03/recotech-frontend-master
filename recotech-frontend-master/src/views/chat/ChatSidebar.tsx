import { fetchFileById } from '@/api/documentsService';
import { Avatar } from '@/components/ui';
import { getTranslatedRole } from '@/utils/sharedHelpers';
import { t } from 'i18next';
import { useState } from 'react';
import { BsSearch } from 'react-icons/bs';

const Sidebar = ({ onUserSelect, friendsList }: any) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedContact, setSelectedContact] = useState<any>(null);

    // Filter users based on search input
    const filteredUsers = friendsList.filter((user: any) =>
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) || user.connectionUsername.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleUserClick = (contact: any) => {
        setSelectedContact(contact);
        onUserSelect(contact); // Trigger the chat transition
    };

    return (
        <div className="lg:block  bg-white h-[80vh] overflow-hidden shadow-md p-4 lg:rounded-l-xl">
            <div className="relative">
                <input
                    type="text"
                    className="w-full border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring focus:ring-blue-500"
                    placeholder={`${t("Search")}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute right-3 top-3">
                    <span className="rounded-full text-black">
                        <BsSearch size={15} />
                    </span>
                </div>
            </div>

            <ul className="h-[90%] overflow-y-auto pt-4">
                {filteredUsers.map((contact: any) => {
                    // console.log("contact -- >" , contact.lastMessage)
                    // console.log("contact -- >" , JSON.stringify(contact))
                    console.log("contact -- >" , contact.lastMessageTime)
                    
                    return (
                        <li
                            key={contact.connectionId}
                            className={`flex justify-between items-center mb-2 p-3 rounded-lg transition duration-200 ${selectedContact?.connectionId === contact.connectionId ? 'bg-blue-200' : 'hover:bg-gray-100'
                                }`}
                            onClick={() => handleUserClick(contact)} // Handle user selection
                        >
                            <div className="flex items-center">
                                {contact?.user?.profilePicture ? (
                                    <Avatar shape="circle" className="mr-4" src={contact.user.profilePicture} />
                                ) : (
                                    <div className="bg-blue-300 rounded-full h-10 w-10 mr-3 flex items-center justify-center">
                                        {contact?.user?.firstName && contact?.user?.lastName
                                            ? contact.user.firstName[0].toUpperCase() + contact.user.lastName[0].toUpperCase()
                                            : null}
                                    </div>
                                )}
                                <div>
                                    <p className="font-bold max-w-52 text-blue-600 truncate">{contact.user ? `${contact.user.lastName} ${contact.user.firstName} - ${getTranslatedRole(contact.user.role)}` : `${contact.connectionUsername}`}</p>
                                    <p className="text-sm text-gray-600 max-w-[10rem] truncate">{contact.lastMessage || t("No messages")}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500">{contact.lastMessageTime || '00:00'}</p>
                                {contact.unSeen > 0 && (
                                    <span className="bg-red-500 text-white rounded-full px-2 text-xs ml-2">
                                        {contact.unSeen ?? 5}
                                    </span>
                                )}
                            </div>
                        </li>
                    )
                })}
            </ul>
        </div>
    );
};

export default Sidebar;
