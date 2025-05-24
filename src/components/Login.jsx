import React, { useState, useEffect } from 'react';
import FacebookLogin, { FacebookLoginClient } from '@greatsumini/react-facebook-login';
import axios from 'axios';

const YOUR_APP_ID = '2699237820409003'; // <--- REPLACE THIS
const BACKEND_URL = 'https://localhost:5000'; // <--- Make sure this matches your backend URL

function Login({ onLoginSuccess, onLogout }) {
  const [accessToken, setAccessToken] = useState(null); // User's short-lived FB Access Token
  const [userProfile, setUserProfile] = useState(null); // User's name, ID (for internal component display)
  const [pages, setPages] = useState([]); // List of pages managed by the user
  const [selectedPageId, setSelectedPageId] = useState(null); // Currently selected page
  const [leads, setLeads] = useState([]); // Fetched leads
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize Facebook SDK and check login status on component mount
  useEffect(() => {
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: YOUR_APP_ID,
        cookie: true,
        xfbml: true,
        version: 'v18.0', // Use the latest stable API version
      });

      // Check current login status (for page refreshes)
      window.FB.getLoginStatus(function(response) {
        if (response.status === 'connected') {
          // If already connected, use the current access token and fetch user/pages
          handleFacebookLogin(response);
          // Also try to get profile data if not already available
          window.FB.api('/me', { fields: 'id,name,email' }, function(profileResponse) {
            if (profileResponse && !profileResponse.error) {
              handleProfileSuccess(profileResponse);
            }
          });
        }
      });
    };
  }, []); // Empty dependency array means this runs once on mount

  const handleFacebookLogin = async (response) => {
    if (response.accessToken) {
      console.log('Facebook Login Success:', response);
      setAccessToken(response.accessToken);
      setError(null);

      // Extract basic profile info if available in the initial response
      const initialProfile = {
        name: response.name,
        id: response.id,
        email: response.email // if 'email' scope was requested and user granted
      };
      setUserProfile(initialProfile);

      // --- Step 1: Send User Access Token to Backend to get pages ---
      try {
        setLoading(true);
        const backendResponse = await axios.post(`${BACKEND_URL}/api/get-pages`, {
          userAccessToken: response.accessToken,
        });
        setPages(backendResponse.data.pages);
        setLoading(false);

        // Notify parent (App.js) about successful login and user profile
        if (typeof onLoginSuccess === 'function') {
          onLoginSuccess(response.accessToken, initialProfile);
        }
      } catch (err) {
        console.error('Error fetching pages from backend:', err.response?.data || err.message);
        setError('Failed to fetch pages. Please try again. Check backend console for details.');
        setLoading(false);
        // If backend call fails, log out to ensure consistent state
        handleLogout();
      }
    } else {
      console.log('Facebook Login Failed:', response);
      setError('Facebook login failed. Please try again. User might have cancelled.');
      setAccessToken(null);
      setUserProfile(null);
      if (typeof onLoginSuccess === 'function') {
        onLoginSuccess(null, null); // Indicate login failure to parent
      }
    }
  };

  // This prop is for fetching additional profile data directly after login
  const handleProfileSuccess = (profile) => {
    console.log('Get Profile Success!', profile);
    setUserProfile({ name: profile.name, id: profile.id, email: profile.email });
    // Note: onLoginSuccess is primarily called from handleFacebookLogin
    // to pass token and initial profile to parent. This just updates internal state.
  };

  // *** Logout Function ***
  const handleLogout = () => {
    FacebookLoginClient.logout(() => {
      console.log('Facebook logout completed!');
      setAccessToken(null);
      setUserProfile(null);
      setPages([]);
      setSelectedPageId(null);
      setLeads([]);
      setError(null);
      setLoading(false);
      // Notify parent (App.js) about logout
      if (typeof onLogout === 'function') {
        onLogout();
      } else {
        console.warn("onLogout prop is not a function in Login component.");
      }
    });
  };

  // This component acts as both a login interface and a logout button.
  // It does NOT manage page selection or lead fetching directly.
  // It only handles the FB login/logout flow and passing the access token.
  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
      {!accessToken ? (
        <>
          <h2>Login with Facebook</h2>
          <FacebookLogin
            appId={YOUR_APP_ID}
            autoLoad={false} // Set to true if you want to automatically attempt login on page load
            fields="public_profile,email,pages_show_list,pages_read_engagement,leads_retrieval,ads_management,pages_manage_ads"
            scope="public_profile,email,pages_show_list,pages_read_engagement,leads_retrieval,ads_management,pages_manage_ads"
            onSuccess={handleFacebookLogin}
            onFail={(error) => console.log('Login Fail!', error)}
            onProfileSuccess={handleProfileSuccess}
          />
          {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
        </>
      ) : (
        // Only display logout button if logged in
        <button
          onClick={handleLogout}
          style={{
            marginTop: '10px',
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '1em'
          }}
        >
          Logout from Facebook
        </button>
      )}
    </div>
  );
}

export default Login;