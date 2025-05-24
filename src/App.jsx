import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Profile from './components/Profile';
import PageSelector from './components/PageSelector';
import Insights from './components/Insights'; // This will eventually show leads

function App() {
  const [accessToken, setAccessToken] = useState(null); // User's FB Access Token
  const [userProfile, setUserProfile] = useState(null); // User's name, ID
  const [selectedPageId, setSelectedPageId] = useState(null); // ID of the selected FB Page

  // Load token from localStorage on component mount for persistence
  useEffect(() => {
    const storedToken = localStorage.getItem('facebookAccessToken');
    const storedUserProfile = localStorage.getItem('facebookUserProfile');
    if (storedToken) {
      setAccessToken(storedToken);
      if (storedUserProfile) {
        setUserProfile(JSON.parse(storedUserProfile));
      }
      // In a production app, you'd send this token to your backend to verify its validity.
    }
  }, []);

  const handleLoginSuccess = (token, profile) => {
    setAccessToken(token);
    setUserProfile(profile);
    localStorage.setItem('facebookAccessToken', token);
    localStorage.setItem('facebookUserProfile', JSON.stringify(profile));
  };

  const handleLogout = () => {
    setAccessToken(null);
    setUserProfile(null);
    setSelectedPageId(null);
    localStorage.removeItem('facebookAccessToken');
    localStorage.removeItem('facebookUserProfile');
  };

  const handlePageSelect = (pageId) => {
    setSelectedPageId(pageId);
  };

  return (
    <div className="App" style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto", fontFamily: "Arial, sans-serif" }}>
      {!accessToken ? (
        // Display Login component if not logged in
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        // Display user dashboard if logged in
        <>
          <div style={{ marginBottom: "20px", borderBottom: "1px solid #eee", paddingBottom: "20px" }}>
            {userProfile && <Profile user={userProfile} />}
            <Login onLogout={handleLogout} /> {/* Login component also houses the logout button */}
          </div>

          <div style={{ marginBottom: "20px" }}>
            <PageSelector
              accessToken={accessToken} // Pass User Access Token for page retrieval
              onPageSelect={handlePageSelect}
            />
          </div>

          {selectedPageId && (
            <Insights
              accessToken={accessToken} // User Access Token
              pageId={selectedPageId} // Selected Page ID
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;