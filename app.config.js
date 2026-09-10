import 'dotenv/config';



const appJson = require('./app.json');



const productionUrl = 'https://nsdurlikkuoxqobabixr.supabase.co';

const productionAnonKey = 'sb_publishable_GZfJfr6RdAgbu9W9fy1O1Q_8DAgtf0k';



const LOCAL_HOST_PATTERN = /localhost|127\.0\.0\.1|10\.0\.2\.2|192\.168\./i;

const SERVICE_ROLE_PATTERN = /service_role|sb_secret_/i;



function sanitizeBuildConfig(rawUrl, rawKey) {

  const url = (rawUrl || '').trim();

  const anonKey = (rawKey || '').trim();

  const warnings = [];



  const urlOk =

    url.startsWith('https://') && !LOCAL_HOST_PATTERN.test(url) && url.includes('.supabase.co');

  const keyOk = anonKey.length > 0 && !SERVICE_ROLE_PATTERN.test(anonKey);



  if (urlOk && keyOk) {

    return { url, anonKey, warnings };

  }



  if (url && !urlOk) {

    warnings.push(`EXPO_PUBLIC_SUPABASE_URL ignorada en build (${url}). Usando producción embebida.`);

  }

  if (anonKey && !keyOk) {

    warnings.push('EXPO_PUBLIC_SUPABASE_ANON_KEY inválida en build. Usando producción embebida.');

  }



  return { url: productionUrl, anonKey: productionAnonKey, warnings };

}



const sanitized = sanitizeBuildConfig(

  process.env.EXPO_PUBLIC_SUPABASE_URL,

  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,

);



for (const warning of sanitized.warnings) {

  console.warn(`[app.config.js] ${warning}`);

}



/** @type {import('@expo/config').ExpoConfig} */

module.exports = ({ config }) => ({

  ...appJson.expo,

  ...config,

  extra: {

    ...appJson.expo.extra,

    ...config?.extra,

    supabaseUrl: sanitized.url,

    supabaseAnonKey: sanitized.anonKey,

  },

});

