// netlify/functions/local-md.js
import fetch from 'node-fetch';

export const handler = async (event) => {
  try {
    const county = (event.queryStringParameters.county || '').trim();
    const place  = (event.queryStringParameters.place || '').trim();

    if (!county) return json({ ok:false, error:'Missing county' }, 400);

    // Basic normalization (e.g., "Queen Anne's County" → "Queen Anne's")
    const countyName = county.replace(/ County$/i, '').trim();

    // Authoritative statewide directories (stable official sites)
    const LINKS = {
      registersOfWills: 'https://registers.maryland.gov/main/',            // County list → each Register page
      orphansCourt:     'https://www.mdcourts.gov/judgesprofiles#orphans', // Orphans’ Court judges & contacts
      mdManualLocal:    'https://msa.maryland.gov/msa/mdmanual/36loc/html/loc.html', // County & municipal directory
      mdsaa:            'https://mdsaa.org/state-s-attorneys',             // State’s Attorneys by county
      mdSheriffs:       'https://www.mdsheriffs.org/sheriffs'              // Sheriffs by county (association directory)
    };

    // We’ll return direct directory links; on each page you can click your county name.
    // Later we can upgrade this to parse the individual officeholder names into cards.

    const county_links = [
      {
        title: `Register of Wills — ${countyName} County`,
        url: LINKS.registersOfWills,
        note: 'Open the directory and click your county.'
      },
      {
        title: `Orphans’ Court — ${countyName} County`,
        url: LINKS.orphansCourt,
        note: 'Scroll to your county’s listing.'
      },
      {
        title: `State’s Attorney — ${countyName} County`,
        url: LINKS.mdsaa,
        note: 'Find your county to get the official contact page.'
      },
      {
        title: `Sheriff — ${countyName} County`,
        url: LINKS.mdSheriffs,
        note: 'Find your county to get the Sheriff’s office.'
      },
      {
        title: `${countyName} County (Maryland Manual)`,
        url: LINKS.mdManualLocal,
        note: 'County & municipal officials (Mayor/Burgess, Council/Commissioners).'
      }
    ];

    // Municipality link (Maryland Manual has a single index page; users select their town)
    const municipal = place
      ? {
          title: `Municipal Officials — ${place}`,
          url: LINKS.mdManualLocal,
          note: 'Open the Municipalities list and click your town.'
        }
      : null;

    return json({ ok:true, county_links, municipal });

  } catch (e) {
    return json({ ok:false, error:e.message }, 500);
  }
};
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

    const people = (data?.results || []).map(item => {
      const p = item; // OpenStates result
      // Normalize for our cards
      const office = p.current_role?.title || p.current_role?.jurisdiction?.name || 'Legislator';
      const districtName = p.current_role?.district || '';
      const party = (p.parties && p.parties[0]?.name) || p.party || '';
      const email = (p.contact_details || []).find(c => c.type==='email')?.value || p.email || '';
      const phone = (p.contact_details || []).find(c => c.type==='voice')?.value || p.phone || '';
      const website = (p.links && p.links[0]?.url) || '';
      return {
        name: p.name,
        office,
        party,
        district_name: districtName,
        email, phone, website,
        photo_url: p.image || '',
        sources: (p.sources||[]).map(s=>s.url)
      };
    });
// Prefer the specific role title, then add district if present
let office = p.current_role?.title?.trim() 
  || p.current_role?.jurisdiction?.name 
  || 'Elected Official';
const districtName = p.current_role?.district?.trim() || '';
if (districtName) {
  office = `${office} – ${districtName}`;
}
const party = (p.parties && p.parties[0]?.name) || p.party || '';

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
