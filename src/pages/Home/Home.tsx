import styles from './Home.module.css';

export const Home = () => {
  return (
    <section className={styles.wrapper}>
      <h1>Explora Chrome APIs</h1>
      <p>
        Proyecto inicial en React + TypeScript con una paleta de colores vívida y estilos modulares.
      </p>
      <div className={styles.grid}> 
        <div className={styles.card}>
          <h2>Rutas</h2>
          <p>React Router 6 listo para ampliar con más secciones.</p>
        </div>
        <div className={styles.card}>
          <h2>Estilos</h2>
          <p>CSS modular + variables de tema para consistencia.</p>
        </div>
        <div className={styles.card}>
          <h2>Tipado</h2>
          <p>TypeScript estricto para mayor confiabilidad.</p>
        </div>
      </div>
    </section>
  );
};
