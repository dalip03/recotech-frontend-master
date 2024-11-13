import React, { useState } from 'react';
import { fetchUsers } from "@/api/userService";
import { Card } from "@/components/ui";
import wrapPromise from "@/utils/wrapPromise";
import { t } from 'i18next';
import { getTranslatedRole, UserRole } from '@/utils/sharedHelpers';
import { fetchTasks } from '@/api/sarciniService';

interface User {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    whitePoints: number;
    blackPoints: number;
}

interface UserWithStatistics extends User {
    statistics: {
        total: number;
        todo: number;
        inProgress: number;
        done: number;
    };
}

const fetchUsersData = () => {
    return new Promise<UserWithStatistics[]>(async (resolve) => {
        try {
            const usersResult = await fetchUsers(0, 10000, ['updateDate', 'desc']);
            const tasks = await fetchTasks();
            const users = usersResult.data.content;

            const currentDate = new Date();
            const daysAgo28 = new Date(currentDate.setDate(currentDate.getDate() - 28));

            const usersWithStatistics = users.map((user: any) => {
                const userTasks = tasks.filter((task: any) => {
                    const isAssignedToUser = task.assignedTo.includes(user.id);
                    const isWithin28Days = new Date(task.createDate) >= daysAgo28;
                    return isAssignedToUser && isWithin28Days;
                });

                const statistics = {
                    total: userTasks.length,
                    todo: userTasks.filter((task: any) => task.status === 'TODO').length,
                    inProgress: userTasks.filter((task: any) => task.status === 'IN_PROGRESS').length,
                    done: userTasks.filter((task: any) => task.status === 'DONE').length,
                };

                return {
                    ...user,
                    statistics,
                };
            });

            resolve(usersWithStatistics);
        } catch (error) {
            console.error('Error fetching user data:', error);
            throw error;
        }
    });
};

const usersResource = wrapPromise(fetchUsersData());

const Users: React.FC = () => {
    const users = usersResource.read();
    const [visibleCount, setVisibleCount] = useState(8); // Initial number of users displayed

    const showMoreUsers = () => {
        if (visibleCount >= users.length) {
            // Reset to initial count if end is reached
            setVisibleCount(8);
        } else {
            // Otherwise, increase the count by 8
            setVisibleCount(visibleCount + 8);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between w-full mb-4 mt-4">
                <h4 className="text-3xl font-semibold">{t("Operators")}</h4>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                {users.slice(0, visibleCount).map((user) => (
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
                            <p>{t("Black Points")}:</p>
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
                        <div className="flex flex-row gap-2 mt-6">
                            <p>{t("Tasks in progress")}:</p>
                            <p>{user.statistics.inProgress}</p>
                        </div>
                        <div className="flex flex-row gap-2 mt-6">
                            <p>{t("Tasks done")}:</p>
                            <p>{user.statistics.done}</p>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="flex justify-center mt-6">
                <button
                    onClick={showMoreUsers}
                    className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
                >
                    {visibleCount >= users.length ? t("Show Less") : t("Show More")}
                </button>
            </div>
        </div>
    );
};

export default Users;
