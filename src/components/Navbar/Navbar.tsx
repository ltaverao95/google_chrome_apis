import { NavLink } from 'react-router-dom';
import styles from './Navbar.module.css';

export const Navbar = () => {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>Chrome APIs</div>
      <nav className={styles.nav} aria-label="Principal">
        <NavLink to="/" end className={({ isActive }) => isActive ? styles.active : undefined}>Home</NavLink>
      </nav>
    </header>
  );
};
