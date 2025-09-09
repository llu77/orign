"use client";

import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Briefcase, Eye, EyeOff, Shield, Mail, Lock, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Logo from '@/components/ui/logo';
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState("");
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError("");
    
    try {
      await login(email, password);
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "مرحباً بك في نظام سهل المالي",
      });
      
      // Save credentials if remember me is checked
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      
    } catch (error: any) {
      const errorMessage = error.message || "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
      setLoginError(errorMessage);
      toast({
        variant: "destructive",
        title: "فشل تسجيل الدخول",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // Load remembered email on component mount
  React.useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleQuickLogin = (userEmail: string, userPassword: string) => {
    setEmail(userEmail);
    setPassword(userPassword);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto mb-4">
            <Logo width={180} height={70} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">نظام سهل المالي</h1>
          <p className="text-gray-600">نظام متكامل لإدارة الإيرادات والمصروفات</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-gray-900 text-center">
              تسجيل الدخول
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              أدخل بيانات حسابك للوصول إلى النظام
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Error Alert */}
            {loginError && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-800">
                  {loginError}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium flex items-center">
                  <Mail className="h-4 w-4 ml-2 text-blue-600" />
                  البريد الإلكتروني
                </Label>
                <div className="relative">
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="أدخل بريدك الإلكتروني"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    disabled={loading}
                    className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors pr-10"
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium flex items-center">
                  <Lock className="h-4 w-4 ml-2 text-blue-600" />
                  كلمة المرور
                </Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"}
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    disabled={loading}
                    placeholder="أدخل كلمة المرور"
                    className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors pr-10"
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    disabled={loading}
                  />
                  <Label htmlFor="rememberMe" className="text-sm text-gray-600">
                    تذكرني
                  </Label>
                </div>
                <Button
                  type="button"
                  variant="link"
                  className="text-sm text-blue-600 hover:text-blue-800 p-0 h-auto"
                  disabled={loading}
                >
                  نسيت كلمة المرور؟
                </Button>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full h-11 font-semibold bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || !email || !password}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    جاري تسجيل الدخول...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Shield className="h-4 w-4 ml-2" />
                    تسجيل الدخول
                  </div>
                )}
              </Button>
            </form>

            {/* Demo Accounts */}
            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 text-center mb-3">
                حسابات تجريبية للتجربة:
              </p>
              <div className="grid grid-cols-1 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-sm justify-start h-auto p-3 border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                  onClick={() => handleQuickLogin("admin@sahel.com", "Admin1230")}
                  disabled={loading}
                >
                  <div className="text-right">
                    <div className="font-medium">مدير النظام</div>
                    <div className="text-xs text-gray-500">admin@sahel.com</div>
                  </div>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-sm justify-start h-auto p-3 border-gray-300 hover:border-green-500 hover:bg-green-50"
                  onClick={() => handleQuickLogin("user@sahel.com", "user123")}
                  disabled={loading}
                >
                  <div className="text-right">
                    <div className="font-medium">مستخدم عادي</div>
                    <div className="text-xs text-gray-500">user@sahel.com</div>
                  </div>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>&copy; 2024 نظام سهل المالي. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </main>
  );
}