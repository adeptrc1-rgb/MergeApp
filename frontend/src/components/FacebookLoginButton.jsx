import React from 'react';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

const FacebookLoginButton = ({ onSuccess }) => {
  const handleFacebookResponse = async (response) => {
    if (response.accessToken) {
      try {
        // Send Facebook token to backend
        const backendResponse = await axios.post(
          `${BACKEND_URL}/api/auth/facebook/login`,
          { access_token: response.accessToken },
          { withCredentials: true }
        );

        if (backendResponse.data.success) {
          console.log('✅ Facebook login successful');
          if (onSuccess) {
            onSuccess(backendResponse.data);
          }
          // Reload to trigger auth check
          window.location.href = '/home';
        }
      } catch (error) {
        console.error('❌ Facebook login failed:', error);
        alert('Facebook login failed. Please try again.');
      }
    } else {
      console.log('Facebook login cancelled');
    }
  };

  const appId = process.env.REACT_APP_FACEBOOK_APP_ID;

  if (!appId || appId === 'YOUR_FACEBOOK_APP_ID_HERE') {
    return (
      <div style={{
        padding: '16px',
        background: 'rgba(255,200,0,0.1)',
        border: '1px solid rgba(255,200,0,0.3)',
        borderRadius: '8px',
        color: '#FFA500',
        fontSize: '14px',
        marginBottom: '16px'
      }}>
        ⚠️ Facebook App ID not configured. Please add REACT_APP_FACEBOOK_APP_ID to your .env file.
      </div>
    );
  }

  return (
    <FacebookLogin
      appId={appId}
      autoLoad={false}
      fields="name,email,picture.type(large)"
      callback={handleFacebookResponse}
      render={(renderProps) => (
        <button
          onClick={renderProps.onClick}
          disabled={renderProps.isDisabled}
          style={{
            width: '100%',
            padding: '14px 24px',
            background: '#1877F2',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: renderProps.isDisabled ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            transition: 'all 0.2s',
            opacity: renderProps.isDisabled ? 0.6 : 1
          }}
          onMouseEnter={(e) => {
            if (!renderProps.isDisabled) {
              e.currentTarget.style.background = '#0C63D4';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#1877F2';
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          {renderProps.isDisabled ? 'Connecting...' : 'Continue with Facebook'}
        </button>
      )}
    />
  );
};

export default FacebookLoginButton;
