import './Navigation.scss';
import navicon from '../../assets/navicon.svg';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

function Navigation() {
    const navigate = useNavigate();
    const [showMenu, setShowMenu] = useState(false);

    return (
        <nav className={ `navigation ${ showMenu ? 'show-menu' : '' }` }>
            {/* data-testid needed for testing navigation menu toggle functionality */}
            <img src={ navicon } className='navigation__icon'
            onClick={ () => { setShowMenu(!showMenu) }} data-testid="nav-icon" />
            {/* data-testid needed for testing navigation between views */}
            <a href="#" className={ `navigation__link ${ showMenu ? '' : 'hide' }` } 
            onClick={ () => { navigate('/') }} data-testid="nav-booking">Booking</a>
            <a href="#" className={ `navigation__link ${ showMenu ? '' : 'hide' }` } 
            onClick={ () => { navigate('/confirmation') }} data-testid="nav-confirmation">Confirmation</a>
        </nav>
    )
}

export default Navigation;