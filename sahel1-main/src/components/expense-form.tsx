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

const expenseSchema = z.object({
  amount: z.string().min(1, "المبلغ مطلوب"),
  date: z.string().min(1, "التاريخ مطلوب"),
  description: z.string().optional(),
  category: z.string().min(1, "الفئة مطلوبة"),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
  onSuccess?: () => void;
  initialData?: Partial<ExpenseFormData>;
}

const expenseCategories = [
  "تشغيل",
  "تسويق",
  "إداري",
  "صيانة",
  "موظفين",
  "مرافق",
  "تكنولوجيا",
  "تدريب",
  "سفر",
  "أخرى"
];

export default function ExpenseForm({ onSuccess, initialData }: ExpenseFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: initialData?.amount || "",
      date: initialData?.date || new Date().toISOString().split('T')[0],
      description: initialData?.description || "",
      category: initialData?.category || "",
    },
  });

  const onSubmit = async (data: ExpenseFormData) => {
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
      const response = await fetch('/api/expenses', {
        method: 'POST',
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
          description: "تمت إضافة المصروف بنجاح",
        });
        form.reset();
        onSuccess?.();
      } else {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: result.error || "فشل في إضافة المصروف",
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
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          {initialData ? "تعديل مصروف" : "إضافة مصروف جديد"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المبلغ</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>التاريخ</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الفئة</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الفئة" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {expenseCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الوصف (اختياري)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="أدخل وصفاً للمصروف..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "جاري الحفظ..." : initialData ? "تحديث المصروف" : "إضافة المصروف"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}