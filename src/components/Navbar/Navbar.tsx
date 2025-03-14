import classes from './navbar.module.scss';
import { Link } from 'react-router';
import { getPictureSrcUrl } from '@/utils/picture.utils.ts';
import { useAuth } from '@/context/AuthContext.tsx';

export interface NavbarProps {}

export const Navbar = () => {
    const { loggedInUser } = useAuth();
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

                {loggedInUser && (
                    <Link to={'/'} className={classes.userProfile}>
                        <img
                            src={getPictureSrcUrl(loggedInUser.picture)}
                            alt="User Avatar"
                            className={classes.avatar}
                        />
                    </Link>
                )}
            </div>
        </nav>
    );
};
