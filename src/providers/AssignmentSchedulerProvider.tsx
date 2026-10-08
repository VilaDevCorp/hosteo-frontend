import { createContext, ReactNode } from 'react';
import {
    useAssignmentScheduler,
    IUseAssignmentScheduler
} from '../hooks/useAssignmentScheduler';

type IAssignmentSchedulerContext = Omit<IUseAssignmentScheduler, 'modalComponent'>;

export const AssignmentSchedulerContext = createContext<IAssignmentSchedulerContext>(
    {} as IAssignmentSchedulerContext
);

export const AssignmentSchedulerProvider = ({
    children
}: {
    children: ReactNode;
}) => {
    const { onCreateAssignment, onUpdateAssignment, modalComponent } =
        useAssignmentScheduler();

    const value: IAssignmentSchedulerContext = {
        onCreateAssignment,
        onUpdateAssignment
    };

    return (
        <AssignmentSchedulerContext.Provider value={value}>
            {modalComponent}
            {children}
        </AssignmentSchedulerContext.Provider>
    );
};
