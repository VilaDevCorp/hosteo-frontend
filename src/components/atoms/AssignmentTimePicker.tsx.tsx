import dayjs from 'dayjs';
import { conf } from '../../../conf';
import { AssignmentFormFields } from '../../types/forms';
import { CustomTimePicker } from './CustomTimePicker';

export function AssignmentTimePicker({
    formFields,
    setFormFields,
    duration
}: {
    formFields: AssignmentFormFields;
    setFormFields: React.Dispatch<React.SetStateAction<AssignmentFormFields>>;
    duration: number;
}) {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'column',
                gap: '1rem',
                width: '16rem'
            }}
        >
            <CustomTimePicker
                isStart={true}
                date={formFields.startDate || undefined}
                updateDate={(value: string) =>
                    setFormFields((oldValue) => {
                        return {
                            ...oldValue,
                            startDate: value,
                            endDate: dayjs(value)
                                .add(duration, 'minute')
                                .format(conf.dateInputFormat)
                        };
                    })
                }
            />

            <CustomTimePicker
                isStart={false}
                date={formFields.endDate || undefined}
                updateDate={(value: string) =>
                    setFormFields((oldValue) => {
                        const startDate = dayjs(oldValue.startDate);
                        const newEndDate = dayjs(value);
                        let endDate = startDate
                            .set('hour', newEndDate.hour())
                            .set('minute', newEndDate.minute());

                        if (endDate.isBefore(startDate)) {
                            endDate = endDate.add(1, 'day');
                        }
                        return {
                            ...oldValue,
                            endDate: endDate.format(conf.dateInputFormat)
                        };
                    })
                }
            />
        </div>
    );
}
