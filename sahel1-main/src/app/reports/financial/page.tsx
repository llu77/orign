"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Download, 
  RefreshCw,
  BarChart3,
  PieChart,
  Target,
  Activity
} from "lucide-react";

interface FinancialReport {
  totalRevenues: number;
  totalExpenses: number;
  netProfit: number;
  revenuesByCategory: { [key: string]: number };
  expensesByCategory: { [key: string]: number };
  monthlyData: Array<{
    month: string;
    revenues: number;
    expenses: number;
    profit: number;
  }>;
  topRevenueCategories: Array<{
    category: string;
    amount: number;
    count: number;
  }>;
  topExpenseCategories: Array<{
    category: string;
    amount: number;
    count: number;
  }>;
}

export default function FinancialReportPage() {
  const { user, hasPermission } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<FinancialReport | null>(null);
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<string>('this_month');

  useEffect(() => {
    if (!hasPermission('view_financial_reports')) {
      return;
    }
    fetchReportData();
  }, [branchFilter, periodFilter]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (branchFilter !== 'all') params.append('branch', branchFilter);
      params.append('period', periodFilter);

      const response = await fetch(`/api/reports/financial?${params.toString()}`, {
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
          description: "فشل في جلب بيانات التقرير المالي",
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

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (branchFilter !== 'all') params.append('branch', branchFilter);
      params.append('period', periodFilter);

      const response = await fetch(`/api/reports/financial/export?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `financial-report-${new Date().toISOString().split('T')[0]}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "نجاح",
          description: "تم تصدير التقرير بنجاح",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في تصدير التقرير",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (!hasPermission('view_financial_reports')) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">غير مصرح لك</h1>
          <p className="text-gray-600 mt-2">لا تملك صلاحية الوصول إلى هذه الصفحة</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">التقرير المالي</h1>
          <p className="text-gray-600 mt-2">عرض الإحصائيات المالية وتحليلات الأداء</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={fetchReportData}
            disabled={loading}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 ml-2" />
            تصدير
          </Button>
        </div>
      </div>

      {/* الفلاتر */}
      <Card>
        <CardHeader>
          <CardTitle>الفلاتر</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>الفرع</Label>
              <Select value={branchFilter} onValueChange={setBranchFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الفروع</SelectItem>
                  <SelectItem value="laban">فرع لبان</SelectItem>
                  <SelectItem value="tuwaiq">فرع طويق</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>الفترة</Label>
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="this_week">هذا الأسبوع</SelectItem>
                  <SelectItem value="this_month">هذا الشهر</SelectItem>
                  <SelectItem value="last_month">الشهر الماضي</SelectItem>
                  <SelectItem value="this_quarter">هذا الربع</SelectItem>
                  <SelectItem value="this_year">هذه السنة</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>نوع التقرير</Label>
              <Select defaultValue="detailed">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">ملخص</SelectItem>
                  <SelectItem value="detailed">مفصل</SelectItem>
                  <SelectItem value="comparison">مقارنة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {report && (
        <>
          {/* ملخص مالي */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">إجمالي الإيرادات</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(report.totalRevenues)}</p>
                    <p className="text-xs text-green-600 mt-1">
                      <TrendingUp className="inline h-3 w-3 ml-1" />
                      +12.5% عن الشهر الماضي
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">إجمالي المصروفات</p>
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(report.totalExpenses)}</p>
                    <p className="text-xs text-red-600 mt-1">
                      <TrendingDown className="inline h-3 w-3 ml-1" />
                      +8.2% عن الشهر الماضي
                    </p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">صافي الربح</p>
                    <p className={`text-2xl font-bold ${report.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(report.netProfit)}
                    </p>
                    <p className={`text-xs mt-1 ${report.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {report.netProfit >= 0 ? 'إيجابي' : 'سلبي'}
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">هامش الربح</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {report.totalRevenues > 0 ? ((report.netProfit / report.totalRevenues) * 100).toFixed(1) : 0}%
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      <Activity className="inline h-3 w-3 ml-1" />
                      من الإيرادات
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* أهم الفئات */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  أهم فئات الإيرادات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {report.topRevenueCategories.slice(0, 5).map((category, index) => (
                    <div key={category.category} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-green-600">{index + 1}</span>
                        </div>
                        <div>
                          <div className="font-medium">{category.category}</div>
                          <div className="text-sm text-gray-500">{category.count} عملية</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">{formatCurrency(category.amount)}</div>
                        <div className="text-xs text-gray-500">
                          {((category.amount / report.totalRevenues) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5" />
                  أهم فئات المصروفات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {report.topExpenseCategories.slice(0, 5).map((category, index) => (
                    <div key={category.category} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-red-600">{index + 1}</span>
                        </div>
                        <div>
                          <div className="font-medium">{category.category}</div>
                          <div className="text-sm text-gray-500">{category.count} عملية</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-red-600">{formatCurrency(category.amount)}</div>
                        <div className="text-xs text-gray-500">
                          {((category.amount / report.totalExpenses) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* البيانات الشهرية */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                الأداء الشهري
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right p-3">الشهر</th>
                      <th className="text-right p-3">الإيرادات</th>
                      <th className="text-right p-3">المصروفات</th>
                      <th className="text-right p-3">صافي الربح</th>
                      <th className="text-right p-3">هامش الربح</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.monthlyData.map((data, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{data.month}</td>
                        <td className="p-3 text-green-600">{formatCurrency(data.revenues)}</td>
                        <td className="p-3 text-red-600">{formatCurrency(data.expenses)}</td>
                        <td className={`p-3 font-medium ${data.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(data.profit)}
                        </td>
                        <td className="p-3">
                          <Badge variant={data.profit >= 0 ? "default" : "destructive"}>
                            {data.revenues > 0 ? ((data.profit / data.revenues) * 100).toFixed(1) : 0}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {loading && !report && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
}

