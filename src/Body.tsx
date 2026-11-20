import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { LoginScreen } from './screens/LoginScreen';
import { Suspense, lazy } from 'react';
import { LoadingScreen } from './screens/LoadingScreen';
import { Layout } from './components/organism/layout/Layout';

const LazyApartmentsScreen = lazy(() =>
    import('./screens/ApartmentsScreen').then((module) => ({
        default: module.ApartmentsScreen
    }))
);

const LazyWorkersScreen = lazy(() =>
    import('./screens/WorkersScreen').then((module) => ({
        default: module.WorkersScreen
    }))
);

const LazyEventsScreen = lazy(() =>
    import('./screens/EventsScreen').then((module) => ({
        default: module.EventsScreen
    }))
);

const LazySchedulerScreen = lazy(() =>
    import('./screens/SchedulerScreen').then((module) => ({
        default: module.SchedulerScreen
    }))
);

const LazyFinancesScreen = lazy(() =>
    import('./screens/FinancesScreen').then((module) => ({
        default: module.FinancesScreen
    }))
);

function Body() {
    const authInfo = useAuth();
    const { pathname } = useLocation();

    // The scheduler needs a wider content area than the rest of the screens
    const privateLayoutStyles =
        pathname === '/' ? { maxWidth: '90rem' } : undefined;

    return authInfo.isLoadingUserInfo === false ? (
        <div
            style={{
                width: '100vw',
                height: '100%',
                position: 'relative',
                display: 'flex',
                overflow: 'hidden'
            }}
        >
            {authInfo.user === null ? (
                <Layout isPublic>
                    <Suspense fallback={<LoadingScreen showLogo />}>
                        <LoginScreen />
                    </Suspense>
                </Layout>
            ) : (
                <Layout customStyles={privateLayoutStyles}>
                    <Suspense fallback={<LoadingScreen />}>
                        <Routes>
                            <Route
                                path="/login"
                                element={<Navigate to="/" replace />}
                            />
                            <Route path="/" element={<LazySchedulerScreen />} />
                            <Route
                                path="/apartments"
                                element={
                                    <Suspense fallback={<LoadingScreen />}>
                                        <LazyApartmentsScreen />
                                    </Suspense>
                                }
                            />
                            <Route
                                path="/workers"
                                element={
                                    <Suspense fallback={<LoadingScreen />}>
                                        <LazyWorkersScreen />
                                    </Suspense>
                                }
                            />
                            <Route
                                path="/events"
                                element={
                                    <Suspense fallback={<LoadingScreen />}>
                                        <LazyEventsScreen />
                                    </Suspense>
                                }
                            />
                            <Route
                                path="/finances"
                                element={
                                    <Suspense fallback={<LoadingScreen />}>
                                        <LazyFinancesScreen />
                                    </Suspense>
                                }
                            />
                        </Routes>
                    </Suspense>
                </Layout>
            )}
        </div>
    ) : (
        <Layout isPublic>
            <LoadingScreen />
        </Layout>
    );
}

export default Body;
