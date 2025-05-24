import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = 'https://localhost:5000'; // <--- Make sure this matches your backend URL

function PageSelector({ accessToken, onPageSelect }) {
  const [pages, setPages] = useState([]);
  const [selectedPageId, setSelectedPageId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPages = async () => {
      if (!accessToken) {
        setPages([]);
        setSelectedPageId('');
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await axios.post(`${BACKEND_URL}/api/get-pages`, {
          userAccessToken: accessToken,
        });
        setPages(response.data.pages);
      } catch (err) {
        console.error('Error fetching pages from backend:', err.response?.data || err.message);
        setError('Failed to load Facebook Pages. Please ensure you have granted page management permissions.');
        setPages([]); // Clear pages on error
      } finally {
        setLoading(false);
      }
    };

    fetchPages();
  }, [accessToken]); // Re-fetch when access token changes

  const handleSelectChange = (event) => {
    const pageId = event.target.value;
    setSelectedPageId(pageId);
    if (typeof onPageSelect === 'function') {
      onPageSelect(pageId);
    }
  };

  return (
    <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: '#fff' }}>
      <h3>Select a Facebook Page:</h3>
      {loading && <p>Loading pages...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && pages.length === 0 && !error && <p>No Facebook Pages found. Ensure your account manages pages and you've granted `pages_show_list` permission.</p>}

      {!loading && pages.length > 0 && (
        <select
          onChange={handleSelectChange}
          value={selectedPageId}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%', maxWidth: '300px' }}
        >
          <option value="">-- Choose a Page --</option>
          {pages.map((page) => (
            <option key={page.id} value={page.id}>
              {page.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

export default PageSelector;