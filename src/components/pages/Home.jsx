import Cookies from 'js-cookie'
import { Navigate } from 'react-router-dom'
import Header from '../Header'
import Footer from '../Footer'



export default function Home( { handleLogout, currentUser } ) {

    if (!currentUser) {
        return <Navigate to='/register' />
    }
    // let csrftoken = Cookies.get('csrftoken')
    // console.log(csrftoken)
    return (
        <div className='app'>
            <Header currentUser={currentUser} handleLogout={handleLogout} />
        <div className='home'>
            <h1></h1>
        </div>
            <Footer />
        </div>
    );
}