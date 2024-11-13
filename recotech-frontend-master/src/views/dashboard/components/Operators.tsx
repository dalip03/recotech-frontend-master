import React from 'react';
import { fetchOperators } from "@/api/userService";
import { Card } from "@/components/ui";
import wrapPromise from "@/utils/wrapPromise";
import { t } from 'i18next';
import { getTranslatedRole, UserRole } from '@/utils/sharedHelpers';

interface User {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    whitePoints: number;
    blackPoints: number;
}

const fetchUsersData = () => {
    return new Promise<User[]>(async (resolve) => {
        try {
            const result = await fetchOperators(0, 4, ['updateDate', 'desc']); // page, pagesize, sort column and direction
            resolve(result.data.content);
        } catch (error) {
            console.error('Error fetching user data:', error);
            throw error; // Throw error to handle it in Suspense
        }
    });
};

// Wrap the fetch function
const usersResource = wrapPromise(fetchUsersData());

const Operators: React.FC = () => {
    // Use the read method to get the data
    const users = usersResource.read(); // This will suspend until data is fetched

    return (
        <div>
            <div className="flex items-center justify-between w-full mb-4 mt-4">
                <h4 className="text-3xl font-semibold">{t("Operators")}</h4>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                {users.map((user) => (
                    <Card
                        key={user.id}
                        clickable
                        className="hover:shadow-lg transition duration-150 ease-in-out rounded-2xl"
                    >
                        <h5>
                            {user.firstName} {user.lastName} ({getTranslatedRole(user.role)})
                        </h5>
                        <div className="flex flex-row gap-2 mt-8">
                            <p>{t("White Points")}:</p>
                            {[...Array(Math.min(user.whitePoints, 3))].map((_, i) => (
                                <div
                                    key={i}
                                    className="w-4 h-4 bg-white rounded-full border"
                                ></div>
                            ))}
                            {user.whitePoints > 3 && (
                                <p className="ml-2">+{user.whitePoints - 3}</p>
                            )}
                        </div>
                        <div className="flex flex-row gap-2 mt-6">
                            <p>{t("Black Points")}</p>
                            {[...Array(Math.min(user.blackPoints, 3))].map((_, i) => (
                                <div
                                    key={i}
                                    className="w-4 h-4 bg-black rounded-full"
                                ></div>
                            ))}
                            {user.blackPoints > 3 && (
                                <p className="ml-2">+{user.blackPoints - 3}</p>
                            )}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default Operators;
