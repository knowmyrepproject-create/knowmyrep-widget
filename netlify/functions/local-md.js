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
