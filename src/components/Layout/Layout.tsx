import { Outlet } from 'react-router-dom';
import { Navbar } from '../Navbar/Navbar';
import styles from './Layout.module.css';

export const Layout = () => {
  return (
    <div className={styles.container}>
      <Navbar />
      <main className={styles.main}>
        <Outlet />
      </main>
      <footer className={styles.footer}>Hecho con React + Vite</footer>
    </div>
  );
};
