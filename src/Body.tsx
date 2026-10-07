import { Routes, Route } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { LoginScreen } from './screens/LoginScreen';
import { Suspense, lazy } from 'react';
import { LoadingScreen } from './screens/LoadingScreen';

const LazyRegisterScreen = lazy(() =>
    import('./screens/RegisterScreen').then((module) => ({
        default: module.RegisterScreen
    }))
);

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

const LazyTemplatesScreen = lazy(() =>
    import('./screens/TemplatesScreen').then((module) => ({
        default: module.TemplatesScreen
    }))
);

const LazySchedulerScreen = lazy(() =>
    import('./screens/SchedulerScreen').then((module) => ({
        default: module.SchedulerScreen
    }))
);

function Body() {
    const authInfo = useAuth();

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
            <Suspense fallback={<LoadingScreen />}>
                <Routes>
                    <Route path="/login" element={<LoginScreen />} />
                    <Route
                        path="/register"
                        element={
                            <Suspense fallback={<LoadingScreen />}>
                                <LazyRegisterScreen />
                            </Suspense>
                        }
                    />
                    <Route
                        path="/"
                        element={
                            <Suspense fallback={<LoadingScreen />}>
                                <LazySchedulerScreen />
                            </Suspense>
                        }
                    />
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
                        path="/templates"
                        element={
                            <Suspense fallback={<LoadingScreen />}>
                                <LazyTemplatesScreen />
                            </Suspense>
                        }
                    />
                </Routes>
            </Suspense>
        </div>
    ) : (
        <LoadingScreen />
    );
}

export default Body;
