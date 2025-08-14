// netlify/functions/local-md.js
import fetch from 'node-fetch';

export const handler = async (event) => {
  try {
    const county = (event.queryStringParameters.county || '').trim(); // e.g., "Montgomery County"
    const place  = (event.queryStringParameters.place || '').trim();  // e.g., "Rockville"

    if (!county) return json({ ok:false, error:'Missing county' }, 400);

    const countyName = county.replace(/ County$/i, '').trim(); // "Montgomery"
    const placeName  = place || '';

    // Authoritative statewide directories (stable landing pages)
    const LINKS = {
      mdManualLocal:    'https://msa.maryland.gov/msa/mdmanual/36loc/html/loc.html', // County & municipal directory (includes school boards)
      registersOfWills: 'https://registers.maryland.gov/main/',
      orphansCourt:     'https://www.mdcourts.gov/judgesprofiles#orphans',
      mdSheriffs:       'https://www.mdsheriffs.org/sheriffs',
      mdsaa:            'https://mdsaa.org/state-s-attorneys',
      clerksCircuit:    'https://www.mdcourts.gov/circuit/courtclerks' // Clerks of Circuit Court directory
      // For school boards we’ll use mdManualLocal for now; later we can point to the exact county board URL.
    };

    // --- PEOPLE CARDS (titles now include district names) ---
    const people = [];

    // Municipal leadership
    if (placeName) {
      people.push({
        name: '',
        office: `Mayor/Burgess – ${placeName}`,
        district_name: placeName,
        party: '',
        email: '',
        phone: '',
        website: LINKS.mdManualLocal,
        photo_url: '',
        sources: [LINKS.mdManualLocal]
      });
      people.push({
        name: '',
        office: `Council/Commissioners – ${placeName}`,
        district_name: placeName,
        party: '',
        email: '',
        phone: '',
        website: LINKS.mdManualLocal,
        photo_url: '',
        sources: [LINKS.mdManualLocal]
      });
    }

    // County-wide elected offices (with clear titles)
    people.push({
      name: '',
      office: `Sheriff – ${countyName} County`,
      district_name: `${countyName} County`,
      party: '',
      email: '',
      phone: '',
      website: LINKS.mdSheriffs,
      photo_url: '',
      sources: [LINKS.mdSheriffs]
    });

    people.push({
      name: '',
      office: `State’s Attorney – ${countyName} County`,
      district_name: `${countyName} County`,
      party: '',
      email: '',
      phone: '',
      website: LINKS.mdsaa,
      photo_url: '',
      sources: [LINKS.mdsaa]
    });

    people.push({
      name: '',
      office: `Clerk of the Circuit Court (County Clerk) – ${countyName} County`,
      district_name: `${countyName} County`,
      party: '',
      email: '',
      phone: '',
      website: LINKS.clerksCircuit,
      photo_url: '',
      sources: [LINKS.clerksCircuit]
    });

    people.push({
      name: '',
      office: `Register of Wills – ${countyName} County`,
      district_name: `${countyName} County`,
      party: '',
      email: '',
      phone: '',
      website: LINKS.registersOfWills,
      photo_url: '',
      sources: [LINKS.registersOfWills]
    });

    people.push({
      name: '',
      office: `Orphans’ Court Judge(s) – ${countyName} County`,
      district_name: `${countyName} County`,
      party: '',
      email: '',
      phone: '',
      website: LINKS.orphansCourt,
      photo_url: '',
      sources: [LINKS.orphansCourt]
    });

    // School board (Board of Education)
    people.push({
      name: '',
      office: `Board of Education – ${countyName} County`,
      district_name: `${countyName} County`,
      party: '',
      email: '',
      phone: '',
      website: LINKS.mdManualLocal, // later: swap to exact county board URL
      photo_url: '',
      sources: [LINKS.mdManualLocal]
    });

    // --- OFFICIAL LINK CARDS (fallbacks/shortcuts) ---
    const county_links = [
      { title: `${countyName} County – Maryland Manual (county & municipal)`, url: LINKS.mdManualLocal, note: 'Official directory of county/municipal officials (incl. school boards)' },
      { title: `Sheriff — ${countyName} County`, url: LINKS.mdSheriffs, note: 'Official Sheriffs directory' },
      { title: `State’s Attorney — ${countyName} County`, url: LINKS.mdsaa, note: 'Official State’s Attorneys directory' },
      { title: `Clerk of the Circuit Court — ${countyName} County`, url: LINKS.clerksCircuit, note: 'Official Clerks of Circuit Court directory' },
      { title: `Register of Wills — ${countyName} County`, url: LINKS.registersOfWills, note: 'Official Register of Wills site' },
      { title: `Orphans’ Court — ${countyName} County`, url: LINKS.orphansCourt, note: 'Judiciary Judges Profiles' }
    ];

    const municipal = placeName
      ? { title: `Municipal Officials — ${placeName}`, url: LINKS.mdManualLocal, note: 'Find your town in the municipal list' }
      : null;

    return json({ ok:true, people, county_links, municipal });
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
