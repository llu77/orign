# نظام سهل المالي

نظام مالي متكامل مصمم لإدارة الإيرادات والمصروفات والموظفين والطلبات بفعالية.

## المميزات

- 📊 **إدارة مالية شاملة**: تتبع الإيرادات والمصروفات بسهولة
- 📈 **تقارير ورسوم بيانية**: تحليلات متقدمة مع رسوم بيانية تفاعلية
- 👥 **نظام مستخدمين**: مصادقة آمنة مع أدوار (مشرف/مستخدم)
- 📋 **إدارة الطلبات**: نظام متكامل لإدارة طلبات الموظفين وطلبات المنتجات
- 🎁 **نظام المكافآت**: إدارة قواعد المكافآت ودفعاتها
- 📱 **تصميم متجاوب**: يعمل على جميع الأجهزة
- 🌐 **دعم اللغة العربية**: واجهة عربية بالكامل مع دعم RTL

## التقنيات المستخدمة

- **Frontend**: Next.js 14, React, TypeScript
- **UI Components**: Radix UI, Tailwind CSS
- **Charts**: Recharts
- **Database**: SQLite مع Cloudflare D1
- **Deployment**: Cloudflare Pages
- **Authentication**: JWT Tokens
- **Form Handling**: React Hook Form مع Zod

## التثبيت والتشغيل

### المتطلبات
- Node.js 18+
- npm أو yarn
- حساب Cloudflare

### خطوات التثبيت

1. **نسخ المشروع**
   ```bash
   git clone <repository-url>
   cd sahel1
   ```

2. **تثبيت الحزم**
   ```bash
   npm install
   ```

3 **إعداد قاعدة البيانات**
   ```bash
   # تثبيت Wrangler CLI
   npm install -g wrangler
   
   # تسجيل الدخول إلى Cloudflare
   wrangler login
   
   # إنشاء قاعدة البيانات
   wrangler d1 create financial-db
   
   # تحديث ملف wrangler.toml مع معرف قاعدة البيانات
   
   # تطبيق الهجرة
   wrangler d1 execute financial-db --file=./migrations/init.sql
   ```

4. **إعداد المتغيرات البيئية**
   ```bash
   # نسخ ملف المتغيرات
   cp .env.example .env
   
   # تحديث القيم في ملف .env
   ```

5. **التشغيل المحلي**
   ```bash
   # تشغيل الخادم المحلي
   npm run dev
   
   # تشغيل مع قاعدة بيانات محلية
   npm run cf:dev
   ```

## النشر على Cloudflare

### 1. إعداد Project على Cloudflare Pages
1. اذهب إلى Cloudflare Dashboard
2. اختر Pages > Create a project
3. ربط المشروع مع GitHub repository
4. إعدادات البناء:
   - Build command: `npm run build`
   - Build output directory: `.next`
   - Node.js version: 18

### 2. إعداد قاعدة البيانات
```bash
# نشر قاعدة البيانات
wrangler d1 execute financial-db --file=./migrations/init.sql --remote

# نشر المتغيرات البيئية
wrangler secret put JWT_SECRET
wrangler secret put DB_ID
```

### 3. النشر
```bash
# بناء ونشر المشروع
npm run build
wrangler pages publish .next --project-name=sahel-financial-system
```

## هيكل المشروع

```
src/
├── app/                    # صفحات التطبيق
│   ├── api/               # واجهات برمجة التطبيقات
│   ├── expenses/          # صفحة المصروفات
│   ├── revenues/          # صفحة الإيرادات
│   ├── reports/           # صفحة التقارير
│   └── login/             # صفحة تسجيل الدخول
├── components/            # المكونات
│   ├── ui/                # مكونات واجهة المستخدم
│   ├── expense-form.tsx   # نموذج المصروفات
│   ├── revenue-form.tsx   # نموذج الإيرادات
│   └── request-form.tsx   # نموذج الطلبات
├── contexts/              # Context Providers
│   ├── auth-context.tsx   # سياق المصادقة
│   └── financial-data-context.tsx # سياق البيانات المالية
└── lib/                   # وظائف مساعدة
    └── utils.ts           # وظائف عامة
```

## استخدام النظام

### تسجيل الدخول
- البريد الإلكتروني: `admin@sahel.com`
- كلمة المرور: `Admin1230`

### الميزات الرئيسية

1. **الإيرادات**
   - إضافة إيرادات جديدة مع الفئات
   - عرض وتحليل الإيرادات
   - تقارير الإيرادات الشهرية

2. **المصروفات**
   - تسجيل المصروفات مع التصنيف
   - متابعة المصروفات الشهرية
   - تحليل توزيع المصروفات

3. **التقارير**
   - تقارير مالية شاملة
   - رسوم بيانية تفاعلية
   - تصدير التقارير بصيغة CSV

4. **إدارة المستخدمين**
   - إضافة وإدارة المستخدمين
   - تحديد صلاحيات المستخدمين
   - متابعة نشاط المستخدمين

## المساهمة

1. Fork المشروع
2. إنشاء branch جديد (`git checkout -b feature/amazing-feature`)
3. Commit التغييرات (`git commit -m 'Add some amazing feature'`)
4. Push إلى الbranch (`git push origin feature/amazing-feature`)
5. فتح Pull Request

## الرخصة

هذا المشروع مرخص تحت رخصة MIT - انظر ملف [LICENSE](LICENSE) للمزيد من المعلومات.

## الدعم

لأي استفسارات أو مشاكل، يرجى فتح issue في GitHub repository.