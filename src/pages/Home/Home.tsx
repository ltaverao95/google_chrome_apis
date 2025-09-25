import styles from './Home.module.css';
import { NavLink } from 'react-router-dom';

export const Home = () => {
  return (
    <section className={styles.wrapper}>
      <h1>Explora Chrome APIs</h1>
      <p>
        Proyecto inicial en React + TypeScript con una paleta de colores vívida y estilos modulares.
      </p>
      <div className={styles.grid}> 
        <div className={styles.card}>
          <h2>Summarizer API</h2>
          <p>Google Built-in API Summarizer</p>
          <NavLink to="/summarizer" className={styles.goLink}>
            Go <span aria-hidden="true">→</span>
          </NavLink>
        </div>
        <div className={styles.card}>
          <h2>Translator API</h2>
          <p>Google Built-in API Translator and Language Detection</p>
          <NavLink to="/translator" className={styles.goLink}>
            Go <span aria-hidden="true">→</span>
          </NavLink>
        </div>
        <div className={styles.card}>
          <h2>Writer API</h2>
          <p>Google Built-in API Writer</p>
          <NavLink to="/writer" className={styles.goLink}>
            Go <span aria-hidden="true">→</span>
          </NavLink>
        </div>
      </div>
    </section>
  );
};
