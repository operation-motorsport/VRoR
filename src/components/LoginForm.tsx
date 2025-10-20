import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { signIn, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect to veterans page when user is authenticated
  useEffect(() => {
    console.log('LoginForm redirect check - user:', user ? 'present' : 'null', 'authLoading:', authLoading);

    if (user && !authLoading) {
      console.log('✅ User authenticated, redirecting to /veterans');
      navigate('/veterans', { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Fallback redirect timeout after successful login
  useEffect(() => {
    if (success && success.includes('Redirecting')) {
      console.log('🔄 Setting fallback redirect timeout...');
      const redirectTimeout = setTimeout(() => {
        if (!user) {
          console.log('⚠️ Fallback redirect triggered - forcing navigation');
          navigate('/veterans', { replace: true });
        }
      }, 5000); // 5 second fallback

      return () => clearTimeout(redirectTimeout);
    }
  }, [success, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('🔄 Attempting to sign in...');
      await signIn(email, password);
      console.log('✅ Sign in successful, waiting for auth state update...');
      setSuccess('Signed in successfully! Redirecting...');

      // Immediate redirect attempt after 2 seconds
      setTimeout(() => {
        console.log('🚀 Attempting immediate redirect...');
        navigate('/veterans', { replace: true });
      }, 2000);

      // Navigation will also happen in useEffect when user state is set
    } catch (err: any) {
      let errorMessage = 'An error occurred';

      if (err.message.includes('too many requests')) {
        errorMessage = 'Too many attempts. Please wait a few minutes and try again.';
      } else if (err.message.includes('invalid')) {
        errorMessage = 'Invalid email or password. Please check and try again.';
      } else if (err.message.includes('confirm')) {
        errorMessage = 'Please check your email and click the confirmation link first.';
      } else {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm sm:max-w-md">
        <div className="text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <img
              src="/vror.png"
              alt="Veterans Race of Remembrance Logo"
              className="h-16 w-auto"
            />
          </div>
          <h1 className="text-3xl font-bebas text-gray-900 mb-2 tracking-wide">
            Event Information Hub
          </h1>
        </div>
      </div>

      <div className="mt-8 w-full max-w-sm sm:max-w-md">
        <div className="bg-white py-6 px-4 shadow rounded-lg sm:px-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-h-[44px] text-base"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-h-[44px] text-base"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
                {success}
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading || !email || !password}
                className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Please wait...' : 'Sign In'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Need an account?{' '}
              <a
                href="mailto:Tiffany.Lodder@operationmotorsport.org,jason.leach@operationmotorsport.org?subject=Account Request - Veterans Race of Remembrance"
                className="text-primary-600 hover:text-primary-700 underline"
              >
                Contact your administrator
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}