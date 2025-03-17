import { useState } from 'react';
import classes from './navbar.module.scss';
import { Link } from 'react-router';

import { EditProfileModal } from '../EditProfileModal';
import { NavbarUserDropdown } from '../NavbarUserDropdown';

export const Navbar = () => {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const showModal = () => setIsModalOpen(true);
    const handleCancel = () => setIsModalOpen(false);

    return (
        <nav className={classes.navbar}>
            <Link to={'/'} className={classes.brand}>
                <span className={classes.icon}>🍴</span>
                <h1 className={classes.title}>Sport Scanner</h1>
            </Link>

            <div className={classes.right}>
                <NavbarUserDropdown showModal={showModal} />
                <EditProfileModal isOpen={isModalOpen} handleCancel={handleCancel} />
            </div>
        </nav>
    );
};
