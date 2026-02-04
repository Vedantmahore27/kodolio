import React, { useState } from 'react';
import { Plus, Edit, Trash2, Home, RefreshCw, Zap,Video } from 'lucide-react';
import { NavLink } from 'react-router';
import './authBackground.css';
import CreateProblem from '../component/CreateProblem';
import AdminDelete from '../component/AdminDelete'
import HeaderPage from './Header';

function Admin() {
  const [selectedOption, setSelectedOption] = useState(null);

  const adminOptions = [
    {
      id: 'create',
      title: 'Create Problem',
      description: 'Add a new coding problem to the platform',
      icon: Plus,
      color: 'btn-success',
      bgColor: 'bg-success/10',
      route: '/admin/create'
    },
    {
      id: 'update',
      title: 'Update Problem',
      description: 'Edit existing problems and their details',
      icon: Edit,
      color: 'btn-warning',
      bgColor: 'bg-warning/10',
      route: '/admin/update'
    },
    {
      id: 'delete',
      title: 'Delete Problem',
      description: 'Remove problems from the platform',
      icon: Trash2,
      color: 'btn-error',
      bgColor: 'bg-error/10',
      route: '/admin/delete'
    },
    {
      id: 'video',
      title: 'Video Problem',
      description: 'Upload And Delete Videos',
      icon: Video,
      color: 'btn-success',
      bgColor: 'bg-success/10',
      route: '/admin/video'
    }
  ];

  return (

     <div className="min-h-screen flex flex-col">
      <div classname="auth-background">
    <HeaderPage />

    <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="flex-2 overflow-y-auto -mr-[20px] pr-[20px] text-center mb-12">
          <h1 className="text-purple-400 text-4xl font-bold text-base-content mt-7 mb-4">
            Admin Panel
          </h1>
          <p className="text-orange-400 base-content/70 text-lg">
            Manage coding problems on your platform
          </p>
        </div>

        {/* Admin Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {adminOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <div
                key={option.id}
                className="card backdrop-blur-md  bg-transparent  bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
              >
                <div className="card  shadow-xl border border-primary card-body items-center text-center p-8">
                  {/* Icon */}
                  <div className={`${option.bgColor} p-4 rounded-full mb-4`}>
                    <IconComponent size={32} className="text-base-content" />
                  </div>
                  
                  {/* Title */}
                  <h2 className="card-title text-xl mb-2">
                    {option.title}
                  </h2>
                  
                  {/* Description */}
                  <p className="text-base-content/70 mb-6">
                    {option.description}
                  </p>
                  
                  {/* Action Button */}
                  <div className="card-actions">
                    <div className="card-actions">
                    <NavLink 
                    to={option.route}
                   className={`btn ${option.color} btn-wide`}
                   >
                   {option.title}
                   </NavLink>
                   </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
    </div>

 
  );
}

export default Admin;