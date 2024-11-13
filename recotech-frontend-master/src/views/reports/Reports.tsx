import { Spinner } from "@/components/ui";
import { Suspense } from "react";
import AdminStatistics from "../dashboard/components/AdminStatistics";
import Parts from "../dashboard/components/Parts";
import RequestParts from "../dashboard/components/RequestParts";
import Projects from "../dashboard/components/Projects";
import TaskStatistics from "../sarcini/components/TaskStatistics";
import Users from "../dashboard/components/Users";

export default function Reports() {
    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-3xl font-semibold mb-4">Dashboard</h3>
            </div>
            <Suspense fallback={
                <div className="flex justify-center items-center h-full w-full">
                    <Spinner size={40} />
                </div>
            }>
                <AdminStatistics />
                <div>
                    <h2>Piese</h2>
                    <Parts />
                </div>
                <div>
                    <h2>Magazie</h2>
                    <RequestParts />
                </div>
                <Projects />
                <div className='my-4'>
                    <h2 className="mb-2">Sarcini</h2>
                    <TaskStatistics />
                </div>
                <Users />
            </Suspense>
        </div>
    )
}