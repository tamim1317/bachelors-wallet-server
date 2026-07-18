const { GoogleGenAI } = require("@google/genai");
const Expense = require("../models/Expense");
const Income = require("../models/Income");
const Meal = require("../models/Meal");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

exports.getInsights = async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "GEMINI_API_KEY is missing",
      });
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const [expenses, incomes, meals] = await Promise.all([
      Expense.find({
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      }),

      Income.find({
        month: `${year}-${String(month).padStart(2, "0")}`,
      }),

      Meal.find({
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      }),
    ]);

    const totalExpense = expenses.reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0
    );

    const totalIncome = incomes.reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0
    );

    const totalMeals = meals.reduce(
      (sum, meal) =>
        sum +
        (meal.breakfast ? 1 : 0) +
        (meal.lunch ? 1 : 0) +
        (meal.dinner ? 1 : 0),
      0
    );

    const catBreakdown = {};

    expenses.forEach((expense) => {
      catBreakdown[expense.category] =
        (catBreakdown[expense.category] || 0) +
        Number(expense.amount);
    });

    const catText =
      Object.keys(catBreakdown).length > 0
        ? Object.entries(catBreakdown)
            .sort(([, a], [, b]) => b - a)
            .map(([cat, amount]) => `${cat}: ৳${amount}`)
            .join(", ")
        : "কোনো খরচ নেই";

    let insights = [
      "📊 এই মাসের খরচ নিয়মিত পর্যবেক্ষণ করুন।",
      "💰 অপ্রয়োজনীয় খরচ কমিয়ে সঞ্চয় বাড়ানোর চেষ্টা করুন।",
      "🍛 খাবারের খরচ ও মিল নিয়মিত ট্র্যাক করুন।",
      "📅 আগামী মাসের জন্য একটি বাজেট তৈরি করুন।",
    ];

    const prompt = `
তুমি একজন বাংলাদেশী Bachelor Mess Financial Advisor।

নিচের তথ্য দেখে ৪টি বাস্তবসম্মত বাংলা পরামর্শ দাও।

Rules:
- প্রতিটি insight emoji দিয়ে শুরু হবে।
- ১-২ লাইনের বেশি হবে না।
- Generic advice দিবে না।
- Data অনুযায়ী specific advice দিবে।
- শুধুমাত্র JSON return করবে।

Example:

{
  "insights":[
    "💰 ...",
    "🍛 ...",
    "📊 ...",
    "✅ ..."
  ]
}

Data

মোট আয়: ৳${totalIncome}

মোট খরচ: ৳${totalExpense}

সঞ্চয়: ৳${totalIncome - totalExpense}

মোট মিল: ${totalMeals}

Category Wise:

${catText}
`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const text = response.text;

      const clean = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const parsed = JSON.parse(clean);

      if (parsed.insights && Array.isArray(parsed.insights)) {
        insights = parsed.insights;
      }
    } catch (aiError) {
      console.error("Gemini Error:", aiError.message);
    }

    return res.json({
      success: true,
      data: {
        insights,

        summary: {
          totalExpense,
          totalIncome,
          savings: totalIncome - totalExpense,
          totalMeals,
          catBreakdown,
        },
      },
    });
  } catch (err) {
    console.error("Insights Error:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};