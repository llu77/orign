"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { 
  Settings, 
  Bell, 
  Shield, 
  Monitor, 
  Palette, 
  Save, 
  RefreshCw,
  Download,
  Upload,
  Database,
  Key
} from "lucide-react";

interface SettingsData {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    activityStatus: boolean;
    dataCollection: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    language: 'ar' | 'en';
    fontSize: 'small' | 'medium' | 'large';
  };
  system: {
    autoBackup: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    dataRetention: number;
  };
}

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<SettingsData>({
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    privacy: {
      profileVisibility: 'private',
      activityStatus: true,
      dataCollection: true,
    },
    appearance: {
      theme: 'light',
      language: 'ar',
      fontSize: 'medium',
    },
    system: {
      autoBackup: true,
      backupFrequency: 'weekly',
      dataRetention: 30,
    },
  });

  const handleSettingChange = (category: keyof SettingsData, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast({
          title: "نجاح",
          description: "تم حفظ الإعدادات بنجاح",
        });
      } else {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "فشل في حفظ الإعدادات",
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

  const handleExportData = async () => {
    try {
      const response = await fetch('/api/settings/export', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sahel-data-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "نجاح",
          description: "تم تصدير البيانات بنجاح",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في تصدير البيانات",
      });
    }
  };

  const handleBackupNow = async () => {
    try {
      const response = await fetch('/api/settings/backup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        toast({
          title: "نجاح",
          description: "تم إنشاء نسخة احتياطية بنجاح",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في إنشاء نسخة احتياطية",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">الإعدادات</h1>
          <p className="text-gray-600 mt-2">إدارة إعدادات النظام والتفضيلات الشخصية</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2"
        >
          {loading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          حفظ الإعدادات
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            عام
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            الإشعارات
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            الخصوصية
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            النظام
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  المظهر
                </CardTitle>
                <CardDescription>
                  تخصيص مظهر النظام
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">السمة</Label>
                  <Select
                    value={settings.appearance.theme}
                    onValueChange={(value) => handleSettingChange('appearance', 'theme', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">فاتح</SelectItem>
                      <SelectItem value="dark">داكن</SelectItem>
                      <SelectItem value="auto">تلقائي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">اللغة</Label>
                  <Select
                    value={settings.appearance.language}
                    onValueChange={(value) => handleSettingChange('appearance', 'language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ar">العربية</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fontSize">حجم الخط</Label>
                  <Select
                    value={settings.appearance.fontSize}
                    onValueChange={(value) => handleSettingChange('appearance', 'fontSize', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">صغير</SelectItem>
                      <SelectItem value="medium">متوسط</SelectItem>
                      <SelectItem value="large">كبير</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  عرض النظام
                </CardTitle>
                <CardDescription>
                  إعدادات عرض النظام والأداء
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>تحديث تلقائي</Label>
                    <p className="text-sm text-muted-foreground">
                      تحديث البيانات تلقائياً
                    </p>
                  </div>
                  <Switch
                    checked={true}
                    onCheckedChange={() => {}}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>عرض الإحصائيات</Label>
                    <p className="text-sm text-muted-foreground">
                      عرض الإحصائيات في لوحة التحكم
                    </p>
                  </div>
                  <Switch
                    checked={true}
                    onCheckedChange={() => {}}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>الرسوم البيانية</Label>
                    <p className="text-sm text-muted-foreground">
                      عرض الرسوم البيانية المتقدمة
                    </p>
                  </div>
                  <Switch
                    checked={true}
                    onCheckedChange={() => {}}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                إعدادات الإشعارات
              </CardTitle>
              <CardDescription>
                اختر أنواع الإشعارات التي تريد استقبالها
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>الإشعارات البريدية</Label>
                  <p className="text-sm text-muted-foreground">
                    استلام الإشعارات عبر البريد الإلكتروني
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.email}
                  onCheckedChange={(checked) => handleSettingChange('notifications', 'email', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>الإشعارات المباشرة</Label>
                  <p className="text-sm text-muted-foreground">
                    استلام الإشعارات المباشرة في النظام
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.push}
                  onCheckedChange={(checked) => handleSettingChange('notifications', 'push', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>الإشعارات النصية</Label>
                  <p className="text-sm text-muted-foreground">
                    استلام الإشعارات عبر الرسائل النصية
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.sms}
                  onCheckedChange={(checked) => handleSettingChange('notifications', 'sms', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                إعدادات الخصوصية
              </CardTitle>
              <CardDescription>
                إدارة خصوصيتك وأمان بياناتك
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="profileVisibility">رؤية الملف الشخصي</Label>
                  <Select
                    value={settings.privacy.profileVisibility}
                    onValueChange={(value) => handleSettingChange('privacy', 'profileVisibility', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">عام</SelectItem>
                      <SelectItem value="private">خاص</SelectItem>
                      <SelectItem value="friends">الأصدقاء فقط</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>حالة النشاط</Label>
                    <p className="text-sm text-muted-foreground">
                      إظهار حالة نشاطك للمستخدمين الآخرين
                    </p>
                  </div>
                  <Switch
                    checked={settings.privacy.activityStatus}
                    onCheckedChange={(checked) => handleSettingChange('privacy', 'activityStatus', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>جمع البيانات</Label>
                    <p className="text-sm text-muted-foreground">
                      السماح بجمع البيانات لتحسين النظام
                    </p>
                  </div>
                  <Switch
                    checked={settings.privacy.dataCollection}
                    onCheckedChange={(checked) => handleSettingChange('privacy', 'dataCollection', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  النسخ الاحتياطي
                </CardTitle>
                <CardDescription>
                  إعدادات النسخ الاحتياطي واستعادة البيانات
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>نسخ احتياطي تلقائي</Label>
                    <p className="text-sm text-muted-foreground">
                      إنشاء نسخ احتياطية تلقائية
                    </p>
                  </div>
                  <Switch
                    checked={settings.system.autoBackup}
                    onCheckedChange={(checked) => handleSettingChange('system', 'autoBackup', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backupFrequency">معدل النسخ الاحتياطي</Label>
                  <Select
                    value={settings.system.backupFrequency}
                    onValueChange={(value) => handleSettingChange('system', 'backupFrequency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">يومي</SelectItem>
                      <SelectItem value="weekly">أسبوعي</SelectItem>
                      <SelectItem value="monthly">شهري</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dataRetention">فترة الاحتفاظ بالبيانات (أيام)</Label>
                  <Input
                    id="dataRetention"
                    type="number"
                    value={settings.system.dataRetention}
                    onChange={(e) => handleSettingChange('system', 'dataRetention', parseInt(e.target.value))}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleBackupNow} className="flex-1">
                    <Database className="h-4 w-4 ml-2" />
                    نسخ احتياطي الآن
                  </Button>
                  <Button onClick={handleExportData} variant="outline" className="flex-1">
                    <Download className="h-4 w-4 ml-2" />
                    تصدير البيانات
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  الأمان
                </CardTitle>
                <CardDescription>
                  إعدادات الأمان والحماية
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>المصادقة الثنائية</Label>
                    <p className="text-sm text-muted-foreground">
                      تفعيل المصادقة الثنائية
                    </p>
                  </div>
                  <Switch
                    checked={false}
                    onCheckedChange={() => {}}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>تسجيل الدخول التلقائي</Label>
                    <p className="text-sm text-muted-foreground">
                      تسجيل الدخول تلقائياً
                    </p>
                  </div>
                  <Switch
                    checked={true}
                    onCheckedChange={() => {}}
                  />
                </div>

                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    تغيير كلمة المرور
                  </Button>
                </div>

                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    تسجيل الخروج من جميع الأجهزة
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}