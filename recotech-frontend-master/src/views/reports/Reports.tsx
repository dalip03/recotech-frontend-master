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
            <h3 className="pb-4 pt-4 font-bold ">Dashboard</h3>
            </div>
            <Suspense fallback={
                <div className="flex justify-center items-center h-full w-full">
                    <Spinner size={40} />
                </div>
            }>
                <AdminStatistics />
                <div>
                <h3 className="pb-4 pt-4 font-bold ">Piese</h3>
                    <Parts />
                </div>
                <div>
                <h3 className="pb-4 pt-4 font-bold ">Magazie</h3>
                    <RequestParts />
                </div>
                <Projects />
                <div className='my-4'>
                <h3 className="pb-4 pt-4 font-bold ">Sarcini</h3>
                    <TaskStatistics />
                </div>
                <Users />
            </Suspense>
        </div>
    )
}