import React from 'react';
import { fetchTotalExpenses, fetchTotalIncomes, fetchTotalProjects, fetchTotalUsers } from "@/api/dashboardService";
import { Card } from "@/components/ui";
import wrapPromise from "@/utils/wrapPromise";
import { t } from 'i18next';

type Statistics = {
    totalUsers: number;
    totalProjects: number;
    totalExpenses: number;
    totalIncomes: number;
};
const fetchStatistics = () => {
    return new Promise<Statistics>((resolve) => {
        Promise.all([
            fetchTotalUsers(),
            fetchTotalProjects(),
            fetchTotalExpenses(),
            fetchTotalIncomes(),
        ]).then(([users, projects, expenses, incomes]) => resolve({
            totalUsers: users,
            totalProjects: projects,
            totalExpenses: expenses,
            totalIncomes: incomes,
        }))
    });
};

const statisticsResource = wrapPromise(fetchStatistics()); // Create the resource for statistics

const AdminStatistics: React.FC = () => {

    const statistics = statisticsResource.read(); // This will suspend until data is fetched

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
            <Card
                clickable
                className="hover:shadow-lg transition duration-150 ease-in-out rounded-2xl"
            >
                <h5 className="text-xl">{t('Users')}</h5>
                <p className="mt-5 text-3xl font-bold">{statistics.totalUsers !== null ? statistics.totalUsers : 'N/A'}</p>
            </Card>
            <Card
                clickable
                className="hover:shadow-lg transition duration-150 ease-in-out rounded-2xl"
            >
                <h5 className="text-xl">{t('Projects')}</h5>
                <p className="mt-5 text-3xl font-bold">{statistics.totalProjects !== null ? statistics.totalProjects : 'N/A'}</p>
            </Card>
            <Card
                clickable
                className="hover:shadow-lg transition duration-150 ease-in-out rounded-2xl"
            >
                <h5 className="text-xl">{t('Expenses')}</h5>
                <p className="mt-5 text-2xl font-bold">{statistics.totalExpenses !== null && statistics.totalExpenses !== undefined ? `${statistics.totalExpenses} RON` : 'N/A'}</p>
            </Card>
            <Card
                clickable
                className="hover:shadow-lg transition duration-150 ease-in-out rounded-2xl"
            >
                <h5 className="text-xl">{t('Income')}</h5>
                <p className="mt-5 text-2xl font-bold">{statistics.totalIncomes !== null && statistics.totalIncomes !== undefined ? `${statistics.totalIncomes} RON` : 'N/A'}</p>
            </Card>
        </div>
    );
};

export default AdminStatistics;
