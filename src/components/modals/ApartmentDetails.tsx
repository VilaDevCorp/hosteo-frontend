import { Divider, Image, Text } from '@mantine/core';
import { ApartmentWithTasks } from '../../types/entities';
import { addressToString } from '../../utils/utilFunctions';
import { PlatformIcon } from '../atoms/PlatformIcon';
import { useScreen } from '../../hooks/useScreen';
import { TaskOrTemplateCard } from '../molecules/TaskOrTemplateCard';
import { useTaskOrTemplateDetailsModal } from '../organism/TaskOrTemplateDetailsModal';

export function ApartmentDetails({
    entity: apartment
}: {
    entity?: ApartmentWithTasks;
}) {
    const { isTablet } = useScreen();
    const {
        onOpenDetailsModal: onOpenTaskDetailsModal,
        detailsModal: taskDetailsModal
    } = useTaskOrTemplateDetailsModal('task');

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                height: '100%'
            }}
        >
            <div
                style={{
                    display: 'flex',
                    gap: '1rem',
                    flexDirection: isTablet ? 'row' : 'column'
                }}
            >
                <Image
                    src="/apartment_placeholder.svg"
                    height={120}
                    style={{
                        objectFit: 'contain',
                        objectPosition: isTablet ? 'left' : 'center'
                    }}
                    alt="Apartment picture"
                />
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        width: '100%'
                    }}
                >
                    {apartment?.airbnbId && (
                        <div>
                            <PlatformIcon platform={'airbnb'} size={24} />
                            <Text component="span" ml={'0.25rem'}>
                                {apartment?.airbnbId}
                            </Text>
                        </div>
                    )}
                    {apartment?.bookingId && (
                        <div>
                            <PlatformIcon platform={'booking'} size={24} />
                            <Text component="span" ml={'0.25rem'}>
                                {apartment?.bookingId}
                            </Text>
                        </div>
                    )}
                    <Text c="dimmed">
                        {addressToString(apartment?.address)}
                    </Text>
                </div>
            </div>
            <Divider />
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns:
                        'repeat(auto-fill, minmax(15rem, 1fr))',
                    justifyItems: 'center',
                    gap: '1rem',
                    rowGap: '2rem',
                    width: '100%',
                    overflowY: 'auto',
                    height: '100%',
                    paddingRight: '0.4rem'
                }}
            >
                {apartment?.tasks &&
                    apartment.tasks
                        .filter((task) => task.visible !== false)
                        .map((task) => (
                            <TaskOrTemplateCard
                                key={task.id}
                                item={task}
                                onClick={() => onOpenTaskDetailsModal(task.id)}
                            />
                        ))}
            </div>
            {taskDetailsModal}
        </div>
    );
}
