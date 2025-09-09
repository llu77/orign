"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { 
  Gift, 
  DollarSign, 
  Save, 
  ArrowLeft, 
  Settings,
  Target,
  Plus
} from "lucide-react";
import Link from "next/link";

interface BonusRuleData {
  name: string;
  description: string;
  amount: number;
  type: 'fixed' | 'percentage';
  conditions: any[];
  active: boolean;
}

export default function CreateBonusRulePage() {
  const router = useRouter();
  const { user, hasPermission } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<BonusRuleData>({
    name: "",
    description: "",
    amount: 0,
    type: "fixed",
    conditions: [],
    active: true,
  });

  useEffect(() => {
    if (!hasPermission('manage_bonus')) {
      router.push('/');
      return;
    }
  }, []);

  const handleInputChange = (field: keyof BonusRuleData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.description || formData.amount <= 0) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/bonus-rules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: "نجاح",
          description: "تمت إضافة قاعدة المكافأة بنجاح",
        });
        router.push('/bonus-rules');
      } else {
        const error = await response.json();
        toast({
          variant: "destructive",
          title: "خطأ",
          description: error.message || "فشل في إضافة قاعدة المكافأة",
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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/bonus-rules">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 ml-2" />
              العودة
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">إضافة قاعدة مكافأة جديدة</h1>
            <p className="text-gray-600 mt-2">إدخال بيانات قاعدة المكافأة الجديدة</p>
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
          حفظ القاعدة
        </Button>
      </div>

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
            <Gift className="h-8 w-8 text-purple-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            إضافة قاعدة مكافأة جديدة
          </CardTitle>
          <CardDescription>
            أدخل بيانات قاعدة المكافأة الجديدة
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center">
                <Target className="h-4 w-4 ml-2 text-purple-600" />
                اسم القاعدة
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="text-right"
                placeholder="اسم القاعدة"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="flex items-center">
                <DollarSign className="h-4 w-4 ml-2 text-purple-600" />
                المبلغ
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', parseFloat(e.target.value))}
                className="text-right"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">نوع المكافأة</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleInputChange('type', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed">مبلغ ثابت</SelectItem>
                <SelectItem value="percentage">نسبة مئوية</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center">
              <Settings className="h-4 w-4 ml-2 text-purple-600" />
              الوصف
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="min-h-[100px] text-right resize-none"
              placeholder="أدخل وصفاً لقاعدة المكافأة..."
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
                  حفظ القاعدة
                </div>
              )}
            </Button>
            
            <Link href="/bonus-rules">
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