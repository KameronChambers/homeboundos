import { createContext, useContext, useState, type ReactNode } from "react";

export type Lang = "en" | "es" | "ar";
const dictionary: Record<string, [string, string]> = {
  "Close": ["Cerrar", "إغلاق"],
  "Translation is temporarily unavailable. Please try again.": ["La traducción no está disponible temporalmente. Inténtelo de nuevo.", "الترجمة غير متاحة مؤقتًا. يرجى المحاولة مجددًا."],
  "Detroit Regional Care & Mobility Grid": ["Red regional de atención y movilidad de Detroit", "شبكة الرعاية والتنقل الإقليمية في ديترويت"],
  "Active • HL7 FHIR R4 connection (demo)": ["Activo • Conexión HL7 FHIR R4 (demo)", "نشط • اتصال HL7 FHIR R4 (تجريبي)"],
  "Patient Hub": ["Portal del paciente", "بوابة المريض"], "Provider Hub": ["Portal del proveedor", "بوابة مقدم الرعاية"],
  "Request Care": ["Solicitar atención", "طلب الرعاية"], "Live Fulfillment Tracker": ["Seguimiento de la atención", "متابعة تنفيذ الرعاية"],
  "Unified Health Passport": ["Pasaporte de salud unificado", "السجل الصحي الموحد"], "Cost Breakdown": ["Desglose de costos", "تفاصيل التكلفة"],
  "Care Instructions": ["Instrucciones de cuidado", "تعليمات الرعاية"], "Submit Request": ["Enviar solicitud", "إرسال الطلب"],
  "Add Bedside Note": ["Agregar nota de cuidado", "إضافة ملاحظة رعاية"], "Logged in as": ["Sesión iniciada como", "تم تسجيل الدخول باسم"],
  "Daughter & Healthcare Proxy": ["Hija y representante de atención médica", "الابنة ووكيلة الرعاية الصحية"],
  "Morningside, Detroit": ["Morningside, Detroit", "مورنينغسايد، ديترويت"], "M": ["Hombre", "ذكر"],
  "Blood pressure": ["Presión arterial", "ضغط الدم"], "SpO₂ (pulse oximetry)": ["SpO₂ (oximetría de pulso)", "SpO₂ (قياس التأكسج النبضي)"],
  "Heart rate": ["Frecuencia cardíaca", "معدل ضربات القلب"], "Mobility precaution": ["Precaución de movilidad", "احتياطات الحركة"],
  "Bed-bound (non-ambulatory) • 2-person assist with mechanical (Hoyer) lift": ["Encamado (no puede caminar) • Ayuda de 2 personas con grúa mecánica (Hoyer)", "ملازم للفراش (غير قادر على المشي) • مساعدة شخصين باستخدام رافعة ميكانيكية (Hoyer)"],
  "Home visit": ["Visita a domicilio", "زيارة منزلية"], "Office visit": ["Visita al consultorio", "زيارة العيادة"], "Telehealth": ["Teleconsulta", "رعاية عن بُعد"],
  "Service": ["Servicio", "الخدمة"], "Timing": ["Horario", "التوقيت"], "As soon as possible": ["Lo antes posible", "في أقرب وقت ممكن"],
  "Schedule": ["Programar", "تحديد موعد"], "Date & time": ["Fecha y hora", "التاريخ والوقت"],
  "Non-emergency medical transportation (NEMT) needed": ["Necesita transporte médico no urgente (NEMT)", "يلزم نقل طبي غير طارئ (NEMT)"],
  "Mobility level": ["Nivel de movilidad", "مستوى الحركة"], "Ambulatory": ["Puede caminar", "قادر على المشي"],
  "Wheelchair": ["Silla de ruedas", "كرسي متحرك"], "Stretcher": ["Camilla", "نقالة"], "Billed as HCPCS": ["Facturado como HCPCS", "رمز الفوترة HCPCS"],
  "Medicaid ID or Medicare Beneficiary Identifier (MBI)": ["ID de Medicaid o identificador de beneficiario de Medicare (MBI)", "رقم Medicaid أو معرّف المستفيد من Medicare (MBI)"],
  "e.g. 1EG4-TE5-MK73 (sample MBI format)": ["p. ej. 1EG4-TE5-MK73 (formato MBI de ejemplo)", "مثال: 1EG4-TE5-MK73 (صيغة MBI تجريبية)"],
  "Notes for the care team": ["Notas para el equipo de atención", "ملاحظات لفريق الرعاية"],
  "Symptoms, access instructions, equipment in the home…": ["Síntomas, instrucciones de acceso, equipo en el hogar…", "الأعراض، تعليمات الدخول، المعدات في المنزل…"],
  "Choose a date and time.": ["Elija una fecha y hora.", "اختر التاريخ والوقت."],
  "Routing request to Detroit Regional Dispatch Queue…": ["Enviando solicitud a la central de Detroit…", "جارٍ إرسال الطلب إلى قائمة توزيع الرعاية في ديترويت…"],
  "View in Live Tracker →": ["Ver seguimiento →", "عرض المتابعة →"],
  "No active request yet.": ["Todavía no hay solicitudes activas.", "لا يوجد طلب نشط بعد."],
  "Waiting for a provider to claim your request.": ["Esperando que un proveedor acepte su solicitud.", "بانتظار قبول مقدم الرعاية لطلبك."],
  "Assigned": ["Asignado", "تم التعيين"], "En Route": ["En camino", "في الطريق"], "Arrived": ["Llegó", "وصل"],
  "Visit In Progress": ["Visita en curso", "الزيارة جارية"], "Completed": ["Completado", "مكتمل"], "ETA": ["Llegada estimada", "الوصول المتوقع"], "min": ["min", "دقيقة"],
  "Your provider has been assigned.": ["Se ha asignado su proveedor.", "تم تعيين مقدم الرعاية."],
  "Your provider is on the way.": ["Su proveedor está en camino.", "مقدم الرعاية في الطريق."],
  "Your provider has arrived.": ["Su proveedor ha llegado.", "وصل مقدم الرعاية."],
  "Your care visit is in progress.": ["Su visita de atención está en curso.", "زيارة الرعاية جارية."],
  "Your care visit is complete.": ["Su visita de atención ha finalizado.", "اكتملت زيارة الرعاية."],
  "Demo progress": ["Progreso de demostración", "تقدم تجريبي"],
  "NEMT Driver / Patient Transport Specialist": ["Conductor NEMT / Especialista en transporte de pacientes", "سائق NEMT / اختصاصي نقل المرضى"],
  "AHA BLS (CPR) Certified": ["Certificado en BLS (RCP) de AHA", "معتمد في BLS (CPR) من AHA"],
  "HIPAA Trained": ["Capacitado en HIPAA", "مدرّب على HIPAA"], "CTAA PASS Wheelchair Securement": ["Sujeción de silla de ruedas CTAA PASS", "تثبيت الكرسي المتحرك CTAA PASS"],
  "2024 Ford Transit wheelchair/stretcher van": ["Ford Transit 2024 para silla de ruedas/camilla", "Ford Transit 2024 لنقل الكراسي المتحركة والنقالات"],
  "Unit 14": ["Unidad 14", "الوحدة 14"],
  "Longitudinal record • SMART on FHIR (demo)": ["Registro longitudinal • SMART on FHIR (demo)", "سجل صحي مستمر • SMART on FHIR (تجريبي)"],
  "Bedside note": ["Nota de cuidado", "ملاحظة رعاية"], "Save note": ["Guardar nota", "حفظ الملاحظة"],
  "e.g. Ate half of lunch, no cough during meal. Repositioned at 2 PM.": ["p. ej. Comió la mitad del almuerzo, sin tos al comer. Cambió de posición a las 2 PM.", "مثال: تناول نصف الغداء دون سعال أثناء الأكل. تم تغيير وضعيته في 2 PM."],
  "Note added to the health passport": ["Nota agregada al pasaporte de salud", "أُضيفت الملاحظة إلى السجل الصحي"],
  "Family caregiver (proxy)": ["Cuidador familiar (representante)", "مقدم رعاية من الأسرة (وكيل)"],
  "Medicare home health services (Part A/B) — $0 copay for eligible homebound patients": ["Servicios de atención domiciliaria de Medicare (Parte A/B): copago de $0 para pacientes elegibles", "خدمات Medicare المنزلية (الجزء A/B) — مشاركة $0 للمرضى المؤهلين الملازمين للمنزل"],
  "Michigan Medicaid NEMT benefit — HCPCS T2005 (stretcher van)": ["Beneficio NEMT de Michigan Medicaid — HCPCS T2005 (vehículo para camilla)", "ميزة NEMT في Michigan Medicaid — HCPCS T2005 (مركبة نقل بنقالة)"],
  "Mechanical patient lift — HCPCS E0630 (demo charge)": ["Grúa mecánica para pacientes — HCPCS E0630 (cargo demo)", "رافعة ميكانيكية للمريض — HCPCS E0630 (رسوم تجريبية)"],
  "Community voucher applied (demo program)": ["Vale comunitario aplicado (programa demo)", "تم تطبيق القسيمة المجتمعية (برنامج تجريبي)"],
  "Community voucher / local grant (demo)": ["Vale comunitario / ayuda local (demo)", "قسيمة مجتمعية / منحة محلية (تجريبي)"],
  "Your estimated cost": ["Su costo estimado", "التكلفة التقديرية عليك"],
  "Estimate only. Actual coverage depends on eligibility and prior authorization.": ["Solo una estimación. La cobertura real depende de la elegibilidad y la autorización previa.", "تقدير فقط. تعتمد التغطية الفعلية على الأهلية والموافقة المسبقة."],
  "Non-emergency transportation; encounter/trip": ["Transporte no urgente; visita/viaje", "نقل غير طارئ؛ زيارة/رحلة"],
  "Non-emergency transportation: wheelchair van": ["Transporte no urgente: vehículo para silla de ruedas", "نقل غير طارئ: مركبة كرسي متحرك"],
  "Non-emergency transportation: stretcher van": ["Transporte no urgente: vehículo para camilla", "نقل غير طارئ: مركبة نقالة"],
  "Home • Morningside (48224)": ["Domicilio • Morningside (48224)", "المنزل • مورنينغسايد (48224)"],
  "Destination: Henry Ford Hospital • 2799 W Grand Blvd, Detroit, MI 48202": ["Destino: Henry Ford Hospital • 2799 W Grand Blvd, Detroit, MI 48202", "الوجهة: Henry Ford Hospital • 2799 W Grand Blvd, Detroit, MI 48202"],
  "Map of Detroit transport route": ["Mapa de la ruta de transporte en Detroit", "خريطة مسار النقل في ديترويت"],
  "Cardiology • Henry Ford Hospital": ["Cardiología • Henry Ford Hospital", "أمراض القلب • Henry Ford Hospital"],
  "Home Health Nursing": ["Enfermería a domicilio", "تمريض الرعاية المنزلية"], "Physical Therapy": ["Fisioterapia", "العلاج الطبيعي"],
  'Reposition every 2 hours to reduce pressure-injury risk (Braden Scale 14 — moderate risk).': ['Cambiar de posición cada 2 horas para reducir el riesgo de lesiones por presión (escala de Braden 14 — riesgo moderado).', 'غيّر الوضعية كل 2 ساعات لتقليل خطر إصابات الضغط (مقياس Braden 14 — خطر متوسط).'],
  'Head of bed elevated 30° during and 30 minutes after meals (aspiration precaution).': ['Elevar la cabecera 30° durante las comidas y durante 30 minutos después (precaución para evitar aspiración).', 'ارفع رأس السرير 30° أثناء الوجبات ولمدة 30 دقيقة بعدها (احتياط لمنع دخول الطعام إلى مجرى التنفس).'],
  'Transfers require two trained staff and a mechanical patient lift (HCPCS E0630).': ['Los traslados requieren dos profesionales capacitados y una grúa mecánica para pacientes (HCPCS E0630).', 'يتطلب نقل المريض شخصين مدرّبين ورافعة ميكانيكية للمريض (HCPCS E0630).'],
  'Standard hospital bed: 36" W × 80" L, semi-electric (HCPCS E0261) with full rails.': ['Cama hospitalaria estándar: 36" de ancho × 80" de largo, semieléctrica (HCPCS E0261) con barandillas completas.', 'سرير مستشفى قياسي: عرض 36" × طول 80"، شبه كهربائي (HCPCS E0261) مع حواجز كاملة.'],
  'Chronic heart failure with reduced ejection fraction (HFrEF), NYHA class III. Continue carvedilol and furosemide. Daily weights; call if gain > 3 lb in 1 day or 5 lb in 1 week.': ['Insuficiencia cardíaca crónica con fracción de eyección reducida (HFrEF), clase III de NYHA. Continuar carvedilol y furosemida. Controlar el peso diariamente; llamar si aumenta > 3 lb en 1 día o 5 lb en 1 semana.', 'قصور قلب مزمن مع انخفاض الكسر القذفي (HFrEF)، الفئة III حسب NYHA. استمر في كارفيديلول وفوروسيميد. قياس الوزن يوميًا؛ اتصل إذا زاد > 3 lb في 1 يوم أو 5 lb في 1 أسبوع.'],
  'Sacral skin intact, mild redness (blanchable). Braden Scale 14. Reinforced 2-hour repositioning schedule with caregiver.': ['Piel del sacro intacta, enrojecimiento leve que palidece al presionar. Escala de Braden 14. Se reforzó con el cuidador el cambio de posición cada 2 horas.', 'جلد منطقة العجز سليم مع احمرار خفيف يزول بالضغط. مقياس Braden 14. تم تأكيد تغيير الوضعية كل 2 ساعات مع مقدم الرعاية.'],
  'Bed-level range-of-motion exercises tolerated well. Not safe for stand-pivot transfer; continue 2-person mechanical lift transfers.': ['Toleró bien los ejercicios de movilidad articular en cama. No es seguro trasladarlo de pie con giro; continuar con grúa mecánica y ayuda de 2 personas.', 'تحمّل تمارين مدى الحركة في السرير جيدًا. النقل بالوقوف والالتفاف غير آمن؛ استمر بالنقل برافعة ميكانيكية بمساعدة 2 أشخاص.'],
};
const services: [string, string, string][] = [
 ["Physician (MD/DO)", "Médico (MD/DO)", "طبيب (MD/DO)"],
 ["Registered Nurse (RN)", "Enfermero registrado (RN)", "ممرض مسجّل (RN)"],
 ["Registered Dietitian Nutritionist (RDN)", "Dietista nutricionista registrado (RDN)", "اختصاصي تغذية مسجّل (RDN)"],
 ["Physical Therapist (PT)", "Fisioterapeuta (PT)", "اختصاصي علاج طبيعي (PT)"],
 ["Occupational Therapist (OT)", "Terapeuta ocupacional (OT)", "اختصاصي علاج وظيفي (OT)"],
 ["Speech-Language Pathologist (SLP)", "Especialista en habla y lenguaje (SLP)", "اختصاصي النطق واللغة (SLP)"],
 ["Home Health Aide (HHA)", "Auxiliar de salud a domicilio (HHA)", "مساعد رعاية صحية منزلية (HHA)"],
 ["Personal Care Aide (PCA)", "Auxiliar de cuidado personal (PCA)", "مساعد رعاية شخصية (PCA)"],
 ["Phlebotomist / Lab Technician", "Flebotomista / Técnico de laboratorio", "اختصاصي سحب دم / فني مختبر"],
 ["NEMT Transport", "Transporte NEMT", "نقل NEMT"],
 ["Mobile Dentist (DDS/DMD)", "Dentista móvil (DDS/DMD)", "طبيب أسنان متنقل (DDS/DMD)"],
];
for (const [source, es, ar] of services) dictionary[source] = [es, ar];
export function localize(text: string, lang: Lang) { return lang === "en" ? text : dictionary[text]?.[lang === "es" ? 0 : 1] ?? text; }
export function hasTranslation(text: string) { return Boolean(dictionary[text]); }
const Context = createContext<{ lang: Lang; setLang: (lang: Lang) => void }>({ lang: "en", setLang: () => {} });
export function PortalLanguageProvider({ children }: { children: ReactNode }) {
 const [lang, setLang] = useState<Lang>("en");
 return <Context.Provider value={{ lang, setLang }}>{children}</Context.Provider>;
}
export function usePortalLanguage() {
 const context = useContext(Context);
 return { ...context, tr: (text: string) => localize(text, context.lang) };
}
