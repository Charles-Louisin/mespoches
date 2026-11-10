/** Lien direct de l’APK Android : redirige toujours vers la dernière release GitHub. Surcharge : NEXT_PUBLIC_APK_URL */
export const APK_URL =
  process.env.NEXT_PUBLIC_APK_URL?.trim() ||
  'https://github.com/Charles-Louisin/mespoches/releases/latest/download/MES.POCHES.apk'
