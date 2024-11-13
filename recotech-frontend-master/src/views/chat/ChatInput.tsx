import { t } from 'i18next';
import React, { useState } from 'react';

const ChatInput = ({ sendMessage }: any) => {
    const [message, setMessage] = useState('');

    const handleSend = async () => {
        if (message.trim()) {
            // Create your chat message object
            const chatMessage = { text: message, time: new Date().toLocaleTimeString() };

            // Call the sendMessage function passed from ChatPage
            sendMessage(chatMessage);
            setMessage(''); // Clear input field
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent any default behavior (like form submission)
            handleSend(); // Trigger the send message action
        }
    };

    return (
        <div className="flex p-4 border-t rounded-br-xl">
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress} // Add listener for the Enter key
                className="flex-1 p-2 border rounded"
                placeholder={`${t("Type a message")}...`}
            />
            <button onClick={handleSend} className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-br-xl">
                {t("Send")}
            </button>
        </div>
    );
};

export default ChatInput;
