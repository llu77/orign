"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Scatter,
  ScatterChart
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
  Star,
  Award,
  Zap,
  Eye,
  Settings,
  Database,
  Shield,
  Bell,
  Globe,
  Building,
  CreditCard,
  ShoppingCart,
  Truck,
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, startOfYear, endOfYear, subWeeks, startOfWeek, endOfWeek } from 'date-fns';
import { ar } from 'date-fns/locale';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#FF6B6B', '#4ECDC4', '#F45B5B', '#7BC142'];

interface AdvancedFinancialReport {
  totalRevenues: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  revenuesByCategory: { category: string; amount: number; percentage: number }[];
  expensesByCategory: { category: string; amount: number; percentage: number }[];
  monthlyTrends: { month: string; revenue: number; expense: number; profit: number; growth: number }[];
  weeklyTrends: { week: string; revenue: number; expense: number; profit: number }[];
  branchComparison: { branch: string; revenue: number; expense: number; profit: number; transactions: number }[];
  topCustomers: { name: string; revenue: number; transactions: number; lastTransaction: string }[];
  topProducts: { name: string; revenue: number; quantity: number; profit: number }[];
  cashFlow: { date: string; inflow: number; outflow: number; balance: number }[];
  performanceMetrics: {
    revenueGrowth: number;
    expenseGrowth: number;
    profitGrowth: number;
    averageTransactionValue: number;
    customerRetention: number;
    inventoryTurnover: number;
  };
  alerts: {
    type: 'warning' | 'success' | 'error' | 'info';
    message: string;
    value?: number;
    trend?: 'up' | 'down';
  }[];
}

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = "blue", subtitle }: { 
  title: string; 
  value: string; 
  icon: React.ElementType;
  trend?: 'up' | 'down';
  trendValue?: string;
  color?: string;
  subtitle?: string;
}) => {
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    red: "bg-red-500",
    purple: "bg-purple-500",
    yellow: "bg-yellow-500",
    orange: "bg-orange-500",
    teal: "bg-teal-500"
  };

  return (
    <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-gray-800">{value}</div>
        {subtitle && <div className="text-sm text-gray-500 mt-1">{subtitle}</div>}
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
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-gray-100 to-transparent rounded-full -mr-10 -mt-10 opacity-20"></div>
    </Card>
  );
};

const AlertCard = ({ alert }: { alert: AdvancedFinancialReport['alerts'][0] }) => {
  const alertConfig = {
    warning: { icon: AlertTriangle, bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200', textColor: 'text-yellow-800' },
    success: { icon: CheckCircle, bgColor: 'bg-green-50', borderColor: 'border-green-200', textColor: 'text-green-800' },
    error: { icon: XCircle, bgColor: 'bg-red-50', borderColor: 'border-red-200', textColor: 'text-red-800' },
    info: { icon: Bell, bgColor: 'bg-blue-50', borderColor: 'border-blue-200', textColor: 'text-blue-800' }
  };

  const config = alertConfig[alert.type];
  const Icon = config.icon;

  return (
    <Card className={`${config.bgColor} ${config.borderColor} border-2`}>
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <Icon className={`h-5 w-5 ${config.textColor}`} />
          <div className="flex-1">
            <p className={`text-sm font-medium ${config.textColor}`}>{alert.message}</p>
            {alert.value !== undefined && (
              <p className={`text-xs ${config.textColor} opacity-75`}>
                القيمة: {alert.value.toLocaleString()}
              </p>
            )}
          </div>
          {alert.trend && (
            <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
              alert.trend === 'up' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {alert.trend === 'up' ? (
                <ArrowUpRight className="h-4 w-4 text-green-600" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-600" />
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default function AdvancedReportsPage() {
  const { toast } = useToast();
  const [report, setReport] = useState<AdvancedFinancialReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState('this-month');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  const fetchReport = async () => {
    setLoading(true);
    try {
      let startDate = '';
      let endDate = '';
      
      const today = new Date();
      
      switch (dateRange) {
        case 'this-week':
          startDate = startOfWeek(today).toISOString().split('T')[0];
          endDate = endOfWeek(today).toISOString().split('T')[0];
          break;
        case 'last-week':
          const lastWeek = subWeeks(today, 1);
          startDate = startOfWeek(lastWeek).toISOString().split('T')[0];
          endDate = endOfWeek(lastWeek).toISOString().split('T')[0];
          break;
        case 'this-month':
          startDate = startOfMonth(today).toISOString().split('T')[0];
          endDate = endOfMonth(today).toISOString().split('T')[0];
          break;
        case 'last-month':
          const lastMonth = subMonths(today, 1);
          startDate = startOfMonth(lastMonth).toISOString().split('T')[0];
          endDate = endOfMonth(lastMonth).toISOString().split('T')[0];
          break;
        case 'this-quarter':
          const currentQuarter = Math.floor(today.getMonth() / 3);
          startDate = new Date(today.getFullYear(), currentQuarter * 3, 1).toISOString().split('T')[0];
          endDate = new Date(today.getFullYear(), (currentQuarter + 1) * 3, 0).toISOString().split('T')[0];
          break;
        case 'this-year':
          startDate = startOfYear(today).toISOString().split('T')[0];
          endDate = endOfYear(today).toISOString().split('T')[0];
          break;
      }

      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (selectedBranch !== 'all') params.append('branch', selectedBranch);

      const response = await fetch(`/api/reports/advanced?${params}`, {
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
          description: "فشل في جلب التقرير المتقدم",
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
  }, [dateRange, selectedBranch]);

  const exportReport = (format: 'csv' | 'excel' | 'pdf') => {
    if (!report) return;
    
    if (format === 'csv') {
      const csvContent = [
        ['المؤشر', 'القيمة'],
        ['إجمالي الإيرادات', report.totalRevenues.toString()],
        ['إجمالي المصروفات', report.totalExpenses.toString()],
        ['صافي الربح', report.netProfit.toString()],
        ['هامش الربح', `${report.profitMargin}%`],
        ['نمو الإيرادات', `${report.performanceMetrics.revenueGrowth}%`],
        ['نمو المصروفات', `${report.performanceMetrics.expenseGrowth}%`],
        ['نمو الأرباح', `${report.performanceMetrics.profitGrowth}%`],
        ['متوسط قيمة المعاملة', report.performanceMetrics.averageTransactionValue.toString()],
        ['احتفاظ العملاء', `${report.performanceMetrics.customerRetention}%`],
        ['دوران المخزون', report.performanceMetrics.inventoryTurnover.toString()],
        ...report.branchComparison.map(b => [`${b.branch} - الإيرادات`, b.revenue.toString()]),
        ...report.branchComparison.map(b => [`${b.branch} - المصروفات`, b.expense.toString()]),
        ...report.branchComparison.map(b => [`${b.branch} - الربح`, b.profit.toString()]),
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `تقرير-متقدم-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    }
    
    toast({
      title: "تم التصدير",
      description: `تم تصدير التقرير بنجاح بصيغة ${format.toUpperCase()}`,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading && !report) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">جاري تحميل التقارير المتقدمة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">التقارير المتقدمة</h1>
            <p className="text-purple-100 text-lg">تحليل متقدم وبيانات تفصيلية للأداء المالي</p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <div className="text-sm text-purple-100 mb-1">آخر تحديث</div>
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

      {/* Controls */}
      <Card className="shadow-lg border-0">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-4">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[200px] h-12">
                <Calendar className="ml-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this-week">هذا الأسبوع</SelectItem>
                <SelectItem value="last-week">الأسبوع الماضي</SelectItem>
                <SelectItem value="this-month">هذا الشهر</SelectItem>
                <SelectItem value="last-month">الشهر الماضي</SelectItem>
                <SelectItem value="this-quarter">هذا الربع</SelectItem>
                <SelectItem value="this-year">هذه السنة</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="w-[200px] h-12">
                <Building className="ml-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفروع</SelectItem>
                <SelectItem value="laban">فرع لبن</SelectItem>
                <SelectItem value="tuwaiq">فرع طويق</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2 ml-auto">
              <Button onClick={() => exportReport('csv')} className="bg-green-600 hover:bg-green-700 text-white shadow-lg">
                <Download className="ml-2 h-4 w-4" />
                تصدير CSV
              </Button>
              <Button onClick={fetchReport} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
                <RefreshCw className={`ml-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'جاري التحديث...' : 'تحديث'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      {report && (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              نظرة عامة
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              تحليل مالي
            </TabsTrigger>
            <TabsTrigger value="branches" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              مقارنة الفروع
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              تحليل العملاء
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              مؤشرات الأداء
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              التنبيهات
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <StatCard 
                title="إجمالي الإيرادات" 
                value={formatCurrency(report.totalRevenues)} 
                icon={TrendingUp}
                trend="up"
                trendValue={`+${report.performanceMetrics.revenueGrowth}%`}
                color="green"
              />
              <StatCard 
                title="إجمالي المصروفات" 
                value={formatCurrency(report.totalExpenses)} 
                icon={TrendingDown}
                trend={report.performanceMetrics.expenseGrowth > 0 ? 'up' : 'down'}
                trendValue={`${report.performanceMetrics.expenseGrowth > 0 ? '+' : ''}${report.performanceMetrics.expenseGrowth}%`}
                color="red"
              />
              <StatCard 
                title="صافي الربح" 
                value={formatCurrency(report.netProfit)} 
                icon={Target}
                trend={report.performanceMetrics.profitGrowth > 0 ? 'up' : 'down'}
                trendValue={`${report.performanceMetrics.profitGrowth > 0 ? '+' : ''}${report.performanceMetrics.profitGrowth}%`}
                color={report.netProfit >= 0 ? "green" : "red"}
              />
              <StatCard 
                title="هامش الربح" 
                value={formatPercentage(report.profitMargin)} 
                icon={Activity}
                color="purple"
              />
            </div>

            {/* Revenue vs Expense Trend */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-800">
                  <TrendingIcon className="ml-2 h-5 w-5 text-blue-600" />
                  اتجاه الإيرادات والمصروفات
                </CardTitle>
                <CardDescription className="text-gray-600">
                  مقارنة الإيرادات والمصروفات overtime
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={report.monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#666" tick={{ fill: '#666' }} />
                    <YAxis stroke="#666" tick={{ fill: '#666' }} tickFormatter={(value) => `${value/1000}k`} />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        name === 'profit' ? formatPercentage(value) : formatCurrency(value), 
                        name === 'revenue' ? 'الإيرادات' : name === 'expense' ? 'المصروفات' : 'الربح'
                      ]}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="revenue" fill="#00C49F" stroke="#00C49F" fillOpacity={0.3} name="الإيرادات" />
                    <Area type="monotone" dataKey="expense" fill="#FF8042" stroke="#FF8042" fillOpacity={0.3} name="المصروفات" />
                    <Line type="monotone" dataKey="profit" stroke="#8884d8" strokeWidth={3} name="الربح" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Breakdown */}
            <div className="grid gap-8 lg:grid-cols-2">
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-800">
                    <PieChartIcon className="ml-2 h-5 w-5 text-green-600" />
                    توزيع الإيرادات
                  </CardTitle>
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
                        formatter={(value, entry, index) => (
                          <span className="text-gray-700 text-sm">
                            {value} ({formatPercentage(report.revenuesByCategory[index].percentage)})
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-800">
                    <BarChart3 className="ml-2 h-5 w-5 text-red-600" />
                    توزيع المصروفات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={report.expensesByCategory} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis type="number" stroke="#666" tick={{ fill: '#666' }} tickFormatter={(value) => `${value/1000}k`} />
                      <YAxis dataKey="category" type="category" width={80} stroke="#666" tick={{ fill: '#666' }} />
                      <Tooltip 
                        formatter={(value: number) => [formatCurrency(value), '']}
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Bar dataKey="amount" fill="#FF8042" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            {/* Cash Flow Analysis */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-800">
                  <CreditCard className="ml-2 h-5 w-5 text-purple-600" />
                  تحليل التدفق النقدي
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={report.cashFlow}>
                    <defs>
                      <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00C49F" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#00C49F" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF8042" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#FF8042" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" stroke="#666" tick={{ fill: '#666' }} />
                    <YAxis stroke="#666" tick={{ fill: '#666' }} tickFormatter={(value) => `${value/1000}k`} />
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
                    <Area type="monotone" dataKey="inflow" stroke="#00C49F" fill="url(#colorInflow)" name="التدفق الداخل" />
                    <Area type="monotone" dataKey="outflow" stroke="#FF8042" fill="url(#colorOutflow)" name="التدفق الخارج" />
                    <Line type="monotone" dataKey="balance" stroke="#8884d8" strokeWidth={3} name="الرصيد" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Weekly Performance */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-800">
                  <Clock className="ml-2 h-5 w-5 text-blue-600" />
                  الأداء الأسبوعي
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={report.weeklyTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="week" stroke="#666" tick={{ fill: '#666' }} />
                    <YAxis stroke="#666" tick={{ fill: '#666' }} tickFormatter={(value) => `${value/1000}k`} />
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
                    <Bar dataKey="revenue" fill="#00C49F" name="الإيرادات" />
                    <Bar dataKey="expense" fill="#FF8042" name="المصروفات" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="branches" className="space-y-6">
            {/* Branch Comparison */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-800">
                  <Building className="ml-2 h-5 w-5 text-indigo-600" />
                  مقارنة أداء الفروع
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={report.branchComparison}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="branch" stroke="#666" tick={{ fill: '#666' }} />
                    <PolarRadiusAxis angle={90} domain={[0, 'dataMax']} stroke="#666" />
                    <Radar
                      name="الإيرادات"
                      dataKey="revenue"
                      stroke="#00C49F"
                      fill="#00C49F"
                      fillOpacity={0.3}
                    />
                    <Radar
                      name="المصروفات"
                      dataKey="expense"
                      stroke="#FF8042"
                      fill="#FF8042"
                      fillOpacity={0.3}
                    />
                    <Radar
                      name="الربح"
                      dataKey="profit"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.3}
                    />
                    <Legend />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), '']}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Branch Details */}
            <div className="grid gap-6 md:grid-cols-2">
              {report.branchComparison.map((branch, index) => (
                <Card key={branch.branch} className="shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center text-gray-800">
                      <Building className="ml-2 h-5 w-5" style={{ color: COLORS[index % COLORS.length] }} />
                      {branch.branch === 'laban' ? 'فرع لبن' : 'فرع طويق'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">الإيرادات</span>
                        <Badge className="bg-green-100 text-green-800">
                          {formatCurrency(branch.revenue)}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">المصروفات</span>
                        <Badge className="bg-red-100 text-red-800">
                          {formatCurrency(branch.expense)}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">صافي الربح</span>
                        <Badge className={branch.profit >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {formatCurrency(branch.profit)}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">عدد المعاملات</span>
                        <Badge className="bg-blue-100 text-blue-800">
                          {branch.transactions}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            {/* Top Customers */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-800">
                  <Users className="ml-2 h-5 w-5 text-orange-600" />
                  أفضل العملاء
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {report.topCustomers.slice(0, 10).map((customer, index) => (
                    <div key={customer.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-400 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">{customer.name}</h4>
                          <p className="text-sm text-gray-600">{customer.transactions} معاملة</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-gray-800">{formatCurrency(customer.revenue)}</p>
                        <p className="text-sm text-gray-600">آخر معاملة: {new Date(customer.lastTransaction).toLocaleDateString('ar-SA')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Customer Metrics */}
            <div className="grid gap-6 md:grid-cols-3">
              <StatCard 
                title="متوسط قيمة المعاملة" 
                value={formatCurrency(report.performanceMetrics.averageTransactionValue)} 
                icon={CreditCard}
                color="blue"
              />
              <StatCard 
                title="نسبة احتفاظ العملاء" 
                value={formatPercentage(report.performanceMetrics.customerRetention)} 
                icon={Shield}
                color="green"
              />
              <StatCard 
                title="دوران المخزون" 
                value={report.performanceMetrics.inventoryTurnover.toFixed(1)} 
                icon={Package}
                color="purple"
              />
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            {/* Performance Metrics */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <StatCard 
                title="نمو الإيرادات" 
                value={formatPercentage(report.performanceMetrics.revenueGrowth)} 
                icon={TrendingUp}
                trend={report.performanceMetrics.revenueGrowth > 0 ? 'up' : 'down'}
                color="green"
              />
              <StatCard 
                title="نمو المصروفات" 
                value={formatPercentage(report.performanceMetrics.expenseGrowth)} 
                icon={TrendingDown}
                trend={report.performanceMetrics.expenseGrowth > 0 ? 'up' : 'down'}
                color="red"
              />
              <StatCard 
                title="نمو الأرباح" 
                value={formatPercentage(report.performanceMetrics.profitGrowth)} 
                icon={Target}
                trend={report.performanceMetrics.profitGrowth > 0 ? 'up' : 'down'}
                color={report.performanceMetrics.profitGrowth > 0 ? "green" : "red"}
              />
              <StatCard 
                title="متوسط قيمة المعاملة" 
                value={formatCurrency(report.performanceMetrics.averageTransactionValue)} 
                icon={CreditCard}
                color="blue"
              />
            </div>

            {/* Performance Scatter */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-800">
                  <ScatterChart className="ml-2 h-5 w-5 text-purple-600" />
                  تحليل الأداء الموزع
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart data={report.monthlyTrends.map(item => ({
                    x: item.revenue,
                    y: item.profit,
                    z: item.expense,
                    month: item.month
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="x" name="الإيرادات" stroke="#666" tick={{ fill: '#666' }} tickFormatter={(value) => `${value/1000}k`} />
                    <YAxis dataKey="y" name="الربح" stroke="#666" tick={{ fill: '#666' }} tickFormatter={(value) => `${value/1000}k`} />
                    <Tooltip 
                      formatter={(value: number, name: string) => [formatCurrency(value), name === 'x' ? 'الإيرادات' : name === 'y' ? 'الربح' : 'المصروفات']}
                      labelFormatter={(label) => `الشهر: ${label}`}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Scatter dataKey="y" fill="#8884d8" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            {/* System Alerts */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {report.alerts.map((alert, index) => (
                <AlertCard key={index} alert={alert} />
              ))}
            </div>

            {/* Additional Metrics */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-800">
                    <Database className="ml-2 h-5 w-5 text-blue-600" />
                    مؤشرات التشغيل
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">نمو الإيرادات</span>
                      <Badge className={report.performanceMetrics.revenueGrowth > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {formatPercentage(report.performanceMetrics.revenueGrowth)}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">نمو المصروفات</span>
                      <Badge className={report.performanceMetrics.expenseGrowth < 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {formatPercentage(report.performanceMetrics.expenseGrowth)}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">نمو الأرباح</span>
                      <Badge className={report.performanceMetrics.profitGrowth > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {formatPercentage(report.performanceMetrics.profitGrowth)}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">هامش الربح</span>
                      <Badge className={report.profitMargin > 20 ? "bg-green-100 text-green-800" : report.profitMargin > 10 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}>
                        {formatPercentage(report.profitMargin)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-800">
                    <Award className="ml-2 h-5 w-5 text-purple-600" />
                    الإنجازات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">إجمالي الإيرادات</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 ml-1" />
                        <span className="font-semibold">{formatCurrency(report.totalRevenues)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">صافي الربح</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 ml-1" />
                        <span className="font-semibold">{formatCurrency(report.netProfit)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">عدد المعاملات</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 ml-1" />
                        <span className="font-semibold">{report.branchComparison.reduce((sum, b) => sum + b.transactions, 0)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">متوسط قيمة المعاملة</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 ml-1" />
                        <span className="font-semibold">{formatCurrency(report.performanceMetrics.averageTransactionValue)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}