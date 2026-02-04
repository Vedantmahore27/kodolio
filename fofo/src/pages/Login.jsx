import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from 'react-router';
import { loginUser } from "../authSlice";
import { useEffect, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import './authBackground.css';
import logo from '../assets/logo.png';


const signupSchema = z.object({
  emailId: z.string().email("Invalid Email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z
    .enum(["user", "admin"])
});

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, loading, error } =
    useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(signupSchema),
                        defaultValues: {
                        role: "user"
                        }
                        });

  const onSubmit = (data) => {
    dispatch(loginUser(data));
  };

  return (
    <>
      <div className="auth-background">
        <div className="bg-gradient-overlay"></div>
        <svg className="circuit-board-svg" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="circuit-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor: '#00ff88', stopOpacity: 0.3}} />
              <stop offset="50%" style={{stopColor: '#00ffff', stopOpacity: 0.2}} />
              <stop offset="100%" style={{stopColor: '#0088ff', stopOpacity: 0.3}} />
            </linearGradient>
          </defs>
          <line x1="100" y1="100" x2="300" y2="100" stroke="url(#circuit-gradient)" strokeWidth="2" className="circuit-line" />
          <circle cx="300" cy="100" r="4" fill="#00ff88" opacity="0.6" className="circuit-node" />
          <line x1="300" y1="100" x2="300" y2="300" stroke="url(#circuit-gradient)" strokeWidth="2" className="circuit-line" />
          <circle cx="300" cy="300" r="4" fill="#00ffff" opacity="0.6" className="circuit-node" />
          <line x1="300" y1="300" x2="600" y2="300" stroke="url(#circuit-gradient)" strokeWidth="2" className="circuit-line" />
          <circle cx="600" cy="300" r="4" fill="#0088ff" opacity="0.6" className="circuit-node" />
        </svg>
        <div className="code-block code-block-1">
          <span className="code-line"><span className="keyword">const</span> <span className="variable">user</span> = <span className="function">new</span> <span className="class-name">Coder</span>();</span>
        </div>
        <div className="floating-cursor cursor-1"></div>
        <div className="floating-cursor cursor-2"></div>
        <div className="floating-cursor cursor-3"></div>
      </div>
      <div className="auth-container">
        <div className="card w-96 shadow-xl border border-primary bg-transparent backdrop-blur-md">
          <div className="card-body">
            <div className="flex justify-center mb-6">
              <img src={logo} alt="Kodolio" className="h-28 object-contain" />
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>

              {/* Email */}
              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  placeholder="abc@example.com"
                  className={`input input-bordered w-full 
                  ${errors.emailId ? 'input-error' : ''}`}
                  {...register('emailId')}
                />
                {errors.emailId && (
                  <span className="text-error text-sm mt-1">
                    {errors.emailId.message}
                  </span>
                )}
              </div>

              {/* Password */}
              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text">Password</span>
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`input input-bordered w-full pr-10 
                    ${errors.password ? 'input-error' : ''}`}
                    {...register('password')}
                  />

                  <button
                    type="button"
                    className="absolute right-3 top-1/2 
                    -translate-y-1/2 text-xl"
                    onClick={() => setShowPassword(prev => !prev)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                {errors.password && (
                  <span className="text-error text-sm mt-1">
                    {errors.password.message}
                  </span>
                )}
              </div>
              {/* Role Selection */}
<div className="form-control mt-6">
  <label className="label">
    <span className="label-text">Login as</span>
  </label>

  <div className="flex gap-6 justify-center">
    {/* User */}
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="radio"
        value="user"
        {...register("role")}
        defaultChecked
        className="hidden peer"
      />
      <div
        className="w-5 h-5 rounded-full border-2 border-gray-400
        peer-checked:border-orange-400 peer-checked:bg-purple-400
        flex items-center justify-center"
      >
        <div className="w-2 h-2 bg-white rounded-full hidden peer-checked:block"></div>
      </div>
      <span className="text-sm">User</span>
    </label>

    {/* Admin */}
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="radio"
        value="admin"
        {...register("role")}
        className="hidden peer"
      />
      <div
        className="w-5 h-5 rounded-full border-2 border-gray-400
        peer-checked:border-purple-400 peer-checked:bg-orange-400
        flex items-center justify-center"
      >
        <div className="w-2 h-2 bg-white rounded-full hidden peer-checked:block"></div>
      </div>
      <span className="text-sm">Admin</span>
    </label>
  </div>
</div>


              {/* Backend Error */}
             <p className="text-red-500 text-sm mt-3 text-center min-h-[20px]">
              {error || " "}
             </p>


              {/* Submit */}
              <div className="form-control mt-8 flex justify-center"> 
                <button
                  type="submit"
                  className={`btn btn-primary ${loading ? 'loading' : ''}`}
                  disabled={loading}
                >
                  {loading ? 'Loging...' : 'Login'}
                </button>
              </div>

            </form>
            <div className="text-center mt-6">
              <span className="text-sm">
                Don't have an account?{' '}
                <NavLink to="/signup" className="link link-primary">
                  singup
                </NavLink>
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
