import React from 'react';
import { fetchProjects } from "@/api/projectService";
import { fetchProjectTypes } from "@/api/projectTypeService";
import { fetchTasks } from "@/api/sarciniService";
import { Button, Card, Progress } from "@/components/ui";
import wrapPromise from "@/utils/wrapPromise";
import { useNavigate } from "react-router-dom";
import { t } from 'i18next';
import { hasAccess, UserRole } from '@/utils/sharedHelpers';
import { useAppSelector } from '@/store';

const fetchProjectsData = () => {
    return new Promise<any>(async (resolve) => {
        try {
            const [projects, tasks, projectTypes] = await Promise.all([
                fetchProjects(0, 4, ['updateDate', 'desc']),
                fetchTasks(),
                fetchProjectTypes(),
            ]);
            resolve({ projects, tasks, projectTypes });
        } catch (error) {
            console.error('Error fetching project data:', error);
            throw error; // Throw error to handle it in Suspense
        }
    });
};

// Wrap the fetch function
const projectsResource = wrapPromise(fetchProjectsData());

const Projects: React.FC = () => {
    // Use the read method to get the data
    const { projects, tasks, projectTypes } = projectsResource.read();

    const navigate = useNavigate();
    const userRole = useAppSelector((state) => state.auth.user.authority) as UserRole;

    return (
        <div>
            {hasAccess(userRole, ['ADMIN']) && (
                <div className="flex items-center justify-between w-full mb-4 mt-4">
                    <h4 className="text-3xl font-semibold">{t("Projects")}</h4>
                    <Button onClick={() => navigate('/proiecte/nou')} shape="circle">{t("New Project")} +</Button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 ">
                {projects.map((project: any) => {
                    const projectTasks = tasks.filter((task: any) => task.projectId === project.id);
                    let projectTasksPercentage = projectTasks.filter((task: any) => task.status === 'DONE').length / projectTasks.length * 100;
                    projectTasksPercentage = isNaN(projectTasksPercentage) ? 0 : Number(projectTasksPercentage.toFixed(2));
                    const totalProjectSteps = projectTypes.find((projectType: any) => projectType.name === project.type)?.variables ?? {};
                    const totalProjectStepsLength = Object.keys(totalProjectSteps).length;
                    let projectStepsPercentage: any = project.checkpoint / totalProjectStepsLength * 100;
                    projectStepsPercentage = isNaN(projectStepsPercentage) || !isFinite(projectStepsPercentage) ? 0 : projectStepsPercentage.toFixed(2);

                    return (
                        <Card
                            key={project.id} // Ensure each card has a unique key
                            clickable
                            className="hover:shadow-lg transition duration-150 ease-in-out rounded-2xl"
                            onClick={(e) => navigate(`/proiecte/${project.id}`)}
                        >
                            <h5>{project.name}</h5>
                            <div className="flex justify-between mt-2">
                                <p>{t("Tasks")}:</p>
                                <p className="text-right">{`${projectTasks.filter((task: any) => task.status === 'DONE').length} / ${projectTasks.length}`}</p>
                            </div>
                            <Progress percent={projectTasksPercentage} />
                            <div className="flex justify-between mt-2">
                                <p>{t("Step")}:</p>
                                <p className="text-right">{project.checkpoint ?? 0} / {totalProjectStepsLength}</p>
                            </div>
                            <Progress percent={projectStepsPercentage} />
                            <div className="flex justify-between mt-2">
                                <p>{t("Deadline")}:</p>
                                <p className="text-right">{project.deliveryDate ? new Date(project.deliveryDate).toLocaleDateString() : 'N/A'}</p>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default Projects;
