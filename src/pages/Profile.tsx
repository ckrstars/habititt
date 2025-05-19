import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaUser, FaCamera, FaTimes, FaCheck } from 'react-icons/fa';

// Define stock avatar images
const STOCK_AVATARS = [
  // Adventurer avatars (similar to Google Play Games style)
  { id: 'adventure1', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Gamer1&backgroundColor=b6e3f4' },
  { id: 'adventure2', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Player2&backgroundColor=d1d4f9' },
  { id: 'adventure3', url: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Buddy3&backgroundColor=c0aede' },
  { id: 'adventure4', url: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Hero4&backgroundColor=ffdfbf' },
  
  // Fun cartoon emojis
  { id: 'fun1', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Felix&backgroundColor=b6e3f4' },
  { id: 'fun2', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Bella&backgroundColor=d1d4f9' },
  
  // Pixel art style (reminiscent of retro games)
  { id: 'pixel1', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Gamer5&backgroundColor=c0aede' },
  { id: 'pixel2', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Player6&backgroundColor=ffdfbf' },
  
  // Big smile faces
  { id: 'big1', url: 'https://api.dicebear.com/7.x/big-smile/svg?seed=Buddy7&backgroundColor=b6e3f4' },
  { id: 'big2', url: 'https://api.dicebear.com/7.x/big-smile/svg?seed=Hero8&backgroundColor=d1d4f9' },
  
  // Bottts (robot avatars)
  { id: 'bottts1', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Nova&backgroundColor=c0aede' },
  { id: 'bottts2', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Rocky&backgroundColor=ffdfbf' },
  
  // Lorelei avatars (colorful characters)
  { id: 'lorelei1', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Gamer9&backgroundColor=b6e3f4' },
  { id: 'lorelei2', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Player10&backgroundColor=d1d4f9' },
  
  // Croodles (hand-drawn style)
  { id: 'croodles1', url: 'https://api.dicebear.com/7.x/croodles/svg?seed=Buddy11&backgroundColor=c0aede' },
  { id: 'croodles2', url: 'https://api.dicebear.com/7.x/croodles-neutral/svg?seed=Hero12&backgroundColor=ffdfbf' },
  
  // Thumbs (cute cartoon style)
  { id: 'thumbs1', url: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Gamer13&backgroundColor=b6e3f4' },
  { id: 'thumbs2', url: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Player14&backgroundColor=d1d4f9' },
  
  // Personas (more realistic)
  { id: 'personas1', url: 'https://api.dicebear.com/7.x/personas/svg?seed=Alex&backgroundColor=c0aede' },
  { id: 'personas2', url: 'https://api.dicebear.com/7.x/personas/svg?seed=Jamie&backgroundColor=ffdfbf' },
];

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(() => localStorage.getItem('userFullName') || '');
  const [username, setUsername] = useState(() => localStorage.getItem('username') || '');
  const [profileImage, setProfileImage] = useState(() => localStorage.getItem('profileImage') || '');
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    localStorage.setItem('userFullName', fullName);
    localStorage.setItem('username', username);
    if (profileImage) {
      localStorage.setItem('profileImage', profileImage);
    }
    setIsEditing(false);
    setShowAvatarSelector(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setProfileImage(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarSelect = (avatarUrl: string) => {
    setProfileImage(avatarUrl);
    setShowAvatarSelector(false);
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <header className="flex items-center space-x-4 mb-8">
        <Link to="/" className="btn-secondary p-2">
          <FaArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-3xl font-bold">Profile</h1>
      </header>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <div className="card">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <FaUser className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                )}
              </div>
              {isEditing && (
                <button 
                  onClick={() => setShowAvatarSelector(true)}
                  className="absolute bottom-0 right-0 bg-primary-light dark:bg-primary-dark text-white rounded-full p-2 shadow-lg"
                >
                  <FaCamera className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          
          {isEditing ? (
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  className="input w-full"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <input
                  type="text"
                  className="input w-full"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your username"
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  className="btn-primary flex-1"
                  onClick={handleSave}
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  className="btn-secondary flex-1"
                  onClick={() => {
                    setIsEditing(false);
                    setShowAvatarSelector(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</h3>
                <p className="mt-1 text-lg">{fullName || "Not set"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Username</h3>
                <p className="mt-1 text-lg">{username || "Not set"}</p>
              </div>
              <button
                className="btn-primary w-full"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
            </div>
          )}
        </div>

        {/* Avatar Selector Modal */}
        <AnimatePresence>
          {showAvatarSelector && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 w-full max-w-lg"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Choose Profile Picture</h2>
                  <button
                    onClick={() => setShowAvatarSelector(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <FaTimes className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-4">
                  <div className="flex justify-center mb-4">
                    <div className="h-20 w-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                      {profileImage ? (
                        <img src={profileImage} alt="Selected profile" className="h-full w-full object-cover" />
                      ) : (
                        <FaUser className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                      )}
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-secondary text-sm"
                    >
                      Upload Custom Image
                    </button>
                    <input 
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </div>
                </div>

                <h3 className="font-medium mb-2">Stock Avatars</h3>
                <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto p-1">
                  {STOCK_AVATARS.map((avatar) => (
                    <button
                      key={avatar.id}
                      onClick={() => handleAvatarSelect(avatar.url)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 hover:border-primary-light dark:hover:border-primary-dark ${
                        profileImage === avatar.url 
                          ? 'border-primary-light dark:border-primary-dark' 
                          : 'border-transparent'
                      }`}
                    >
                      <img src={avatar.url} alt={avatar.id} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>

                <div className="flex justify-end mt-4 space-x-2">
                  <button
                    onClick={() => {
                      setProfileImage('');
                      setShowAvatarSelector(false);
                    }}
                    className="btn-secondary text-sm"
                  >
                    Clear Image
                  </button>
                  <button
                    onClick={() => {
                      setShowAvatarSelector(false);
                    }}
                    className="btn-primary text-sm"
                  >
                    <FaCheck className="mr-1 inline-block" /> Apply
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
} 