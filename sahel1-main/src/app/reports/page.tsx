"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Download,
  RefreshCw,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Activity,
  PieChart as PieChartIcon,
  BarChart3,
  TrendingUp as TrendingIcon,
  Clock,
  Users,
  FileText,
  Zap,
  Eye
} from 'lucide-react';
import Link from 'next/link';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ar } from 'date-fns/locale';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#FF6B6B', '#4ECDC4'];

interface FinancialReport {
  totalRevenues: number;
  totalExpenses: number;
  netProfit: number;
  revenuesByCategory: { category: string; amount: number }[];
  expensesByCategory: { category: string; amount: number }[];
  monthlyTrends: { month: string; revenue: number; expense: number }[];
  topRevenues: { description: string; amount: number; date: string }[];
  topExpenses: { description: string; amount: number; date: string }[];
}

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = "blue" }: { 
  title: string; 
  value: string; 
  icon: React.ElementType;
  trend?: 'up' | 'down';
  trendValue?: string;
  color?: string;
}) => {
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    red: "bg-red-500",
    purple: "bg-purple-500",
    yellow: "bg-yellow-500"
  };

  return (
    <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-gray-800">{value}</div>
        {trend && trendValue && (
          <div className="flex items-center space-x-1 text-xs mt-2">
            {trend === 'up' ? (
              <ArrowUpRight className="h-3 w-3 text-green-600" />
            ) : (
              <ArrowDownRight className="h-3 w-3 text-red-600" />
            )}
            <span className={trend === 'up' ? 'text-green-600' : 'text-red-600'}>
              {trendValue}
            </span>
          </div>
        )}
      </CardContent>
      <div className="absolute top-0 right-0 w-20 h-20 bg-gray-100 rounded-full -mr-10 -mt-10 opacity-10"></div>
    </Card>
  );
};

export default function ReportsPage() {
  const { toast } = useToast();
  const [report, setReport] = useState<FinancialReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState('this-month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const fetchReport = async () => {
    setLoading(true);
    try {
      let startDate = '';
      let endDate = '';
      
      const today = new Date();
      
      switch (dateRange) {
        case 'this-month':
          startDate = startOfMonth(today).toISOString().split('T')[0];
          endDate = endOfMonth(today).toISOString().split('T')[0];
          break;
        case 'last-month':
          const lastMonth = subMonths(today, 1);
          startDate = startOfMonth(lastMonth).toISOString().split('T')[0];
          endDate = endOfMonth(lastMonth).toISOString().split('T')[0];
          break;
        case 'last-3-months':
          startDate = startOfMonth(subMonths(today, 3)).toISOString().split('T')[0];
          endDate = endOfMonth(today).toISOString().split('T')[0];
          break;
        case 'this-year':
          startDate = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
          endDate = new Date(today.getFullYear(), 11, 31).toISOString().split('T')[0];
          break;
        case 'custom':
          startDate = customStartDate;
          endDate = customEndDate;
          break;
      }

      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`/api/reports?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setReport(data);
      } else {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "فشل في جلب التقرير",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ في الاتصال بالخادم",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [dateRange, customStartDate, customEndDate]);

  const exportReport = () => {
    if (!report) return;
    
    const csvContent = [
      ['النوع', 'الوصف', 'المبلغ', 'التاريخ'],
      ...report.topRevenues.map(r => ['إيراد', r.description, r.amount.toString(), r.date]),
      ...report.topExpenses.map(e => ['مصروف', e.description, e.amount.toString(), e.date])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `تقرير-مالي-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading && !report) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل التقارير...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">التقارير المالية</h1>
            <p className="text-purple-100 text-lg">تحليل شامل للأداء المالي</p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <div className="text-sm text-purple-100">آخر تحديث</div>
              <div className="text-lg font-semibold">
                {new Date().toLocaleDateString('ar-SA', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg">
          <Link href="/reports/advanced">
            <Zap className="ml-2 h-4 w-4" />
            التقارير المتقدمة
          </Link>
        </Button>
        <Button onClick={exportReport} className="bg-green-600 hover:bg-green-700 text-white shadow-lg">
          <Download className="ml-2 h-4 w-4" />
          تصدير التقرير
        </Button>
        <Button onClick={fetchReport} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
          <RefreshCw className={`ml-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'جاري التحديث...' : 'تحديث البيانات'}
        </Button>
      </div>

      {/* Date Range Filter */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <Filter className="ml-2 h-5 w-5 text-purple-600" />
            فلترة التاريخ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[200px] h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this-month">هذا الشهر</SelectItem>
                <SelectItem value="last-month">الشهر الماضي</SelectItem>
                <SelectItem value="last-3-months">آخر 3 أشهر</SelectItem>
                <SelectItem value="this-year">هذه السنة</SelectItem>
                <SelectItem value="custom">مخصص</SelectItem>
              </SelectContent>
            </Select>
            
            {dateRange === 'custom' && (
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-[150px] h-12"
                />
                <span className="text-gray-600">إلى</span>
                <Input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-[150px] h-12"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {report && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="إجمالي الإيرادات" 
            value={formatCurrency(report.totalRevenues)} 
            icon={TrendingUp}
            trend="up"
            trendValue="+12.5%"
            color="green"
          />
          <StatCard 
            title="إجمالي المصروفات" 
            value={formatCurrency(report.totalExpenses)} 
            icon={TrendingDown}
            trend="down"
            trendValue="+8.2%"
            color="red"
          />
          <StatCard 
            title="صافي الربح" 
            value={formatCurrency(report.netProfit)} 
            icon={Target}
            trend={report.netProfit >= 0 ? 'up' : 'down'}
            color={report.netProfit >= 0 ? "green" : "red"}
          />
          <StatCard 
            title="معدل الربح" 
            value={`${report.totalRevenues > 0 ? ((report.netProfit / report.totalRevenues) * 100).toFixed(1) : 0}%`} 
            icon={Activity}
            trend={report.netProfit >= 0 ? 'up' : 'down'}
            color="purple"
          />
        </div>
      )}

      {/* Charts */}
      {report && (
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Monthly Trends - Area Chart */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-800">
                <TrendingIcon className="ml-2 h-5 w-5 text-blue-600" />
                الاتجاه الشهري
              </CardTitle>
              <CardDescription className="text-gray-600">
                مقارنة الإيرادات والمصروفات شهرياً
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={report.monthlyTrends}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00C49F" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#00C49F" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF8042" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#FF8042" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#666"
                    tick={{ fill: '#666' }}
                  />
                  <YAxis 
                    stroke="#666"
                    tick={{ fill: '#666' }}
                    tickFormatter={(value) => `${value/1000}k`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), '']}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#00C49F" 
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    name="الإيرادات"
                    strokeWidth={3}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="expense" 
                    stroke="#FF8042" 
                    fillOpacity={1}
                    fill="url(#colorExpense)"
                    name="المصروفات"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Revenue by Category - Pie Chart */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-800">
                <PieChartIcon className="ml-2 h-5 w-5 text-green-600" />
                توزيع الإيرادات
              </CardTitle>
              <CardDescription className="text-gray-600">
                نسبة الإيرادات لكل فئة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={report.revenuesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="amount"
                  >
                    {report.revenuesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), '']}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend 
                    layout="vertical" 
                    verticalAlign="middle" 
                    align="left"
                    formatter={(value, entry, index) => (
                      <span className="text-gray-700 text-sm">
                        {value} ({((report.revenuesByCategory[index].amount / report.totalRevenues) * 100).toFixed(1)}%)
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Expenses by Category - Bar Chart */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-800">
                <BarChart3 className="ml-2 h-5 w-5 text-red-600" />
                المصروفات حسب الفئة
              </CardTitle>
              <CardDescription className="text-gray-600">
                توزيع المصروفات حسب الفئات
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={report.expensesByCategory} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    type="number" 
                    stroke="#666"
                    tick={{ fill: '#666' }}
                    tickFormatter={(value) => `${value/1000}k`}
                  />
                  <YAxis 
                    dataKey="category" 
                    type="category" 
                    width={80}
                    stroke="#666"
                    tick={{ fill: '#666' }}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), '']}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="amount" 
                    fill="#FF8042"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Transactions */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-800">
                <Activity className="ml-2 h-5 w-5 text-purple-600" />
                أعلى المعاملات
              </CardTitle>
              <CardDescription className="text-gray-600">
                أعلى 5 إيرادات ومصروفات
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-4 text-green-600 flex items-center">
                    <TrendingUp className="h-4 w-4 ml-2" />
                    أعلى الإيرادات
                  </h4>
                  <div className="space-y-3">
                    {report.topRevenues.slice(0, 3).map((revenue, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center">
                            <span className="text-green-700 font-bold text-sm">{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{revenue.description}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(revenue.date).toLocaleDateString('ar-SA')}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          {formatCurrency(revenue.amount)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-4 text-red-600 flex items-center">
                    <TrendingDown className="h-4 w-4 ml-2" />
                    أعلى المصروفات
                  </h4>
                  <div className="space-y-3">
                    {report.topExpenses.slice(0, 3).map((expense, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-red-200 rounded-full flex items-center justify-center">
                            <span className="text-red-700 font-bold text-sm">{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{expense.description}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(expense.date).toLocaleDateString('ar-SA')}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-red-100 text-red-800 border-red-200">
                          {formatCurrency(expense.amount)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}