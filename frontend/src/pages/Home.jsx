import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Link, NavLink } from 'react-router-dom';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';



import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import logo from "../assets/logo.jpg";
import img1 from "../assets/img1.jpg";
import img2 from "../assets/img2.jpg";
import img3 from "../assets/img3.jpg";


const HomePage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const slides = [
    {
      image: img1,
      title: "Transparent Elections",
      content: "Fair and secure voting for societies, NGOs, and clubs."
    },
    {
      image: img2,
      title: "Easy Nomination",
      content: "Nominate candidates and manage elections effortlessly."
    },
    {
      image: img3,
      title: "Live Results",
      content: "Track election outcomes in real-time."
    }
  ];

  const menuItems = [
    { title: "Create Election", icon: "🗓️", path: "/create-election" },
    { title: "Nomination Desk", icon: "📤", path: "/nominations" },
    { title: "Voter Panel", icon: "🧑‍🤝‍🧑", path: "/voters" },
    { title: "Live Voting", icon: "📡", path: "/live-voting" },
    { title: "Results & Analytics", icon: "📊", path: "/results" },
    { title: "Help & Support", icon: "🛠️", path: "/support" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-[#111827] text-white' : 'bg-[#F3F4F6] text-gray-900'}`}>
      {/* Header */}
      <header className={`p-5 w-full flex justify-between items-center ${darkMode ? 'bg-[#1F2937]' : 'bg-[#4F46E5]'} text-white`}>
              <div className="flex items-center">
                <img src={logo} alt="Logo" className="w-14 h-14 mr-2 rounded-full" />
                <div className="text-left">
                  <h2 className="text-2xl font-extrabold tracking-wide">Civix Voting Portal</h2>
                  <p className="text-sm text-gray-300 italic">Empowering Societies, NGOs & Clubs through Secure Voting</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button onClick={toggleDarkMode} className="p-2 rounded-full bg-white text-black">
                  {darkMode ? '🌚 Dark' : '🌞 Light'} 
                </button>
                <NavLink to="/auth/login">
        <button
          className={`px-4 py-1 rounded text-sm transition-colors duration-300 ${
            darkMode
              ? ' hover:bg-[#111827] text-white'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          Login
        </button>
      </NavLink>
              </div>
            </header>

      {/* Swiper Slider */}
      <div className="p-4">
        <Swiper
          spaceBetween={30}
          centeredSlides={true}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation={true}
          modules={[Autoplay, Pagination, Navigation]}
          className={`rounded-lg shadow-md ${darkMode ? 'bg-[#1F2937]' : 'bg-white'}`}
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index}>
              <div className="relative h-[1050px] md:h-[540px] w-full overflow-hidden rounded-lg">
                <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30 flex flex-col justify-center items-center text-center p-4">
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">{slide.title}</h3>
                  <p className="text-lg md:text-xl text-indigo-100">{slide.content}</p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Introduction Section */}
      <div className="p-6 text-center max-w-4xl mx-auto">
        <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-[#10B981]' : 'text-[#4F46E5]'}`}>
          Welcome to Your Election Portal
        </h2>
        <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Empowering Societies, NGOs, and Clubs with transparent digital elections. Manage nominations, voting, and results from one simple dashboard.
        </p>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 max-w-6xl mx-auto">
        {menuItems.map((item, index) => (
          <Link
            to={item.path}
            key={index}
            className={`p-6 rounded-lg shadow-md text-center hover:scale-105 transition-transform ${
              darkMode ? 'bg-[#1F2937]' : 'bg-white'
            }`}
          >
            <span className="text-3xl block mb-2">{item.icon}</span>
            <h4 className={`text-sm font-semibold ${darkMode ? 'text-[#10B981]' : 'text-[#4F46E5]'}`}>
              {item.title}
            </h4>
          </Link>
        ))}
      </div>

      {/* Footer */}
<footer className={`mt-12 ${darkMode ? 'bg-[#1F2937] text-gray-300' : 'bg-[#4F46E5] text-white'} py-8`}>
  <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
    {/* About */}
    <div>
      <h4 className="text-lg font-semibold mb-2">🧾 About Civix</h4>
      <p className="text-sm">
        Civix is a secure and transparent digital voting platform built for Societies, NGOs, and Clubs to conduct fair elections.
      </p>
    </div>

    {/* Quick Links */}
    <div>
      <h4 className="text-lg font-semibold mb-2">🔗 Quick Links</h4>
      <ul className="space-y-1 text-sm">
        <li><Link to="/about" className="hover:underline">About Us</Link></li>
        <li><Link to="/contact" className="hover:underline">Contact Us</Link></li>
        <li><Link to="/support" className="hover:underline">Help & Support</Link></li>
        <li><Link to="/terms" className="hover:underline">Terms & Conditions</Link></li>
      </ul>
    </div>

    {/* Socials */}
    <div>
      <h4 className="text-lg font-semibold mb-2">📱 Connect With Us</h4>
      <div className="flex justify-center md:justify-start gap-4 text-2xl">
        <a href="#" aria-label="Facebook" className="hover:scale-110 transition-transform">
          🌐
        </a>
        <a href="#" aria-label="Twitter" className="hover:scale-110 transition-transform">
          🐦
        </a>
        <a href="#" aria-label="Instagram" className="hover:scale-110 transition-transform">
          📸
        </a>
        <a href="#" aria-label="Email" className="hover:scale-110 transition-transform">
          ✉️
        </a>
      </div>
    </div>
  </div>

  {/* Bottom Strip */}
  <div className="mt-6 text-center text-sm border-t border-gray-500 pt-4">
    <p>© {new Date().getFullYear()} Civix - Community Voting Portal. All rights reserved.</p>
  </div>
</footer>

    </div>
  );
};

export default HomePage;
