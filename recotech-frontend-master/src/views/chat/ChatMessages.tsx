import { useAppSelector } from "@/store";
import { RiCheckDoubleFill } from "react-icons/ri"; // Import double checkmark icon
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';  // Correct import


const ChatMessages = ({ messages }: any) => {
    // console.log(messages)
    const user = useAppSelector((state) => state.auth.user);
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // Function to return the appropriate delivery status
    const getStatusTextOrIcon = (status: string) => {
        switch (status) {
            case "NOT_DELIVERED":
                return <span className="text-red-500">Not Delivered</span>; // Show "Not Delivered" in red
            case "DELIVERED":
                return (
                    <RiCheckDoubleFill size={20} className="text-gray-500" title="Delivered" /> // Two gray checkmarks
                );
            case "SEEN":
                return (
                    <RiCheckDoubleFill size={20} className="text-green-500" title="Seen" /> // Two green checkmarks
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex-1 p-6 h-full overflow-y-auto">
            {messages.map((message: any, index: number) => {
                const isSentByMe = message.senderId === user.id;
                 // Convert the message time to the user's local time zone
                 const messageTimeInLocal = toZonedTime(message.time, userTimeZone); // Use user's time zone
                 const formattedTime = format(messageTimeInLocal, 'yyyy-MM-dd HH:mm:ss'); // Format it for display

                return (
                    <div
                        key={index}
                        className={`flex mb-4 ${isSentByMe ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`flex flex-col gap-1 p-4 rounded-3xl shadow-xl min-w-[20%] max-w-[75%] relative transition duration-300 ease-in-out ${isSentByMe ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
                                }`}
                        >
                            <p className="break-words leading-relaxed">{message.content}</p>
                            {isSentByMe && (
                                <div className="text-right text-xs text-gray-400 flex items-center -mt-2 justify-end">
                                    <span>
                                    {new Date(message.time).toLocaleString()} 
                                        {/* {message.time ?? "00:52"} */}
                                        </span>
                                    <span className="ml-2">{getStatusTextOrIcon(message.messageDeliveryStatusEnum)}</span>
                                </div>
                            ) || (
                                    <div className="text-right text-xs text-gray-400 flex items-center -mt-2 justify-end">
                                        <span>
                                        {formattedTime}
                                            {/* {message.time ?? '00:53'} */}
                                            </span>
                                        
                                    </div>
                                )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default ChatMessages;
