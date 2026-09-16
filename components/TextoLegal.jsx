// Render compartido de los documentos legales: lo usan las páginas públicas
// (/terminos, /privacidad) y el modal de aceptación, así que el texto vive en un
// solo lugar (lib/legal/terminos.js) y nunca se desincroniza.
export default function TextoLegal({ doc, compacto = false }) {
  return (
    <div className={compacto ? 'space-y-5' : 'space-y-7'}>
      {doc.resumen?.length > 0 && (
        <div className="bg-marca-500/10 border border-marca-500/20 rounded-2xl p-4">
          <div className="text-[11px] uppercase tracking-wider text-marca-300 font-bold">
            En corto
          </div>
          <ul className="mt-2 space-y-1.5">
            {doc.resumen.map((linea, i) => (
              <li key={i} className="text-sm text-zinc-200 leading-snug flex gap-2">
                <span className="text-marca-400 shrink-0">·</span>
                <span>{linea}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {doc.secciones.map((s) => (
        <section key={s.titulo}>
          <h2 className={`font-semibold text-white ${compacto ? 'text-sm' : 'text-base'}`}>
            {s.titulo}
          </h2>
          <div className="mt-2 space-y-2.5">
            {s.parrafos.map((p, i) => (
              <p key={i} className="text-sm text-zinc-300 leading-relaxed">
                {p}
              </p>
            ))}
          </div>
        </section>
      ))}

      <p className="text-xs text-zinc-500 pt-2 border-t border-white/10">
        Versión {doc.version}.
      </p>
    </div>
  )
}
