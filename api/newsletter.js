/* Safe server-side mailing-list connector. No credentials shipped to browsers.
   Configure RESEND_API_KEY and RESEND_AUDIENCE_ID in Vercel. */
const json=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export async function POST(request){
  const origin=request.headers.get('origin');
  if(origin){
    try{if(new URL(origin).host !== new URL(request.url).host)return json({error:'Invalid request origin.'},403)}
    catch{return json({error:'Invalid origin.'},403)}
  }
  if(!request.headers.get('content-type')?.toLowerCase().includes('application/json'))return json({error:'JSON body required.'},415);
  if(Number(request.headers.get('content-length')||0)>2048)return json({error:'Request too large.'},413);
  let payload;try{const text=await request.text();if(text.length>2048)return json({error:'Request too large.'},413);payload=JSON.parse(text)}catch{return json({error:'Invalid JSON.'},400)}
  const email=String(payload?.email||'').trim().toLowerCase();
  if(payload?.website)return json({ok:true}); // Honeypot for simple bots
  if(payload?.consent!==true)return json({error:'Consent is required.'},400);
  if(!/^[^\s@<>]+@[^\s@<>]+\.[a-z]{2,}$/i.test(email)||email.length>254)return json({error:'Enter a valid email.'},400);
  if(!process.env.RESEND_API_KEY||!process.env.RESEND_AUDIENCE_ID)return json({error:'Newsletter registration is not configured yet.'},503);
  try{
    const response=await fetch('https://api.resend.com/contacts',{method:'POST',headers:{'Authorization':'Bearer '+process.env.RESEND_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({email,audience_id:process.env.RESEND_AUDIENCE_ID,unsubscribed:false}),signal:AbortSignal.timeout(6000)});
    if(response.ok)return json({ok:true},201);
    if(response.status===409)return json({ok:true});
    if(response.status===429)return json({error:'Too many requests. Try again later.'},429);
    return json({error:'The mailing list provider did not accept the request.'},502);
  }catch{return json({error:'Subscription service temporarily unavailable.'},502)}
}
export function GET(){return json({error:'Method not allowed.'},405)}
