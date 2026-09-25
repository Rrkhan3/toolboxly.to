/* Central tool registry: the single source for search, categories, counts, popular tools and cards. */
window.CATEGORIES = [
 {
  "name": "Calculators",
  "slug": "calculators",
  "icon": "🧮",
  "description": "Percentages, dates, loans, health and everyday math."
 },
 {
  "name": "Text Tools",
  "slug": "text-tools",
  "icon": "📝",
  "description": "Count, clean, sort and transform text in one click."
 },
 {
  "name": "Image Tools",
  "slug": "image-tools",
  "icon": "🖼️",
  "description": "Resize, compress, crop and convert images in your browser."
 },
 {
  "name": "Developer Tools",
  "slug": "developer-tools",
  "icon": "💻",
  "description": "Format, validate, encode and generate developer data."
 },
 {
  "name": "Converters",
  "slug": "converters",
  "icon": "🔄",
  "description": "Convert length, weight, temperature, data and more."
 },
 {
  "name": "Generators",
  "slug": "generators",
  "icon": "▦",
  "description": "Create QR codes and other generated content."
 }
];
window.TOOLS = [
 {
  "name": "Age Calculator",
  "slug": "age-calculator",
  "category": "Calculators",
  "description": "Calculate your exact age",
  "keywords": [
   "age",
   "birthday",
   "date",
   "years",
   "months",
   "days"
  ],
  "popular": true,
  "id": "age-calculator",
  "icon": "🧮",
  "url": "tools/age-calculator"
 },
 {
  "name": "Percentage Calculator",
  "slug": "percentage-calculator",
  "category": "Calculators",
  "description": "Find percentages and percent change",
  "keywords": [
   "percent",
   "percentage",
   "ratio",
   "change",
   "increase",
   "decrease"
  ],
  "popular": true,
  "id": "percentage-calculator",
  "icon": "🧮",
  "url": "tools/percentage-calculator"
 },
 {
  "name": "Discount Calculator",
  "slug": "discount-calculator",
  "category": "Calculators",
  "description": "Calculate the sale price after a discount",
  "keywords": [
   "discount",
   "sale",
   "price",
   "offer",
   "savings"
  ],
  "popular": false,
  "id": "discount-calculator",
  "icon": "🧮",
  "url": "tools/discount-calculator"
 },
 {
  "name": "BMI Calculator",
  "slug": "bmi-calculator",
  "category": "Calculators",
  "description": "Check your body mass index",
  "keywords": [
   "bmi",
   "weight",
   "height",
   "health",
   "body",
   "mass"
  ],
  "popular": false,
  "id": "bmi-calculator",
  "icon": "🧮",
  "url": "tools/bmi-calculator"
 },
 {
  "name": "EMI Calculator",
  "slug": "emi-calculator",
  "category": "Calculators",
  "description": "Calculate monthly loan EMI",
  "keywords": [
   "emi",
   "loan",
   "mortgage",
   "installment",
   "interest"
  ],
  "popular": false,
  "id": "emi-calculator",
  "icon": "🧮",
  "url": "tools/emi-calculator"
 },
 {
  "name": "Simple Interest Calculator",
  "slug": "simple-interest-calculator",
  "category": "Calculators",
  "description": "Calculate simple interest",
  "keywords": [
   "simple",
   "interest",
   "principal",
   "rate"
  ],
  "popular": false,
  "id": "simple-interest-calculator",
  "icon": "🧮",
  "url": "tools/simple-interest-calculator"
 },
 {
  "name": "Compound Interest Calculator",
  "slug": "compound-interest-calculator",
  "category": "Calculators",
  "description": "Calculate compound interest growth",
  "keywords": [
   "compound",
   "interest",
   "growth",
   "savings",
   "investment"
  ],
  "popular": false,
  "id": "compound-interest-calculator",
  "icon": "🧮",
  "url": "tools/compound-interest-calculator"
 },
 {
  "name": "Date Difference Calculator",
  "slug": "date-difference",
  "category": "Calculators",
  "description": "Find the days between two dates",
  "keywords": [
   "date",
   "difference",
   "days",
   "between",
   "weeks",
   "calendar"
  ],
  "popular": false,
  "id": "date-difference",
  "icon": "🧮",
  "url": "tools/date-difference"
 },
 {
  "name": "Average Calculator",
  "slug": "average-calculator",
  "category": "Calculators",
  "description": "Calculate mean, median and more",
  "keywords": [
   "average",
   "mean",
   "median",
   "numbers",
   "sum"
  ],
  "popular": false,
  "id": "average-calculator",
  "icon": "🧮",
  "url": "tools/average-calculator"
 },
 {
  "name": "Time Calculator",
  "slug": "time-calculator",
  "category": "Calculators",
  "description": "Add or subtract hours and minutes",
  "keywords": [
   "time",
   "add",
   "subtract",
   "hours",
   "minutes",
   "duration"
  ],
  "popular": false,
  "id": "time-calculator",
  "icon": "🧮",
  "url": "tools/time-calculator"
 },
 {
  "name": "Word Counter",
  "slug": "word-counter",
  "category": "Text Tools",
  "description": "Count words and characters online",
  "keywords": [
   "word",
   "count",
   "characters",
   "sentences",
   "paragraphs",
   "reading",
   "time"
  ],
  "popular": true,
  "id": "word-counter",
  "icon": "📝",
  "url": "tools/word-counter"
 },
 {
  "name": "Character Counter",
  "slug": "character-counter",
  "category": "Text Tools",
  "description": "Count characters, lines and bytes",
  "keywords": [
   "character",
   "count",
   "length",
   "bytes",
   "letters"
  ],
  "popular": false,
  "id": "character-counter",
  "icon": "📝",
  "url": "tools/character-counter"
 },
 {
  "name": "Case Converter",
  "slug": "case-converter",
  "category": "Text Tools",
  "description": "Change text case instantly",
  "keywords": [
   "case",
   "upper",
   "lower",
   "title",
   "sentence",
   "camel",
   "snake",
   "kebab"
  ],
  "popular": false,
  "id": "case-converter",
  "icon": "📝",
  "url": "tools/case-converter"
 },
 {
  "name": "Text Reverser",
  "slug": "text-reverser",
  "category": "Text Tools",
  "description": "Reverse text, words or lines",
  "keywords": [
   "reverse",
   "text",
   "flip",
   "backwards"
  ],
  "popular": false,
  "id": "text-reverser",
  "icon": "📝",
  "url": "tools/text-reverser"
 },
 {
  "name": "Remove Duplicate Lines",
  "slug": "remove-duplicate-lines",
  "category": "Text Tools",
  "description": "Remove duplicate lines from text",
  "keywords": [
   "duplicate",
   "lines",
   "unique",
   "dedupe",
   "remove",
   "repeated"
  ],
  "popular": false,
  "id": "remove-duplicate-lines",
  "icon": "📝",
  "url": "tools/remove-duplicate-lines"
 },
 {
  "name": "Text Sorter",
  "slug": "text-sorter",
  "category": "Text Tools",
  "description": "Sort lines alphabetically or numerically",
  "keywords": [
   "sort",
   "lines",
   "alphabetical",
   "numeric",
   "order"
  ],
  "popular": false,
  "id": "text-sorter",
  "icon": "📝",
  "url": "tools/text-sorter"
 },
 {
  "name": "Slug Generator",
  "slug": "slug-generator",
  "category": "Text Tools",
  "description": "Create clean URL slugs",
  "keywords": [
   "slug",
   "url",
   "permalink",
   "seo",
   "friendly"
  ],
  "popular": false,
  "id": "slug-generator",
  "icon": "📝",
  "url": "tools/slug-generator"
 },
 {
  "name": "Text Cleaner",
  "slug": "text-cleaner",
  "category": "Text Tools",
  "description": "Clean up messy text",
  "keywords": [
   "clean",
   "text",
   "whitespace",
   "spaces",
   "blank",
   "lines",
   "html"
  ],
  "popular": false,
  "id": "text-cleaner",
  "icon": "📝",
  "url": "tools/text-cleaner"
 },
 {
  "name": "JSON Formatter",
  "slug": "json-formatter",
  "category": "Developer Tools",
  "description": "Format and beautify JSON online",
  "keywords": [
   "json",
   "format",
   "beautify",
   "pretty",
   "print",
   "minify"
  ],
  "popular": true,
  "id": "json-formatter",
  "icon": "💻",
  "url": "tools/json-formatter"
 },
 {
  "name": "JSON Validator",
  "slug": "json-validator",
  "category": "Developer Tools",
  "description": "Check if JSON is valid",
  "keywords": [
   "json",
   "validate",
   "valid",
   "syntax",
   "check"
  ],
  "popular": false,
  "id": "json-validator",
  "icon": "💻",
  "url": "tools/json-validator"
 },
 {
  "name": "Base64 Encoder",
  "slug": "base64-encoder",
  "category": "Developer Tools",
  "description": "Encode text to Base64",
  "keywords": [
   "base64",
   "encode",
   "text"
  ],
  "popular": false,
  "id": "base64-encoder",
  "icon": "💻",
  "url": "tools/base64-encoder"
 },
 {
  "name": "Base64 Decoder",
  "slug": "base64-decoder",
  "category": "Developer Tools",
  "description": "Decode Base64 to text",
  "keywords": [
   "base64",
   "decode",
   "text"
  ],
  "popular": false,
  "id": "base64-decoder",
  "icon": "💻",
  "url": "tools/base64-decoder"
 },
 {
  "name": "URL Encoder",
  "slug": "url-encoder",
  "category": "Developer Tools",
  "description": "Percent-encode URLs and text",
  "keywords": [
   "url",
   "encode",
   "percent",
   "encoding",
   "query",
   "string"
  ],
  "popular": false,
  "id": "url-encoder",
  "icon": "💻",
  "url": "tools/url-encoder"
 },
 {
  "name": "URL Decoder",
  "slug": "url-decoder",
  "category": "Developer Tools",
  "description": "Decode percent-encoded URLs",
  "keywords": [
   "url",
   "decode",
   "percent",
   "encoding",
   "query",
   "string"
  ],
  "popular": false,
  "id": "url-decoder",
  "icon": "💻",
  "url": "tools/url-decoder"
 },
 {
  "name": "UUID Generator",
  "slug": "uuid-generator",
  "category": "Developer Tools",
  "description": "Generate random UUID v4 values",
  "keywords": [
   "uuid",
   "guid",
   "unique",
   "id",
   "random",
   "generator"
  ],
  "popular": false,
  "id": "uuid-generator",
  "icon": "💻",
  "url": "tools/uuid-generator"
 },
 {
  "name": "HTML Formatter",
  "slug": "html-formatter",
  "category": "Developer Tools",
  "description": "Format and preview HTML",
  "keywords": [
   "html",
   "format",
   "beautify",
   "indent",
   "pretty"
  ],
  "popular": false,
  "id": "html-formatter",
  "icon": "💻",
  "url": "tools/html-formatter"
 },
 {
  "name": "CSS Formatter",
  "slug": "css-formatter",
  "category": "Developer Tools",
  "description": "Format and preview CSS",
  "keywords": [
   "css",
   "format",
   "beautify",
   "indent",
   "stylesheet"
  ],
  "popular": false,
  "id": "css-formatter",
  "icon": "💻",
  "url": "tools/css-formatter"
 },
 {
  "name": "JavaScript Formatter",
  "slug": "js-formatter",
  "category": "Developer Tools",
  "description": "Format and preview JavaScript",
  "keywords": [
   "javascript",
   "js",
   "format",
   "beautify",
   "indent",
   "preview",
   "console"
  ],
  "popular": false,
  "id": "js-formatter",
  "icon": "💻",
  "url": "tools/js-formatter"
 },
 {
  "name": "Image Resizer",
  "slug": "image-resizer",
  "category": "Image Tools",
  "description": "Resize images to any size",
  "keywords": [
   "image",
   "resize",
   "dimensions",
   "width",
   "height",
   "photo"
  ],
  "popular": true,
  "id": "image-resizer",
  "icon": "🖼️",
  "url": "tools/image-resizer"
 },
 {
  "name": "Image Compressor",
  "slug": "image-compressor",
  "category": "Image Tools",
  "description": "Compress JPG and WebP images",
  "keywords": [
   "image",
   "compress",
   "reduce",
   "file",
   "size",
   "optimize",
   "photo"
  ],
  "popular": true,
  "id": "image-compressor",
  "icon": "🖼️",
  "url": "tools/image-compressor"
 },
 {
  "name": "Image Cropper",
  "slug": "image-cropper",
  "category": "Image Tools",
  "description": "Crop images to exact pixels",
  "keywords": [
   "image",
   "crop",
   "cut",
   "trim",
   "photo"
  ],
  "popular": false,
  "id": "image-cropper",
  "icon": "🖼️",
  "url": "tools/image-cropper"
 },
 {
  "name": "JPG to PNG Converter",
  "slug": "jpg-to-png",
  "category": "Image Tools",
  "description": "Convert JPG images to PNG",
  "keywords": [
   "jpg",
   "jpeg",
   "png",
   "convert",
   "image"
  ],
  "popular": false,
  "id": "jpg-to-png",
  "icon": "🖼️",
  "url": "tools/jpg-to-png"
 },
 {
  "name": "PNG to JPG Converter",
  "slug": "png-to-jpg",
  "category": "Image Tools",
  "description": "Convert PNG images to JPG",
  "keywords": [
   "png",
   "jpg",
   "jpeg",
   "convert",
   "image"
  ],
  "popular": false,
  "id": "png-to-jpg",
  "icon": "🖼️",
  "url": "tools/png-to-jpg"
 },
 {
  "name": "Image to Base64 Converter",
  "slug": "image-to-base64",
  "category": "Image Tools",
  "description": "Convert an image to a Base64 data URL",
  "keywords": [
   "image",
   "base64",
   "data",
   "url",
   "encode"
  ],
  "popular": false,
  "id": "image-to-base64",
  "icon": "🖼️",
  "url": "tools/image-to-base64"
 },
 {
  "name": "Length Converter",
  "slug": "length-converter",
  "category": "Converters",
  "description": "Convert between length units",
  "keywords": [
   "length",
   "convert",
   "meter",
   "feet",
   "inch",
   "mile",
   "km"
  ],
  "popular": false,
  "id": "length-converter",
  "icon": "🔄",
  "url": "tools/length-converter"
 },
 {
  "name": "Weight Converter",
  "slug": "weight-converter",
  "category": "Converters",
  "description": "Convert between weight units",
  "keywords": [
   "weight",
   "mass",
   "convert",
   "kg",
   "pound",
   "ounce",
   "gram"
  ],
  "popular": false,
  "id": "weight-converter",
  "icon": "🔄",
  "url": "tools/weight-converter"
 },
 {
  "name": "Temperature Converter",
  "slug": "temperature-converter",
  "category": "Converters",
  "description": "Convert Celsius, Fahrenheit and Kelvin",
  "keywords": [
   "temperature",
   "convert",
   "celsius",
   "fahrenheit",
   "kelvin"
  ],
  "popular": false,
  "id": "temperature-converter",
  "icon": "🔄",
  "url": "tools/temperature-converter"
 },
 {
  "name": "Area Converter",
  "slug": "area-converter",
  "category": "Converters",
  "description": "Convert between area units",
  "keywords": [
   "area",
   "convert",
   "square",
   "meter",
   "acre",
   "hectare",
   "feet"
  ],
  "popular": false,
  "id": "area-converter",
  "icon": "🔄",
  "url": "tools/area-converter"
 },
 {
  "name": "Volume Converter",
  "slug": "volume-converter",
  "category": "Converters",
  "description": "Convert between volume units",
  "keywords": [
   "volume",
   "convert",
   "liter",
   "gallon",
   "cup",
   "ml"
  ],
  "popular": false,
  "id": "volume-converter",
  "icon": "🔄",
  "url": "tools/volume-converter"
 },
 {
  "name": "Speed Converter",
  "slug": "speed-converter",
  "category": "Converters",
  "description": "Convert between speed units",
  "keywords": [
   "speed",
   "convert",
   "kmh",
   "mph",
   "knot",
   "velocity"
  ],
  "popular": false,
  "id": "speed-converter",
  "icon": "🔄",
  "url": "tools/speed-converter"
 },
 {
  "name": "Time Converter",
  "slug": "time-converter",
  "category": "Converters",
  "description": "Convert between time units",
  "keywords": [
   "time",
   "convert",
   "seconds",
   "minutes",
   "hours",
   "days",
   "weeks"
  ],
  "popular": false,
  "id": "time-converter",
  "icon": "🔄",
  "url": "tools/time-converter"
 },
 {
  "name": "Data Storage Converter",
  "slug": "data-storage-converter",
  "category": "Converters",
  "description": "Convert bits, bytes, MB, GB and TB",
  "keywords": [
   "data",
   "storage",
   "convert",
   "byte",
   "kb",
   "mb",
   "gb",
   "tb",
   "bit"
  ],
  "popular": false,
  "id": "data-storage-converter",
  "icon": "🔄",
  "url": "tools/data-storage-converter"
 },
 {
  "name": "QR Generator",
  "slug": "qr-generator",
  "category": "Generators",
  "description": "Create free QR codes for text, URLs, contacts and more",
  "keywords": [
   "qr",
   "code",
   "generator",
   "text",
   "url",
   "email",
   "phone",
   "sms",
   "wifi",
   "vcard",
   "contact",
   "image"
  ],
  "popular": true,
  "id": "qr-generator",
  "icon": "▦",
  "url": "tools/qr-generator"
 }
];
