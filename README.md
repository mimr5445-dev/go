# go — aiTrends 2D Studio

محرر قصة ولقطات وخط زمني بواجهة React/TypeScript، معاينة 2D/3D ومؤثرات Web Audio وتصدير JSON. ليس مشروعاً بلغة Go.

**ابدأ من [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) ثم [AGENTS.md](AGENTS.md).**

## تشغيل محلي
المسار الذي اختُبر في 2026-11-09: Node v22.22.3 وBun v1.4.4 مع `bun.lock` الحالي:
```sh
bun install --frozen-lockfile
npm run dev
npm run lint
npm run build
python3 tests/check_memory.py
```
يمكن استعمال `npm exec --yes --package=bun@1.4.4 -- bun install --frozen-lockfile` إن لم يكن Bun مثبتاً (يتطلب الشبكة). `npm install` العادي فشل بتعارض peer dependencies؛ لا تستبدل lockfile أو تستخدم force لإخفاء ذلك، انظر INC-003. Bun منع postinstall لاثنتين من الحزم؛ نجح فحص الأنواع والبناء دون إجازتهما.
`dev` يستمع على 0.0.0.0:3000؛ إعداد allowedHosts للمعاينات الموكلة غير موجود في الفرع الحالي، لا نفترض نجاح رابط preview. لا تُرخِ الحماية دون مراجعة.

لا تحتاج المعاينة المطبقة مفتاح Gemini حسب فحص src. `.env.example` أمثلة بيئة قديمة، لا مفاتيح فعلية. لا تضع أسراراً في كود المتصفح.

## قيود مهمة
التعديلات في الذاكرة فقط؛ نزّل الملفات من درج التصدير قبل مغادرة الصفحة. ليس هذا نظام حفظ/استعادة متكاملاً. لم تُضف اختبارات منتج آلية بعد؛ فحص التوثيق ليس بديلاً عنها.

## خريطة الإدارة
- [الحالة](project-memory/CURRENT_STATE.md) / [المهمة الحالية](tasks/ACTIVE.md) / [المستقبل](tasks/BACKLOG.md).
- [الحوادث](project-memory/INCIDENTS.md) / [القرارات](project-memory/DECISIONS.md) / [الخطة](project-memory/ROADMAP.md).
- [البنية](project-memory/ARCHITECTURE.md) / [التاريخ](docs/INITIAL_AUDIT.md) / [نتائج التحقق](docs/VALIDATION.md).
- [قالب التكليف](tasks/templates/TASK_TEMPLATE.md) / [المكتمل](tasks/completed/README.md) / [الأرشيف](project-memory/archive/README.md).
