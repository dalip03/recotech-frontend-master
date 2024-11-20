import AdminStatistics from './components/AdminStatistics'
import { hasAccess, UserRole } from '@/utils/sharedHelpers'
import { useAppSelector } from '@/store'
import Projects from './components/Projects'
import Operators from './components/Operators'
import { Suspense } from 'react'
import { Spinner } from '@/components/ui'
import Parts from './components/Parts'
import RequestParts from './components/RequestParts'
import MyTasks from './components/MyTasks'
import TaskStatistics from '../sarcini/components/TaskStatistics'
import OperatorProjects from './components/OperatorProjects'

const Dashboard = () => {
    const userRole = useAppSelector((state) => state.auth.user.authority) as UserRole;
    return (
        <div>
            <div>
            <h3 className="pb-4 pt-4 font-bold ">Dashboard</h3>
            </div>
            <Suspense fallback={
                <div className="flex justify-center items-center h-full w-full">
                    <Spinner size={40} />
                </div>
            }>
                {hasAccess(userRole, ['ADMIN']) && (
                    <AdminStatistics />
                )}
                {hasAccess(userRole, ['ADMIN', 'OPERATOR', 'VANZATOR']) && (
                    <div className='my-4'>
                        <TaskStatistics />
                    </div>
                )}
                {hasAccess(userRole, ['PIESAR']) && userRole !== 'SUPER_ADMIN' && (
                    <Parts />
                )}
                {hasAccess(userRole, ['MAGAZIE']) && userRole !== 'SUPER_ADMIN' && (
                    <RequestParts />
                )}
                {hasAccess(userRole, ['OPERATOR']) && userRole !== 'SUPER_ADMIN' && (
                    <>
                        <OperatorProjects />
                        <MyTasks />
                    </>
                )}
                {userRole !== 'OPERATOR' && (
                    <Projects />
                )}
                {hasAccess(userRole, ['ADMIN']) && (
                    <Operators />
                )}
            </Suspense>
        </div>
    )
}

export default Dashboard
