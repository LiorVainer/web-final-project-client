import classes from './navbar.module.scss';
import { Link } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFutbol } from '@fortawesome/free-solid-svg-icons';

export interface NavbarProps {}

export const Navbar = () => {
    return (
        <nav className={classes.navbar}>
            <Link to={'/'} className={classes.brand}>
                <FontAwesomeIcon icon={faFutbol} />
                <h1 className={classes.title}>Sport Scanner</h1>
            </Link>

            <div className={classes.right}>
                <div className={classes.navLinks}>
                    <Link to="/my-experiences">My Experiences</Link>
                </div> 

                <Link to={'/'} className={classes.userProfile}>
                    <img src="https://picsum.photos/40/40" alt="User Avatar" className={classes.avatar} />
                </Link>
            </div>
        </nav>
    );
};
