import { ActionIcon, Button, Popover, Text } from '@mantine/core';
import { Calendar } from '@mantine/dates';
import {
    IconChevronLeft,
    IconChevronRight,
    IconCalendar
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import { conf } from '../../../conf';
import { useState } from 'react';
import { getEndOfWeek, getStartOfWeek } from '../../utils/utilFunctions';

export function SchedulerDatePicker({
    date,
    setDate
}: {
    date: string;
    setDate: (date: string) => void;
}) {
    const [hovered, setHovered] = useState<string | null>(null);

    function isInWeekRange(date: string, compareDate: string | null) {
        return compareDate
            ? dayjs(date).isBefore(getEndOfWeek(compareDate)) &&
                  (dayjs(date).isSame(getStartOfWeek(compareDate)) ||
                      dayjs(date).isAfter(getStartOfWeek(compareDate)))
            : false;
    }
    return (
        <div
            style={{
                display: 'flex',
                gap: '1rem',
                alignItems: 'center',
                width: '25rem'
            }}
        >
            <Button
                variant="light"
                size="compact-sm"
                onClick={() => setDate(getStartOfWeek(dayjs().toISOString()))}
            >
                {"Today"}
            </Button>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}
            >
                <ActionIcon
                    variant="transparent"
                    onClick={() =>
                        setDate(
                            getStartOfWeek(
                                dayjs(date).subtract(1, 'week').toISOString()
                            )
                        )
                    }
                >
                    <IconChevronLeft />
                </ActionIcon>
                <Text style={{ textTransform: 'uppercase' }}>
                    {`${dayjs(date).format(conf.dateWithSpaces)} - ${dayjs(
                        getEndOfWeek(date)
                    ).format(conf.dateWithSpaces)}`}
                </Text>
                <ActionIcon
                    variant="transparent"
                    onClick={() =>
                        setDate(
                            getStartOfWeek(
                                dayjs(date).add(1, 'week').toISOString()
                            )
                        )
                    }
                >
                    <IconChevronRight />
                </ActionIcon>
            </div>
            <Popover>
                <Popover.Target>
                    <ActionIcon variant="transparent">
                        <IconCalendar />
                    </ActionIcon>
                </Popover.Target>
                <Popover.Dropdown>
                    <Calendar
                        defaultDate={date}
                        withCellSpacing={false}
                        getDayProps={(dateCell) => {
                            const isHovered = isInWeekRange(dateCell, hovered);
                            const isSelected = isInWeekRange(dateCell, date);
                            const isInRange = isHovered || isSelected;
                            return {
                                onMouseEnter: () =>
                                    setHovered(getStartOfWeek(dateCell)),
                                onMouseLeave: () => setHovered(null),
                                inRange: isInRange,
                                firstInRange:
                                    isInRange &&
                                    new Date(dateCell).getDay() === 1,
                                lastInRange:
                                    isInRange &&
                                    new Date(dateCell).getDay() === 0,
                                selected: isSelected,
                                onClick: () => setDate(getStartOfWeek(dateCell))
                            };
                        }}
                    />
                </Popover.Dropdown>
            </Popover>
        </div>
    );
}
