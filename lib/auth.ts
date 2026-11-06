const encoder = new TextEncoder();
const COOKIE='ijournal_session';
function toBase64Url(bytes: Uint8Array){let s='';bytes.forEach(b=>s+=String.fromCharCode(b));return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
async function sign(payload:string){const secret=process.env.SESSION_SECRET;if(!secret)throw new Error('SESSION_SECRET is not configured');const key=await crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return toBase64Url(new Uint8Array(await crypto.subtle.sign('HMAC',key,encoder.encode(payload))));}
export async function createSession(){const exp=Math.floor(Date.now()/1000)+7*24*60*60;const payload=String(exp);return `${payload}.${await sign(payload)}`;}
export async function verifySession(value?:string){if(!value)return false;const [payload,signature]=value.split('.');if(!payload||!signature||!/^\d+$/.test(payload)||Number(payload)<Date.now()/1000)return false;return (await sign(payload))===signature;}
export const sessionCookieName=COOKIE;
export const sessionCookieOptions={httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax' as const,path:'/',maxAge:7*24*60*60};
