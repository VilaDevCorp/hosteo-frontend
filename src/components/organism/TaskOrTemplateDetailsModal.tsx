import { Text, Title } from '@mantine/core';
import { Task, Template } from '../../types/entities';
import { TaskOrTemplateDetailsSkeleton } from '../skeletons/TaskOrTemplateDetailsSkeleton';
import { TaskCategoryBadge } from '../atoms/TaskCategoryBadge';
import { useEntityModal } from '../../hooks/useEntityModal';
import { TaskOrTemplateDetails } from '../modals/TaskOrTemplateDetails';

export function useTaskOrTemplateDetailsModal(type: 'task' | 'template') {
    const { onOpen: onOpenDetailsModal, modalComponent: detailsModal } =
        useEntityModal<Template>({
            entityName: type,
            getTitle: (entity?: Task | Template) => {
                if (!entity) return '';
                return (
                    <div
                        style={{
                            display: 'flex',
                            gap: '1rem',
                            alignItems: 'center'
                        }}
                    >
                        <Title
                            order={4}
                            style={{
                                display: '-webkit-box',
                                WebkitBoxOrient: 'vertical',
                                WebkitLineClamp: 1,
                                overflow: 'hidden'
                            }}
                        >
                            {entity.name}
                        </Title>
                        <TaskCategoryBadge category={entity.category} />
                        <Text style={{ whiteSpace: 'nowrap' }}>
                            {entity.duration} min
                        </Text>
                    </div>
                );
            },
            ModalBodyComponent: TaskOrTemplateDetails,
            ModalBodySkeleton: TaskOrTemplateDetailsSkeleton
        });

    return { onOpenDetailsModal, detailsModal };
}
