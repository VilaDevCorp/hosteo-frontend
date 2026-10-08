import Body from './Body';
import { ApiProvider } from './providers/ApiProvider';
import { AuthProvider } from './providers/AuthProvider';
import { ScreenProvider } from './providers/ScreenProvider';
import { StrictMode } from 'react';
import { ReactQueryProvider } from './providers/ReactQueryProvider';
import { LibraryProvider } from './providers/LibraryProvider';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import { ModalsProvider } from '@mantine/modals';
import { BrowserRouter } from 'react-router-dom';
import { ConfirmModalProvider } from './providers/ConfirmModalProvider';
import { AssignmentSchedulerProvider } from './providers/AssignmentSchedulerProvider';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import dayjs from 'dayjs';
import 'dayjs/locale/en-gb';

dayjs.extend(customParseFormat);
dayjs.locale('en-gb');

function App() {
    return (
        <StrictMode>
            <ScreenProvider>
                <ReactQueryProvider>
                    <LibraryProvider>
                        <ConfirmModalProvider>
                            <ModalsProvider
                                labels={{
                                    cancel: 'Cancel',
                                    confirm: 'Confirm'
                                }}
                            >
                                <BrowserRouter>
                                    <AuthProvider>
                                        <ApiProvider>
                                            <AssignmentSchedulerProvider>
                                                <Body />
                                            </AssignmentSchedulerProvider>
                                        </ApiProvider>
                                    </AuthProvider>
                                </BrowserRouter>
                            </ModalsProvider>
                        </ConfirmModalProvider>
                    </LibraryProvider>
                </ReactQueryProvider>
            </ScreenProvider>
        </StrictMode>
    );
}

export default App;
