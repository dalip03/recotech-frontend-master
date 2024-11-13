import React, { useState, useEffect } from 'react';
import ChatSidebar from './ChatSidebar';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import { Client } from '@stomp/stompjs';
import { fetchConversations, fetchUnreadMessages, fetchUnreadMessagesByContactId } from '@/api/conversatiiService';
import { useAppSelector } from '@/store';
import { fetchUsers } from '@/api/userService';
import { Button, toast } from '@/components/ui';
import toastNotification from '@/components/common/ToastNotification';
import { BsArrowLeft, BsArrowRight } from 'react-icons/bs';
import { fetchFileById } from '@/api/documentsService';
import { sendNotification } from '@/api/notificationService';

// Define the message type
interface Message {
    text: string;
    time: string;
    senderId: number; // Assuming senderId is part of the message structure
}

const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL ?? 'ws://localhost:8080/ws'

const ChatPage: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [stompClient, setStompClient] = useState<Client | null>(null);
    const [friendsList, setFriendsList] = useState<any[]>([]);
    const [selectedContact, setSelectedContact] = useState<any>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);


    const token = useAppSelector((state) => state.auth.session.token);
    const user = useAppSelector((state) => state.auth.user);

    // Fetch friend data when the component mounts
    useEffect(() => {
        const fetchFriendsData = async () => {
            const conversations = await fetchConversations(); // Fetch conversation data (friends list)
            const unseenMessages = await fetchUnreadMessages(); // Fetch unseen messages
            const result = await fetchUsers();
            const usersData = result.data.content; // Fetch all users (with id)s

            // Create a map for unread counts
            const unreadCountMap = unseenMessages.reduce((acc: any, message: any) => {
                acc[message.fromUser] = message.count; // Map fromUser to count
                return acc;
            }, {});

            // Create a map of users by ID for fast lookup
            const usersMap = usersData.reduce((acc: any, user: any) => {
                acc[user.id] = user; // Map user id to user object
                return acc;
            }, {});

            // Combine conversations, unread counts, and user data
            const friendsWithCounts = await Promise.all(
                conversations.map(async (friend: any) => {
                    const count = unreadCountMap[friend.connectionId] || 0; // Get unread message count
                    const user = usersMap[friend.connectionId]; // Get user data for this friend (by ID)
                    const profilePicture = user?.profilePictureKey
                        ? await fetchFileById(user.profilePictureKey).then((file: any) => URL.createObjectURL(file))
                        : null;
                    return {
                        ...friend,
                        unSeen: count, // Attach unread message count
                        user: { ...user, profilePicture }, // Attach user object (or empty object if not found)
                    };
                })
            );
            setFriendsList(friendsWithCounts); // Update friends list with combined data
        };

        fetchFriendsData();
    }, []);


    // Effect for WebSocket connection and subscription
    useEffect(() => {
        const client = new Client({
            brokerURL: WEBSOCKET_URL,
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            onConnect: (frame) => {
                client.subscribe(`/topic/chat/${user.id}`, (message) => {
                    const receivedMessage: any = JSON.parse(message.body);
                    console.log(receivedMessage);
                    setFriendsList((prevFriendsList) =>
                        prevFriendsList.map((friend) =>
                            friend.connectionId === receivedMessage.senderId
                                ? { ...friend, unSeen: friend.unSeen + 1, lastMessage: receivedMessage.content } // Reset unread count for selected friend
                                : friend
                        )
                    );
                    // Update unread counts using unreadCounts state
                }, { 'Authorization': `Bearer ${token}` });

                if (selectedContact) {
                    client.subscribe(`/topic/chat/${selectedContact.convId}`, (message) => {
                        const receivedMessage: Message = JSON.parse(message.body);
                        console.log('Received message:', receivedMessage);

                        // Update the messages state
                        setMessages((prevMessages) => [...prevMessages, receivedMessage]);

                        // Update unread counts using unreadCounts state
                    }, { 'Authorization': `Bearer ${token}` });
                }
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ', frame.headers['message']);
                console.error('Additional details: ', frame.body);
            }
        });

        client.activate(); // Connect to the server
        setStompClient(client);

        return () => {
            client.deactivate(); // Clean up on unmount
        };
    }, [selectedContact]); // Run when selectedContact changes

    // Function to send messages via STOMP
    const sendMessage = async (message: any) => {
        if (stompClient && stompClient.active && selectedContact) {
            const chatMessage = {
                content: message.text,
                messageType: "CHAT",
                senderId: user.id,
                senderUsername: user.username,
                receiverId: selectedContact.connectionId,
                receiverUsername: selectedContact.connectionUsername,
            };

            // Send chat message via WebSocket
            stompClient.publish({
                destination: `/app/chat/sendMessage/${selectedContact.convId}`,
                body: JSON.stringify(chatMessage),
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log(selectedContact)
            // Prepare notification DTO
            const notificationDto = {
                object: JSON.stringify({
                    roles: [],  // specify target role if any
                    userId: [selectedContact.user.id],   // specify userId if targeting a specific user
                }),
                objectId: selectedContact.id, // You can adjust this to fit your use case
                type: "MESSAGE_RECEIVED", // Set the type of notification
                message: `New message from ${user.username}: ${message.text}`,
                timestamp: new Date().toISOString(),
                status: "UNREAD",
                from: user.username
            };

            // Send notification via HTTP POST
            await sendNotification(notificationDto);
        } else {
            console.error('STOMP client is not active or no contact selected');
        }
    };


    const handleUserSelect = async (contact: any) => {
        setSelectedContact(contact);
        const unseenMessages = contact.unSeen > 0 ? await fetchUnreadMessagesByContactId(contact.connectionId) : [];
        setMessages(unseenMessages);
        setFriendsList((prevFriendsList) =>
            prevFriendsList.map((friend) =>
                friend.connectionId === contact.connectionId
                    ? { ...friend, unSeen: 0, lastMessage: null }
                    : friend
            )
        );
        setIsSidebarOpen(false); // Close sidebar when a contact is selected
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen); // Toggle sidebar visibility
    };

    return (

        <div className="relative grid grid-cols-1 lg:grid-cols-[0.5fr_1.5fr] bg-gray-100 shadow-lg border border-black/10 rounded-xl">
            <div onClick={() => setIsSidebarOpen(false)} className='lg:hidden w-full flex items-center p-4 bg-slate-600'>
                <Button
                    onClick={(e) => { e.stopPropagation(); toggleSidebar(); }}
                    className='!bg-blue-500 text-white border-none flex items-center gap-2 !px-2 !py-2'
                >
                    <span>Contacte</span>
                    {/* Rotate the arrow based on the sidebar state */}
                    <span
                        className={`transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'rotate-180' : 'rotate-0'}`}
                    >
                        <BsArrowRight size={10} />
                    </span>
                </Button>
            </div>
            {/* Sidebar */}
            <div
                className={`absolute lg:relative shadow-lg transition-transform duration-300 z-40 w-full bottom-0 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <ChatSidebar
                    onUserSelect={handleUserSelect}
                    friendsList={friendsList}
                />
            </div>
            <div className="flex flex-col bg-white shadow-lg h-[80vh] w-full">
                {selectedContact && (
                    <>
                        <ChatHeader selectedContact={selectedContact} />
                        <div className="flex-1 h-full overflow-hidden">
                            <ChatMessages messages={messages} />
                        </div>
                        <ChatInput sendMessage={sendMessage} />
                    </>
                )}
            </div>
        </div>
    );
};

export default ChatPage;
