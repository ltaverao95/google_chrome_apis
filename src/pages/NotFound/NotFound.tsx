import styles from './NotFound.module.css';
import { NavLink } from 'react-router-dom';

export const NotFound = () => {
  return (
    <section className={styles.wrapper}>
      <h1>404</h1>
      <p>Página no encontrada.</p>
      <NavLink to="/" className={styles.back}>Volver al inicio</NavLink>
    </section>
  );
};
