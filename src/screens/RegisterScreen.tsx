import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import {
    emailValidator,
    minLength8Validator,
    notEmptyValidator,
    upperLowerCaseValidator,
    useValidator
} from '../hooks/useValidator';
import { ApiError } from '../types/types';
import StatusCode from 'status-code-enum';
import { useNavigate } from 'react-router-dom';
import { PublicFormLayout } from '../components/organism/publicformlayout/PublicFormLayout';
import { Layout } from '../components/organism/layout/Layout';
import { useMutation } from '@tanstack/react-query';
import { Button, TextInput } from '@mantine/core';
import {
    IconAt,
    IconEye,
    IconEyeOff,
    IconLock,
    IconUser
} from '@tabler/icons-react';
import {
    showNotificationError,
    showNotificationSuccess
} from '../utils/notifUtils';
import { useScreen } from '../hooks/useScreen';
import { ERROR_CODE } from '../types/enums';

export function RegisterScreen() {
    const { register } = useApi();
    const navigate = useNavigate();
    const { isTablet } = useScreen();

    const [username, setUsername] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [repeatPassword, setRepeatPassword] = useState<string>('');
    const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
    const [repeatPasswordVisible, setRepeatPasswordVisible] =
        useState<boolean>(false);

    const {
        dirty: usernameDirty,
        error: usernameError,
        message: usernameMessage,
        validate: usernameValidate,
        activateDirty: setDirtyUsername
    } = useValidator(username, [notEmptyValidator]);

    const {
        dirty: emailDirty,
        error: emailError,
        message: emailMessage,
        validate: emailValidate,
        activateDirty: setDirtyEmail
    } = useValidator(email, [notEmptyValidator, emailValidator]);

    const {
        dirty: passwordDirty,
        error: passwordError,
        message: passwordMessage,
        validate: passwordValidate,
        activateDirty: setDirtyPassword
    } = useValidator(password, [
        notEmptyValidator,
        minLength8Validator,
        upperLowerCaseValidator
    ]);
    const [passwordMatchError, setPasswordMatchError] = useState<string>('');
    const [passwordMatchDirty, setPasswordMatchDirty] =
        useState<boolean>(false);

    const passwordMatchValidate = () => {
        if (!passwordMatchDirty && (password || repeatPassword)) {
            setPasswordMatchDirty(true);
        }
        if (password === repeatPassword) {
            setPasswordMatchError('');
            return true;
        } else {
            setPasswordMatchError('The passwords do not match');
            return false;
        }
    };

    useEffect(() => {
        passwordMatchValidate();
    }, [password, repeatPassword]);

    const registerUser = async () => {
        const usernameValid = usernameValidate();
        const emailValid = emailValidate();
        const passwordValid = passwordValidate();
        const passwordMatch = passwordMatchValidate();
        if (usernameValid && emailValid && passwordValid && passwordMatch) {
            await register({ username, email, password });
        } else {
            throw new Error('There are errors in the form');
        }
    };

    const { mutate: onRegister, isPending: isLoading } = useMutation({
        mutationFn: registerUser,
        onSuccess: () => {
            showNotificationSuccess('User succesfully registered');
            navigate('/login');
        },
        onError: (e) => {
            if (e instanceof ApiError) {
                if (e.statusCode === StatusCode.ClientErrorConflict) {
                    if (e.code === ERROR_CODE.USERNAME_IN_USE) {
                        showNotificationError('The username is already in use');
                        return;
                    }
                    if (e.code === ERROR_CODE.EMAIL_IN_USE) {
                        showNotificationError('The email is already in use');
                        return;
                    }
                }
            }
        }
    });

    const disabledButton =
        isLoading ||
        emailError ||
        passwordError ||
        passwordMatchError !== '' ||
        usernameError;

    return (
        <Layout isPublic>
            <PublicFormLayout onSubmit={() => onRegister()} title={'Sign up'}>
                <TextInput
                    label="Username"
                    variant="filled"
                    value={username}
                    onBlur={() => setDirtyUsername()}
                    onChange={(e) => setUsername(e.target.value)}
                    leftSection={<IconUser size={16} />}
                    withAsterisk
                    error={
                        usernameError && usernameDirty
                            ? usernameMessage
                            : undefined
                    }
                />
                <TextInput
                    label="Email"
                    variant="filled"
                    value={email}
                    onBlur={() => setDirtyEmail()}
                    onChange={(e) => setEmail(e.target.value)}
                    leftSection={<IconAt size={16} />}
                    withAsterisk
                    error={emailError && emailDirty ? emailMessage : undefined}
                />
                <TextInput
                    label="Password"
                    type={passwordVisible ? 'text' : 'password'}
                    rightSection={
                        passwordVisible ? (
                            <IconEyeOff
                                size={16}
                                onClick={() =>
                                    setPasswordVisible(!passwordVisible)
                                }
                            />
                        ) : (
                            <IconEye
                                size={16}
                                onClick={() =>
                                    setPasswordVisible(!passwordVisible)
                                }
                            />
                        )
                    }
                    variant="filled"
                    value={password}
                    onBlur={() => setDirtyPassword()}
                    onChange={(e) => setPassword(e.target.value)}
                    leftSection={<IconLock size={16} />}
                    withAsterisk
                    error={
                        passwordError && passwordDirty
                            ? passwordMessage
                            : undefined
                    }
                />

                <TextInput
                    label="Repeat password"
                    type={repeatPasswordVisible ? 'text' : 'password'}
                    rightSection={
                        repeatPasswordVisible ? (
                            <IconEyeOff
                                size={16}
                                onClick={() =>
                                    setRepeatPasswordVisible(
                                        !repeatPasswordVisible
                                    )
                                }
                            />
                        ) : (
                            <IconEye
                                size={16}
                                onClick={() =>
                                    setRepeatPasswordVisible(
                                        !repeatPasswordVisible
                                    )
                                }
                            />
                        )
                    }
                    variant="filled"
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    leftSection={<IconLock size={16} />}
                    withAsterisk
                    error={
                        passwordMatchError && passwordMatchDirty
                            ? passwordMatchError
                            : undefined
                    }
                />
                <Button
                    mt={isTablet ? '0.75rem' : 'auto'}
                    w={'100%'}
                    disabled={disabledButton}
                    loading={isLoading}
                    type="submit"
                >
                    {'Sign up'}
                </Button>
            </PublicFormLayout>
        </Layout>
    );
}
