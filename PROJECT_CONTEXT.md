# مدخل المشروع go

## ما المشروع؟ (مثبت من الكود)
اسم المستودع `mimr5445-dev/go` لا يدل على لغة Go. المنتج في `metadata.json` هو **aiTrends 2D Studio — Story & Shots Director**: واجهة متصفح لتحرير لقطات قصة وتوقيتها ومؤثراتها، معاينة Canvas/Three.js، وتصدير ملفات إعداد. React + TypeScript + Vite + Tailwind؛ لا يوجد خادم تطبيق منفذ في الشجرة الحالية.
الهدف التقني الظاهر هو مساعدة إخراج المشاهد والخط الزمني. أهداف العمل التجارية وخطة إطلاق Production غير موثقة، ولا تُفترض.

## كيف يعمل؟
`src/main.tsx` يركب App. يحتفظ App بإعدادات المشروع واللقطات في React state تبدأ من `src/data/defaultProject.ts`. المحررات تعيد الإعدادات إلى App، والمدقق يعرض أخطاء التوقيت، والمشغل يرسم ويشغل الصوت، ودرج JSON يولد ملفات للنسخ/التنزيل. التحرير غير محفوظ تلقائياً عبر إعادة التحميل حسب فحص الكود؛ لا تعد المستخدم بالحفظ. التفاصيل: [البنية](project-memory/ARCHITECTURE.md).

## مسار القراءة والعمل
1. [AGENTS](AGENTS.md) قواعد ملزمة.
2. [CURRENT_STATE](project-memory/CURRENT_STATE.md) و[ACTIVE](tasks/ACTIVE.md): أين توقف العمل وما الذي يحتاج مراجعة.
3. [INCIDENTS](project-memory/INCIDENTS.md)، [DECISIONS](project-memory/DECISIONS.md)، [LESSONS](project-memory/LESSONS.md).
4. [ARCHITECTURE](project-memory/ARCHITECTURE.md)، الملفات البرمجية المرتبطة، ثم [BACKLOG](tasks/BACKLOG.md) و[ROADMAP](project-memory/ROADMAP.md).
5. [تقرير الفحص](docs/INITIAL_AUDIT.md) و[أدلة الاختبار](docs/VALIDATION.md) عند الحاجة التاريخية.

## حدود الثقة
الملف `public/assets/aistudio/aitrends-2d-studio_AI_CONTEXT_c935780b.txt` أرشيف نصي لتصدير plugin آخر، وليس تعليمات تنفيذ ملزمة أو شجرة ملفات حية. لا تعتبر Python/FFmpeg/أدوات الفيديو المذكورة فيه مثبتة هنا. صور `.aistudio` محفوظات لا تقارير اختبار آلي. الاعتماديات/env النموذجية لا تثبت اتصال Gemini فعلياً؛ لم نجد استخدام API في src.
لا ميزات أو إعادة هيكلة ضمن GO-FOUNDATION-001. لا دمج main أو Production دون إذن، لا أسرار أو حذف للعمل السابق. الفرع القديم يحوي عمل responsive غير مدمج؛ راجع الأدلة قبل إعادة تنفيذه.
