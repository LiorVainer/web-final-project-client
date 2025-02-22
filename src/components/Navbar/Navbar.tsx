import classes from './navbar.module.scss';
import { Link } from 'react-router';

export interface NavbarProps {}

export const Navbar = () => {
    return (
        <nav className={classes.navbar}>
            {/* Left Section: Brand */}
            <Link to={'/'} className={classes.brand}>
                <span className={classes.icon}>🍴</span>
                <h1 className={classes.title}>Sport Scanner</h1>
            </Link>

            <div className={classes.right}>
                {/*<div className={classes.navLinks}>*/}
                {/*    <Link to="/groups">Groups</Link>*/}
                {/*    <Link to="/history">History</Link>*/}
                {/*    <Link to="/saved">Saved</Link>*/}
                {/*    <Link to="/settings">Settings</Link>*/}
                {/*</div>*/}

                <Link to={'/'} className={classes.userProfile}>
                    <img src="https://picsum.photos/40/40" alt="User Avatar" className={classes.avatar} />
                </Link>
            </div>
        </nav>
    );
};
