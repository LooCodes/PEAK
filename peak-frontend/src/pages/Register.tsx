import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    age: '',
    heightFeet: '',
    heightInches: '',
    weight: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const heightInInches =
        (parseInt(formData.heightFeet) || 0) * 12 + (parseInt(formData.heightInches) || 0);

      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName || undefined,
        last_name: formData.lastName || undefined,
        age: formData.age ? parseInt(formData.age) : undefined,
        height: heightInInches || undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
      });
      console.log("registered:", register)
        // Navigate to questionnaire for the user to complete
        navigate('/questionnaire');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen from-blue-50 to-purple-50 flex items-center justify-center p-4 pt-24">
      <div className="w-full max-w-2xl">

        <div className="bg-[#1a1a1a] rounded-3xl p-8 shadow-lg border-4 border-[#1a1a1a]" style={{ borderStyle: 'solid', transform: 'rotate(-0.5deg)' }}>
          <div style={{ transform: 'rotate(0.5deg)' }}>
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold mb-2">Register</h2>
              <p className="text-sm">Create an account to get started</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border-2 border-red-400 rounded-lg text-red-700 text-sm">
                {JSON.stringify(error, null, 2)}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-800 focus:outline-none focus:border-blue-500 bg-[#212121]"
                    style={{ transform: 'rotate(-0.3deg)' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-800 focus:outline-none focus:border-blue-500 bg-[#212121]"
                    style={{ transform: 'rotate(0.3deg)' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Username</label>
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-800 focus:outline-none focus:border-blue-500 bg-[#212121]"
                  style={{ transform: 'rotate(0.2deg)' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-800 focus:outline-none focus:border-blue-500 bg-[#212121]"
                  style={{ transform: 'rotate(-0.2deg)' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-800 focus:outline-none focus:border-blue-500 bg-[#212121]"
                  style={{ transform: 'rotate(0.1deg)' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Age</label>
                <input
                  type="number"
                  name="age"
                  placeholder="Age"
                  value={formData.age}
                  onChange={handleChange}
                  min="13"
                  max="120"
                  className="w-32 px-4 py-3 rounded-xl border-2 border-gray-800 focus:outline-none focus:border-blue-500 bg-[#212121]"
                  style={{ transform: 'rotate(-0.1deg)' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Height</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <select
                      name="heightFeet"
                      value={formData.heightFeet}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-800 focus:outline-none focus:border-blue-500 bg-[#212121] appearance-none"
                      style={{ transform: 'rotate(-0.2deg)' }}
                    >
                      <option value="">Ft</option>
                      {[3, 4, 5, 6, 7, 8].map(ft => (
                        <option key={ft} value={ft}>{ft} ft</option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="relative">
                    <select
                      name="heightInches"
                      value={formData.heightInches}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-800 focus:outline-none focus:border-blue-500 bg-[#212121] appearance-none"
                      style={{ transform: 'rotate(0.2deg)' }}
                    >
                      <option value="">In</option>
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(inch => (
                        <option key={inch} value={inch}>{inch} in</option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Weight (lbs)</label>
                <input
                  type="number"
                  name="weight"
                  placeholder="lbs."
                  value={formData.weight}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-800 focus:outline-none focus:border-blue-500 bg-[#212121]"
                  style={{ transform: 'rotate(-0.1deg)' }}
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-2xl border-3 border-gray-800 bg-blue-500 hover:bg-blue-600 font-bold text-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  style={{ transform: 'rotate(0.2deg)' }}
                >
                  {loading ? 'Signing Up...' : 'Sign Up'}
                </button>
              </div>

              <p className="text-center text-sm mt-4">
                You'll be asked to complete a questionnaire next.
              </p>
            </form>

            <div className="text-center mt-6 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-800 font-semibold underline">
                Log in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
