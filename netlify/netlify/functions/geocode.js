// netlify/functions/geocode.js
import fetch from 'node-fetch';

export const handler = async (event) => {
  try {
    const address = (event.queryStringParameters.address || '').trim();
    if (!address) return json({ ok:false, error:'Missing address' }, 400);

    const url = 'https://geocoding.geo.census.gov/geocoder/locations/onelineaddress'
              + `?address=${encodeURIComponent(address)}`
              + '&benchmark=Public_AR_Current&format=json';

    const r = await fetch(url);
    const data = await r.json();
    const match = data?.result?.addressMatches?.[0];
    if(!match) return json({ ok:false, error:'No match for that address' }, 404);

    const coords = match.coordinates || {};
    // Pull basic geography details if available
    const comps = match.addressComponents || {};
    const zip = comps.zip || '';
    const state = comps.state || '';
    const county = (data?.result?.addressMatches?.[0]?.geographies?.Counties?.[0]?.NAME) || '';
    const place = (data?.result?.addressMatches?.[0]?.geographies?.Places?.[0]?.NAME) || '';

    return json({
      ok:true,
      lat: coords.y,
      lon: coords.x,
      zip, state, county, place,
      normalized: match.matchedAddress
    });
  } catch (e) {
    return json({ ok:false, error: e.message }, 500);
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

