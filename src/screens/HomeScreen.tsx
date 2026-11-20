import { useAuth } from '../hooks/useAuth';

export function HomeScreen() {
    const { user, logout } = useAuth();
    return (
        <>
            <p>{user?.id}</p>
            <h1>{`HELLO, ${user?.username}`}</h1>
            <button onClick={() => logout()}>{"LOGOUT"}</button>
        </>
    );
}
