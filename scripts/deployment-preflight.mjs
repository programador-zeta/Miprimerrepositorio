// Checks hosted runtime connectivity without administrator tokens or credential logging.
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;
if (!url || !key) {
 console.error('Configura SUPABASE_URL y SUPABASE_ANON_KEY del proyecto remoto. No se necesitan tokens de Vercel ni de Render.');
 process.exit(1);
}
try {
 const target = new URL(url);
 if(target.protocol !== 'https:' || ['localhost','127.0.0.1','0.0.0.0'].includes(target.hostname)) throw new Error('El despliegue necesita un proyecto Supabase remoto con HTTPS.');
 target.pathname = '/rest/v1/profiles';
 target.search = '?select=id&limit=0';
 const response = await fetch(target, {headers:{apikey:key,Authorization:`Bearer ${key}`},signal:AbortSignal.timeout(20000),redirect:'error'});
 if(!response.ok) throw new Error(`Supabase devolvió HTTP ${response.status}. Revisa las variables y las migraciones.`);
 const rows=await response.json();
 if(!Array.isArray(rows))throw new Error('Respuesta inesperada de Supabase.');
 console.log('Supabase remoto: conexión y lectura pública verificadas. No se han creado ni modificado datos.');
} catch(error) {
 console.error(error instanceof Error ? error.message : 'No se pudo comprobar Supabase.');
 process.exitCode=1;
}
