import { Dialog } from "@/components/ui";

const DataDetailsModal = ({ isOpen, onClose, selectedLog }: any) => {
    const renderContent = (content: any) => {
        // Attempt to parse content as JSON if it's a string
        if (typeof content === 'string') {
            try {
                const parsedContent = JSON.parse(content);
                if (typeof parsedContent === 'object' && parsedContent !== null) {
                    // Render parsed JSON object
                    return Object.entries(parsedContent).map(([key, value]: any) => (
                        <div key={key} className="mb-2">
                            <strong>{key}:</strong> {typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
                        </div>
                    ));
                }
            } catch (error) {
                // If it's not valid JSON, return the string as is
                return <div>{content}</div>;
            }
        }

        // If it's already an object
        if (typeof content === 'object' && content !== null) {
            return Object.entries(content).map(([key, value]: any) => (
                <div key={key} className="mb-2">
                    <strong>{key}:</strong> {typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
                </div>
            ));
        }

        // Return fallback content if it's neither string nor object
        return 'No additional content';
    };


    return (
        <Dialog isOpen={isOpen} onClose={() => onClose(false)}>
            <h5 className="text-lg font-bold mb-4">Detalii</h5>
            <div>
                {selectedLog?.content ? renderContent(selectedLog.content) : 'No additional content'}
            </div>
        </Dialog>
    );
};

export default DataDetailsModal;
