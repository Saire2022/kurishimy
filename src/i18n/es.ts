/**
 * Every user-facing UI string, in Spanish. A future Kichwa UI is another file
 * with the same shape (`Strings`), not a rewrite of the screens.
 */
export const es = {
  appName: "Kury Shimy",
  home: {
    /** Not shown on the home screen itself; iOS uses it as the back label. */
    screenTitle: "Inicio",
    tagline: "Aprende Kichwa leyendo y escuchando",
    description:
      "Historias bilingües con audio sincronizado. Sigue el texto en Kichwa y Español mientras escuchas la narración.",
    chaptersTitle: "Capítulos",
    completed: "Completado",
  },
  lesson: {
    chapterLabel: (chapterNumber: number | string) =>
      `Capítulo ${chapterNumber}`,
    chapterNotFound: (chapterId: string) =>
      `No se encontró el capítulo "${chapterId}".`,
    loadingAudio: "Cargando audio...",
    audioError: "No se pudo preparar el audio.",
    resumedFrom: (time: string) => `Continuando desde ${time}`,
    startOver: "Empezar de nuevo",
  },
  viewModes: {
    kichwa: "Kichwa",
    spanish: "Español",
    dual: "Dual",
  },
  notFound: {
    screenTitle: "Página no encontrada",
    message: "Esta pantalla no existe.",
    goHome: "Ir al inicio",
  },
};

export type Strings = typeof es;
