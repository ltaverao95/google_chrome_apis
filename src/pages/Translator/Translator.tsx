import { useState } from "react";

export const TranslatorComponent = () => {
  const [input, setInput] = useState(
    "Este es un texto de ejemplo en español que podrás traducir a otros idiomas."
  );
  const [targetLang, setTargetLang] = useState("en");

  const handleTranslate = (e: React.FormEvent) => {
    e.preventDefault();
    alert("¡Hola! (traducción simulada)");
  };

  return (
    <section style={{ maxWidth: 880, margin: "0 auto", padding: "1.5rem" }}>
      <form
        onSubmit={handleTranslate}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        <h1 style={{ margin: 0, fontSize: "1.4rem" }}>Input:</h1>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={8}
          style={{
            width: 800,          // ancho fijo
            maxWidth: 800,
            fontFamily: "inherit",
            fontSize: "0.95rem",
            padding: "0.75rem",
            resize: "vertical",  // evitar deformar horizontalmente
            maxHeight: 320,      // altura máxima
            lineHeight: 1.4,
          }}
        />
        <div
          style={{
            width: 800,
            maxWidth: 800,
            background: "#f6f6f8",
            border: "1px solid #e2e2e6",
            padding: "0.75rem 1rem",
            borderRadius: 6,
            fontSize: "0.9rem",
            whiteSpace: "pre-wrap",
          }}
        >
          {input}
        </div>
        <label
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            fontSize: "0.9rem",
            width: 260,
          }}
        >
          <span style={{ fontWeight: 600 }}>Translate to</span>
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            style={{ padding: "0.5rem", fontSize: "0.9rem" }}
          >
            <option value="es">Español</option>
            <option value="en">Inglés</option>
            <option value="de">Alemán</option>
            <option value="it">Italiano</option>
            <option value="fr">Francés</option>
          </select>
        </label>
        <button
          type="submit"
          style={{
            background: "#2563eb",
            color: "#fff",
            padding: "0.75rem 1.25rem",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: "0.95rem",
            fontWeight: 600,
            width: 160,
          }}
        >
          Translate
        </button>
      </form>
    </section>
  );
};