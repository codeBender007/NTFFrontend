/**
 * Canonical Day 1 & Day 2 DOJO Induction Question Paper templates.
 * Used as fallback display templates when the backend DB does not yet contain
 * a DAY_1 / DAY_2 question paper record, and to publish them directly to
 * POST /api/v1/lms/question-papers/ without any localStorage usage.
 */

const buildOptions = (opts = []) =>
  opts.map((value, idx) => ({
    id: idx,
    label: String.fromCharCode(65 + idx),
    value,
  }));

const DAY_1_SECTIONS = [
  {
    id: 1,
    name: "General Questions:",
    subtitle: "Company Overview, 5S & Kaizen",
    questions: [
      {
        id: 101,
        number: 1,
        question: "कंपनी कब START हुई?",
        options: buildOptions(["1990", "1984", "2000", "1980"]),
        marks: 1,
      },
      {
        id: 102,
        number: 2,
        question: "कंपनी का MAIN प्लांट कहाँ है?",
        options: buildOptions(["Sanand Gujarat", "Neemrana", "IMT Manesar", "Delhi"]),
        marks: 1,
      },
      {
        id: 103,
        number: 3,
        question: "NTF की उत्पाद श्रेणी क्या है?",
        options: buildOptions(["Metal", "Plastic", "Plating", "Rubber"]),
        marks: 1,
      },
      {
        id: 104,
        number: 4,
        question: "NTF का पहला प्रोडक्ट कौन सा है?",
        options: buildOptions(["Hard Top", "Bumper", "Spoiler", "Roof Garnish"]),
        marks: 1,
      },
      {
        id: 105,
        number: 5,
        question: "NTF में कौन सा Process नहीं है?",
        options: buildOptions(["PIM", "Paint Shop", "Casting", "TCM"]),
        marks: 1,
      },
      {
        id: 106,
        number: 6,
        question: "निम्नलिखित में से कौन सा 5S नहीं है",
        options: buildOptions(["Seiri", "Seiketsu", "Seiso", "Shitsuke"]),
        marks: 1,
      },
      {
        id: 107,
        number: 7,
        question: "काइज़न क्या है?",
        options: buildOptions(["निरंतर सुधार", "अंतरायिक सुधार", "असंतत सुधार", "सुधार रोकें"]),
        marks: 1,
      },
      {
        id: 108,
        number: 8,
        question: "पर्यावरण को क्या दूषित करता है?",
        options: buildOptions(["Waste", "Process", "Part", "Man"]),
        marks: 1,
      },
    ],
  },
  {
    id: 2,
    name: "Safety Questions:",
    subtitle: "Fire Safety, PPE & First Aid",
    questions: [
      {
        id: 201,
        number: 9,
        question: "आग कितने प्रकार की होती है?",
        options: buildOptions(["3", "4", "5", "6"]),
        marks: 1,
      },
      {
        id: 202,
        number: 10,
        question: "प्राथमिक चिकित्सा से क्या अभिप्राय है?",
        options: buildOptions([
          "मरीज को दी जाने वाली पूर्व चिकित्सा",
          "मरीज को दी जाने वाली अस्पताल चिकित्सा",
          "दोनों हैं",
          "इनमें से कोई नहीं",
        ]),
        marks: 1,
      },
      {
        id: 203,
        number: 11,
        question: "निम्नलिखित में से कौन PPE किट का हिस्सा नहीं है?",
        options: buildOptions(["दस्ताने", "सुरक्षा चश्मा", "हेलमेट", "पेचकस"]),
        marks: 1,
      },
      {
        id: 204,
        number: 12,
        question: "फायर एक्सटिंगुइशर में PASS शब्द की परिभाषा में इनमें से कौन सा शब्द नहीं है",
        options: buildOptions(["Pull", "Squeeze", "Alert", "Sweep"]),
        marks: 1,
      },
      {
        id: 205,
        number: 13,
        question: "ABC Type Fire Extinguisher को कौन-सी आग पर प्रयोग करेंगे?",
        options: buildOptions([
          "हर प्रकार की आग पर",
          "केवल बिजली के सामान पर",
          "केवल लकड़ी की वस्तुओं पर",
          "इनमें से कोई भी नहीं",
        ]),
        marks: 1,
      },
    ],
  },
  {
    id: 3,
    name: "Maintenance Questions:",
    subtitle: "Plant Maintenance Basics",
    questions: [
      {
        id: 301,
        number: 14,
        question: "Maintenance क्या होता है?",
        options: [],
        marks: 1,
      },
      {
        id: 302,
        number: 15,
        question: "इंडस्ट्री में कितना वोल्टेज यूज़ करते हैं?",
        options: buildOptions(["100", "440", "200", "50"]),
        marks: 1,
      },
      {
        id: 303,
        number: 16,
        question: "Break down maintenance क्या है?",
        options: buildOptions([
          "First Maintenance",
          "Maintenance when machine stops",
          "Last Maintenance",
          "None of above",
        ]),
        marks: 1,
      },
    ],
  },
  {
    id: 4,
    name: "Stores Questions:",
    subtitle: "FIFO & Material Issue",
    questions: [
      {
        id: 401,
        number: 17,
        question: "FIFO से आप क्या समझते हो?",
        options: buildOptions([
          "First In First Out",
          "Last in Last Out",
          "Out first Out last",
          "Thermocompression",
        ]),
        marks: 1,
      },
      {
        id: 402,
        number: 18,
        question: "मटेरियल इश्यू करते समय किन किन बातों का ध्यान रखना चाहिए?",
        options: buildOptions(["DATE", "SAFETY", "GRADE", "All of the above"]),
        marks: 1,
      },
    ],
  },
  {
    id: 5,
    name: "Abnormality Handling:",
    subtitle: "Reject & Power-Cut Part Handling",
    questions: [
      {
        id: 501,
        number: 19,
        question: "बिजली जाने के दौरान बने हुए पार्ट की हैंडलिंग:",
        options: buildOptions([
          "बिजली जाने के दौरान बने हुए पार्ट को बिना मार्क किये ना रखें",
          "बिजली जाने के दौरान बने हुए पार्ट को लाल बिन में रखें",
          "उपरोक्त दोनों कथन सही हैं",
          "उपरोक्त दोनों कथन गलत हैं",
        ]),
        marks: 1,
      },
      {
        id: 502,
        number: 20,
        question: "Inspection के दौरान Reject पार्ट की हैंडलिंग:",
        options: buildOptions([
          "Reject पार्ट को बिना मार्क किये और लाल बिन के बाहर ना रखें",
          "Reject पार्ट को हमेशा मार्क करके लाल बिन में रखें",
          "उपरोक्त दोनों कथन सही हैं",
          "उपरोक्त दोनों कथन गलत हैं",
        ]),
        marks: 1,
      },
    ],
  },
];

const DAY_2_SECTIONS = [
  {
    id: 1,
    name: "Process Questions: (Quality)",
    subtitle: "Quality Instruments & Checks",
    questions: [
      {
        id: 101,
        number: 1,
        question: "पार्ट की कलर वैल्यू किस इंस्ट्रूमेंट से चेक करते हैं?",
        options: buildOptions(["हाईएस्ट गेज कैलिपर", "वर्नियर", "कलर मीटर", "माइक्रोमीटर"]),
        marks: 1,
      },
      {
        id: 102,
        number: 2,
        question: "पेंटेड पार्ट की DFT किस यंत्र से चेक करते हैं?",
        options: buildOptions(["Gloss मीटर", "टेपर स्केल", "DFT मीटर", "माइक्रोमीटर"]),
        marks: 1,
      },
      {
        id: 103,
        number: 3,
        question: "पार्ट की ग्लॉस वैल्यू कैसे चेक करते हैं?",
        options: buildOptions(["Gloss मीटर", "वर्नियर कैलिपर", "स्केल", "कलर मीटर"]),
        marks: 1,
      },
    ],
  },
  {
    id: 2,
    name: "Process Questions: (Plastic Injection Moulding)",
    subtitle: "Injection Moulding Process",
    questions: [
      {
        id: 201,
        number: 4,
        question: "इंजेक्शन मोल्डिंग में इस्तेमाल किया मोल्ड कैसे ठंडा होता है?",
        options: buildOptions(["ठंडे सतह से संपर्क करें", "वायु", "पानी", "इनमें से कोई नहीं"]),
        marks: 1,
      },
      {
        id: 202,
        number: 5,
        question: "प्लास्टिक रॉ मटेरियल मशीन में कहाँ लोड होता हैं",
        options: buildOptions(["हॉपर", "बैरल", "मोल्ड", "इनमें से कोई नहीं"]),
        marks: 1,
      },
      {
        id: 203,
        number: 6,
        question: "इंजेक्शन मोल्डिंग द्वारा निम्न में से कौनसी सामग्री नहीं बनाई गई है?",
        options: buildOptions(["नट्स", "कार बम्पर", "इलेक्ट्रिकल स्विच", "कुर्सी"]),
        marks: 1,
      },
      {
        id: 204,
        number: 7,
        question: "HRTC का प्रयोग किया जाता है?",
        options: buildOptions([
          "मोल्ड को गर्म करने में",
          "रनर को गर्म रखने में",
          "पार्ट को गर्म करने में",
          "मटेरियल को गर्म करने में",
        ]),
        marks: 1,
      },
      {
        id: 205,
        number: 8,
        question: "PP मटेरियल का पूरा नाम क्या है?",
        options: buildOptions([
          "पॉली इथिलीन",
          "पॉली कार्बोनेट",
          "पॉली प्रोपलिन",
          "प्लास्टिक पॉलिमर",
        ]),
        marks: 1,
      },
    ],
  },
  {
    id: 3,
    name: "Process Questions: (Paint Shop)",
    subtitle: "Paint Shop & Assembly",
    questions: [
      {
        id: 301,
        number: 9,
        question: "स्प्रे गन से पार्ट की दूरी कितनी होनी चाहिए?",
        options: buildOptions(["152-228 mm", "250-400 mm", "100-200 mm", "200-400 mm"]),
        marks: 1,
      },
      {
        id: 302,
        number: 10,
        question: "प्राइमर कोट की DFT कितनी माइक्रोन होनी चाहिए?",
        options: buildOptions(["8 से 14", "10 से 16", "12 से 18", "14 से 20"]),
        marks: 1,
      },
      {
        id: 303,
        number: 11,
        question: "असेम्बली करते समय किन-किन बातों का ध्यान देना चाहिए?",
        options: buildOptions([
          "कोई Child part मिस ना हो",
          "सबसे पहले ध्यान देना चाहिए कि कोई डिफेक्ट ना जाये।",
          "दोनों हैं",
          "इनमें से कोई नहीं।",
        ]),
        marks: 1,
      },
    ],
  },
  {
    id: 4,
    name: "Process Questions: ( PU Rim )",
    subtitle: "PU Rim Materials & Defects",
    questions: [
      {
        id: 401,
        number: 12,
        question: "PU Rim में कौन सा मटेरियल यूज़ होता है?",
        options: buildOptions(["ABC", "PP", "N-66", "ISO/POLYOL"]),
        marks: 1,
      },
      {
        id: 402,
        number: 13,
        question: "PU Rim में कौन-कौन से डिफेक्ट आते हैं?",
        options: buildOptions(["बर्स", "एयर बबल", "पिन होल", "B & C"]),
        marks: 1,
      },
    ],
  },
  {
    id: 5,
    name: "Process Questions: (TCM)",
    subtitle: "TCM Raw Materials & Defects",
    questions: [
      {
        id: 501,
        number: 14,
        question: "TCM में यूज होने वाले RAW मटेरियल हैं।",
        options: buildOptions([
          "फॉम कोर",
          "पी यू",
          "प्लास्टिक ग्रेनुअल्स",
          "वुडस्टॉक, फैब्रिक, PPGF",
        ]),
        marks: 1,
      },
      {
        id: 502,
        number: 15,
        question: "TCM में क्या-क्या प्रॉब्लम आ सकती हैं।",
        options: buildOptions(["सिल्वर स्टिक्स", "सिंक मार्क", "शार्ट मोल्डिंग", "उपरोक्त सभी"]),
        marks: 1,
      },
      {
        id: 503,
        number: 16,
        question: "फैब्रिक ka Material kya होता है।",
        options: buildOptions(["PVC", "प्लास्टिक का", "धागे का", "फाइबर का"]),
        marks: 1,
      },
    ],
  },
  {
    id: 6,
    name: "Process Questions: (LB)",
    subtitle: "LF / LB Process & Defects",
    questions: [
      {
        id: 601,
        number: 17,
        question: "L.F में उपयोग होने वाले मटेरियल का नाम लिखे",
        options: buildOptions(["ISO & POLYOL", "फाइबर ग्लास", "सरफेस मैट", "उपरोक्त सभी"]),
        marks: 1,
      },
      {
        id: 602,
        number: 18,
        question: "LF process में कौन सा part बनाया जाता है",
        options: buildOptions(["Spoiler", "Luggage Board", "Rear Parcel Tray", "Bumper"]),
        marks: 1,
      },
      {
        id: 603,
        number: 19,
        question: "फैब्रिक में क्या-क्या प्रॉब्लम आती हैं?",
        options: buildOptions([
          "ओवर GSM",
          "वाइट मार्क या लाइन मार्क",
          "अनइक्वल कटिंग",
          "उपरोक्त सभी",
        ]),
        marks: 1,
      },
      {
        id: 604,
        number: 20,
        question: "LB में क्या-क्या डिफेक्ट्स आते हैं :",
        options: buildOptions(["पिन होल", "शॉर्ट मोल्डिंग", "एयर बबल", "उपरोक्त सभी"]),
        marks: 1,
      },
    ],
  },
];

const flattenQuestions = (sections) =>
  sections.flatMap((sec) =>
    sec.questions.map((q) => ({
      ...q,
      questionNumber: q.number,
      sectionId: sec.id,
      sectionName: sec.name,
    }))
  );

export const getDefaultDayPaper = (dayType = "DAY_1") => {
  const isDay2 = String(dayType).toUpperCase().includes("2");
  const sections = isDay2 ? DAY_2_SECTIONS : DAY_1_SECTIONS;

  return {
    id: null,
    isTemplateFallback: true,
    title: isDay2 ? "DOJO TEST PAPER-DAY-2" : "DOJO TEST PAPER- DAY-1",
    description: isDay2
      ? "Quality Standards, PPE Guidelines, Defect Types, and Process Discipline."
      : "NTF Company History, Overview, 5S, Kaizen, and General Plant Safety.",
    dayType: isDay2 ? "DAY_2" : "DAY_1",
    level: isDay2 ? "L1" : "L0",
    totalMarks: 20,
    totalQuestions: 20,
    sections,
    meta: {
      testTitle: isDay2 ? "DOJO TEST PAPER-DAY-2" : "DOJO TEST PAPER- DAY-1",
      headerTitle: isDay2 ? "DOJO TEST PAPER-DAY-2" : "DOJO TEST PAPER- DAY-1",
      duration: 30,
      passPercentage: 80,
      documentCode: "F18(AMD-02)",
      revision: "Rev. 00",
      level: isDay2 ? "L1" : "L0",
    },
    raw: {
      day_type: isDay2 ? "DAY_2" : "DAY_1",
      duration_minutes: 30,
      duration_label: isDay2 ? "30 मिनिट्स" : "30 मिनट",
      total_marks: 20,
      pass_percentage: 80,
      total_questions: 20,
      document_code: "F18(AMD-02)",
      revision: "Rev. 00",
      passing_instruction: isDay2
        ? "(संकेत- टेस्ट में पास होने के लिए 80% अंक लाना अनिवार्य है।)"
        : "(ऑब्जेक्टिव टेस्ट में पास होने के लिए 80% अंक लाना अनिवार्य है।)",
      sections,
      questions: flattenQuestions(sections),
    },
  };
};

export const buildSeedPayloadForDayPaper = (dayType = "DAY_1") => {
  const tpl = getDefaultDayPaper(dayType);
  return {
    title: tpl.title,
    description: tpl.description,
    day_type: tpl.dayType,
    document_code: tpl.meta.documentCode,
    revision: tpl.meta.revision,
    duration_minutes: tpl.meta.duration,
    duration_label: tpl.raw.duration_label,
    total_marks: tpl.totalMarks,
    pass_percentage: tpl.meta.passPercentage,
    total_questions: tpl.totalQuestions,
    passing_instruction: tpl.raw.passing_instruction,
    sections: tpl.sections,
    questions: tpl.raw.questions,
    metadata: {
      ...tpl.meta,
      isOfficialDayPaper: true,
    },
    is_active: true,
  };
};
