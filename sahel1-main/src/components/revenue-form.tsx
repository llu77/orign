"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { TrendingUp, DollarSign, Calendar, FolderOpen, FileText, ArrowRight } from "lucide-react";

const revenueSchema = z.object({
  amount: z.string().min(1, "المبلغ مطلوب"),
  date: z.string().min(1, "التاريخ مطلوب"),
  description: z.string().optional(),
  category: z.string().min(1, "الفئة مطلوبة"),
});

type RevenueFormData = z.infer<typeof revenueSchema>;

interface RevenueFormProps {
  onSuccess?: () => void;
  initialData?: Partial<RevenueFormData>;
  onCancel?: () => void;
}

const revenueCategories = [
  "مبيعات",
  "خدمات",
  "استثمارات",
  "إيجارات",
  "عمولات",
  "هدايا",
  "أخرى"
];

export default function RevenueForm({ onSuccess, initialData, onCancel }: RevenueFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<RevenueFormData>({
    resolver: zodResolver(revenueSchema),
    defaultValues: {
      amount: initialData?.amount || "",
      date: initialData?.date || new Date().toISOString().split('T')[0],
      description: initialData?.description || "",
      category: initialData?.category || "",
    },
  });

  const onSubmit = async (data: RevenueFormData) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يجب تسجيل الدخول أولاً",
      });
      return;
    }

    setLoading(true);
    try {
      const isEdit = initialData && initialData.amount;
      const url = isEdit ? `/api/revenues?id=${initialData.id}` : '/api/revenues';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ...data,
          user_id: user.id,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "نجاح",
          description: isEdit ? "تم تعديل الإيراد بنجاح" : "تمت إضافة الإيراد بنجاح",
        });
        form.reset();
        onSuccess?.();
      } else {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: result.error || isEdit ? "فشل في تعديل الإيراد" : "فشل في إضافة الإيراد",
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

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg border-0 bg-gradient-to-br from-white to-green-50">
      <CardHeader className="text-center pb-6">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <TrendingUp className="h-8 w-8 text-green-600" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-800">
          {initialData ? "تعديل إيراد" : "إضافة إيراد جديد"}
        </CardTitle>
        <p className="text-gray-600">
          {initialData ? "تحديث بيانات الإيراد" : "أدخل بيانات الإيراد الجديد"}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-gray-700 font-medium flex items-center">
                      <DollarSign className="h-4 w-4 ml-2 text-green-600" />
                      المبلغ
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="h-12 text-lg border-gray-300 focus:border-green-500 focus:ring-green-500 transition-colors"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-gray-700 font-medium flex items-center">
                      <Calendar className="h-4 w-4 ml-2 text-green-600" />
                      التاريخ
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        className="h-12 border-gray-300 focus:border-green-500 focus:ring-green-500 transition-colors"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-gray-700 font-medium flex items-center">
                    <FolderOpen className="h-4 w-4 ml-2 text-green-600" />
                    الفئة
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 border-gray-300 focus:border-green-500 focus:ring-green-500 transition-colors">
                        <SelectValue placeholder="اختر الفئة" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="border-gray-200">
                      {revenueCategories.map((category) => (
                        <SelectItem 
                          key={category} 
                          value={category}
                          className="hover:bg-green-50 cursor-pointer"
                        >
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-gray-700 font-medium flex items-center">
                    <FileText className="h-4 w-4 ml-2 text-green-600" />
                    الوصف (اختياري)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="أدخل وصفاً للإيراد..."
                      className="min-h-[100px] border-gray-300 focus:border-green-500 focus:ring-green-500 transition-colors resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full h-12 text-lg font-semibold bg-green-600 hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  جاري الحفظ...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  {initialData ? "تحديث الإيراد" : "إضافة الإيراد"}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </div>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}