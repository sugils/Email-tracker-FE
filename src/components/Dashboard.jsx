// import React, { useState, useEffect } from 'react';
// import { dashboardService } from '../services/api';
// import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// import { Mail, Users, FileText, Send, Inbox, Eye, MousePointer, MessageCircle, ArrowUp, ArrowDown, Calendar, Clock, RefreshCw, AlertCircle, CheckCircle, XCircle, MoreHorizontal } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';

// const Dashboard = () => {
//   const [isLoading, setIsLoading] = useState(true);
//   const [dashboardData, setDashboardData] = useState(null);
//   const [error, setError] = useState(null);
  
//   const fetchDashboardData = async () => {
//     setIsLoading(true);
//     try {
//       const data = await dashboardService.getDashboardData();
//       setDashboardData(data);
//       setError(null);
//     } catch (err) {
//       setError('Failed to load dashboard data. Please try again.');
//       console.error('Dashboard fetch error:', err);
//     } finally {
//       setIsLoading(false);
//     }
//   };
  
//   useEffect(() => {
//     fetchDashboardData();
//   }, []);
  
//   // Animation variants
//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: { 
//       opacity: 1,
//       transition: { 
//         when: "beforeChildren",
//         staggerChildren: 0.1
//       }
//     }
//   };
  
//   const cardVariants = {
//     hidden: { y: 20, opacity: 0 },
//     visible: { 
//       y: 0, 
//       opacity: 1,
//       transition: { type: "spring", stiffness: 100 }
//     }
//   };
  
//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-screen bg-gray-50">
//         <div className="text-center">
//           <motion.div 
//             animate={{ rotate: 360 }}
//             transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
//             className="mx-auto"
//           >
//             <RefreshCw size={40} className="text-blue-500" />
//           </motion.div>
//           <p className="mt-4 text-lg text-gray-600">Loading dashboard data...</p>
//         </div>
//       </div>
//     );
//   }
  
//   if (error) {
//     return (
//       <div className="flex items-center justify-center h-screen bg-gray-50">
//         <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
//           <div className="text-red-500 mb-4">
//             <AlertCircle className="h-16 w-16 mx-auto" />
//           </div>
//           <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Dashboard</h2>
//           <p className="text-gray-600 mb-4">{error}</p>
//           <button 
//             onClick={fetchDashboardData}
//             className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }
  
//   // Prepare data for charts
//   const campaignPerformanceData = dashboardData.campaign_stats.map(campaign => ({
//     name: campaign.campaign_name.length > 15 
//       ? campaign.campaign_name.substring(0, 15) + '...' 
//       : campaign.campaign_name,
//     openRate: Math.round(campaign.open_rate),
//     clickRate: Math.round(campaign.click_rate),
//     replyRate: Math.round(campaign.reply_rate)
//   }));
  
//   // Create monthly trend data based on campaign stats
//   const campaignsByMonth = {};
//   dashboardData.campaign_stats.forEach(campaign => {
//     const sentDate = new Date(campaign.sent_at);
//     const monthYear = `${sentDate.getMonth() + 1}/${sentDate.getFullYear()}`;
    
//     if (!campaignsByMonth[monthYear]) {
//       campaignsByMonth[monthYear] = {
//         campaigns: 0,
//         opened: 0,
//         clicked: 0,
//         replied: 0,
//         sent: 0
//       };
//     }
    
//     campaignsByMonth[monthYear].campaigns += 1;
//     campaignsByMonth[monthYear].opened += campaign.opened_count;
//     campaignsByMonth[monthYear].clicked += campaign.clicked_count;
//     campaignsByMonth[monthYear].replied += campaign.replied_count;
//     campaignsByMonth[monthYear].sent += campaign.sent_count;
//   });
  
//   const trendData = Object.keys(campaignsByMonth).map(month => {
//     const data = campaignsByMonth[month];
//     return {
//       name: month,
//       openRate: data.sent ? Math.round((data.opened / data.sent) * 100) : 0,
//       clickRate: data.sent ? Math.round((data.clicked / data.sent) * 100) : 0,
//       replyRate: data.sent ? Math.round((data.replied / data.sent) * 100) : 0
//     };
//   });
  
//   const stats = dashboardData.overall_stats;
  
//   return (
//     <motion.div 
//       className="p-6 bg-gray-50 min-h-screen"
//       variants={containerVariants}
//       initial="hidden"
//       animate="visible"
//     >
//       <header className="mb-8">
//         <motion.h1 
//           className="text-3xl font-bold text-gray-800"
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.2 }}
//         >
//           Email Campaign Dashboard
//         </motion.h1>
//         <motion.p 
//           className="text-gray-600 mt-1"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.3 }}
//         >
//           Overview of your email campaign performance
//         </motion.p>
//       </header>
      
//       {/* Key metrics */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//         <motion.div 
//           className="bg-white rounded-lg shadow p-6 transition-all duration-200 hover:shadow-lg"
//           variants={cardVariants}
//           whileHover={{ scale: 1.02 }}
//         >
//           <div className="flex items-center">
//             <div className="bg-blue-100 p-3 rounded-lg">
//               <Mail className="text-blue-600" size={24} />
//             </div>
//             <div className="ml-4">
//               <p className="text-sm font-medium text-gray-500">Campaigns</p>
//               <p className="text-2xl font-bold text-gray-800">{dashboardData.counts.campaigns}</p>
//             </div>
//           </div>
//         </motion.div>
        
//         <motion.div 
//           className="bg-white rounded-lg shadow p-6 transition-all duration-200 hover:shadow-lg"
//           variants={cardVariants}
//           whileHover={{ scale: 1.02 }}
//         >
//           <div className="flex items-center">
//             <div className="bg-green-100 p-3 rounded-lg">
//               <Users className="text-green-600" size={24} />
//             </div>
//             <div className="ml-4">
//               <p className="text-sm font-medium text-gray-500">Recipients</p>
//               <p className="text-2xl font-bold text-gray-800">{dashboardData.counts.recipients}</p>
//             </div>
//           </div>
//         </motion.div>
        
//         <motion.div 
//           className="bg-white rounded-lg shadow p-6 transition-all duration-200 hover:shadow-lg"
//           variants={cardVariants}
//           whileHover={{ scale: 1.02 }}
//         >
//           <div className="flex items-center">
//             <div className="bg-purple-100 p-3 rounded-lg">
//               <FileText className="text-purple-600" size={24} />
//             </div>
//             <div className="ml-4">
//               <p className="text-sm font-medium text-gray-500">Templates</p>
//               <p className="text-2xl font-bold text-gray-800">{dashboardData.counts.templates}</p>
//             </div>
//           </div>
//         </motion.div>
        
//         <motion.div 
//           className="bg-white rounded-lg shadow p-6 transition-all duration-200 hover:shadow-lg"
//           variants={cardVariants}
//           whileHover={{ scale: 1.02 }}
//         >
//           <div className="flex items-center">
//             <div className="bg-amber-100 p-3 rounded-lg">
//               <Send className="text-amber-600" size={24} />
//             </div>
//             <div className="ml-4">
//               <p className="text-sm font-medium text-gray-500">Emails Sent</p>
//               <p className="text-2xl font-bold text-gray-800">{dashboardData.counts.emails_sent}</p>
//             </div>
//           </div>
//         </motion.div>
//       </div>
      
//       {/* Detailed metrics */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//         <motion.div 
//           className="bg-white rounded-lg shadow p-6"
//           variants={cardVariants}
//         >
//           <h2 className="text-lg font-bold text-gray-800 mb-4">Email Performance</h2>
//           <div className="grid grid-cols-3 gap-4 mb-6">
//             <div className="text-center">
//               <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-2">
//                 <Eye className="text-blue-600" size={20} />
//               </div>
//               <p className="text-2xl font-bold text-gray-800">{stats.open_rate.toFixed(1)}%</p>
//               <p className="text-sm text-gray-500">Open Rate</p>
//             </div>
//             <div className="text-center">
//               <div className="inline-flex items-center justify-center p-3 bg-green-100 rounded-full mb-2">
//                 <MousePointer className="text-green-600" size={20} />
//               </div>
//               <p className="text-2xl font-bold text-gray-800">{stats.click_rate.toFixed(1)}%</p>
//               <p className="text-sm text-gray-500">Click Rate</p>
//             </div>
//             <div className="text-center">
//               <div className="inline-flex items-center justify-center p-3 bg-amber-100 rounded-full mb-2">
//                 <MessageCircle className="text-amber-600" size={20} />
//               </div>
//               <p className="text-2xl font-bold text-gray-800">{stats.reply_rate.toFixed(1)}%</p>
//               <p className="text-sm text-gray-500">Reply Rate</p>
//             </div>
//           </div>
//           <div className="h-64">
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart data={campaignPerformanceData} margin={{ top: 10, right: 10, left: 0, bottom: 30 }}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
//                 <YAxis />
//                 <Tooltip />
//                 <Legend />
//                 <Bar dataKey="openRate" name="Open Rate %" fill="#3B82F6" />
//                 <Bar dataKey="clickRate" name="Click Rate %" fill="#10B981" />
//                 <Bar dataKey="replyRate" name="Reply Rate %" fill="#F59E0B" />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         </motion.div>
        
//         <motion.div 
//           className="bg-white rounded-lg shadow p-6"
//           variants={cardVariants}
//         >
//           <h2 className="text-lg font-bold text-gray-800 mb-4">Performance Trend</h2>
//           <div className="h-80">
//             <ResponsiveContainer width="100%" height="100%">
//               <LineChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="name" />
//                 <YAxis />
//                 <Tooltip />
//                 <Legend />
//                 <Line type="monotone" dataKey="openRate" name="Open Rate %" stroke="#3B82F6" activeDot={{ r: 8 }} />
//                 <Line type="monotone" dataKey="clickRate" name="Click Rate %" stroke="#10B981" />
//                 <Line type="monotone" dataKey="replyRate" name="Reply Rate %" stroke="#F59E0B" />
//               </LineChart>
//             </ResponsiveContainer>
//           </div>
//         </motion.div>
//       </div>
      
//       {/* Recent campaigns */}
//       <motion.div
//         className="bg-white rounded-lg shadow mb-8"
//         variants={cardVariants}
//       >
//         <div className="px-6 py-4 border-b border-gray-200">
//           <h2 className="text-lg font-bold text-gray-800">Recent Campaigns</h2>
//         </div>
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent</th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opened</th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Open Rate</th>
//                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {dashboardData.recent_campaigns.map((campaign) => (
//                 <motion.tr 
//                   key={campaign.campaign_id} 
//                   className="hover:bg-gray-50 transition-colors"
//                   initial={{ opacity: 0 }}
//                   animate={{ opacity: 1 }}
//                   transition={{ duration: 0.3 }}
//                 >
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="flex items-center">
//                       <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
//                         <Mail className="h-5 w-5 text-blue-600" />
//                       </div>
//                       <div className="ml-4">
//                         <div className="text-sm font-medium text-gray-900">{campaign.campaign_name}</div>
//                         <div className="text-sm text-gray-500">{new Date(campaign.created_at).toLocaleDateString()}</div>
//                       </div>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
//                       ${campaign.status === 'completed' ? 'bg-green-100 text-green-800' : 
//                         campaign.status === 'sending' ? 'bg-blue-100 text-blue-800' : 
//                         campaign.status === 'draft' ? 'bg-gray-100 text-gray-800' : 
//                         'bg-yellow-100 text-yellow-800'}`}>
//                       {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                     {campaign.status === 'completed' ? 
//                       (campaign.sent_at ? new Date(campaign.sent_at).toLocaleDateString() : 'N/A') : 
//                       'Not sent'}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     {campaign.status === 'completed' ? (
//                       <div className="flex items-center">
//                         <Eye className="h-4 w-4 text-blue-500 mr-1" />
//                         <span className="text-sm text-gray-900">
//                           {Math.round(campaign.stats?.open_rate || 0)}%
//                         </span>
//                       </div>
//                     ) : (
//                       <span className="text-sm text-gray-500">N/A</span>
//                     )}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     {campaign.status === 'completed' ? (
//                       <div className="w-full bg-gray-200 rounded-full h-2.5">
//                         <div 
//                           className="bg-blue-600 h-2.5 rounded-full" 
//                           style={{ width: `${Math.min(100, Math.round(campaign.stats?.open_rate || 0))}%` }}
//                         ></div>
//                       </div>
//                     ) : (
//                       <div className="w-full bg-gray-200 rounded-full h-2.5">
//                         <div className="bg-gray-400 h-2.5 rounded-full w-0"></div>
//                       </div>
//                     )}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                     <button className="text-indigo-600 hover:text-indigo-900 mr-3">View</button>
//                     <button className="text-gray-600 hover:text-gray-900">
//                       <MoreHorizontal className="h-5 w-5" />
//                     </button>
//                   </td>
//                 </motion.tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </motion.div>
      
//       {/* Recent Recipients and Activity */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <motion.div 
//           className="bg-white rounded-lg shadow"
//           variants={cardVariants}
//         >
//           <div className="px-6 py-4 border-b border-gray-200">
//             <h2 className="text-lg font-bold text-gray-800">Recent Recipients</h2>
//           </div>
//           <ul className="divide-y divide-gray-200">
//             {dashboardData.recent_recipients.map((recipient) => (
//               <li key={recipient.recipient_id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
//                 <div className="flex items-center">
//                   <div className="flex-shrink-0">
//                     <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
//                       {recipient.first_name ? recipient.first_name.charAt(0) : recipient.email.charAt(0).toUpperCase()}
//                     </div>
//                   </div>
//                   <div className="ml-4">
//                     <div className="text-sm font-medium text-gray-900">
//                       {recipient.first_name ? `${recipient.first_name} ${recipient.last_name || ''}` : 'Unknown Name'}
//                     </div>
//                     <div className="text-sm text-gray-500">{recipient.email}</div>
//                   </div>
//                   <div className="ml-auto">
//                     <span className="text-xs text-gray-500">
//                       Added {new Date(recipient.created_at).toLocaleDateString()}
//                     </span>
//                   </div>
//                 </div>
//               </li>
//             ))}
//           </ul>
//           <div className="px-6 py-4 border-t border-gray-200">
//             <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
//               View All Recipients →
//             </button>
//           </div>
//         </motion.div>
        
//         <motion.div 
//           className="bg-white rounded-lg shadow"
//           variants={cardVariants}
//         >
//           <div className="px-6 py-4 border-b border-gray-200">
//             <h2 className="text-lg font-bold text-gray-800">Email Activity</h2>
//           </div>
//           <div className="p-6">
//             <div className="space-y-6">
//               <div>
//                 <div className="flex items-center mb-2">
//                   <div className="w-full bg-gray-200 rounded-full h-2.5">
//                     <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${stats.open_rate.toFixed(1)}%` }}></div>
//                   </div>
//                   <span className="ml-4 text-sm font-medium text-gray-900">{stats.open_rate.toFixed(1)}%</span>
//                 </div>
//                 <div className="flex justify-between text-sm text-gray-500">
//                   <span>Opened</span>
//                   <span>{stats.total_opened} of {stats.total_sent}</span>
//                 </div>
//               </div>
              
//               <div>
//                 <div className="flex items-center mb-2">
//                   <div className="w-full bg-gray-200 rounded-full h-2.5">
//                     <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${stats.click_rate.toFixed(1)}%` }}></div>
//                   </div>
//                   <span className="ml-4 text-sm font-medium text-gray-900">{stats.click_rate.toFixed(1)}%</span>
//                 </div>
//                 <div className="flex justify-between text-sm text-gray-500">
//                   <span>Clicked</span>
//                   <span>{stats.total_clicked} of {stats.total_sent}</span>
//                 </div>
//               </div>
              
//               <div>
//                 <div className="flex items-center mb-2">
//                   <div className="w-full bg-gray-200 rounded-full h-2.5">
//                     <div className="bg-amber-600 h-2.5 rounded-full" style={{ width: `${stats.reply_rate.toFixed(1)}%` }}></div>
//                   </div>
//                   <span className="ml-4 text-sm font-medium text-gray-900">{stats.reply_rate.toFixed(1)}%</span>
//                 </div>
//                 <div className="flex justify-between text-sm text-gray-500">
//                   <span>Replied</span>
//                   <span>{stats.total_replied} of {stats.total_sent}</span>
//                 </div>
//               </div>
//             </div>
            
//             <div className="mt-8">
//               <h3 className="text-md font-medium text-gray-800 mb-4">Performance Summary</h3>
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="bg-blue-50 rounded-lg p-4">
//                   <div className="flex items-center">
//                     <div className="p-2 bg-blue-100 rounded">
//                       <ArrowUp className="text-blue-600 h-5 w-5" />
//                     </div>
//                     <div className="ml-3">
//                       <p className="text-sm font-medium text-gray-900">Best Campaign</p>
//                       <p className="text-xs text-gray-500">
//                         {dashboardData.campaign_stats.length > 0 ? 
//                           dashboardData.campaign_stats.reduce((best, current) => 
//                             current.open_rate > best.open_rate ? current : best
//                           ).campaign_name : 'No campaigns'}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
                
//                 <div className="bg-amber-50 rounded-lg p-4">
//                   <div className="flex items-center">
//                     <div className="p-2 bg-amber-100 rounded">
//                       <Calendar className="text-amber-600 h-5 w-5" />
//                     </div>
//                     <div className="ml-3">
//                       <p className="text-sm font-medium text-gray-900">Best Day</p>
//                       <p className="text-xs text-gray-500">
//                         {trendData.length > 0 ? 
//                           trendData.reduce((best, current) => 
//                             current.openRate > best.openRate ? current : best
//                           ).name : 'No data'}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </motion.div>
//       </div>
//     </motion.div>
//   );
// };

// export default Dashboard;


import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Mail, Users, FileText, Send, Inbox, Eye, MousePointer, MessageCircle, RefreshCw } from 'lucide-react';

// Sample data for demonstration since we don't have real API data
const sampleData = {
  counts: {
    campaigns: 12,
    recipients: 583,
    templates: 8,
    emails_sent: 3215
  },
  overall_stats: {
    total_sent: 3215,
    total_opened: 1875,
    total_clicked: 943,
    total_replied: 421,
    open_rate: 58.3,
    click_rate: 29.3,
    reply_rate: 13.1
  },
  campaign_stats: [
    {
      campaign_id: "1",
      name: "Sales Outreach Q2",
      sent_at: "2023-04-15T10:30:45Z",
      sent_count: 956,
      opened_count: 598,
      clicked_count: 312,
      replied_count: 143,
      open_rate: 62.6,
      click_rate: 32.6,
      reply_rate: 15.0
    },
    {
      campaign_id: "2",
      name: "Product Update Newsletter",
      sent_at: "2023-05-02T14:15:30Z",
      sent_count: 1245,
      opened_count: 732,
      clicked_count: 421,
      replied_count: 178,
      open_rate: 58.8,
      click_rate: 33.8,
      reply_rate: 14.3
    }
  ]
};

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Simulate API loading
    setTimeout(() => {
      try {
        // Use sample data instead of API call for now
        setDashboardData(sampleData);
        setError(null);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard load error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 1000);
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-10 w-10 text-blue-500 animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-red-600 mb-4">Error Loading Dashboard</h2>
        <p className="text-gray-700 mb-4">Failed to load dashboard data. Please try again.</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">No Dashboard Data</h2>
        <p className="text-gray-700">No data is available to display.</p>
      </div>
    );
  }
  
  const stats = dashboardData.overall_stats;
  
  return (
    <div className="space-y-6">
      {/* Simple Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Mail className="text-blue-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Campaigns</p>
              <p className="text-2xl font-bold text-gray-800">{dashboardData.counts.campaigns}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <Users className="text-green-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Recipients</p>
              <p className="text-2xl font-bold text-gray-800">{dashboardData.counts.recipients}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg">
              <FileText className="text-purple-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Templates</p>
              <p className="text-2xl font-bold text-gray-800">{dashboardData.counts.templates}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-amber-100 p-3 rounded-lg">
              <Send className="text-amber-600" size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Emails Sent</p>
              <p className="text-2xl font-bold text-gray-800">{dashboardData.counts.emails_sent}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Fallback text stats instead of charts */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Email Performance</h2>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-2">
              <Eye className="text-blue-600" size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.open_rate.toFixed(1)}%</p>
            <p className="text-sm text-gray-500">Open Rate</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-3 bg-green-100 rounded-full mb-2">
              <MousePointer className="text-green-600" size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.click_rate.toFixed(1)}%</p>
            <p className="text-sm text-gray-500">Click Rate</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-3 bg-amber-100 rounded-full mb-2">
              <MessageCircle className="text-amber-600" size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.reply_rate.toFixed(1)}%</p>
            <p className="text-sm text-gray-500">Reply Rate</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;