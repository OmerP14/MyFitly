import tr from '../locales/tr';
import en from '../locales/en';

const translations = {
  tr,
  en
};

export const getTranslation = (language, key) => {
  return translations[language]?.[key] || key;
};

export const getTranslations = (language) => {
  return translations[language] || translations.tr;
};

// Egzersiz isimlerini çevir - DEVRE DIŞI (egzersizler İngilizce kalacak)
export const translateExerciseName = (exerciseName, language) => {
  // Egzersiz isimleri her zaman orijinal haliyle dönsün
  return exerciseName;
};

// Program adını çevir
export const translateProgramName = (programName, language) => {
  if (!programName) return programName;
  if (language === 'en') {
    // Türkçe -> İngilizce
    return programName
      .replace(/Başlangıç/g, 'Beginner')
      .replace(/başlangıç/g, 'beginner')
      .replace(/Orta/g, 'Intermediate')
      .replace(/orta/g, 'intermediate')
      .replace(/İleri/g, 'Advanced')
      .replace(/ileri/g, 'advanced')
      .replace(/Gün /g, 'Day ');
  }
  // İngilizce -> Türkçe (TR dilinde)
  return programName
    .replace(/Beginner/g, 'Başlangıç')
    .replace(/beginner/g, 'Başlangıç')
    .replace(/Intermediate/g, 'Orta')
    .replace(/intermediate/g, 'Orta')
    .replace(/Advanced/g, 'İleri')
    .replace(/advanced/g, 'İleri')
    .replace(/Day /g, 'Gün ')
    .replace(/Legs Day/g, 'Bacak Günü')
    .replace(/Push Day/g, 'İtme Günü')
    .replace(/Pull Day/g, 'Çekme Günü');
};

// Program açıklamasını çevir (Türkçe <-> İngilizce)
export const translateProgramDescription = (description, language) => {
  if (!description) return description;

  if (language === 'en') {
    // Türkçe -> İngilizce
    let translated = description
      .replace(/Haftada (\d+) gün/gi, '$1 days a week')
      .replace(/(\d+) hafta/gi, '$1 weeks')
      .replace(/tüm vücut çalışan/gi, 'full body workout')
      .replace(/başlangıç seviyesi program/gi, 'beginner level program')
      .replace(/Yeni başlayanlar için ideal/gi, 'Ideal for beginners')
      .replace(/orta seviye program/gi, 'intermediate level program')
      .replace(/profesyonel program/gi, 'professional program')
      .replace(/ileri seviye/gi, 'advanced level')
      .replace(/Güç artırımı odaklı/gi, 'Strength focused')
      .replace(/güç odaklı/gi, 'strength focused')
      .replace(/İtme, çekme ve bacak hareketleri odaklı/gi, 'Focused on push, pull and leg movements')
      .replace(/İtme, çekme ve bacak günleri ayrımı ile/gi, 'With push, pull and leg day separation')
      .replace(/üst vücut ve alt vücut ayrımı yapan/gi, 'upper and lower body split')
      .replace(/yoğun kardiyovasküler sağlık ve core güçlendirme programı/gi, 'intense cardiovascular health and core strengthening program')
      .replace(/kardiyovasküler sağlık ve core güçlendirme programı/gi, 'cardiovascular health and core strengthening program')
      .replace(/yoğun/gi, 'intense')
      .replace(/güç ve kas gelişimi için ideal/gi, 'ideal for strength and muscle development')
      .replace(/güç artırımı için ideal/gi, 'ideal for strength gains')
      .replace(/kondisyon ve güç için ideal/gi, 'ideal for conditioning and strength')
      .replace(/HIIT ve güç antrenmanı kombinasyonu/gi, 'HIIT and strength training combination')
      .replace(/için ideal/gi, 'ideal for');
    return translated;
  }

  // İngilizce -> Türkçe (TR)
  let trText = description
    .replace(/(\d+) days a week/gi, 'Haftada $1 gün')
    .replace(/(\d+) weeks/gi, '$1 hafta')
    .replace(/full body workout/gi, 'tüm vücut antrenmanı')
    .replace(/beginner level program/gi, 'başlangıç seviyesi program')
    .replace(/Ideal for beginners/gi, 'Yeni başlayanlar için ideal')
    .replace(/intermediate level program/gi, 'orta seviye program')
    .replace(/professional program/gi, 'profesyonel program')
    .replace(/advanced level/gi, 'ileri seviye')
    .replace(/strength focused/gi, 'güç odaklı')
    .replace(/upper and lower body split/gi, 'üst vücut ve alt vücut ayrımı yapan')
    .replace(/intense cardiovascular health and core strengthening program/gi, 'yoğun kardiyovasküler sağlık ve core güçlendirme programı')
    .replace(/cardiovascular health and core strengthening program/gi, 'kardiyovasküler sağlık ve core güçlendirme programı')
    .replace(/ideal for strength and muscle development/gi, 'güç ve kas gelişimi için ideal')
    .replace(/ideal for strength gains/gi, 'güç artırımı için ideal')
    .replace(/ideal for conditioning and strength/gi, 'kondisyon ve güç için ideal')
    .replace(/HIIT and strength training combination/gi, 'HIIT ve güç antrenmanı kombinasyonu');
  return trText;
};

// Gün açıklamalarını çevir (Türkçe <-> İngilizce)
export const translateDayDescription = (description, language) => {
  if (!description) return description;

  if (language === 'en') {
    // Türkçe -> İngilizce
    return description
      .replace(/Temel bileşik hareketler ile tüm vücut/gi, 'Full body with basic compound movements')
      .replace(/Temel hareketler ile tüm vücut/gi, 'Basic movements with full body')
      .replace(/İtme hareketleri odaklı/gi, 'Push movements focused')
      .replace(/Çekme hareketleri odaklı/gi, 'Pull movements focused')
      .replace(/Bacak hareketleri odaklı/gi, 'Leg movements focused')
      .replace(/Üst vücut çalışması/gi, 'Upper body workout')
      .replace(/Alt vücut çalışması/gi, 'Lower body workout')
      .replace(/Kardiyo ve core hareketleri/gi, 'Cardio and core movements')
      .replace(/Kardiyo ve core/gi, 'Cardio and core')
      .replace(/Güç odaklı tüm vücut/gi, 'Strength focused full body')
      .replace(/Güç odaklı/gi, 'Strength focused')
      .replace(/Yoğun güç çalışması/gi, 'Intense strength workout')
      .replace(/Yoğun kardiyo ve core/gi, 'Intense cardio and core')
      .replace(/HIIT ve güç kombinasyonu/gi, 'HIIT and strength combination')
      .replace(/Üst vücut güçlendirme/gi, 'Upper body strengthening');
  }

  // İngilizce -> Türkçe
  return description
    .replace(/Full body with basic compound movements/gi, 'Temel bileşik hareketler ile tüm vücut')
    .replace(/Basic movements with full body/gi, 'Temel hareketler ile tüm vücut')
    .replace(/Push movements focused/gi, 'İtme hareketleri odaklı')
    .replace(/Pull movements focused/gi, 'Çekme hareketleri odaklı')
    .replace(/Leg movements focused/gi, 'Bacak hareketleri odaklı')
    .replace(/Upper body workout/gi, 'Üst vücut çalışması')
    .replace(/Lower body workout/gi, 'Alt vücut çalışması')
    .replace(/Cardio and core movements/gi, 'Kardiyo ve core hareketleri')
    .replace(/Cardio and core/gi, 'Kardiyo ve core')
    .replace(/Strength focused full body/gi, 'Güç odaklı tüm vücut')
    .replace(/Strength focused/gi, 'Güç odaklı')
    .replace(/Intense strength workout/gi, 'Yoğun güç çalışması')
    .replace(/Intense cardio and core/gi, 'Yoğun kardiyo ve core')
    .replace(/HIIT and strength combination/gi, 'HIIT ve güç kombinasyonu')
    .replace(/Upper body strengthening/gi, 'Üst vücut güçlendirme');
};

// Gün ismini çevir (Monday, Tuesday, vb.)
export const translateDayName = (dayName, language) => {
  if (!dayName) return dayName;
  if (language === 'tr') {
    return dayName
      .replace(/Monday/g, 'Pazartesi')
      .replace(/Tuesday/g, 'Salı')
      .replace(/Wednesday/g, 'Çarşamba')
      .replace(/Thursday/g, 'Perşembe')
      .replace(/Friday/g, 'Cuma')
      .replace(/Saturday/g, 'Cumartesi')
      .replace(/Sunday/g, 'Pazar')
      .replace(/Push Day/g, 'İtme Günü')
      .replace(/Pull Day/g, 'Çekme Günü')
      .replace(/Legs Day/g, 'Bacak Günü')
      .replace(/Upper A/g, 'Üst A')
      .replace(/Upper B/g, 'Üst B')
      .replace(/Lower A/g, 'Alt A')
      .replace(/Lower B/g, 'Alt B')
      .replace(/Push A/g, 'İtme A')
      .replace(/Push B/g, 'İtme B')
      .replace(/Pull A/g, 'Çekme A')
      .replace(/Pull B/g, 'Çekme B')
      .replace(/Legs A/g, 'Bacak A')
      .replace(/Day (\d+)/g, 'Gün $1');
  }
  return dayName;
};

export default translations;





