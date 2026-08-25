export const languages = {
  en: { label: "English", native: "English", dir: "ltr" },
  te: { label: "Telugu", native: "తెలుగు", dir: "ltr" },
  hi: { label: "Hindi", native: "हिन्दी", dir: "ltr" },
  ta: { label: "Tamil", native: "தமிழ்", dir: "ltr" },
  kn: { label: "Kannada", native: "ಕನ್ನಡ", dir: "ltr" },
  ml: { label: "Malayalam", native: "മലയാളം", dir: "ltr" },
  mr: { label: "Marathi", native: "मराठी", dir: "ltr" },
  bn: { label: "Bengali", native: "বাংলা", dir: "ltr" },
} as const;
export type LanguageCode = keyof typeof languages;
export const ui = {
  en: { ledger:"Ledger",garuda:"Garuda Purana",dharma:"Dharma",record:"Record into Ledger",confession:"The confession scroll",placeholder:"Unburden your soul to the Ledger... (max 500 characters)",judgment:"Community judgment",today:"Today's Ledger",random:"Draw a random soul",language:"Language",verdict:"Chitragupta's Verdict",repair:"Path of Repair",explore:"Explore Garuda Purana" },
  te: { ledger:"లెడ్జర్",garuda:"గరుడ పురాణం",dharma:"ధర్మం",record:"లెడ్జర్‌లో నమోదు చేయి",confession:"ఒప్పుకోలు పత్రం",placeholder:"మీ మనసులోని మాటను లెడ్జర్‌కు చెప్పండి... (గరిష్ఠం 500 అక్షరాలు)",judgment:"సమాజ తీర్పు",today:"ఈరోజు లెడ్జర్",random:"ఒక యాదృచ్ఛిక ఆత్మను చూడండి",language:"భాష",verdict:"చిత్రగుప్తుని తీర్పు",repair:"పరిహార మార్గం",explore:"గరుడ పురాణాన్ని చూడండి" },
  hi: { ledger:"लेजर",garuda:"गरुड़ पुराण",dharma:"धर्म",record:"लेजर में दर्ज करें",confession:"स्वीकारोक्ति पत्र",placeholder:"अपनी बात लेजर के सामने कहें... (अधिकतम 500 अक्षर)",judgment:"समुदाय का निर्णय",today:"आज का लेजर",random:"एक अनजान आत्मा देखें",language:"भाषा",verdict:"चित्रगुप्त का निर्णय",repair:"प्रायश्चित्त का मार्ग",explore:"गरुड़ पुराण देखें" },
  ta: { ledger:"பதிவேடு",garuda:"கருட புராணம்",dharma:"தர்மம்",record:"பதிவேட்டில் பதிவு செய்",confession:"ஒப்புதல் ஓலை",placeholder:"உங்கள் உண்மையை பதிவேட்டிடம் கூறுங்கள்... (அதிகபட்சம் 500 எழுத்துகள்)",judgment:"சமூக தீர்ப்பு",today:"இன்றைய பதிவேடு",random:"ஒரு அறியப்படாத ஆன்மாவை காண்க",language:"மொழி",verdict:"சித்ரகுப்தரின் தீர்ப்பு",repair:"சீர்திருத்தப் பாதை",explore:"கருட புராணத்தை காண்க" },
  kn: { ledger:"ಲೆಡ್ಜರ್",garuda:"ಗರುಡ ಪುರಾಣ",dharma:"ಧರ್ಮ",record:"ಲೆಡ್ಜರ್‌ಗೆ ದಾಖಲಿಸಿ",confession:"ಒಪ್ಪಿಗೆಯ ಪತ್ರ",placeholder:"ನಿಮ್ಮ ಸತ್ಯವನ್ನು ಲೆಡ್ಜರ್‌ಗೆ ಹೇಳಿ... (ಗರಿಷ್ಠ 500 ಅಕ್ಷರಗಳು)",judgment:"ಸಮುದಾಯದ ತೀರ್ಪು",today:"ಇಂದಿನ ಲೆಡ್ಜರ್",random:"ಒಂದು ಅಪರಿಚಿತ ಆತ್ಮವನ್ನು ನೋಡಿ",language:"ಭಾಷೆ",verdict:"ಚಿತ್ರಗುಪ್ತನ ತೀರ್ಪು",repair:"ಪರಿಹಾರದ ಮಾರ್ಗ",explore:"ಗರುಡ ಪುರಾಣ ನೋಡಿ" },
  ml: { ledger:"ലെഡ്ജർ",garuda:"ഗരുഡ പുരാണം",dharma:"ധർമ്മം",record:"ലെഡ്ജറിൽ രേഖപ്പെടുത്തുക",confession:"ഏറ്റുപറച്ചിലിന്റെ താൾ",placeholder:"നിങ്ങളുടെ സത്യം ലെഡ്ജറിനോട് പറയൂ... (പരമാവധി 500 അക്ഷരങ്ങൾ)",judgment:"സമൂഹ വിധി",today:"ഇന്നത്തെ ലെഡ്ജർ",random:"ഒരു അജ്ഞാത ആത്മാവിനെ കാണുക",language:"ഭാഷ",verdict:"ചിത്രഗുപ്തന്റെ വിധി",repair:"പരിഹാരത്തിന്റെ വഴി",explore:"ഗരുഡ പുരാണം കാണുക" },
  mr: { ledger:"नोंदवही",garuda:"गरुड पुराण",dharma:"धर्म",record:"नोंदवहीत नोंदवा",confession:"कबुलीची नोंद",placeholder:"तुमचे सत्य नोंदवहीसमोर मांडा... (कमाल 500 अक्षरे)",judgment:"समुदायाचा निर्णय",today:"आजची नोंदवही",random:"एक अनोळखी आत्मा पहा",language:"भाषा",verdict:"चित्रगुप्ताचा निर्णय",repair:"प्रायश्चित्ताचा मार्ग",explore:"गरुड पुराण पहा" },
  bn: { ledger:"লেজার",garuda:"গরুড় পুরাণ",dharma:"ধর্ম",record:"লেজারে নথিভুক্ত করুন",confession:"স্বীকারোক্তির পাতা",placeholder:"আপনার সত্য লেজারের কাছে বলুন... (সর্বোচ্চ ৫০০ অক্ষর)",judgment:"সমাজের বিচার",today:"আজকের লেজার",random:"একটি অচেনা আত্মা দেখুন",language:"ভাষা",verdict:"চিত্রগুপ্তের বিচার",repair:"সংশোধনের পথ",explore:"গরুড় পুরাণ দেখুন" },
} as const;
