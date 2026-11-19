import dayjs from 'dayjs';
import { conf } from '../../conf';
import {
    AssignmentDto,
    WorkerAssignmentDto,
    WorkerInstructions
} from '../types/entities';

const formatDateRange = (assignments: AssignmentDto[]): string | undefined => {
    if (assignments.length === 0) {
        return undefined;
    }
    const firstDate = dayjs.unix(assignments[0].startDate);
    const lastDate = assignments.reduce((latest, assignment) => {
        const endDate = dayjs.unix(
            Math.max(assignment.startDate, assignment.endDate)
        );
        return endDate.isAfter(latest) ? endDate : latest;
    }, firstDate);
    return `${firstDate.format(conf.dateFormat)} - ${lastDate.format(
        conf.dateFormat
    )}`;
};

const groupByDay = (assignments: AssignmentDto[]) => {
    const assignmentsByDay = new Map<string, AssignmentDto[]>();
    assignments.forEach((assignment) => {
        const day = dayjs.unix(assignment.startDate).format('YYYY-MM-DD');
        const dayAssignments = assignmentsByDay.get(day);
        if (dayAssignments) {
            dayAssignments.push(assignment);
        } else {
            assignmentsByDay.set(day, [assignment]);
        }
    });
    return assignmentsByDay;
};

export const generateWorkerInstructions = (
    workerAssignments: WorkerAssignmentDto
): WorkerInstructions => {
    const assignments = [...workerAssignments.assignments].sort(
        (a, b) => a.startDate - b.startDate
    );

    const lines = [workerAssignments.worker.name];

    const dateRange = formatDateRange(assignments);
    if (dateRange) {
        lines.push(dateRange);
    }

    groupByDay(assignments).forEach((dayAssignments, day) => {
        lines.push('', dayjs(day).format(conf.dateWithShortWeekDay), '');
        dayAssignments.forEach((assignment) => {
            const time = dayjs
                .unix(assignment.startDate)
                .format(conf.timeFormat);
            lines.push(
                `${time} - ${assignment.task.name} (${assignment.task.apartment.name})`
            );
        });
    });

    return {
        worker: workerAssignments.worker,
        instructions: lines.join('\n')
    };
};

export const generateWorkerInstructionsList = (
    workerAssignments: WorkerAssignmentDto[]
): WorkerInstructions[] => workerAssignments.map(generateWorkerInstructions);
