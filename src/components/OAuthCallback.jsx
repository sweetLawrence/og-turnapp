import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleOAuthCallback = () => {
      const urlParams = new URLSearchParams(location.search);
      const token = urlParams.get('token');
      const userEncoded = urlParams.get('user');
      const messageEncoded = urlParams.get('message');
      const messageType = urlParams.get('message_type') || 'success';

      if (token && userEncoded) {
        try {
          // Decode user data
          const user = JSON.parse(atob(userEncoded));
          
          // Store authentication data
          localStorage.setItem('auth_token', token);
          localStorage.setItem('user', JSON.stringify(user));

          // Show success message
          if (messageEncoded) {
            const message = atob(messageEncoded);
            if (messageType === 'success') {
              toast.success(message);
            } else {
              toast.error(message);
            }
          }

          // Redirect based on user type
          if (user.user_type === 'Admin' || user.user_type === 'Organiser') {
            navigate('/dashboard', { replace: true });
          } else if (user.user_type === 'affiliate') {
            navigate('/dashboard', { replace: true }); // or affiliate dashboard if you have one
          } else {
            navigate('/', { replace: true });
          }
        } catch (error) {
          console.error('Error processing OAuth callback:', error);
          toast.error('Authentication failed. Please try again.');
          navigate('/login', { replace: true });
        }
      } else {
        // Handle error case
        if (messageEncoded) {
          const message = atob(messageEncoded);
          toast.error(message);
        } else {
          toast.error('Authentication failed. Please try again.');
        }
        navigate('/login', { replace: true });
      }
    };

    handleOAuthCallback();
  }, [location, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-white">Completing authentication...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;