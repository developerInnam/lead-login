import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = 'https://localhost:5000'; // <--- Make sure this matches your backend URL

function Insights({ accessToken, pageId }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeads = async () => {
      if (!pageId || !accessToken) {
        setLeads([]);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await axios.post(`${BACKEND_URL}/api/get-leads`, {
          pageId: pageId,
          userAccessToken: accessToken, // Pass userAccessToken, backend will find page token
        });
        setLeads(response.data.leads);
      } catch (err) {
        console.error('Error fetching leads from backend:', err.response?.data || err.message);
        setError('Failed to load leads. Please ensure you have granted leads retrieval and ads management permissions.');
        setLeads([]); // Clear leads on error
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [pageId, accessToken]); // Re-fetch when selected page or user token changes

  if (!pageId) {
    return <p style={{ marginTop: '20px', color: '#666' }}>Select a Facebook Page to view leads.</p>;
  }

  return (
    <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: '#fff', marginTop: '20px' }}>
      <h3>Leads for Page (ID: {pageId}):</h3>
      {loading && <p>Loading leads...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && leads.length === 0 && !error && <p>No leads found for this page.</p>}

      {!loading && leads.length > 0 && (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {leads.map((lead) => (
            <li key={lead.id} style={{ border: '1px solid #eee', padding: '10px', marginBottom: '10px', borderRadius: '5px', backgroundColor: '#fcfcfc' }}>
              <strong>Lead ID:</strong> {lead.id}<br/>
              <strong>Submitted:</strong> {new Date(lead.created_time).toLocaleString()}<br/>
              <strong style={{ color: '#007bff' }}>Form: {lead.form_name} (ID: {lead.form_id})</strong>
              <ul style={{ listStyleType: 'disc', marginLeft: '20px', marginTop: '5px', fontSize: '0.9em' }}>
                {lead.field_data.map((field, index) => (
                  <li key={index}>
                    <strong>{field.name}:</strong> {field.values.join(', ')}
                  </li>
                ))}
              </ul>
              {lead.campaign_id && <p style={{ fontSize: '0.8em', color: '#555' }}>Campaign ID: {lead.campaign_id}</p>}
              {lead.ad_id && <p style={{ fontSize: '0.8em', color: '#555' }}>Ad ID: {lead.ad_id}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Insights;