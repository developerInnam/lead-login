import React from 'react';

function Profile({ user }) {
  if (!user) {
    return null;
  }

  return (
    <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: '#e9f7ef' }}>
      <h2>Welcome, {user.name}!</h2>
      <p>Facebook ID: {user.id}</p>
      {user.email && <p>Email: {user.email}</p>}
      <p>You are logged in.</p>
    </div>
  );
}

export default Profile;