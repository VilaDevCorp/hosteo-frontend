import { ReactNode, useMemo } from 'react';
import {
    Accordion,
    Badge,
    Button,
    Card,
    Checkbox,
    createTheme,
    Drawer,
    Fieldset,
    Input,
    MantineProvider,
    Modal,
    MultiSelect,
    Pagination,
    Radio,
    Switch,
    Table,
    TextInput
} from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { useScreen } from '../hooks/useScreen';
import { Select } from '@mantine/core';

export const LibraryProvider = ({ children }: { children: ReactNode }) => {
    const { isTablet } = useScreen();

    const theme = useMemo(() => {
        const defaultSize = isTablet ? 'sm' : 'md';
        return createTheme({
            colors: {
                background: [
                    'hsla(0, 0%, 99%, 1.00)',
                    'hsla(0, 0%, 98%, 1.00)',
                    'hsla(0, 0%, 96%, 1.00)',
                    '#f5f5f5',
                    '#f5f5f5',
                    '#f5f5f5',
                    '#f5f5f5',
                    '#f5f5f5',
                    '#f5f5f5',
                    '#f5f5f5'
                ],
                primary: [
                    '#e1eaff',
                    '#b9d2fe',
                    '#5385F9',
                    '#97bafc',
                    '#5385F9',
                    '#5385F9',
                    '#5385F9',
                    '#5385F9',
                    '#5385F9',
                    '#5385F9'
                ],
                success: [
                    '#12B886',
                    '#12B886',
                    '#12B886',
                    '#12B886',
                    '#12B886',
                    '#12B886',
                    '#12B886',
                    '#12B886',
                    '#12B886',
                    '#12B886'
                ],
                error: [
                    '#FA5252',
                    '#FA5252',
                    '#FA5252',
                    '#FA5252',
                    '#FA5252',
                    '#FA5252',
                    '#FA5252',
                    '#FA5252',
                    '#FA5252',
                    '#FA5252'
                ],
                warning: [
                    '#FAB005',
                    '#FAB005',
                    '#FAB005',
                    '#FAB005',
                    '#FAB005',
                    '#FAB005',
                    '#FAB005',
                    '#FAB005',
                    '#FAB005',
                    '#FAB005',
                    '#FAB005',
                    '#FAB005',
                    '#FAB005'
                ],
                remark: [
                    '#6324CF',
                    '#6324CF',
                    '#6324CF',
                    '#6324CF',
                    '#6324CF',
                    '#6324CF',
                    '#6324CF',
                    '#6324CF',
                    '#6324CF',
                    '#6324CF'
                ]
            },
            primaryColor: 'primary',
            fontFamily: 'Inter, sans-serif',
            components: {
                Button: Button.extend({
                    defaultProps: {
                        size: defaultSize
                    }
                }),
                Select: Select.extend({
                    styles: {
                        root: {
                            width: '100%'
                        }
                    },
                    defaultProps: {
                        size: defaultSize
                    }
                }),
                MultiSelect: MultiSelect.extend({
                    styles: {
                        root: {
                            width: '100%'
                        }
                    },
                    defaultProps: {
                        size: defaultSize
                    }
                }),
                Pagination: Pagination.extend({
                    defaultProps: {
                        size: isTablet ? 'sm' : 'lg'
                    }
                }),
                Input: Input.extend({
                    styles: (_theme, props) => ({
                        input: {
                            '--input-bg':
                                props.variant === 'outlined'
                                    ? 'var(--mantine-color-background-0)'
                                    : 'var(--mantine-color-gray-2)',
                            '--input-bd':
                                props.variant === 'outlined'
                                    ? 'var(--mantine-color-gray-3)'
                                    : 'var(--mantine-color-gray-2)'
                        }
                    })
                }),
                TextInput: TextInput.extend({
                    defaultProps: {
                        size: defaultSize,
                        radius: 'md' // You can also default the rounded corners while you're at it!
                    },
                    styles: {
                        root: {
                            width: '100%'
                        },
                        wrapper: {
                            minHeight: '1rem',
                            marginBottom: '0.4rem'
                        },
                        error: {
                            position: 'absolute'
                        }
                    }
                }),
                Fieldset: Fieldset.extend({
                    defaultProps: {
                        variant: 'unstyled'
                    },
                    styles: {
                        legend: {
                            fontSize: 'var(--mantine-font-size-md)'
                        }
                    }
                }),
                Checkbox: Checkbox.extend({
                    defaultProps: {
                        size: defaultSize
                    }
                }),
                Radio: Radio.extend({
                    styles: {
                        body: {
                            alignItems: 'center'
                        },
                        label: {
                            paddingLeft: '0.3rem'
                        }
                    },
                    defaultProps: {
                        size: defaultSize
                    }
                }),
                Badge: Badge.extend({
                    defaultProps: {
                        size: defaultSize
                    },
                    styles: {
                        label: {
                            overflow: 'visible'
                        }
                    }
                }),
                Switch: Switch.extend({
                    defaultProps: {
                        w: 'fit-content',
                        size: isTablet ? 'sm' : 'lg'
                    }
                }),
                Modal: Modal.extend({
                    defaultProps: {
                        fullScreen: isTablet ? false : true
                    },

                    styles: {
                        content: {
                            display: 'flex',
                            flexDirection: 'column',
                            backgroundColor: 'var(--mantine-color-background-1)'
                        },
                        body: {
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                            overflow: 'auto'
                        },
                        header: {
                            backgroundColor: 'transparent',
                            gap: '0.5rem'
                        }
                    }
                }),
                Table: Table.extend({}),
                Drawer: Drawer.extend({
                    styles: {
                        content: {
                            scrollbarGutter: 'stable',
                            display: 'flex',
                            flexDirection: 'column',
                            backgroundColor: 'var(--mantine-color-background-1)'
                        },
                        header: {
                            backgroundColor: 'var(--mantine-color-background-1)'
                        }
                    }
                }),
                Accordion: Accordion.extend({
                    styles: {
                        control: {
                            borderRadius: 'var(--mantine-radius-md)'
                        }
                    }
                }),
                Card: Card.extend({
                    styles: {
                        root: {
                            borderRadius: 'var(--mantine-radius-md)',
                            boxShadow: 'var(--mantine-shadow-sm)'
                        }
                    }
                })
            }
        });
    }, [isTablet]);
    return (
        <MantineProvider theme={theme}>
            <Notifications />
            {children}
        </MantineProvider>
    );
};
