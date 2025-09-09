
"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/datepicker';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Expense } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { DollarSign, FileText, Send, Tag, Edit, Trash2, Search, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useFinancialData } from '@/contexts/financial-data-context-api';
import { useAuth } from '@/contexts/auth-context';
import { ExpenseReportPrint } from '@/components/ui/expense-report-print';

const expenseFormSchema = z.object({
  category: z.string().min(1, { message: "يرجى تحديد البند." }),
  amount: z.coerce.number().positive({ message: "يجب أن يكون المبلغ إيجابيًا." }),
  date: z.date({ required_error: "التاريخ مطلوب." }),
  description: z.string().min(10, { message: "يرجى تقديم وصف لا يقل عن 10 أحرف." }),
  branch: z.string().min(1, { message: "يرجى تحديد الفرع." }),
});

const StatCard = ({ title, value, icon: Icon }: { title: string; value: string; icon: React.ElementType }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
);

const expenseCategories = [
    'كهرباء', 'تحسينات', 'رسوم حكومية', 'إصدار/تجديد إقامة',
    'شهادة صحية', 'بونص', 'أغراض محل', 'صيانة', 'صيانة سكن',
    'تأشيرة', 'تذاكر', 'ورق', 'إيجار محل', 'إيجار سكن', 'إنترنت'
];


export default function ExpensesPage() {
  const { user } = useAuth();
  const { expenses, addExpense } = useFinancialData();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const branchExpenses = React.useMemo(() => {
    if (!expenses || !Array.isArray(expenses)) return [];
    if (user?.role === 'admin') return expenses;
    // Filter by type (which holds branch info) instead of branch
    return expenses.filter(e => e.type === user?.branch);
  }, [expenses, user]);

  const filteredExpenses = React.useMemo(() => {
    if (!branchExpenses || !Array.isArray(branchExpenses)) return [];
    
    return branchExpenses.filter(expense => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        expense.description?.toLowerCase().includes(searchLower) ||
        expense.category?.toLowerCase().includes(searchLower) ||
        expense.amount?.toString().includes(searchTerm)
      );
    });
  }, [branchExpenses, searchTerm]);

  const form = useForm<z.infer<typeof expenseFormSchema>>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      category: "",
      amount: undefined,
      date: new Date(),
      description: "",
      branch: user?.role === 'admin' ? "" : user?.branch,
    },
  });

  const handleAddExpense = async (values: z.infer<typeof expenseFormSchema>) => {
    try {
      setLoading(true);
      const isEdit = editingExpense && editingExpense.id;
      const url = isEdit ? `/api/expenses?id=${editingExpense.id}` : '/api/expenses';
      const method = isEdit ? 'PUT' : 'POST';

      // Convert form data to match API requirements
      const expenseData = {
        amount: values.amount || 0,
        date: values.date ? format(values.date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        reason: values.description || '',
        type: values.branch || 'عام',
        category: values.category || '',
        details: values.description || ''
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(expenseData),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "نجاح",
          description: isEdit ? "تم تعديل المصروف بنجاح" : "تمت إضافة المصروف بنجاح",
        });
        form.reset({
          category: "",
          amount: undefined,
          date: new Date(),
          description: "",
          branch: user?.role === 'admin' ? "" : user?.branch,
        });
        setShowForm(false);
        setEditingExpense(null);
        // Refresh expenses list
        window.location.reload();
      } else {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: result.error || isEdit ? "فشل في تعديل المصروف" : "فشل في إضافة المصروف",
        });
      }
    } catch (error) {
      console.error('Failed to add expense:', error);
      toast({
        title: "خطأ في إضافة المصروف",
        description: "حدث خطأ أثناء إضافة المصروف. يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteExpense = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا المصروف؟')) return;
    
    try {
      const response = await fetch(`/api/expenses?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        toast({
          title: "نجاح",
          description: "تم حذف المصروف بنجاح",
        });
        // Refresh expenses list
        window.location.reload();
      } else {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "فشل في حذف المصروف",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ في الاتصال بالخادم",
      });
    }
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setShowForm(true);
    form.reset({
      category: expense.category,
      amount: expense.amount,
      date: new Date(expense.date),
      description: expense.description,
      branch: expense.type,
    });
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingExpense(null);
    form.reset({
      category: "",
      amount: undefined,
      date: new Date(),
      description: "",
      branch: user?.role === 'admin' ? "" : user?.branch,
    });
  };
  
  const totalExpenses = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const selectedBranch = form.watch("branch");

  return (
    <>
        <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-headline font-bold">صفحة المصاريف {user?.branch && user.branch !== 'admin' && `- فرع ${user.branch}`}</h1>
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="ml-2 h-4 w-4" />
              {showForm ? "إلغاء" : "إضافة مصروف"}
            </Button>
        </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard title="إجمالي المصاريف" value={`${totalExpenses.toLocaleString()} ريال`} icon={DollarSign} />
        <StatCard title="عدد حركات المصروف" value={filteredExpenses.length.toString()} icon={FileText} />
      </div>

      {showForm && (
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">
                {editingExpense ? "تعديل مصروف" : "إضافة مصروف جديد"}
              </CardTitle>
              <CardDescription>
                {editingExpense ? "تحديث بيانات المصروف" : "املأ النموذج أدناه لتسجيل مصروف جديد"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleAddExpense)} className="space-y-6">
                  {user?.role === 'admin' && (
                    <FormField control={form.control} name="branch" render={({ field }) => (
                      <FormItem>
                        <FormLabel>الفرع</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر الفرع للمصروف" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="laban">فرع لبن</SelectItem>
                            <SelectItem value="tuwaiq">فرع طويق</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  )}
                  <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem>
                      <FormLabel>البند</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر بندًا" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {expenseCategories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="amount" render={({ field }) => (
                    <FormItem>
                      <FormLabel>المبلغ</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="بالريال السعودي" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : e.target.valueAsNumber)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="date" render={({ field }) => (
                    <FormItem>
                      <FormLabel>تاريخ المصروف</FormLabel>
                      <FormControl>
                        <DatePicker date={field.value} setDate={field.onChange} placeholder="اختر تاريخًا" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                      <FormLabel>الوصف</FormLabel>
                      <FormControl>
                        <Textarea placeholder="أضف وصفًا موجزًا لحركة المصروف..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1 font-semibold" disabled={loading || (user?.role === 'admin' && !selectedBranch)}>
                      <Send className="ml-2 h-4 w-4" />
                      {loading ? "جاري الحفظ..." : editingExpense ? "تحديث المصروف" : "إضافة المصروف"}
                    </Button>
                    {editingExpense && (
                      <Button type="button" variant="outline" onClick={handleFormClose}>
                        إلغاء
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="lg:col-span-7">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">سجل المصاريف</CardTitle>
                    <CardDescription>قائمة بجميع حركات المصاريف المسجلة.</CardDescription>
                    <div className="flex items-center space-x-2">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="بحث في المصاريف..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-sm"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>البند</TableHead>
                                    <TableHead>المبلغ</TableHead>
                                    <TableHead>التاريخ</TableHead>
                                    <TableHead>الوصف</TableHead>
                                    {user?.role === 'admin' && <TableHead>الفرع</TableHead>}
                                    <TableHead>الإجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={user?.role === 'admin' ? 6 : 5} className="text-center py-8">
                                            جاري التحميل...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredExpenses.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={user?.role === 'admin' ? 6 : 5} className="text-center py-8">
                                            لا توجد مصاريف
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredExpenses.map((expense) => (
                                        <TableRow key={expense.id}>
                                            <TableCell>
                                                <Badge variant="outline" className="flex items-center gap-1.5 w-fit">
                                                    <Tag className="h-3 w-3" />
                                                    {expense.category}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-semibold">{`${expense.amount.toLocaleString()} ريال`}</TableCell>
                                            <TableCell>{format(new Date(expense.date), 'PPP', { locale: ar })}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{expense.description}</TableCell>
                                            {user?.role === 'admin' && <TableCell>{expense.type === 'laban' ? 'لبن' : 'طويق'}</TableCell>}
                                            <TableCell>
                                                <div className="flex space-x-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEditExpense(expense)}
                                                        className="text-blue-600 hover:text-blue-800"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => deleteExpense(expense.id)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
            
            {/* Expense Report Print Section */}
            <div className="mt-6">
                <ExpenseReportPrint
                    expenses={filteredExpenses.map(exp => ({
                        id: exp.id,
                        category: exp.category,
                        description: exp.description,
                        amount: exp.amount,
                        date: exp.date,
                        paymentMethod: 'نقدي',
                        vendor: '',
                        invoiceNumber: `EXP-${exp.id.toString().padStart(6, '0')}`,
                        notes: exp.description,
                        approvedBy: user?.name || 'المدير',
                        branch: exp.type
                    }))}
                    branch={selectedBranch || user?.branch || 'laban'}
                    title="تقرير المصروفات"
                    showPrintButton={true}
                />
            </div>
        </div>
      </div>
    </>
  );
}
