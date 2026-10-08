import { useContext } from 'react';
import { AssignmentSchedulerContext } from '../providers/AssignmentSchedulerProvider';

export const useAssignmentSchedulerWithContext = () => {
    const ctx = useContext(AssignmentSchedulerContext);
    if (ctx === null) {
        throw new Error(
            'useAssignmentSchedulerWithContext() can only be used on the descendants of AssignmentSchedulerProvider'
        );
    } else {
        return ctx;
    }
};
