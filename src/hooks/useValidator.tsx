import { useEffect, useState } from 'react';

export function emailValidator(input: string): string {
    const regex =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regex.test(input) ? '' : 'The email is not valid';
}
export function phoneValidator(input: string): string {
    const regex = /^[0-9]{9}$/;
    return regex.test(input) ? '' : 'The phone is not valid';
}
export function notEmptyValidator(input: string): string {
    return input && input.length >= 1 ? '' : 'The field cannot be empty';
}
export function haveNumbersValidator(input: string): string {
    return /(?=.*\d).*/.test(input) ? '' : 'The field should contain a number';
}
export function minLength8Validator(input: string): string {
    return input.length >= 8 ? '' : 'The field cannot be less than 8 char';
}
export function authCodeValidator(value: string): string {
    return /^[0-9]{6}$/.test(value) ? '' : 'The code is not valid';
}

export function positiveNumberValidator(input: string): string {
    const value = Number(input);
    return input.trim() !== '' && !Number.isNaN(value) && value > 0
        ? ''
        : 'The amount must be a positive number';
}

export function nonNegativeNumberValidator(input: string): string {
    const value = Number(input);
    return input.trim() !== '' && !Number.isNaN(value) && value >= 0
        ? ''
        : 'The value must be zero or a positive number';
}

export function upperLowerCaseValidator(input: string): string {
    return /(?=.*[A-Z])(?=.*[a-z]).*/.test(input)
        ? ''
        : 'The field should contain upper and lower case';
}

export type UseValidatorReturn = {
    dirty: boolean;
    error: boolean;
    message: string;
    validate: () => boolean;
    activateDirty: () => void;
};

export const useValidator = (
    input: string,
    validators: { (input: string): string }[]
): UseValidatorReturn => {
    const [dirty, setDirty] = useState(false);
    const [error, setError] = useState(false);
    const [message, setMessage] = useState('');

    const activateDirty = () => setDirty(true);

    useEffect(() => {
        //If the inputRef is not set, the dirty state is activated when the user starts typing
        for (const validator of validators) {
            const e = validator(input);
            if (e) {
                setError(true);
                setMessage(e);
                return;
            }
        }
        setError(false);
        setMessage('');
    }, [input]);

    const validate = () => {
        for (const validator of validators) {
            const e = validator(input);
            if (e) {
                setDirty(true);
                setError(true);
                setMessage(e);
                return false;
            }
        }
        return true;
    };
    return { dirty, error, message, validate, activateDirty };
};
