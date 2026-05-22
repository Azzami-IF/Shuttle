import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User, Phone } from 'lucide-react';
import logo from '../../imports/Pastel_Circle_Logo_ambatu-removebg-preview.png';

interface RegistrationProps {
  onBackToLogin: () => void;
  onRegisterSuccess: (user: { name: string; email: string; phone: string }) => void;
}

export default function Registration({ onBackToLogin, onRegisterSuccess }: RegistrationProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Registration attempt:', formData);

    if (formData.password !== formData.confirmPassword) {
      alert('Password tidak cocok!');
      return;
    }

    onRegisterSuccess({
      name: formData.fullName,
      email: formData.email,
      phone: formData.phone
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="size-full flex items-center justify-center bg-gradient-to-br from-[#1a2e1a] via-[#2d4a2d] to-[#1f331f] relative overflow-hidden">
      {/* Animated stars background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="stars"></div>
        <div className="stars2"></div>
        <div className="stars3"></div>
      </div>

      {/* Logo floating animation */}
      <div className="absolute top-20 right-20 animate-pulse opacity-10">
        <img src={logo} alt="Ambatu Bus" className="w-32 h-32" />
      </div>

      {/* Registration card */}
      <div className="relative z-10 w-full max-w-md mx-4 my-8">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <img src={logo} alt="Ambatu Bus Logo" className="w-20 h-20" />
            </div>
            <h1 className="text-white mb-2">Daftar Akun Baru</h1>
            <p className="text-lime-200">Bergabung dengan Ambatu Bus</p>
          </div>

          {/* Registration form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name input */}
            <div>
              <label htmlFor="fullName" className="block text-white mb-2">
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-lime-300" size={20} />
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/30 rounded-lg pl-11 pr-4 py-3 text-white placeholder-lime-200/50 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>
            </div>

            {/* Email input */}
            <div>
              <label htmlFor="email" className="block text-white mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-lime-300" size={20} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/30 rounded-lg pl-11 pr-4 py-3 text-white placeholder-lime-200/50 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                  placeholder="email@example.com"
                  required
                />
              </div>
            </div>

            {/* Phone input */}
            <div>
              <label htmlFor="phone" className="block text-white mb-2">
                Nomor Telepon
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-lime-300" size={20} />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/30 rounded-lg pl-11 pr-4 py-3 text-white placeholder-lime-200/50 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                  placeholder="08xxxxxxxxxx"
                  required
                />
              </div>
            </div>

            {/* Password input */}
            <div>
              <label htmlFor="password" className="block text-white mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-lime-300" size={20} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/30 rounded-lg pl-11 pr-12 py-3 text-white placeholder-lime-200/50 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-lime-300 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password input */}
            <div>
              <label htmlFor="confirmPassword" className="block text-white mb-2">
                Konfirmasi Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-lime-300" size={20} />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/30 rounded-lg pl-11 pr-12 py-3 text-white placeholder-lime-200/50 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-lime-300 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Terms and conditions */}
            <div className="flex items-start">
              <input
                type="checkbox"
                id="terms"
                className="mt-1 mr-2 rounded bg-white/5 border-white/30 text-lime-500 focus:ring-lime-500"
                required
              />
              <label htmlFor="terms" className="text-lime-200 cursor-pointer">
                Saya setuju dengan{' '}
                <a href="#" className="text-lime-300 hover:text-lime-100 transition-colors">
                  syarat dan ketentuan
                </a>{' '}
                yang berlaku
              </label>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#9dc847] to-[#7fb52a] hover:from-[#8ab839] hover:to-[#6fa321] text-white py-3 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              Daftar Sekarang
            </button>
          </form>

          {/* Login link */}
          <div className="mt-6 text-center text-lime-200">
            Sudah punya akun?{' '}
            <button
              onClick={onBackToLogin}
              className="text-lime-300 hover:text-lime-100 transition-colors"
            >
              Masuk di sini
            </button>
          </div>
        </div>

        {/* Footer text */}
        <p className="text-center text-lime-300/50 mt-6">
          © 2026 Ambatu Bus. Sistem manajemen transportasi.
        </p>
      </div>

      <style>{`
        @keyframes stars-animation {
          from { transform: translateY(0px); }
          to { transform: translateY(-2000px); }
        }

        .stars, .stars2, .stars3 {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 100%;
          background: transparent;
        }

        .stars {
          background-image:
            radial-gradient(2px 2px at 20px 30px, #eee, rgba(0,0,0,0)),
            radial-gradient(2px 2px at 60px 70px, #fff, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 50px 50px, #fff, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 130px 80px, #fff, rgba(0,0,0,0)),
            radial-gradient(2px 2px at 90px 10px, #fff, rgba(0,0,0,0));
          background-repeat: repeat;
          background-size: 200px 200px;
          animation: stars-animation 50s linear infinite;
          opacity: 0.4;
        }

        .stars2 {
          background-image:
            radial-gradient(1px 1px at 100px 120px, #fff, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 150px 60px, #fff, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 75px 160px, #fff, rgba(0,0,0,0));
          background-repeat: repeat;
          background-size: 250px 250px;
          animation: stars-animation 100s linear infinite;
          opacity: 0.3;
        }

        .stars3 {
          background-image:
            radial-gradient(1px 1px at 180px 90px, #fff, rgba(0,0,0,0)),
            radial-gradient(2px 2px at 120px 200px, #eee, rgba(0,0,0,0));
          background-repeat: repeat;
          background-size: 300px 300px;
          animation: stars-animation 150s linear infinite;
          opacity: 0.2;
        }
      `}</style>
    </div>
  );
}
