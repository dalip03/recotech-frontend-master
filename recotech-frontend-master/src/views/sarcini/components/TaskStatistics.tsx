import { fetchTaskStatistics } from '@/api/sarciniService'
import { Card } from '@/components/ui'
import { t } from 'i18next'
import { useEffect, useState } from 'react'

const TaskStatistics = (data : any) => {
    // console.log("data in task stats ", data)

    const statistics = {
        // totalTasks:  0,
        // toDoTasks:  0 ,
        // // inProgress: 5,
        // // done: statistics.done,
        // inProgress:  0,
        // done:  0,} 
        totalTasks: data?.data?.length ?? 0,
        toDoTasks: data?.unassigndata?.length ?? 0 ,
        // inProgress: 5,
        // done: statistics.done,
        inProgress: data?.data?.filter( (task:any)=> task.status === "IN_PROGRESS")?.length ?? 0,
        done: data?.data?.filter( (task:any)=> task.status === "APPROVED")?.length ?? 0,} 
    
    
    //     const [statistics, setStatistics] = useState({
    //         totalTasks:  0,
    //     toDoTasks:  0 ,
    //     // inProgress: 5,
    //     // done: statistics.done,
    //     inProgress:  0,
    //     done:  0,
        
    // })

    // const fetchData = async () => {
    //     try {
    //         // const statistics = await fetchTaskStatistics()
    //         setStatistics({
    //             totalTasks: statistics.total,
    //             toDoTasks: statistics.todo,
    //             inProgress: statistics.inProgress,
    //             done: statistics.done,
               
    //         })
    //     } catch (error) {
    //         console.error('Error fetching data:', error)
    //     }
    // }

    // useEffect(() => {
    //     const fetchAllData = async () => {
    //         try {
    //             await fetchData()
    //         } catch (error) {
    //             console.error('Error fetching data:', error)
    //         }
    //     }
    //     fetchAllData()
    // }, [])

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
            <Card      
                clickable={true}
                className="hover:shadow-lg transition duration-150 ease-in-out rounded-2xl"
            >
                 <div className="flex justify-between items-center">
                        <h5 className="text-xl"> {t('Tasks')}</h5>
                    </div>
                <p className=" mt-5 text-3xl font-bold">
                    {statistics.totalTasks !== null
                        ? statistics.totalTasks
                        : 'N/A'}
                </p>
            </Card>
            <Card
                clickable={true}
                className="hover:shadow-lg transition duration-150 ease-in-out rounded-2xl"
            >
                 <div className="flex justify-between items-center">
                        <h5 className="text-xl">
                            {t('Pending Tasks')}
                        </h5>
                    </div>
                <p className="mt-5 text-3xl font-bold">
                    {statistics.toDoTasks !== null
                        ? statistics.toDoTasks
                        : 'N/A'}
                </p>
            </Card>
            <Card
                clickable={true}
                className="hover:shadow-lg transition duration-150 ease-in-out rounded-2xl"
            >
                 <div className="flex justify-between items-center">
                        <h5 className="text-xl">
                            {t('Tasks in progress')}
                        </h5>
                    </div>
                <p className=" mt-5 text-3xl font-bold">
                    {statistics.inProgress !== null
                        ? statistics.inProgress
                        : 'N/A'}
                </p>
            </Card>
            <Card
                clickable={true}
                className="hover:shadow-lg transition duration-150 ease-in-out rounded-2xl"
            >
                 <div className="flex justify-between items-center">
                        <h5 className="text-xl">
                            {t('Finished Tasks')}
                        </h5>
                    </div>
                <p className="mt-5 text-3xl font-bold">
                    {statistics.done !== null ? statistics.done : 'N/A'}
                </p>
            </Card>
        </div>
    )
}

export default TaskStatistics
