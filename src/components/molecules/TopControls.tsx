import { ActionIcon, Indicator } from '@mantine/core';
import { useScreen } from '../../hooks/useScreen';
import { IconFilter } from '@tabler/icons-react';
import { useState } from 'react';
import { FiltersModal } from '../modals/FiltersModal';

interface TopControlsProps {
    keywordFilter?: React.ReactNode;
    firstTopRow?: React.ReactNode;
    secondTopRow?: React.ReactNode;
    addButton?: React.ReactNode;
    filtersOnModalActivated?: boolean;
}

export function TopControls({
    keywordFilter,
    firstTopRow,
    secondTopRow,
    addButton,
    filtersOnModalActivated
}: TopControlsProps) {
    const { isTablet } = useScreen();
    const [filtersOpened, setFiltersOpened] = useState(false);

    return isTablet ? (
        <section
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    flexWrap: 'wrap-reverse'
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        gap: '1rem',
                        flex: 1
                    }}
                >
                    {keywordFilter}
                    {firstTopRow}
                </div>
                {addButton}
            </div>
            <div
                style={{
                    display: 'flex',
                    gap: '1rem',
                    flex: 1
                }}
            >
                {secondTopRow}
            </div>
        </section>
    ) : (
        <section
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {secondTopRow}
                {addButton}
            </div>
            <div
                style={{
                    display: 'flex',
                    gap: '1rem',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
            >
                {firstTopRow && (
                    <Indicator disabled={!filtersOnModalActivated}>
                        <ActionIcon
                            variant="light"
                            size="lg"
                            onClick={() => setFiltersOpened(true)}
                        >
                            <IconFilter />
                        </ActionIcon>
                    </Indicator>
                )}
                {keywordFilter}
            </div>
            {!isTablet && filtersOpened && (
                <FiltersModal
                    opened={filtersOpened}
                    onClose={() => setFiltersOpened(false)}
                    title="Filters"
                >
                    {firstTopRow}
                </FiltersModal>
            )}
        </section>
    );
}
