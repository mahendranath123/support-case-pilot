// src/App.tsx

import React from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';

import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';
import { Insert } from '@/components/Insert'; // ← Import your new Insert page

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,   // 5 minutes
      cacheTime: 1000 * 60 * 10,  // 10 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          {/* 
            1) “Toaster” is our Radix/utility toaster. 
            2) “SonnerToaster” is the Sonner‐styled toaster.
          */}
          <Toaster />
          <SonnerToaster />

          <BrowserRouter>
            <Routes>
              {/*
                "/" renders <Index />, which itself shows:
                  • <LoginForm /> if not logged in, or 
                  • <Dashboard> (with nested routes) if logged in.
              */}
              <Route path="/" element={<Index />} />

              {/*
                We also want to allow a direct bookmark of "/insert"—
                for example if an admin pastes /insert into the address bar.
                So we register "/insert" here as well.
              */}
              <Route path="/insert" element={<Insert />} />

              {/*
                Catch‐all 404
              */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

