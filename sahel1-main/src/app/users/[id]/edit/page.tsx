"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
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
  Calendar,
  Check
} from "lucide-react";
import Link from "next/link";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  branch: 'laban' | 'tuwaiq';
  permissions: string[];
  createdAt: string;
  isActive: boolean;
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

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser, hasPermission } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    if (!hasPermission('manage_users')) {
      router.push('/');
      return;
    }
    
    fetchUser();
  }, [params.id]);

  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/users/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "فشل في جلب بيانات المستخدم",
        });
        router.push('/users');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ في الاتصال بالخادم",
      });
    }
  };

  const handleInputChange = (field: keyof UserData, value: any) => {
    if (user) {
      setUser({ ...user, [field]: value });
    }
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    if (user) {
      const newPermissions = checked
        ? [...user.permissions, permission]
        : user.permissions.filter(p => p !== permission);
      setUser({ ...user, permissions: newPermissions });
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/users/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          role: user.role,
          branch: user.branch,
          permissions: user.permissions,
          isActive: user.isActive,
        }),
      });

      if (response.ok) {
        toast({
          title: "نجاح",
          description: "تم تحديث المستخدم بنجاح",
        });
        router.push('/users');
      } else {
        const error = await response.json();
        toast({
          variant: "destructive",
          title: "خطأ",
          description: error.message || "فشل في تحديث المستخدم",
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
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'مدير النظام';
      case 'manager': return 'مدير';
      case 'employee': return 'موظف';
      default: return role;
    }
  };

  const getBranchLabel = (branch: string) => {
    switch (branch) {
      case 'laban': return 'فرع لبان';
      case 'tuwaiq': return 'فرع طويق';
      default: return branch;
    }
  };

  if (!user) {
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
          <Link href="/users">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 ml-2" />
              العودة
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">تعديل المستخدم</h1>
            <p className="text-gray-600 mt-2">تعديل معلومات المستخدم: {user.name}</p>
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

      <div className="grid gap-6 md:grid-cols-2">
        {/* المعلومات الأساسية */}
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
                value={user.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                value={user.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">الدور</Label>
              <Select
                value={user.role}
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
                value={user.branch}
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

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={user.isActive}
                onCheckedChange={(checked) => handleInputChange('isActive', checked)}
              />
              <Label htmlFor="isActive">حساب نشط</Label>
            </div>
          </CardContent>
        </Card>

        {/* معلومات إضافية */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              معلومات إضافية
            </CardTitle>
            <CardDescription>
              معلومات إضافية عن المستخدم
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>معرف المستخدم</Label>
              <div className="p-2 bg-gray-50 rounded text-sm font-mono">
                {user.id}
              </div>
            </div>

            <div className="space-y-2">
              <Label>تاريخ الإنشاء</Label>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>{formatDate(user.createdAt)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>الحالة الحالية</Label>
              <Badge variant={user.isActive ? "default" : "secondary"}>
                {user.isActive ? "نشط" : "غير نشط"}
              </Badge>
            </div>

            <div className="space-y-2">
              <Button variant="outline" className="w-full">
                <Key className="h-4 w-4 ml-2" />
                تغيير كلمة المرور
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* الصلاحيات */}
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availablePermissions.map((permission) => (
              <div key={permission} className="flex items-center space-x-2">
                <Checkbox
                  id={permission}
                  checked={user.permissions.includes(permission)}
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
  );
}