import { fetchTaskStatistics } from "@/api/sarciniService"
import { Card } from "@/components/ui"
import { t } from "i18next"
import { useEffect, useState } from "react"

const TaskStatistics = () => {

    const [statistics, setStatistics] = useState({
        totalTasks: 0,
        toDoTasks: 0,
        inProgress: 0,
        done: 0
    })

    const fetchData = async () => {
        try {
            const statistics = await fetchTaskStatistics();
            setStatistics({
                totalTasks: statistics.total,
                toDoTasks: statistics.todo,
                inProgress: statistics.inProgress,
                done: statistics.done
            })
        } catch (error) {
            console.error('Error fetching data:', error)
        }
    }

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                await fetchData();
            } catch (error) {
                console.error('Error fetching data:', error)
            }
        }
        fetchAllData()
    }, [])

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
            <Card
                header={
                    <div className="flex justify-between items-center">
                        <span className="text-3xl font-bold text-black">
                            {t("Tasks")}
                        </span>
                    </div>
                }
                clickable={true}
                className="hover:shadow-lg transition duration-150 ease-in-out rounded-2xl"
            >
                <p className=" text-3xl font-bold">
                    {statistics.totalTasks !== null ? statistics.totalTasks : 'N/A'}
                </p>
            </Card>
            <Card
                header={
                    <div className="flex justify-between items-center">
                        <span className="text-3xl font-bold text-black">
                            {t("Pending Tasks")}
                        </span>
                    </div>
                }
                clickable={true}
                className="hover:shadow-lg transition duration-150 ease-in-out rounded-2xl"
            >
                <p className=" text-3xl font-bold">
                    {statistics.toDoTasks !== null ? statistics.toDoTasks : 'N/A'}
                </p>
            </Card>
            <Card
                header={
                    <div className="flex justify-between items-center">
                        <span className="text-3xl font-bold text-black">
                            {t("Tasks in progress")}
                        </span>
                    </div>
                }
                clickable={true}
                className="hover:shadow-lg transition duration-150 ease-in-out rounded-2xl"
            >
                <p className=" text-3xl font-bold">
                    {statistics.inProgress !== null ? statistics.inProgress : 'N/A'}
                </p>
            </Card>
            <Card
                header={
                    <div className="flex justify-between items-center">
                        <span className="text-3xl font-bold text-black">
                            {t("Finished Tasks")}
                        </span>
                    </div>
                }
                clickable={true}
                className="hover:shadow-lg transition duration-150 ease-in-out rounded-2xl"
            >
                <p className=" text-3xl font-bold">
                    {statistics.done !== null ? statistics.done : 'N/A'}
                </p>
            </Card>
        </div>
    )
}

export default TaskStatistics