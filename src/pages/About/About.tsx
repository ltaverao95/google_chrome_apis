import styles from './About.module.css';

export const About = () => {
  return (
    <section className={styles.wrapper}>
      <h1>Acerca del proyecto</h1>
      <p>
        Esta base te permite comenzar rápido con React, Vite, TypeScript y React Router. Ajusta la paleta en <code>styles/theme.css</code>.
      </p>
      <ul className={styles.list}>
        <li>Vite para desarrollo ultrarrápido</li>
        <li>CSS modular para aislamiento de estilos</li>
        <li>Fuentes modernas: Poppins & Fira Code</li>
        <li>Diseño responsive y accesible</li>
      </ul>
    </section>
  );
};
