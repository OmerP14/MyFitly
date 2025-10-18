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
      .replace(/Gün /g, 'Day ')
      .replace(/Push Pull Legs/g, 'Push Pull Legs')
      .replace(/Full Body/g, 'Full Body')
      .replace(/Upper Lower/g, 'Upper Lower')
      .replace(/Split/g, 'Split')
      .replace(/İtme Günü/g, 'Push Day')
      .replace(/Çekme Günü/g, 'Pull Day')
      .replace(/Bacak Günü/g, 'Leg Day')
      .replace(/Üst A/g, 'Upper A')
      .replace(/Üst B/g, 'Upper B')
      .replace(/Alt A/g, 'Lower A')
      .replace(/Alt B/g, 'Lower B')
      .replace(/İtme A/g, 'Push A')
      .replace(/İtme B/g, 'Push B')
      .replace(/Çekme A/g, 'Pull A')
      .replace(/Çekme B/g, 'Pull B')
      .replace(/Bacak A/g, 'Leg A')
      .replace(/Bacak B/g, 'Leg B');
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
    .replace(/Push Pull Legs/g, 'İtme Çekme Bacak')
    .replace(/Full Body/g, 'Tüm Vücut')
    .replace(/Upper Lower/g, 'Üst Alt')
    .replace(/Split/g, 'Bölünmüş')
    .replace(/Push Day/g, 'İtme Günü')
    .replace(/Pull Day/g, 'Çekme Günü')
    .replace(/Leg Day/g, 'Bacak Günü')
    .replace(/Legs Day/g, 'Bacak Günü')
    .replace(/Upper A/g, 'Üst A')
    .replace(/Upper B/g, 'Üst B')
    .replace(/Lower A/g, 'Alt A')
    .replace(/Lower B/g, 'Alt B')
    .replace(/Push A/g, 'İtme A')
    .replace(/Push B/g, 'İtme B')
    .replace(/Pull A/g, 'Çekme A')
    .replace(/Pull B/g, 'Çekme B')
    .replace(/Leg A/g, 'Bacak A')
    .replace(/Leg B/g, 'Bacak B');
};

// Program açıklamasını çevir (EN: ... TR: ... formatını parse et)
export const translateProgramDescription = (description, language) => {
  if (!description) return description;

  // "EN: ... TR: ..." formatını kontrol et
  const enMatch = description.match(/EN:\s*(.*?)(?:\s*TR:|$)/i);
  const trMatch = description.match(/TR:\s*(.*?)(?:\s*EN:|$)/i);
  
  if (enMatch && trMatch) {
    // Format bulundu, seçili dile göre döndür
    if (language === 'en') {
      return enMatch[1].trim();
    } else {
      return trMatch[1].trim();
    }
  }

  // Eski format için fallback (replace işlemleri)
  if (language === 'en') {
    // Türkçe -> İngilizce (karışık dil sorununu düzelt)
    let translated = description
      // Temel kelimeler
      .replace(/Haftada (\d+) gün/gi, '$1 days a week')
      .replace(/(\d+) hafta/gi, '$1 weeks')
      .replace(/tüm vücut çalışan/gi, 'full body workout')
      .replace(/tüm vücut/gi, 'full body')
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
      .replace(/için ideal/gi, 'ideal for')
      // Karışık dil sorunları için
      .replace(/üst vücut odaklı program/gi, 'upper body focused program')
      .replace(/Omuz, göğüs, sırt ve kollar/gi, 'shoulders, chest, back and arms')
      .replace(/ideal for\./gi, 'ideal.')
      .replace(/Başlangıç seviyesi ideal for\./gi, 'Ideal for beginners.')
      .replace(/3 günlük klasik Push-Pull-Legs programı/gi, '3-day classic Push-Pull-Legs program')
      .replace(/İtme, çekme ve bacak hareketleri odaklı profesyonel program/gi, 'Professional program focused on push, pull and leg movements')
      .replace(/Haftada 3 gün tüm vücut çalışan başlangıç seviyesi program/gi, '3-day per week full body beginner level program')
      .replace(/Haftada 4 gün üst vücut ve alt vücut ayrımı yapan orta seviye program/gi, '4-day per week upper and lower body split intermediate program');
    return translated;
  }

  // İngilizce -> Türkçe (TR)
  let trText = description
    // Temel kelimeler
    .replace(/(\d+) days a week/gi, 'Haftada $1 gün')
    .replace(/(\d+) weeks/gi, '$1 hafta')
    .replace(/full body workout/gi, 'tüm vücut antrenmanı')
    .replace(/full body/gi, 'tüm vücut')
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
    .replace(/HIIT and strength training combination/gi, 'HIIT ve güç antrenmanı kombinasyonu')
    // Karışık dil sorunları için
    .replace(/upper body focused program/gi, 'üst vücut odaklı program')
    .replace(/shoulders, chest, back and arms/gi, 'omuz, göğüs, sırt ve kollar')
    .replace(/ideal\./gi, 'ideal.')
    .replace(/Ideal for beginners\./gi, 'Başlangıç seviyesi için ideal.')
    .replace(/3-day classic Push-Pull-Legs program/gi, '3 günlük klasik Push-Pull-Legs programı')
    .replace(/Professional program focused on push, pull and leg movements/gi, 'İtme, çekme ve bacak hareketleri odaklı profesyonel program')
    .replace(/3-day per week full body beginner level program/gi, 'Haftada 3 gün tüm vücut çalışan başlangıç seviyesi program')
    .replace(/4-day per week upper and lower body split intermediate program/gi, 'Haftada 4 gün üst vücut ve alt vücut ayrımı yapan orta seviye program');
  return trText;
};

// Gün açıklamalarını çevir (EN: ... TR: ... formatını parse et)
export const translateDayDescription = (description, language) => {
  if (!description) return description;

  // "EN: ... TR: ..." formatını kontrol et
  const enMatch = description.match(/EN:\s*(.*?)(?:\s*TR:|$)/i);
  const trMatch = description.match(/TR:\s*(.*?)(?:\s*EN:|$)/i);
  
  if (enMatch && trMatch) {
    // Format bulundu, seçili dile göre döndür
    if (language === 'en') {
      return enMatch[1].trim();
    } else {
      return trMatch[1].trim();
    }
  }

  // Eski format için fallback (replace işlemleri)
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
      .replace(/Üst vücut güçlendirme/gi, 'Upper body strengthening')
      .replace(/Göğüs, omuz ve triceps odaklı itme hareketleri/gi, 'Push movements focused on chest, shoulders and triceps')
      .replace(/Sırt, biceps ve arka omuz odaklı çekme hareketleri/gi, 'Pull movements focused on back, biceps and rear delts')
      .replace(/Alt vücut ve bacak odaklı yoğun antrenman/gi, 'Intense workout focused on lower body and legs')
      .replace(/Farklı egzersizler ile tüm vücut/gi, 'Full body with different exercises')
      .replace(/Kardiyo ve güç kombinasyonu/gi, 'Cardio and strength combination')
      .replace(/Göğüs, sırt ve omuz odaklı üst vücut/gi, 'Upper body focused on chest, back and shoulders')
      .replace(/Squat ve deadlift odaklı alt vücut/gi, 'Lower body focused on squat and deadlift')
      .replace(/Farklı açılar ve hareketler ile üst vücut/gi, 'Upper body with different angles and movements')
      .replace(/Hip thrust ve single leg odaklı alt vücut/gi, 'Lower body focused on hip thrust and single leg');
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
    .replace(/Upper body strengthening/gi, 'Üst vücut güçlendirme')
    .replace(/Push movements focused on chest, shoulders and triceps/gi, 'Göğüs, omuz ve triceps odaklı itme hareketleri')
    .replace(/Pull movements focused on back, biceps and rear delts/gi, 'Sırt, biceps ve arka omuz odaklı çekme hareketleri')
    .replace(/Intense workout focused on lower body and legs/gi, 'Alt vücut ve bacak odaklı yoğun antrenman')
    .replace(/Full body with different exercises/gi, 'Farklı egzersizler ile tüm vücut')
    .replace(/Cardio and strength combination/gi, 'Kardiyo ve güç kombinasyonu')
    .replace(/Upper body focused on chest, back and shoulders/gi, 'Göğüs, sırt ve omuz odaklı üst vücut')
    .replace(/Lower body focused on squat and deadlift/gi, 'Squat ve deadlift odaklı alt vücut')
    .replace(/Upper body with different angles and movements/gi, 'Farklı açılar ve hareketler ile üst vücut')
    .replace(/Lower body focused on hip thrust and single leg/gi, 'Hip thrust ve single leg odaklı alt vücut');
};

// Gün ismini çevir (Monday, Tuesday, vb.)
export const translateDayName = (dayName, language) => {
  if (!dayName) return dayName;
  
  if (language === 'en') {
    // Türkçe -> İngilizce
    return dayName
      .replace(/Pazartesi/g, 'Monday')
      .replace(/Salı/g, 'Tuesday')
      .replace(/Çarşamba/g, 'Wednesday')
      .replace(/Perşembe/g, 'Thursday')
      .replace(/Cuma/g, 'Friday')
      .replace(/Cumartesi/g, 'Saturday')
      .replace(/Pazar/g, 'Sunday')
      .replace(/İtme Günü/g, 'Push Day')
      .replace(/Çekme Günü/g, 'Pull Day')
      .replace(/Bacak Günü/g, 'Leg Day')
      .replace(/Üst A/g, 'Upper A')
      .replace(/Üst B/g, 'Upper B')
      .replace(/Alt A/g, 'Lower A')
      .replace(/Alt B/g, 'Lower B')
      .replace(/İtme A/g, 'Push A')
      .replace(/İtme B/g, 'Push B')
      .replace(/Çekme A/g, 'Pull A')
      .replace(/Çekme B/g, 'Pull B')
      .replace(/Bacak A/g, 'Leg A')
      .replace(/Bacak B/g, 'Leg B')
      .replace(/Gün (\d+)/g, 'Day $1');
  }
  
  // İngilizce -> Türkçe (TR)
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
    .replace(/Leg Day/g, 'Bacak Günü')
    .replace(/Legs Day/g, 'Bacak Günü')
    .replace(/Upper A/g, 'Üst A')
    .replace(/Upper B/g, 'Üst B')
    .replace(/Lower A/g, 'Alt A')
    .replace(/Lower B/g, 'Alt B')
    .replace(/Push A/g, 'İtme A')
    .replace(/Push B/g, 'İtme B')
    .replace(/Pull A/g, 'Çekme A')
    .replace(/Pull B/g, 'Çekme B')
    .replace(/Leg A/g, 'Bacak A')
    .replace(/Leg B/g, 'Bacak B')
    .replace(/Day (\d+)/g, 'Gün $1');
};

export default translations;





