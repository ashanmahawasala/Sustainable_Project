import axios from "axios";

export const getSriLankaHolidays = async (req, res) => {
  try {
    const apiKey = process.env.CALENDARIFIC_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ message: "Missing Calendarific API key" });
    }

    const year = Number(req.query.year) || new Date().getFullYear();
    const month = req.query.month ? Number(req.query.month) : undefined;

    const response = await axios.get("https://calendarific.com/api/v2/holidays", {
      params: {
        api_key: apiKey,
        country: "LK",
        year,
        ...(month ? { month } : {}),
      },
    });

    const holidays = response.data?.response?.holidays || [];

    return res.status(200).json({
      year,
      count: holidays.length,
      holidays: holidays.map((holiday) => ({
        name: holiday.name,
        description: holiday.description,
        isoDate: holiday.date?.iso,
        type: holiday.type || [],
      })),
    });
  } catch (error) {
    return res.status(500).json({
      message: error.response?.data?.error || error.message,
    });
  }
};

export const getNextSriLankaHoliday = async (req, res) => {
  try {
    const apiKey = process.env.CALENDARIFIC_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ message: "Missing Calendarific API key" });
    }

    const today = new Date();
    const currentYear = today.getFullYear();

    const fetchYear = async (year) => {
      const response = await axios.get("https://calendarific.com/api/v2/holidays", {
        params: {
          api_key: apiKey,
          country: "LK",
          year,
        },
      });

      return response.data?.response?.holidays || [];
    };

    let holidays = await fetchYear(currentYear);

    let upcoming = holidays
      .filter((holiday) => holiday.date?.iso && new Date(holiday.date.iso) >= today)
      .sort((a, b) => new Date(a.date.iso) - new Date(b.date.iso));

    if (upcoming.length === 0) {
      holidays = await fetchYear(currentYear + 1);
      upcoming = holidays
        .filter((holiday) => holiday.date?.iso)
        .sort((a, b) => new Date(a.date.iso) - new Date(b.date.iso));
    }

    const nextHoliday = upcoming[0] || null;

    return res.status(200).json({
      nextHoliday: nextHoliday
        ? {
            name: nextHoliday.name,
            description: nextHoliday.description,
            isoDate: nextHoliday.date?.iso,
            type: nextHoliday.type || [],
          }
        : null,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.response?.data?.error || error.message,
    });
  }
};