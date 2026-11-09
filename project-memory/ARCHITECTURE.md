# البنية الفعلية

مرجع الكود: 22fd1f2؛ لم يغير التكليف التأسيسي كود المنتج.

```text
index.html → src/main.tsx → App.tsx
 defaultProject.ts → React state (projectConfig + shotsConfig)
 محررات shot/audio/script → callbacks → setShotsConfig
 shotsConfig → validateShots → ValidationBanner
 shots/time/style/aspect → ViewportPlayer → Canvas 2D + ThreeOrbitStage + Web Audio
 shots/time → TimelineTrack → selection/seek callbacks → App
 state → JsonCodeDrawer → copy/download (shots.json/config.json/نصوص مساعدة)
```

## المكونات
- `src/types/studio.ts`: عقود Shot وStoryShotsConfig وProjectConfig وSFXCue؛ at زمن نسبي داخل اللقطة، start/end زمن المشروع، gain بالديسيبل.
- `src/data/defaultProject.ts`: إعدادات/قوالب/شخصيات افتراضية، مصدر بدء الجلسة لا قاعدة بيانات.
- `src/App.tsx`: مالك الحالة؛ تحرير/تقسيم/حذف/إضافة ومحاذاة ومؤثرات وتبويبات. لا persistence أو استعادة عند البدء في الكود الحالي.
- `src/utils/invariantValidator.ts`: البداية صفر، الاتصال الزمني، مطابقة نهاية المدة، تفرد IDs، صلاحية المدة، تحذيرات SFX والموسيقى. التعليق «11 invariants» ليس دليلاً على اختبار أحد عشر شرطاً؛ راجع التنفيذ. autoAlignShots يحفظ المدة الدنيا 0.5 ويعيد حساب duration.
- `src/components/ViewportPlayer.tsx`: requestAnimationFrame وزمن محلي، renderShotToCanvas، إنشاء stage ثلاثي الأبعاد ومؤثرات الصوت.
- `src/engine/core.ts`: حسابات ومزاج/ألوان وأدوات رسم؛ `rig2d.ts` شخصيات؛ `fx2d.ts` مؤثرات؛ `ui2d.ts` نصوص/واجهة الرسم؛ `shotRenderer.ts` تركيب المشهد؛ `threeStage.ts` Three.js؛ `audioSynth.ts` Web Audio إجرائي داخل المتصفح.
- `ScriptToBeatsModal.tsx`: تقسيم نص وتقدير مدد محلياً، لا استدعاء Python فعلي رغم تسمية tools/beats.py في الواجهة.
- `JsonCodeDrawer.tsx`: تصدير ملفات منفردة؛ لا مسار تحميل/حفظ تلقائي مثبت. تصدير مثال shot لا يعني وجود تلك المجلدات في المستودع.
- `src/index.css` + Tailwind: التنسيق؛ `vite.config.ts` إضافة React/Tailwind وHMR بحسب DISABLE_HMR. اختلافات الهاتف بالفرع السابق لم تُدمج.

## الحدود
لا API/backend/database/service worker مثبتة. express وgenai موجودان كاعتماديات دون استخدام مثبت في src. ذكر Gemini في metadata وenv ليس تكاملاً منفذاً. `public/assets/aistudio/*.txt` تصدير تاريخي خارجي؛ Python/FFmpeg والإضافات المذكورة فيه ليست مكونات حية هنا. build ينتج dist (متجاهل في Git)، ليس نشر Production. القيم والأسرار الحقيقية لا تدخل الذاكرة.
