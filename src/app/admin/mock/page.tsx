 'use client';
 
 import { useState } from 'react';
 import { SalesDashboard } from '@/components/admin/sales-dashboard';
 import { TrafficMonitor } from '@/components/admin/traffic-monitor';
 import { StockAlerts } from '@/components/admin/stock-alerts';
 import { Package, LayoutDashboard, Activity, BarChart3 } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
 
 type MockTab = 'dashboard' | 'analytics' | 'monitoring' | 'stock';
 
 export default function AdminMockPage() {
   const [activeTab, setActiveTab] = useState<MockTab>('dashboard');
  const { t } = useTranslation();
 
  const tabs = [
    { id: 'dashboard' as MockTab, label: t('admin.dashboard'), icon: LayoutDashboard },
    { id: 'analytics' as MockTab, label: t('admin.analytics'), icon: BarChart3 },
    { id: 'monitoring' as MockTab, label: t('admin.monitoring'), icon: Activity },
    { id: 'stock' as MockTab, label: t('admin.stockAlerts') || 'Stock Alerts', icon: Package },
  ];
 
   return (
     <main className="min-h-screen bg-background">
       <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 max-w-7xl">
         <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">{t('admin.title')}</h1>
          <p className="text-sm text-zinc-400">{t('admin.subtitle')}</p>
         </div>
 
         <div className="mb-6 overflow-x-auto">
           <div className="inline-flex items-center gap-2 p-1 rounded-2xl border border-zinc-800/80 bg-card/50">
             {tabs.map(({ id, label, icon: Icon }) => (
               <button
                 key={id}
                 onClick={() => setActiveTab(id)}
                 className={`px-3 sm:px-4 py-2 rounded-xl text-sm transition-colors flex items-center gap-2 ${
                   activeTab === id ? 'bg-secondary border border-amber-500/30 text-white' : 'text-zinc-300 hover:bg-secondary'
                 }`}
               >
                 <Icon className="w-4 h-4 text-amber-400" />
                 {label}
               </button>
             ))}
           </div>
         </div>
 
         {activeTab === 'dashboard' && (
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
             <div className="p-4 sm:p-6 rounded-2xl border border-zinc-800/80 bg-card/50 backdrop-blur-sm">
               <div className="flex items-center gap-2 mb-6">
                 <BarChart3 className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg sm:text-xl font-semibold">{t('admin.analytics')}</h2>
               </div>
               <SalesDashboard />
             </div>
             <div className="p-4 sm:p-6 rounded-2xl border border-zinc-800/80 bg-card/50 backdrop-blur-sm">
               <div className="flex items-center gap-2 mb-6">
                 <Activity className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg sm:text-xl font-semibold">{t('admin.monitoring')}</h2>
               </div>
               <TrafficMonitor />
             </div>
             <div className="p-4 sm:p-6 rounded-2xl border border-zinc-800/80 bg-card/50 backdrop-blur-sm lg:col-span-2">
               <div className="flex items-center gap-2 mb-6">
                 <Package className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg sm:text-xl font-semibold">{t('admin.stockAlerts') || 'Stock Alerts'}</h2>
               </div>
               <StockAlerts />
             </div>
           </div>
         )}
 
         {activeTab === 'analytics' && (
           <div className="p-4 sm:p-6 rounded-2xl border border-zinc-800/80 bg-card/50 backdrop-blur-sm">
             <SalesDashboard />
           </div>
         )}
 
         {activeTab === 'monitoring' && (
           <div className="p-4 sm:p-6 rounded-2xl border border-zinc-800/80 bg-card/50 backdrop-blur-sm">
             <TrafficMonitor />
           </div>
         )}
 
         {activeTab === 'stock' && (
           <div className="p-4 sm:p-6 rounded-2xl border border-zinc-800/80 bg-card/50 backdrop-blur-sm">
             <StockAlerts />
           </div>
         )}
       </div>
     </main>
   );
 }
