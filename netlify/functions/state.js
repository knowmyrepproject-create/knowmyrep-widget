// netlify/functions/state.js
import fetch from 'node-fetch';

export const handler = async (event) => {
  try {
    const lat = event.queryStringParameters.lat;
    const lon = event.queryStringParameters.lon;
    if(!lat || !lon) return json({ ok:false, error:'Missing lat/lon' }, 400);

    const KEY = process.env.OPENSTATES_API_KEY;
    if(!KEY) return json({ ok:false, error:'Server missing OPENSTATES_API_KEY' }, 500);

    const url = `https://v3.openstates.org/people.geo?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lon)}`;
    const r = await fetch(url, { headers: { 'X-API-KEY': KEY } });
    const data = await r.json();

    const people = (data?.results || []).map(p => {

      // THIS IS THE SNIPPET
      let office = p.current_role?.title?.trim()
        || p.current_role?.jurisdiction?.name
        || 'Elected Official';

      const districtName = p.current_role?.district?.trim() || '';

      return {
        name: p.name,
        office,                              // e.g., "State Senator"
        party: (p.parties && p.parties[0]?.name) || p.party || '',
        district_name: districtName,         // e.g., "District 12" or "Ward 3"
        email: (p.contact_details || []).find(c => c.type==='email')?.value || p.email || '',
        phone: (p.contact_details || []).find(c => c.type==='voice')?.value || p.phone || '',
        website: (p.links && p.links[0]?.url) || '',
        photo_url: p.image || '',
        sources: (p.sources||[]).map(s=>s.url)
      };
    });

    return json({ ok:true, people });
  } catch (e) {
    return json({ ok:false, error:e.message }, 500);
  }
};

function json(body, status=200){
  return {
    statusCode: status,
    headers: {
      'Content-Type':'application/json',
      'Access-Control-Allow-Origin':'*'
    },
    body: JSON.stringify(body)
  };
}
