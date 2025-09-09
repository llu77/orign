"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  FileText, 
  ShoppingCart,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Activity,
  Target
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalRevenues: number;
  totalExpenses: number;
  netProfit: number;
  totalUsers: number;
  pendingRequests: number;
  totalRequests: number;
  recentActivities: Array<{
    id: string;
    type: 'revenue' | 'expense' | 'request';
    description: string;
    amount?: number;
    date: string;
    status: 'completed' | 'pending' | 'processing';
  }>;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenues: 0,
    totalExpenses: 0,
    netProfit: 0,
    totalUsers: 0,
    pendingRequests: 0,
    totalRequests: 0,
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch revenues
      const revenuesResponse = await fetch('/api/revenues', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const revenuesData = await revenuesResponse.json();
      
      // Fetch expenses
      const expensesResponse = await fetch('/api/expenses', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const expensesData = await expensesResponse.json();
      
      // Fetch requests
      const requestsResponse = await fetch('/api/requests', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const requestsData = await requestsResponse.json();

      const totalRevenues = revenuesData.revenues?.reduce((sum: number, r: any) => sum + r.amount, 0) || 0;
      const totalExpenses = expensesData.expenses?.reduce((sum: number, e: any) => sum + e.amount, 0) || 0;
      const pendingRequests = requestsData.requests?.filter((r: any) => r.status === 'pending').length || 0;
      const totalRequests = requestsData.requests?.length || 0;

      // Generate recent activities
      const activities = [
        ...(revenuesData.revenues?.slice(0, 3).map((r: any) => ({
          id: `rev-${r.id}`,
          type: 'revenue' as const,
          description: r.description || 'إيراد',
          amount: r.amount,
          date: r.date,
          status: 'completed' as const
        })) || []),
        ...(expensesData.expenses?.slice(0, 3).map((e: any) => ({
          id: `exp-${e.id}`,
          type: 'expense' as const,
          description: e.description || 'مصروف',
          amount: e.amount,
          date: e.date,
          status: 'completed' as const
        })) || []),
        ...(requestsData.requests?.slice(0, 3).map((r: any) => ({
          id: `req-${r.id}`,
          type: 'request' as const,
          description: r.title || 'طلب',
          date: r.created_at,
          status: r.status || 'pending' as const
        })) || [])
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);

      setStats({
        totalRevenues,
        totalExpenses,
        netProfit: totalRevenues - totalExpenses,
        totalUsers: 5, // Mock data
        pendingRequests,
        totalRequests,
        recentActivities: activities
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getActivityIcon = (type: string, status: string) => {
    switch (type) {
      case 'revenue':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'expense':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'request':
        return status === 'completed' ? 
          <CheckCircle className="h-4 w-4 text-green-600" /> :
          status === 'pending' ?
          <Clock className="h-4 w-4 text-yellow-600" /> :
          <Activity className="h-4 w-4 text-blue-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">مكتمل</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">قيد الانتظار</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">قيد المعالجة</Badge>;
      default:
        return <Badge variant="outline">غير محدد</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">أهلاً بك في نظام سهل المالي {user?.name}!</h1>
            <p className="text-blue-100 text-lg">
              إدارة شاملة للإيرادات والمصروفات والطلبات
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <div className="text-sm text-blue-100">صافي الربح</div>
              <div className={`text-2xl font-bold ${stats.netProfit >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                {formatCurrency(stats.netProfit)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-4">
        <Link href="/revenues">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">إضافة إيراد</p>
                  <p className="text-2xl font-bold text-green-600">+</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/expenses">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-red-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">إضافة مصروف</p>
                  <p className="text-2xl font-bold text-red-600">+</p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/requests">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">الطلبات</p>
                  <p className="text-2xl font-bold text-blue-600">+</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/reports">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">التقارير</p>
                  <p className="text-2xl font-bold text-purple-600">📊</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalRevenues)}</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span>+12.5% من الشهر الماضي</span>
            </div>
          </CardContent>
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-100 rounded-full -mr-10 -mt-10 opacity-20"></div>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المصروفات</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalExpenses)}</div>
            <div className="flex items-center text-xs text-red-600 mt-1">
              <ArrowDownRight className="h-3 w-3 mr-1" />
              <span>+8.2% من الشهر الماضي</span>
            </div>
          </CardContent>
          <div className="absolute top-0 right-0 w-20 h-20 bg-red-100 rounded-full -mr-10 -mt-10 opacity-20"></div>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">صافي الربح</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(stats.netProfit)}
            </div>
            <div className={`flex items-center text-xs mt-1 ${stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.netProfit >= 0 ? 
                <ArrowUpRight className="h-3 w-3 mr-1" /> : 
                <ArrowDownRight className="h-3 w-3 mr-1" />
              }
              <span>{stats.netProfit >= 0 ? 'إيجابي' : 'سلبي'}</span>
            </div>
          </CardContent>
          <div className={`absolute top-0 right-0 w-20 h-20 rounded-full -mr-10 -mt-10 opacity-20 ${stats.netProfit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}></div>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الطلبات المعلقة</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingRequests}</div>
            <div className="flex items-center text-xs text-yellow-600 mt-1">
              <AlertCircle className="h-3 w-3 mr-1" />
              <span>تحتاج للموافقة</span>
            </div>
          </CardContent>
          <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-100 rounded-full -mr-10 -mt-10 opacity-20"></div>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="ml-2 h-5 w-5" />
            آخر الأنشطة
          </CardTitle>
          <CardDescription="آخر التحديثات في النظام</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentActivities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                لا توجد أنشطة حديثة
              </div>
            ) : (
              stats.recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getActivityIcon(activity.type, activity.status)}
                    </div>
                    <div>
                      <p className="font-medium">{activity.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(activity.date).toLocaleDateString('ar-SA', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {activity.amount && (
                      <span className={`font-medium ${
                        activity.type === 'revenue' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(activity.amount)}
                      </span>
                    )}
                    {getStatusBadge(activity.status)}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}