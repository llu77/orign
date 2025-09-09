"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { 
  User, 
  Mail, 
  Building, 
  Shield, 
  Save, 
  ArrowLeft, 
  Key,
  Plus
} from "lucide-react";
import Link from "next/link";

interface UserData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'employee';
  branch: 'laban' | 'tuwaiq';
  permissions: string[];
}

const availablePermissions = [
  'view_dashboard',
  'view_reports',
  'manage_revenues',
  'manage_expenses',
  'manage_users',
  'manage_bonus',
  'manage_requests',
  'approve_requests',
  'view_financial_reports',
  'export_data',
  'manage_settings',
  'system_admin'
];

export default function CreateUserPage() {
  const router = useRouter();
  const { user, hasPermission } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<UserData>({
    name: "",
    email: "",
    password: "",
    role: "employee",
    branch: "laban",
    permissions: [],
  });

  useEffect(() => {
    if (!hasPermission('manage_users')) {
      router.push('/');
      return;
    }
  }, []);

  const handleInputChange = (field: keyof UserData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    const newPermissions = checked
      ? [...formData.permissions, permission]
      : formData.permissions.filter(p => p !== permission);
    setFormData(prev => ({ ...prev, permissions: newPermissions }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/users', {
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
          description: "تم إنشاء المستخدم بنجاح",
        });
        router.push('/users');
      } else {
        const error = await response.json();
        toast({
          variant: "destructive",
          title: "خطأ",
          description: error.message || "فشل في إنشاء المستخدم",
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
          <Link href="/users">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 ml-2" />
              العودة
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">إنشاء مستخدم جديد</h1>
            <p className="text-gray-600 mt-2">إضافة مستخدم جديد للنظام</p>
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
          حفظ المستخدم
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              المعلومات الأساسية
            </CardTitle>
            <CardDescription>
              المعلومات الشخصية والأساسية للمستخدم
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">الاسم</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="text-right"
                placeholder="أدخل اسم المستخدم"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="text-right"
                placeholder="أدخل البريد الإلكتروني"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="text-right"
                placeholder="أدخل كلمة المرور"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="role">الدور</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleInputChange('role', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">مدير النظام</SelectItem>
                    <SelectItem value="manager">مدير</SelectItem>
                    <SelectItem value="employee">موظف</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="branch">الفرع</Label>
                <Select
                  value={formData.branch}
                  onValueChange={(value) => handleInputChange('branch', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="laban">فرع لبان</SelectItem>
                    <SelectItem value="tuwaiq">فرع طويق</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              الصلاحيات
            </CardTitle>
            <CardDescription>
              اختر الصلاحيات التي تمنحها للمستخدم
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {availablePermissions.map((permission) => (
                <div key={permission} className="flex items-center space-x-2">
                  <Checkbox
                    id={permission}
                    checked={formData.permissions.includes(permission)}
                    onCheckedChange={(checked) => handlePermissionChange(permission, checked as boolean)}
                  />
                  <Label htmlFor={permission} className="text-sm">
                    {permission.replace(/_/g, ' ')}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}