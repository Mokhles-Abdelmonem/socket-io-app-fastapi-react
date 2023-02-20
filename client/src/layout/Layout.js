import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { request_refresh } from '../api/refresh';
import Header from '../components/Header';
import { useSelector } from 'react-redux';
import { useHistory } from "react-router-dom";




const Layout = ({ children }) => {
    const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
    const dispatch = useDispatch();
    let history = useHistory();



    useEffect(() => {

        if (dispatch && dispatch !== null && dispatch !== undefined){
            dispatch(request_refresh());
        }
        
    }, [dispatch]);
    
    console.log({isAuthenticated:isAuthenticated})
    if (!isAuthenticated){
        history.push('/login');
    }
    
    return (
        <>
            <Header/>
            {children}
        </>
    );
};


export default Layout;
