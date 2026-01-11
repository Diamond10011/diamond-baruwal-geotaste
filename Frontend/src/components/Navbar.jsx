import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LogOut, User, Settings } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-2xl text-blue-600">
            GeoTaste
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {isAuthenticated ? (
              <>
                <Link to="/home" className="text-gray-700 hover:text-blue-600 transition">
                  Home
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin-dashboard" className="text-gray-700 hover:text-blue-600 transition">
                    Dashboard
                  </Link>
                )}
                {user?.role === 'store' && (
                  <Link to="/store-profile" className="text-gray-700 hover:text-blue-600 transition">
                    My Store
                  </Link>
                )}
                {user?.role === 'restaurant' && (
                  <Link to="/restaurant-profile" className="text-gray-700 hover:text-blue-600 transition">
                    My Restaurant
                  </Link>
                )}

                {/* User Dropdown */}
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-700">{user?.email}</span>
                  <Link to="/profile" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-gray-700 hover:text-red-600 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-gray-700 hover:text-blue-600 transition">
                  Login
                </Link>
                <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t">
            {isAuthenticated ? (
              <div className="space-y-2 pt-4">
                <Link to="/home" className="block text-gray-700 hover:text-blue-600">
                  Home
                </Link>
                <Link to="/profile" className="block text-gray-700 hover:text-blue-600">
                  Profile
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin-dashboard" className="block text-gray-700 hover:text-blue-600">
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left text-gray-700 hover:text-red-600 mt-2"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-2 pt-4">
                <Link to="/login" className="block text-gray-700 hover:text-blue-600">
                  Login
                </Link>
                <Link to="/register" className="block text-gray-700 hover:text-blue-600">
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
//                       <p className="text-xs text-muted-foreground">{user.email}</p>
//                     </div>
//                   </DropdownMenuLabel>
//                   <DropdownMenuSeparator />
//                   <DropdownMenuItem asChild>
//                     <Link href="/profile" className="cursor-pointer">
//                       <User className="mr-2 h-4 w-4" />
//                       Profile
//                     </Link>
//                   </DropdownMenuItem>
//                   <DropdownMenuItem asChild>
//                     <Link href="/favorites" className="cursor-pointer">
//                       <Heart className="mr-2 h-4 w-4" />
//                       Favorites
//                     </Link>
//                   </DropdownMenuItem>
//                   <DropdownMenuItem asChild>
//                     <Link href="/recommendations" className="cursor-pointer">
//                       <Sparkles className="mr-2 h-4 w-4" />
//                       For You
//                     </Link>
//                   </DropdownMenuItem>
//                   <DropdownMenuItem asChild>
//                     <Link href="/settings" className="cursor-pointer">
//                       <Settings className="mr-2 h-4 w-4" />
//                       Settings
//                     </Link>
//                   </DropdownMenuItem>
//                   <DropdownMenuSeparator />
//                   <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive">
//                     <LogOut className="mr-2 h-4 w-4" />
//                     Sign out
//                   </DropdownMenuItem>
//                 </DropdownMenuContent>
//               </DropdownMenu>
//             ) : (
//               <>
//                 <Link href="/login">
//                   <Button variant="outline">Sign In</Button>
//                 </Link>
//                 <Link href="/signup">
//                   <Button>Get Started</Button>
//                 </Link>
//               </>
//             )}
//           </div>

//           {/* Mobile Menu Button */}
//           <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
//             {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
//           </button>
//         </div>

//         {/* Mobile Menu */}
//         {isMenuOpen && (
//           <div className="md:hidden py-4 border-t border-border">
//             <nav className="flex flex-col gap-4">
//               <Link href="/discover" className="text-muted-foreground hover:text-foreground transition-colors">
//                 Discover
//               </Link>
//               <Link href="/restaurants" className="text-muted-foreground hover:text-foreground transition-colors">
//                 Restaurants
//               </Link>
//               <Link
//                 href="/recommendations"
//                 className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
//               >
//                 <Sparkles className="w-4 h-4" />
//                 For You
//               </Link>
//               <Link href="/recipes" className="text-muted-foreground hover:text-foreground transition-colors">
//                 Recipes
//               </Link>
//               <div className="flex flex-col gap-2 pt-4 border-t border-border">
//                 {user ? (
//                   <>
//                     <Link href="/profile">
//                       <Button variant="outline" className="w-full bg-transparent">
//                         Profile
//                       </Button>
//                     </Link>
//                     <Button variant="destructive" className="w-full" onClick={logout}>
//                       Sign Out
//                     </Button>
//                   </>
//                 ) : (
//                   <>
//                     <Link href="/login">
//                       <Button variant="outline" className="w-full bg-transparent">
//                         Sign In
//                       </Button>
//                     </Link>
//                     <Link href="/signup">
//                       <Button className="w-full">Get Started</Button>
//                     </Link>
//                   </>
//                 )}
//               </div>
//             </nav>
//           </div>
//         )}
//       </div>
//     </header>
//   )
// }