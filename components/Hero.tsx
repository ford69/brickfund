'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingUp, Shield, Users, Search, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.6, -0.05, 0.01, 0.99],
      },
    },
  };

  const buttonVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15,
        delay: 0.5,
      },
    },
    hover: {
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10,
      },
    },
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15,
      },
    },
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80)',
          }}
        >
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 to-purple-900/30" />
        </div>
        
        {/* Animated Background Elements */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        >
          <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400 rounded-full blur-sm animate-pulse" />
          <div className="absolute top-40 right-20 w-3 h-3 bg-purple-400 rounded-full blur-sm animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-40 left-1/4 w-2 h-2 bg-cyan-400 rounded-full blur-sm animate-pulse" style={{ animationDelay: '2s' }} />
        </motion.div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
        <motion.div
          className="text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Main Heading */}
          <motion.h1
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight"
            variants={itemVariants}
          >
            Building Wealth,{' '}
            <motion.span
              className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              Brick by Brick
            </motion.span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            className="text-xl sm:text-2xl text-gray-200 mb-10 max-w-4xl mx-auto leading-relaxed font-light"
            variants={itemVariants}
          >
            Democratize real estate investing. Fund verified property projects with as little as $100 
            and earn returns while developers build the future.
          </motion.p>

          {/* Search Bar (Modern Real Estate Pattern) */}
          <motion.div
            className="max-w-4xl mx-auto mb-12"
            variants={itemVariants}
          >
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-2 flex flex-col md:flex-row gap-2">
              <div className="flex-1 flex items-center px-4 py-3 border-r border-gray-200">
                <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                <input
                  type="text"
                  placeholder="Search by location, project type..."
                  className="flex-1 outline-none text-gray-700 placeholder-gray-400"
                />
              </div>
              <div className="flex items-center px-4 py-3 border-r border-gray-200">
                <select className="outline-none text-gray-700 bg-transparent">
                  <option>All Types</option>
                  <option>Residential</option>
                  <option>Commercial</option>
                  <option>Mixed-Use</option>
                </select>
              </div>
              <Link href="/projects" className="flex-shrink-0">
                <Button className="w-full md:w-auto bg-blue-700 hover:bg-blue-800 text-white px-8 py-3 h-full">
                  <Search className="mr-2 h-5 w-5" />
                  Search Projects
                </Button>
              </Link>
            </div>
          </motion.div>
          
          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            variants={itemVariants}
          >
            <motion.div variants={buttonVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/projects">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-6 text-lg shadow-lg shadow-blue-500/50">
                  Start Investing
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
            <motion.div variants={buttonVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/list-project">
                <Button size="lg" variant="outline" className="px-10 py-6 text-lg bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/20">
                  List Your Project
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Feature Icons */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
            variants={containerVariants}
          >
            <motion.div
              className="flex items-center justify-center space-x-4 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-colors"
              variants={iconVariants}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <motion.div
                className="bg-blue-500/20 p-4 rounded-xl backdrop-blur-sm border border-blue-400/30"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Shield className="h-8 w-8 text-blue-300" />
              </motion.div>
              <div className="text-left">
                <p className="font-semibold text-white text-lg">Secure & Verified</p>
                <p className="text-sm text-gray-300">KYC verified projects only</p>
              </div>
            </motion.div>
            
            <motion.div
              className="flex items-center justify-center space-x-4 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-colors"
              variants={iconVariants}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <motion.div
                className="bg-green-500/20 p-4 rounded-xl backdrop-blur-sm border border-green-400/30"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <TrendingUp className="h-8 w-8 text-green-300" />
              </motion.div>
              <div className="text-left">
                <p className="font-semibold text-white text-lg">High Returns</p>
                <p className="text-sm text-gray-300">8-15% projected ROI</p>
              </div>
            </motion.div>
            
            <motion.div
              className="flex items-center justify-center space-x-4 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-colors"
              variants={iconVariants}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <motion.div
                className="bg-purple-500/20 p-4 rounded-xl backdrop-blur-sm border border-purple-400/30"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Users className="h-8 w-8 text-purple-300" />
              </motion.div>
              <div className="text-left">
                <p className="font-semibold text-white text-lg">Community Driven</p>
                <p className="text-sm text-gray-300">Join 50,000+ investors</p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <motion.div
          className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.div
            className="w-1.5 h-3 bg-white/70 rounded-full mt-2"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}