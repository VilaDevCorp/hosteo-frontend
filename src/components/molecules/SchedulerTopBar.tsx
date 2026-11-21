import { Button, Badge, Menu, TextInput } from '@mantine/core';
import {
    IconUpload,
    IconFileText,
    IconChevronDown,
    IconSearch
} from '@tabler/icons-react';
import { AlertsIndicator } from '../atoms/AlertsIndicator';
import { SchedulerActions } from './SchedulerActions';
import { SchedulerDatePicker } from './SchedulerDatePicker';
import { GenerateInstructionsModal } from '../modals/GenerateInstructionsModal';
import { WorkerInstructionsModal } from '../modals/WorkerInstructionsModal';
import { useApi } from '../../hooks/useApi';
import { useQuery } from '@tanstack/react-query';
import { FailedImportedEvent, WorkerInstructions } from '../../types/entities';
import { useState } from 'react';
import { ImportIssuesModal } from '../modals/ImportIssuesModal';
import { ImportModal } from '../modals/ImportModal';

export function SchedulerTopBar({
    startOfWeek,
    setStartOfWeek,
    selectedEventIds,
    setSelectedEventIds,
    selectedAssignmentIds,
    setSelectedAssignmentIds,
    setOpenedDrawer,
    apartmentSearchKey,
    setApartmentSearchKey
}: {
    startOfWeek: string;
    setStartOfWeek: React.Dispatch<React.SetStateAction<string>>;
    selectedEventIds: Set<string>;
    setSelectedEventIds: React.Dispatch<React.SetStateAction<Set<string>>>;
    selectedAssignmentIds: Set<string>;
    setSelectedAssignmentIds: React.Dispatch<React.SetStateAction<Set<string>>>;
    setOpenedDrawer: React.Dispatch<React.SetStateAction<boolean>>;
    setApartmentSearchKey: React.Dispatch<React.SetStateAction<string>>;
    apartmentSearchKey: string;
}) {
    const [generateInstructionsOpened, setGenerateInstructionsOpened] =
        useState<boolean>(false);
    const [instructionsModalOpened, setInstructionsModalOpened] =
        useState<boolean>(false);
    const [workerInstructions, setWorkerInstructions] = useState<
        WorkerInstructions[]
    >([]);

    const [nSuccessItems, setNSuccessItems] = useState<number | undefined>(
        undefined
    );
    const onOpenIssuesModal = (nSuccessItems: number) => {
        setNSuccessItems(nSuccessItems);
        setIssuesModalOpened(true);
    };

    const [importModalOpened, setImportModalOpened] = useState<boolean>(false);
    const [issuesModalOpened, setIssuesModalOpened] = useState<boolean>(false);

    const onInstructionsGenerated = (instructions: WorkerInstructions[]) => {
        setWorkerInstructions(instructions);
        setGenerateInstructionsOpened(false);
        setInstructionsModalOpened(true);
    };

    const { getFailedImportedEvents } = useApi();

    const { data: failedImportedEvents } = useQuery<FailedImportedEvent[]>({
        queryKey: ['failedImportedEvents'],
        queryFn: getFailedImportedEvents
    });

    return (
        <>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem',
                    flexDirection: 'column'
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        alignItems: 'center',
                        width: '100%'
                    }}
                >
                    <SchedulerDatePicker
                        date={startOfWeek}
                        setDate={setStartOfWeek}
                    />
                    <AlertsIndicator onClick={() => setOpenedDrawer(true)} />
                </div>
                <div
                    style={{
                        display: 'flex',
                        width: '100%',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        alignItems: 'center',
                        height: '3rem'
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            gap: '1rem'
                        }}
                    >
                        <TextInput
                            variant="outlined"
                            style={{
                                width: '15rem'
                            }}
                            placeholder="Filter by apartment"
                            value={apartmentSearchKey}
                            onChange={(e) => {
                                setSelectedAssignmentIds(new Set());
                                setSelectedEventIds(new Set());
                                setApartmentSearchKey(e.target.value);
                            }}
                            leftSection={<IconSearch size={14} />}
                        />

                        {failedImportedEvents &&
                            failedImportedEvents.length > 0 && (
                                <Badge
                                    variant="filled"
                                    color="warning"
                                    size="lg"
                                    style={{
                                        cursor: 'pointer',
                                        height: '30px'
                                    }}
                                    onClick={() => setIssuesModalOpened(true)}
                                >
                                    Pending Issues (
                                    {failedImportedEvents.length})
                                </Badge>
                            )}
                        <Menu position="bottom-end" withArrow>
                            <Menu.Target>
                                <Button
                                    variant=""
                                    size="sm"
                                    leftSection={<IconChevronDown />}
                                >
                                    Actions
                                </Button>
                            </Menu.Target>

                            <Menu.Dropdown>
                                <Menu.Item
                                    leftSection={<IconUpload size={16} />}
                                    onClick={() => setImportModalOpened(true)}
                                >
                                    Import events
                                </Menu.Item>
                                <Menu.Item
                                    leftSection={<IconFileText size={16} />}
                                    onClick={() => {
                                        setGenerateInstructionsOpened(true);
                                    }}
                                >
                                    Generate instructions
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </div>
                    <SchedulerActions
                        selectedEventIds={selectedEventIds}
                        setSelectedEventIds={setSelectedEventIds}
                        selectedAssignmentIds={selectedAssignmentIds}
                        setSelectedAssignmentIds={setSelectedAssignmentIds}
                    />
                </div>
            </div>
            <ImportModal
                opened={importModalOpened}
                onClose={() => setImportModalOpened(false)}
                onOpenIssuesModal={onOpenIssuesModal}
            />
            <ImportIssuesModal
                opened={issuesModalOpened}
                onClose={() => setIssuesModalOpened(false)}
                nSuccessItems={nSuccessItems}
            />

            <GenerateInstructionsModal
                opened={generateInstructionsOpened}
                onClose={() => setGenerateInstructionsOpened(false)}
                onGenerated={onInstructionsGenerated}
            />
            <WorkerInstructionsModal
                opened={instructionsModalOpened}
                onClose={() => setInstructionsModalOpened(false)}
                workerInstructions={workerInstructions}
            />
        </>
    );
}
