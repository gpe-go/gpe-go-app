// One-off: ajusta etiquetas de créditos en Acerca de.
//  - about_support           → "Apoyo"
//  - about_itnl_angela_role  → "Jefa de la Carrera... y Asesora de Proyecto"
//  - about_itnl_marta_role   → "Docente del ITNL y Asesora de Proyecto"
const fs = require('fs');
const path = require('path');

const T = {
  es: {
    about_support: 'Apoyo',
    about_itnl_angela_role: 'Jefa de la Carrera de Ingeniería en Sistemas Computacionales y Asesora de Proyecto',
    about_itnl_marta_role: 'Docente del ITNL y Asesora de Proyecto',
  },
  en: {
    about_support: 'Support',
    about_itnl_angela_role: 'Head of the Computer Systems Engineering program and Project Advisor',
    about_itnl_marta_role: 'ITNL Faculty Member and Project Advisor',
  },
  fr: {
    about_support: 'Soutien',
    about_itnl_angela_role: 'Cheffe du programme d’Ingénierie en Systèmes Informatiques et Conseillère de Projet',
    about_itnl_marta_role: 'Enseignante de l’ITNL et Conseillère de Projet',
  },
  pt: {
    about_support: 'Apoio',
    about_itnl_angela_role: 'Chefe do curso de Engenharia em Sistemas Computacionais e Assessora de Projeto',
    about_itnl_marta_role: 'Docente do ITNL e Assessora de Projeto',
  },
  de: {
    about_support: 'Unterstützung',
    about_itnl_angela_role: 'Leiterin des Studiengangs Informatiktechnik und Projektbetreuerin',
    about_itnl_marta_role: 'Dozentin am ITNL und Projektbetreuerin',
  },
  ja: {
    about_support: 'サポート',
    about_itnl_angela_role: 'コンピュータシステム工学科 学科長 兼 プロジェクトアドバイザー',
    about_itnl_marta_role: 'ITNL 教員 兼 プロジェクトアドバイザー',
  },
  ar: {
    about_support: 'دعم',
    about_itnl_angela_role: 'رئيسة قسم هندسة نظم الحاسوب ومستشارة المشروع',
    about_itnl_marta_role: 'عضو هيئة تدريس في ITNL ومستشارة المشروع',
  },
  af: {
    about_support: 'Ondersteuning',
    about_itnl_angela_role: 'Hoof van die Rekenaarstelsel-ingenieurswese-program en Projekraadgewer',
    about_itnl_marta_role: 'ITNL-dosent en Projekraadgewer',
  },
  ko: {
    about_support: '지원',
    about_itnl_angela_role: '컴퓨터 시스템 공학과 학과장 및 프로젝트 자문',
    about_itnl_marta_role: 'ITNL 교수 및 프로젝트 자문',
  },
  nl: {
    about_support: 'Ondersteuning',
    about_itnl_angela_role: 'Hoofd van de opleiding Computer Systems Engineering en Projectadviseur',
    about_itnl_marta_role: 'ITNL-docent en Projectadviseur',
  },
  uk: {
    about_support: 'Підтримка',
    about_itnl_angela_role: 'Завідувачка кафедри інженерії комп’ютерних систем і консультантка проєкту',
    about_itnl_marta_role: 'Викладачка ITNL і консультантка проєкту',
  },
  sv: {
    about_support: 'Support',
    about_itnl_angela_role: 'Programansvarig för Datateknik och projektrådgivare',
    about_itnl_marta_role: 'ITNL-lärare och projektrådgivare',
  },
  pl: {
    about_support: 'Wsparcie',
    about_itnl_angela_role: 'Kierowniczka kierunku Inżynieria Systemów Komputerowych i Doradczyni Projektu',
    about_itnl_marta_role: 'Wykładowczyni ITNL i Doradczyni Projektu',
  },
  sq: {
    about_support: 'Mbështetje',
    about_itnl_angela_role: 'Drejtuese e Programit të Inxhinierisë së Sistemeve Kompjuterike dhe Këshilltare e Projektit',
    about_itnl_marta_role: 'Pedagoge në ITNL dhe Këshilltare e Projektit',
  },
};

const dir = path.join(__dirname, '..', 'src', 'i18n', 'locales');

for (const lang of Object.keys(T)) {
  const file = path.join(dir, `${lang}.json`);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  Object.assign(data, T[lang]);
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`${lang}: about_support, about_itnl_angela_role, about_itnl_marta_role updated`);
}
