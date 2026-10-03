import { Text, useMantineTheme } from '@mantine/core';
import { IconLogin, IconLogout } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { TimePicker } from '@mantine/dates';
import { conf } from '../../../conf';

export function CustomTimePicker({
    isStart,
    date,
    updateDate
}: {
    isStart: boolean;
    date: string | undefined;
    updateDate: (value: string) => void;
}) {
    const theme = useMantineTheme();

    const changeTime = (value: string) => {
        const timeObj = dayjs(value, 'HH:mm');
        const hours = timeObj.hour();
        const minutes = timeObj.minute();
        const newDate = dayjs(date).hour(hours).minute(minutes).second(0);
        if (newDate.isValid()) {
            updateDate(newDate.format(conf.dateInputFormat));
        } else {
            updateDate('');
        }
    };

    return (
        <div
            style={{ display: 'flex', flexDirection: 'column', width: '100%' }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%'
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                    }}
                >
                    {isStart ? (
                        <IconLogin color={theme.colors.success[5]} />
                    ) : (
                        <IconLogout color={theme.colors.error[5]} />
                    )}

                    {date ? (
                        <Text fw={'bold'}>
                            {dayjs(date).format(conf.dateTimeWithWeekDay)}
                        </Text>
                    ) : (
                        <Text c={'gray'} fw={'lighter'}>
                            {`Select a ${isStart ? 'start' : 'end'} date`}
                        </Text>
                    )}
                </div>
                <TimePicker
                    value={date ? dayjs(date).format('HH:mm') : ''}
                    onChange={changeTime}
                />
            </div>
        </div>
    );
}
