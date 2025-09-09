"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { 
  DollarSign, 
  Calendar, 
  FileText, 
  Save, 
  ArrowLeft, 
  TrendingDown,
  FolderOpen
} from "lucide-react";
import Link from "next/link";

interface ExpenseData {
  id: string;
  amount: number;
  date: string;
  description: string;
  category: string;
  userId: string;
  branch: string;
  createdAt: string;
}

const expenseCategories = [
  "رواتب",
  "إيجار",
  "مرافق",
  "تسويق",
  "صيانة",
  "نقل",
  "مواد",
  "أخرى"
];

export default function EditExpensePage() {
  const params = useParams();
  const router = useRouter();
  const { user, hasPermission } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [expense, setExpense] = useState<ExpenseData | null>(null);

  useEffect(() => {
    if (!hasPermission('manage_expenses')) {
      router.push('/');
      return;
    }
    
    fetchExpense();
  }, [params.id]);

  const fetchExpense = async () => {
    try {
      const response = await fetch(`/api/expenses/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const expenseData = await response.json();
        setExpense(expenseData);
      } else {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "فشل في جلب بيانات المصروف",
        });
        router.push('/expenses');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ في الاتصال بالخادم",
      });
    }
  };

  const handleInputChange = (field: keyof ExpenseData, value: any) => {
    if (expense) {
      setExpense({ ...expense, [field]: value });
    }
  };

  const handleSave = async () => {
    if (!expense) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/expenses/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          amount: expense.amount,
          date: expense.date,
          description: expense.description,
          category: expense.category,
        }),
      });

      if (response.ok) {
        toast({
          title: "نجاح",
          description: "تم تحديث المصروف بنجاح",
        });
        router.push('/expenses');
      } else {
        const error = await response.json();
        toast({
          variant: "destructive",
          title: "خطأ",
          description: error.message || "فشل في تحديث المصروف",
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toISOString().split('T')[0];
  };

  if (!expense) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/expenses">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 ml-2" />
              العودة
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">تعديل المصروف</h1>
            <p className="text-gray-600 mt-2">تعديل بيانات المصروف</p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <Save className="h-4 w-4" />
          )}
          حفظ التغييرات
        </Button>
      </div>

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <TrendingDown className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            تعديل المصروف
          </CardTitle>
          <CardDescription>
            تحديث بيانات المصروف
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="amount" className="flex items-center">
                <DollarSign className="h-4 w-4 ml-2 text-red-600" />
                المبلغ
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={expense.amount}
                onChange={(e) => handleInputChange('amount', parseFloat(e.target.value))}
                className="text-right"
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center">
                <Calendar className="h-4 w-4 ml-2 text-red-600" />
                التاريخ
              </Label>
              <Input
                id="date"
                type="date"
                value={formatDate(expense.date)}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="text-right"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="flex items-center">
              <FolderOpen className="h-4 w-4 ml-2 text-red-600" />
              الفئة
            </Label>
            <Select
              value={expense.category}
              onValueChange={(value) => handleInputChange('category', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {expenseCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center">
              <FileText className="h-4 w-4 ml-2 text-red-600" />
              الوصف (اختياري)
            </Label>
            <Textarea
              id="description"
              value={expense.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="min-h-[100px] text-right resize-none"
              placeholder="أدخل وصفاً للمصروف..."
            />
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  جاري الحفظ...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Save className="h-5 w-5 ml-2" />
                  حفظ التغييرات
                </div>
              )}
            </Button>
            
            <Link href="/expenses">
              <Button variant="outline" className="flex-1">
                إلغاء
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}