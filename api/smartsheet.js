const SHEET_IDS = {
  RT:  '5450376825595780',
  CP:  '4660961098393476',
  DMC: '4151536839354244',
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const token = process.env.SMARTSHEET_TOKEN;
  if (!token) return res.status(500).json({ error: 'SMARTSHEET_TOKEN not set' });

  const { sheet } = req.query;
  const sheetId = SHEET_IDS[sheet];
  if (!sheetId) return res.status(400).json({ error: `Unknown sheet "${sheet}"` });

  try {
    const upstream = await fetch(
      `https://api.smartsheet.com/2.0/sheets/${sheetId}?pageSize=10000`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!upstream.ok) {
      const text = await upstream.text();
      return res.status(upstream.status).json({ error: `Smartsheet error ${upstream.status}`, detail: text });
    }
    const data = await upstream.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
