import { Drawer } from '@mantine/core';
import { EventSchedulerDto, TaskDto } from '../../types/entities';
import { AlertsIndicator } from '../atoms/AlertsIndicator';
import { AlertEvent } from '../molecules/AlertEvent';
import { Accordion } from '@mantine/core';

export function AlertsDrawer({
    opened,
    onClose,
    redAlertEvents,
    yellowAlertEvents,
    eventInfo,
    handleCreateNewAssignment
}: {
    opened: boolean;
    onClose: () => void;
    redAlertEvents: string[];
    yellowAlertEvents: string[];
    eventInfo: Record<string, EventSchedulerDto>;
    handleCreateNewAssignment: (eventSchedulerDto: EventSchedulerDto, task?: TaskDto) => void;
}) {
    return (
        <Drawer
            opened={opened}
            onClose={onClose}
            title={
                <AlertsIndicator
                    redAlertCount={redAlertEvents.length}
                    yellowAlertCount={yellowAlertEvents.length}
                />
            }
            size="md"
            position="right"
        >
            <Accordion>
                {redAlertEvents.map((eventId) => {
                    const eventSchedulerDto = eventInfo[eventId];
                    if (!eventSchedulerDto) return null;
                    return (
                        <AlertEvent
                            key={eventId}
                            eventSchedulerDto={eventSchedulerDto}
                            handleCreateNewAssignment={handleCreateNewAssignment}
                        />
                    );
                })}
                {yellowAlertEvents.map((eventId) => {
                    const eventSchedulerDto = eventInfo[eventId];
                    if (!eventSchedulerDto) return null;
                    return (
                        <AlertEvent
                            key={eventId}
                            eventSchedulerDto={eventSchedulerDto}
                            handleCreateNewAssignment={handleCreateNewAssignment}
                        />
                    );
                })}
            </Accordion>
        </Drawer>
    );
}