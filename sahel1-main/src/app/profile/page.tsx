"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Building, Calendar, Shield, Edit, Save, X } from "lucide-react";

interface ProfileData {
  name: string;
  email: string;
  branch: string;
  role: string;
  createdAt: string;
  permissions: string[];
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileData>({
    name: "",
    email: "",
    branch: "",
    role: "",
    createdAt: "",
    permissions: []
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        branch: user.branch,
        role: user.role,
        createdAt: user.createdAt,
        permissions: user.permissions || []
      });
    }
  }, [user]);

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/users/${user?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
        }),
      });

      if (response.ok) {
        updateUser({ ...user!, name: formData.name, email: formData.email });
        setIsEditing(false);
        toast({
          title: "نجاح",
          description: "تم تحديث الملف الشخصي بنجاح",
        });
      } else {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "فشل في تحديث الملف الشخصي",
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

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        branch: user.branch,
        role: user.role,
        createdAt: user.createdAt,
        permissions: user.permissions || []
      });
    }
    setIsEditing(false);
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">الملف الشخصي</h1>
          <p className="text-gray-600 mt-2">عرض وتحرير معلوماتك الشخصية</p>
        </div>
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            تعديل المعلومات
          </Button>
        )}
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
              معلوماتك الشخصية والأساسية
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">الاسم</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="text-right"
                />
              ) : (
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>{formData.name}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="text-right"
                />
              ) : (
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{formData.email}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>الفرع</Label>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <Building className="h-4 w-4 text-gray-500" />
                <span>{getBranchLabel(formData.branch)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>تاريخ الانضمام</Label>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>{formatDate(formData.createdAt)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* معلومات الدور والصلاحيات */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              معلومات الدور
            </CardTitle>
            <CardDescription>
              دورك في النظام والصلاحيات الممنوحة لك
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>الدور</Label>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <Shield className="h-4 w-4 text-gray-500" />
                <Badge variant="secondary">
                  {getRoleLabel(formData.role)}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label>الصلاحيات</Label>
              <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded">
                {formData.permissions.map((permission, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {permission}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* أزرار الحفظ والإلغاء */}
      {isEditing && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
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
              <Button
                variant="outline"
                onClick={handleCancel}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                إلغاء
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}