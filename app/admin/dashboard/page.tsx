"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Package, 
  ShoppingBag, 
  DollarSign, 
  TrendingUp, 
  Users,
  Clock,
  CheckCircle
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import CounterAnimation from "@/components/CounterAnimation";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });

  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [unanswered, setUnanswered] = useState<any[]>([]);
  const [answered, setAnswered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const prepareChartData = (orders: any[]) => {
    // Revenue chart (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    });

    const revenueByDay = last7Days.map(date => {
      const dayOrders = orders.filter((o: any) => {
        const orderDate = new Date(o.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
        return orderDate === date && o.status === 'delivered';
      });
      return dayOrders.reduce((sum: number, o: any) => sum + parseFloat(o.final_amount || 0), 0);
    });

    // Orders chart (last 7 days)
    const ordersByDay = last7Days.map(date => {
      return orders.filter((o: any) => {
        const orderDate = new Date(o.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
        return orderDate === date;
      }).length;
    });

    // Status distribution
    const statusCounts = {
      pending: orders.filter((o: any) => o.status === 'pending').length,
      processing: orders.filter((o: any) => o.status === 'processing').length,
      shipped: orders.filter((o: any) => o.status === 'shipped').length,
      delivered: orders.filter((o: any) => o.status === 'delivered').length,
      cancelled: orders.filter((o: any) => o.status === 'cancelled').length,
    };

    setChartData({
      revenueChart: {
        labels: last7Days,
        datasets: [
          {
            label: 'Doanh thu (VNĐ)',
            data: revenueByDay,
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            tension: 0.4,
            fill: true,
          },
        ],
      },
      ordersChart: {
        labels: last7Days,
        datasets: [
          {
            label: 'Số đơn hàng',
            data: ordersByDay,
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderRadius: 8,
          },
        ],
      },
      statusChart: {
        labels: ['Chờ xử lý', 'Đang xử lý', 'Đang giao', 'Đã giao', 'Đã hủy'],
        datasets: [
          {
            data: [
              statusCounts.pending,
              statusCounts.processing,
              statusCounts.shipped,
              statusCounts.delivered,
              statusCounts.cancelled,
            ],
            backgroundColor: [
              'rgba(234, 179, 8, 0.8)',
              'rgba(59, 130, 246, 0.8)',
              'rgba(168, 85, 247, 0.8)',
              'rgba(34, 197, 94, 0.8)',
              'rgba(239, 68, 68, 0.8)',
            ],
            borderWidth: 2,
            borderColor: '#fff',
          },
        ],
      },
    });
  };

  const fetchDashboardData = async () => {
    try {
      const supabase = createClient();

      // Fetch users using API route (requires Service Role Key)
      const usersResponse = await fetch('/api/admin/users');
      let users: any[] = [];
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        users = usersData.users || [];
      }

      const [productsResult, ordersResult, unansweredQs, answeredQs] = await Promise.all([
        supabase.from('products').select('id').eq('status', 'active'),
        supabase.from('orders').select('*'),
        supabase.from('questions').select('id,name,content,created_at').is('answered_at', null).order('created_at', { ascending: false }).limit(5),
        supabase.from('questions').select('id,name,content,answered_at').not('answered_at', 'is', null).order('answered_at', { ascending: false }).limit(5),
      ]);

      const products = productsResult.data || [];
      const orders = ordersResult.data || [];

      const totalRevenue = orders
        .filter((o: any) => o.status === 'delivered')
        .reduce((sum: number, o: any) => sum + parseFloat(o.final_amount || 0), 0);

      const pendingOrders = orders.filter((o: any) => o.status === 'pending').length;
      const completedOrders = orders.filter((o: any) => o.status === 'delivered').length;

      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        totalRevenue,
        totalUsers: users.length,
        pendingOrders,
        completedOrders,
      });

      setRecentOrders(orders.slice(0, 10));
      setUnanswered((unansweredQs.data || []).map((q: any) => ({
        id: q.id,
        user: q.name || 'Khách',
        content: q.content,
        time: new Date(q.created_at).toLocaleDateString('vi-VN')
      })));
      setAnswered((answeredQs.data || []).map((q: any) => ({
        id: q.id,
        user: q.name || 'Khách',
        content: q.content,
        time: new Date(q.answered_at).toLocaleDateString('vi-VN')
      })));

      // Prepare chart data
      prepareChartData(orders);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const statsCards = [
    {
      icon: Package,
      label: "Tổng sản phẩm",
      value: stats.totalProducts,
      color: "blue",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      icon: ShoppingBag,
      label: "Tổng đơn hàng",
      value: stats.totalOrders,
      color: "purple",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      icon: DollarSign,
      label: "Doanh thu",
      value: new Intl.NumberFormat('vi-VN').format(stats.totalRevenue),
      color: "green",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      icon: Users,
      label: "Tổng người dùng",
      value: stats.totalUsers,
      color: "orange",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
    },
  ];

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const statusLabels: Record<string, string> = {
    pending: 'Chờ xử lý',
    processing: 'Đang xử lý',
    shipped: 'Đang giao',
    delivered: 'Đã giao',
    cancelled: 'Đã hủy',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tổng quan</h1>
          <p className="text-gray-600 mt-1">Chào mừng trở lại, Admin!</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
              </div>
              <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
              <div className="text-2xl font-bold text-gray-900 mt-2">
                {typeof stat.value === 'number' ? (
                  <CounterAnimation value={stat.value} />
                ) : (
                  <CounterAnimation value={stat.value} />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Đơn hàng gần đây</h2>
            <a href="/admin/orders" className="text-sm text-sky-600 hover:text-sky-700 font-medium">
              Xem tất cả →
            </a>
          </div>

          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ShoppingBag className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Chưa có đơn hàng</p>
              </div>
            ) : (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900">#{order.order_number}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                        {statusLabels[order.status]}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{order.full_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      {new Intl.NumberFormat('vi-VN').format(order.final_amount)}đ
                    </p>
                    <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-4">Thống kê nhanh</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Đơn hàng chờ xử lý</p>
                  <p className="text-xl font-bold text-gray-900">
                    <CounterAnimation value={stats.pendingOrders} />
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Đơn hàng đã hoàn thành</p>
                  <p className="text-xl font-bold text-gray-900">
                    <CounterAnimation value={stats.completedOrders} />
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tỷ lệ hoàn thành</p>
                  <p className="text-xl font-bold text-gray-900">
                    {stats.totalOrders > 0 ? (
                      <CounterAnimation 
                        value={Math.round((stats.completedOrders / stats.totalOrders) * 100)} 
                      />
                    ) : (
                      0
                    )}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Câu hỏi chưa trả lời</h2>
            <a href="/admin/contacts" className="text-sm text-sky-600 hover:text-sky-700 font-medium">Xem tất cả →</a>
          </div>
          <div className="space-y-3">
            {unanswered.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Không có câu hỏi chờ trả lời</p>
              </div>
            ) : (
              unanswered.map((q) => (
                <div key={q.id} className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-gray-900">{q.user}</p>
                  <p className="text-sm text-gray-700 line-clamp-2">{q.content}</p>
                  <p className="text-xs text-gray-500 mt-1">{q.time}</p>
                </div>
              ))
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Câu hỏi đã trả lời</h2>
            <a href="/admin/contacts" className="text-sm text-sky-600 hover:text-sky-700 font-medium">Xem tất cả →</a>
          </div>
          <div className="space-y-3">
            {answered.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Chưa có câu trả lời</p>
              </div>
            ) : (
              answered.map((q) => (
                <div key={q.id} className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-gray-900">{q.user}</p>
                  <p className="text-sm text-gray-700 line-clamp-2">{q.content}</p>
                  <p className="text-xs text-gray-500 mt-1">{q.time}</p>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

