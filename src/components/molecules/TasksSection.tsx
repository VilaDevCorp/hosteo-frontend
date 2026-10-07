import { Tabs } from '@mantine/core';
import { TaskOrTemplateCard } from './TaskOrTemplateCard';
import { Task } from '../../types/entities';

export function TasksSection({
    tasks,
    showHidden,
    onEdit,
    onToggleVisibility
}: {
    tasks: Task[];
    showHidden: boolean;
    onEdit: (id: string) => void;
    onToggleVisibility: (id: string, visible: boolean) => void;
}) {
    const visibleTasks = tasks.filter((task) =>
        showHidden ? task.visible === false : task.visible !== false
    );

    return (
        <Tabs.Panel
            value="tasks"
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(15rem, 1fr))',
                justifyItems: 'center',
                gap: '1rem',
                rowGap: '2rem',
                width: '100%',
                overflowY: 'auto',
                height: '100%',
                paddingRight: '0.4rem'
            }}
        >
            {visibleTasks.map((task) => (
                <TaskOrTemplateCard
                    item={task}
                    key={task.id}
                    onEdit={() => onEdit(task.id)}
                    onToggleVisibility={() =>
                        onToggleVisibility(task.id, task.visible)
                    }
                />
            ))}
        </Tabs.Panel>
    );
}
