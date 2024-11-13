const data = [
    {
        id: 1,
        subject: 'Meeting Reminder',
        body: 'Hello! Just a friendly reminder about our meeting tomorrow.',
        attachments: [
            { id: 1, name: 'meeting_agenda.txt', url: 'random-url' },
            { id: 2, name: 'meeting_notes.txt', url: 'random-url' },
        ],
        sentBy: 1,
        createdAt: new Date().toISOString(),
    },
    {
        id: 2,
        subject: 'Project Update',
        body: 'Here is the latest update on our project progress.',
        attachments: [
            { id: 3, name: 'project_report.txt', url: 'random-url' },
            { id: 4, name: 'project_schedule.txt', url: 'random-url' },
        ],
        sentBy: 1,
        createdAt: new Date().toISOString(),
    },
    {
        id: 3,
        subject: 'Feedback Request',
        body: 'We would appreciate your feedback on our recent service.',
        attachments: [{ id: 5, name: 'feedback_form.txt', url: 'random-url' }],
        sentBy: 1,
        createdAt: new Date().toISOString(),
    },
]

export default data;
