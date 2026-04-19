import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  TrendingUp,
  PieChart as PieIcon,
  Trophy,
  ArrowRight,
  Download,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import {
  getCategoryDistribution,
  getLeaderboard,
  getMonthlyTrend,
  getOverview,
  getNextSriLankaHoliday,
  getHolidayComparison,
  getSriLankaHolidays,
} from '../../services/api';

import dashboardBanner from '../../assets/AdminBanner1.png';
import footerBanner from '../../assets/27.png';
import { PageShell, SummaryCard, SectionPanel } from '../../shared/PageShell';

const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const MATERIAL_COLORS = ['#64748b', '#0f55a7', '#4db848', '#94a3b8', '#0ea5e9'];

const VALID_TABS = ['overview', 'trends', 'materials', 'leaderboard', 'holiday_impact'];
const VALID_OVERVIEW_PERIODS = ['all_time', 'this_year'];
const VALID_TREND_RANGES = [6, 12];

const pad2 = (value) => String(value).padStart(2, '0');

const formatLocalDateKey = (date) => {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
};

const formatIsoDateOnly = (isoDate) => {
  if (!isoDate) return '';
  return String(isoDate).split('T')[0];
};

const buildCalendarDays = (year, month) => {
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];

  for (let i = 0; i < firstDayIndex; i += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(day);
  }

  return cells;
};

const HolidayCalendar = ({
  visibleMonth,
  onPrevMonth,
  onNextMonth,
  holidays,
  selectedHolidayDate,
  onSelectHolidayDate,
}) => {
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();

  const monthLabel = visibleMonth.toLocaleString('default', {
    month: 'short',
    year: 'numeric',
  });

  const calendarCells = buildCalendarDays(year, month);

  const holidayMap = new Map(
    (holidays || []).map((holiday) => [formatIsoDateOnly(holiday.isoDate), holiday])
  );

  return (
    <div className="w-full max-w-[320px] bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={onPrevMonth}
          className="w-8 h-8 rounded-md border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <h4 className="text-sm font-bold text-slate-900">{monthLabel}</h4>

        <button
          type="button"
          onClick={onNextMonth}
          className="w-8 h-8 rounded-md border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekdayLabels.map((label) => (
          <div
            key={label}
            className="text-center text-[10px] font-bold uppercase text-slate-400 py-1"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarCells.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="h-9" />;
          }

          const dateKey = formatLocalDateKey(new Date(year, month, day));
          const holiday = holidayMap.get(dateKey);
          const isHoliday = Boolean(holiday);
          const isSelected = selectedHolidayDate === dateKey;

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => {
                if (isHoliday) onSelectHolidayDate(dateKey);
              }}
              title={holiday ? holiday.name : ''}
              className={`h-9 rounded-md text-xs font-semibold border transition-colors ${
                isHoliday
                  ? isSelected
                    ? 'bg-[#0f55a7] text-white border-[#0f55a7]'
                    : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                  : 'bg-white text-slate-700 border-slate-200'
              } ${isHoliday ? 'cursor-pointer' : 'cursor-default'}`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const AnalyticsDashboard = () => {
  const [data, setData] = useState({
    overview: null,
    trend: [],
    categories: [],
    leaderboard: [],
  });

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [overviewPeriod, setOverviewPeriod] = useState('all_time');
  const [trendRange, setTrendRange] = useState(6);
  const [nextHoliday, setNextHoliday] = useState(null);
  const [holidayComparison, setHolidayComparison] = useState(null);
  const [validationMessage, setValidationMessage] = useState(null);

  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [monthlyHolidays, setMonthlyHolidays] = useState([]);
  const [selectedHolidayDate, setSelectedHolidayDate] = useState(null);

  useEffect(() => {
    if (!validationMessage) return undefined;

    const timer = setTimeout(() => setValidationMessage(null), 3500);
    return () => clearTimeout(timer);
  }, [validationMessage]);

  useEffect(() => {
    let corrected = false;

    if (!VALID_TABS.includes(activeTab)) {
      setActiveTab('overview');
      corrected = true;
    }

    if (!VALID_OVERVIEW_PERIODS.includes(overviewPeriod)) {
      setOverviewPeriod('all_time');
      corrected = true;
    }

    if (!VALID_TREND_RANGES.includes(Number(trendRange))) {
      setTrendRange(6);
      corrected = true;
    }

    if (corrected) {
      setValidationMessage({
        type: 'error',
        text: 'Invalid dashboard selection detected. Default values were restored.',
      });
    }
  }, [activeTab, overviewPeriod, trendRange]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const results = await Promise.allSettled([
          getOverview(overviewPeriod),
          getMonthlyTrend(trendRange),
          getCategoryDistribution(),
          getLeaderboard(),
        ]);

        setData({
          overview: results[0].status === 'fulfilled' ? results[0].value.data : null,
          trend: results[1].status === 'fulfilled' ? results[1].value.data : [],
          categories: results[2].status === 'fulfilled' ? results[2].value.data : [],
          leaderboard: results[3].status === 'fulfilled' ? results[3].value.data : [],
        });
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [overviewPeriod, trendRange]);

  useEffect(() => {
    const fetchHoliday = async () => {
      try {
        const response = await getNextSriLankaHoliday();
        setNextHoliday(response.data?.nextHoliday || null);
      } catch (error) {
        console.error('Failed to load holiday data:', error);
        setNextHoliday(null);
      }
    };

    fetchHoliday();
  }, []);

  useEffect(() => {
    const fetchHolidayComparisonData = async () => {
      try {
        const response = await getHolidayComparison();
        setHolidayComparison(response.data);
      } catch (error) {
        console.error('Failed to load holiday comparison data:', error);
        setHolidayComparison(null);
      }
    };

    fetchHolidayComparisonData();
  }, []);

  useEffect(() => {
    const fetchMonthlyHolidays = async () => {
      try {
        const response = await getSriLankaHolidays(
          calendarMonth.getFullYear(),
          calendarMonth.getMonth() + 1
        );

        const holidays = response.data?.holidays || [];
        setMonthlyHolidays(holidays);

        if (holidays.length > 0) {
          setSelectedHolidayDate(formatIsoDateOnly(holidays[0].isoDate));
        } else {
          setSelectedHolidayDate(null);
        }
      } catch (error) {
        console.error('Failed to load monthly holiday data:', error);
        setMonthlyHolidays([]);
        setSelectedHolidayDate(null);
      }
    };

    fetchMonthlyHolidays();
  }, [calendarMonth]);

  useEffect(() => {
    if (!selectedHolidayDate) return;

    const exists = monthlyHolidays.some(
      (holiday) => formatIsoDateOnly(holiday.isoDate) === selectedHolidayDate
    );

    if (!exists) {
      setSelectedHolidayDate(monthlyHolidays[0] ? formatIsoDateOnly(monthlyHolidays[0].isoDate) : null);
    }
  }, [monthlyHolidays, selectedHolidayDate]);

  const { overview, trend, categories, leaderboard } = data;

  const selectedHoliday = useMemo(() => {
    if (!selectedHolidayDate) return null;

    return (
      monthlyHolidays.find(
        (holiday) => formatIsoDateOnly(holiday.isoDate) === selectedHolidayDate
      ) || null
    );
  }, [monthlyHolidays, selectedHolidayDate]);

  const formatNum = (num) =>
    Number(num || 0).toLocaleString(undefined, {
      maximumFractionDigits: 1,
    });

  const computed = useMemo(() => {
    if (!overview) {
      return {
        chartTrend: [],
        chartCategories: [],
        top5: [],
      };
    }

    const chartTrend = (Array.isArray(trend) ? trend : []).map((item) => {
      const parts = item.month ? item.month.split('-') : [];
      const monthName =
        parts.length === 2
          ? new Date(parts[0], parts[1] - 1).toLocaleString('default', {
              month: 'short',
            })
          : item.month || '';

      return {
        name: monthName,
        monthKey: item.month,
        Weight: Number(item.weightKg) || 0,
        co2SavedKg: Number(item.co2SavedKg) || 0,
        actionsCount: Number(item.actionsCount) || 0,
      };
    });

    const chartCategories = (Array.isArray(categories) ? categories : [])
      .slice()
      .sort((a, b) => (b.weightKg || 0) - (a.weightKg || 0))
      .slice(0, 5)
      .map((item) => ({
        name: item.category || 'Unknown',
        value: Number(item.weightKg) || 0,
      }));

    const top5 = (Array.isArray(leaderboard) ? leaderboard : []).slice(0, 5);

    return {
      chartTrend,
      chartCategories,
      top5,
    };
  }, [overview, trend, categories, leaderboard]);

  const progress = Math.min(
    100,
    Math.max(0, ((overview?.thisMonthWeightKg || 0) / (overview?.monthlyTargetKg || 1)) * 100)
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'trends', label: 'Trends', icon: TrendingUp },
    { id: 'materials', label: 'Materials', icon: PieIcon },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'holiday_impact', label: 'Holiday Impact', icon: BarChart3 },
  ];

  const handlePrevCalendarMonth = () => {
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextCalendarMonth = () => {
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleSelectHolidayDate = (dateKey) => {
    const exists = monthlyHolidays.some(
      (holiday) => formatIsoDateOnly(holiday.isoDate) === dateKey
    );

    if (!exists) {
      setValidationMessage({
        type: 'error',
        text: 'Please select a valid highlighted holiday date.',
      });
      return;
    }

    setSelectedHolidayDate(dateKey);
  };

  const handleExportTrendCSV = () => {
    if (!computed.chartTrend.length) {
      setValidationMessage({
        type: 'error',
        text: 'No trend data available to export.',
      });
      return;
    }

    const rows = [
      ['Month', 'Weight (kg)', 'CO2 Saved (kg)', 'Actions Count'],
      ...computed.chartTrend.map((item) => [
        item.monthKey,
        item.Weight,
        item.co2SavedKg,
        item.actionsCount,
      ]),
    ];

    const csvContent = rows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `collection-trends-${trendRange}-months.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    setValidationMessage({
      type: 'success',
      text: 'Trend report exported successfully.',
    });
  };

  const handleExportOverviewReport = () => {
    if (!overview) {
      setValidationMessage({
        type: 'error',
        text: 'Overview data is not available to export.',
      });
      return;
    }

    const rows = [
      ['Overview Report'],
      ['Period', overviewPeriod === 'all_time' ? 'All Time' : 'This Year'],
      ['Total Diverted (kg)', overview?.totalWeightKg || 0],
      ['CO2 Averted (kg)', overview?.totalCo2SavedKg || 0],
      ['Hazardous Items', overview?.hazardousCount || 0],
      ['Monthly Target (kg)', overview?.monthlyTargetKg || 0],
      ['This Month Weight (kg)', overview?.thisMonthWeightKg || 0],
      ['Progress Percent', overview?.progressPercent || 0],
    ];

    const csvContent = rows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `overview-report-${overviewPeriod === 'all_time' ? 'all-time' : 'this-year'}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    setValidationMessage({
      type: 'success',
      text: 'Overview report exported successfully.',
    });
  };

  const handleExportLeaderboardPDF = () => {
    if (!computed.top5.length) {
      setValidationMessage({
        type: 'error',
        text: 'No leaderboard data available to export.',
      });
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('EcoCycle Leaderboard Report', 14, 18);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 26);
    doc.text('Top Contributors Report', 14, 32);

    const tableBody = (computed.top5 || []).map((user, index) => [
      `#${index + 1}`,
      user.userName || 'Unknown',
      formatNum(user.weightKg),
      formatNum(user.co2SavedKg),
      formatNum(user.actionsCount),
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['Rank', 'User', 'Diverted (kg)', 'CO2 Saved (kg)', 'Actions']],
      body: tableBody,
      theme: 'grid',
      headStyles: {
        fillColor: [15, 85, 167],
        textColor: 255,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 10,
        cellPadding: 4,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    });

    const finalY = doc.lastAutoTable?.finalY || 60;

    doc.setFontSize(11);
    doc.setTextColor(60);
    doc.text(`Total ranked users shown: ${computed.top5.length}`, 14, finalY + 12);

    doc.save('ecocycle-leaderboard-report.pdf');

    setValidationMessage({
      type: 'success',
      text: 'Leaderboard PDF exported successfully.',
    });
  };

  const smallPrimaryButton =
    'bg-[#0f55a7] hover:bg-[#0c478d] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold px-5 py-2.5 rounded-full transition-colors flex items-center gap-2 shadow-sm w-max text-sm';

  const renderTabContent = () => {
    switch (activeTab) {
      case 'trends':
        return (
          <SectionPanel
            left={
              <>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Collection Trends</h3>
                <p className="text-slate-600 mb-8 leading-7 max-w-[34rem]">
                  Analyze the volume of e-waste collected over the selected period. The chart
                  includes months with zero values, so the timeline stays complete and easier to
                  compare.
                </p>

                <div className="flex gap-6 border-b border-slate-200 mb-8">
                  <button
                    onClick={() => setTrendRange(6)}
                    className={`pb-2 border-b-2 text-sm font-semibold transition-colors ${
                      trendRange === 6
                        ? 'border-[#4db848] text-slate-900'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    6 Months
                  </button>

                  <button
                    onClick={() => setTrendRange(12)}
                    className={`pb-2 border-b-2 text-sm font-semibold transition-colors ${
                      trendRange === 12
                        ? 'border-[#4db848] text-slate-900'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    1 Year
                  </button>
                </div>

                <button
                  onClick={handleExportTrendCSV}
                  className={smallPrimaryButton}
                  disabled={!computed.chartTrend.length}
                >
                  Export Chart <Download className="w-4 h-4" />
                </button>
              </>
            }
            right={
              <div className="flex items-center justify-center min-h-[400px]">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart
                    data={computed.chartTrend}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorWeightGreen" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4db848" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#4db848" stopOpacity={0} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b' }}
                      dy={10}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                    <RechartsTooltip
                      formatter={(value) => [`${formatNum(value)} kg`, 'Weight']}
                      contentStyle={{
                        borderRadius: '10px',
                        border: '1px solid #dbeafe',
                        boxShadow: '0 10px 20px -10px rgb(0 0 0 / 0.15)',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="Weight"
                      stroke="#4db848"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorWeightGreen)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            }
          />
        );

      case 'materials':
        return (
          <SectionPanel
            left={
              <>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Material Breakdown</h3>
                <p className="text-slate-600 mb-8 leading-7 max-w-[34rem]">
                  Understand the composition of collected e-waste. This view highlights the top
                  five material categories and makes it easier to see where most of the recycling
                  volume is coming from.
                </p>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-8">
                  <p className="text-sm text-slate-500 font-medium">Top Category</p>
                  <p className="text-xl font-bold text-[#0f55a7]">
                    {computed.chartCategories[0]?.name || 'N/A'}
                  </p>
                </div>
              </>
            }
            right={
              <div className="flex items-center justify-center min-h-[400px]">
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={computed.chartCategories}
                      cx="50%"
                      cy="50%"
                      innerRadius={78}
                      outerRadius={118}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {computed.chartCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={MATERIAL_COLORS[index % MATERIAL_COLORS.length]} />
                      ))}
                    </Pie>

                    <RechartsTooltip
                      formatter={(value) => [`${formatNum(value)} kg`, 'Weight']}
                      contentStyle={{
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 10px 20px -10px rgb(0 0 0 / 0.15)',
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      wrapperStyle={{ fontSize: '14px', color: '#475569' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            }
          />
        );

      case 'leaderboard':
        return (
          <SectionPanel
            left={
              <>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Top Performers</h3>
                <p className="text-slate-600 mb-8 leading-7 max-w-[34rem]">
                  Recognize the top contributors in the EcoCycle network. These users consistently
                  create measurable environmental value through high recycling activity and strong
                  overall impact.
                </p>

                <button
                  onClick={handleExportLeaderboardPDF}
                  className={smallPrimaryButton}
                  disabled={!computed.top5.length}
                >
                  View Full Report <ArrowRight className="w-4 h-4" />
                </button>
              </>
            }
            right={
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#0f55a7]/5 text-[#0f55a7]">
                    <tr>
                      <th className="px-6 py-4 font-bold">Rank</th>
                      <th className="px-6 py-4 font-bold">User</th>
                      <th className="px-6 py-4 font-bold text-right">Diverted (kg)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {computed.top5.map((user, index) => (
                      <tr key={index} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900">#{index + 1}</td>
                        <td className="px-6 py-4 font-medium text-slate-700">
                          {user.userName || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-[#0f55a7]">
                          {formatNum(user.weightKg)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            }
          />
        );

      case 'holiday_impact':
        return (
          <SectionPanel
            left={
              <div className="max-w-[340px] w-full space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Holiday vs Non-Holiday</h3>
                  <p className="text-slate-600 leading-7">
                    Compare collection performance on Sri Lankan public holidays and normal working
                    days to understand how holidays influence recycler activity and pickup demand.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-sm text-slate-500 font-medium mb-1">Insight</p>
                  <p className="text-lg font-bold text-[#0f55a7] leading-8">
                    {holidayComparison?.insight || 'Loading insight...'}
                  </p>
                </div>

                <HolidayCalendar
                  visibleMonth={calendarMonth}
                  onPrevMonth={handlePrevCalendarMonth}
                  onNextMonth={handleNextCalendarMonth}
                  holidays={monthlyHolidays}
                  selectedHolidayDate={selectedHolidayDate}
                  onSelectHolidayDate={handleSelectHolidayDate}
                />

                <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm max-w-[320px]">
                  <p className="text-xs text-slate-500 font-medium mb-1 uppercase tracking-wide">
                    Selected Holiday
                  </p>
                  {selectedHoliday ? (
                    <>
                      <p className="text-base font-bold text-slate-900 leading-7">
                        {selectedHoliday.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(selectedHoliday.isoDate).toLocaleDateString()}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-slate-500">
                      Select a highlighted holiday date.
                    </p>
                  )}
                </div>
              </div>
            }
            right={
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <SummaryCard
                  title="Holiday Weight"
                  value={`${formatNum(holidayComparison?.holidayWeightKg)} kg`}
                  subtitle="Total collected on holidays"
                  tone="text-[#0f55a7]"
                />

                <SummaryCard
                  title="Non-Holiday Weight"
                  value={`${formatNum(holidayComparison?.nonHolidayWeightKg)} kg`}
                  subtitle="Total collected on non-holidays"
                  tone="text-emerald-600"
                />

                <SummaryCard
                  title="Holiday Actions"
                  value={formatNum(holidayComparison?.holidayActions)}
                  subtitle="Impact logs on holidays"
                  tone="text-amber-600"
                />

                <SummaryCard
                  title="Non-Holiday Actions"
                  value={formatNum(holidayComparison?.nonHolidayActions)}
                  subtitle="Impact logs on non-holidays"
                  tone="text-violet-600"
                />

                <SummaryCard
                  title="Holiday Avg / Day"
                  value={`${formatNum(holidayComparison?.holidayAvgWeightPerActiveDay)} kg`}
                  subtitle="Average on holiday activity days"
                  tone="text-sky-700"
                />

                <SummaryCard
                  title="Non-Holiday Avg / Day"
                  value={`${formatNum(holidayComparison?.nonHolidayAvgWeightPerActiveDay)} kg`}
                  subtitle="Average on normal activity days"
                  tone="text-teal-700"
                />
              </div>
            }
          />
        );

      default:
        return (
          <SectionPanel
            left={
              <>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">System Overview</h3>
                <p className="text-slate-600 mb-8 leading-7 max-w-[34rem]">
                  A high-level summary of your network&apos;s impact. Use this dashboard to quickly
                  assess environmental benefits and goal progress.
                </p>

                <div className="flex gap-6 border-b border-slate-200 mb-8">
                  <button
                    onClick={() => setOverviewPeriod('all_time')}
                    className={`pb-2 border-b-2 text-sm font-semibold transition-colors ${
                      overviewPeriod === 'all_time'
                        ? 'border-[#4db848] text-slate-900'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    All Time
                  </button>

                  <button
                    onClick={() => setOverviewPeriod('this_year')}
                    className={`pb-2 border-b-2 text-sm font-semibold transition-colors ${
                      overviewPeriod === 'this_year'
                        ? 'border-[#4db848] text-slate-900'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    This Year
                  </button>
                </div>

                <div className="flex items-center gap-6">
                  <button
                    onClick={handleExportOverviewReport}
                    className="text-slate-600 disabled:text-slate-300 disabled:cursor-not-allowed font-semibold text-sm hover:text-[#0f55a7] transition-colors flex items-center gap-1 group"
                    disabled={!overview}
                  >
                    Detailed Report
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </>
            }
            right={
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                <SummaryCard
                  title="Total Diverted"
                  value={
                    <>
                      {formatNum(overview?.totalWeightKg)}
                      <span className="text-lg text-slate-400"> kg</span>
                    </>
                  }
                  tone="text-[#1055a7]"
                />

                <SummaryCard
                  title="CO₂ Averted"
                  value={
                    <>
                      {formatNum(overview?.totalCo2SavedKg)}
                      <span className="text-lg text-slate-400"> kg</span>
                    </>
                  }
                  tone="text-[#2a9322]"
                />

                <SummaryCard
                  title="Hazardous Items"
                  value={
                    <>
                      {formatNum(overview?.hazardousCount)}
                      <span className="text-lg text-slate-400"> units</span>
                    </>
                  }
                  tone="text-[#2a9322]"
                />

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                      Monthly Target
                    </span>
                    <span className="text-sm font-bold text-[#0f55a7]">
                      {formatNum(progress)}%
                    </span>
                  </div>

                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#0f55a7] to-[#4db848] transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="mt-3 flex justify-between text-xs text-slate-500">
                    <span>{formatNum(overview?.thisMonthWeightKg)} kg this month</span>
                    <span>{formatNum(overview?.monthlyTargetKg)} kg target</span>
                  </div>
                </div>
              </div>
            }
          />
        );
    }
  };

  return (
    <PageShell
      banner={dashboardBanner}
      bannerAlt="Admin dashboard banner"
      footerBanner={footerBanner}
      footerBannerAlt="Admin dashboard footer banner"
      loading={loading}
    >
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="tabIconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0f55a7" />
            <stop offset="50%" stopColor="#0f55a7" />
            <stop offset="100%" stopColor="#4db848" />
          </linearGradient>
        </defs>
      </svg>

      <div className="text-center mb-10">
        <p className="text-[#0f55a7] font-semibold text-sm mb-2 uppercase tracking-widest">
          EcoCycle Admin Portal
        </p>
        <h2 className="text-3xl md:text-4xl font-bold">
          <span className="text-[#1055a7]">What data do you</span>{' '}
          <span className="text-[#2a9322]">want to view today?</span>
        </h2>
      </div>

      {validationMessage && (
        <div className="max-w-5xl mx-auto mb-8">
          <div
            className={`rounded-xl border px-4 py-3 flex items-center gap-3 shadow-sm ${
              validationMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {validationMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 shrink-0" />
            )}
            <span className="text-sm font-semibold">{validationMessage.text}</span>
          </div>
        </div>
      )}

      <div className="mb-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
            <CalendarDays className="w-6 h-6 text-[#4db848]" />
          </div>

          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">
              Holiday Intelligence
            </p>

            {nextHoliday ? (
              <>
                <h3 className="mt-1 text-xl font-bold text-slate-900">{nextHoliday.name}</h3>
                <p className="text-sm text-slate-500 mt-1">
                  {new Date(nextHoliday.isoDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-slate-600 mt-3 leading-6">
                  Upcoming public holiday in Sri Lanka. Pickup demand, recycler availability,
                  and scheduling efficiency may vary around this date.
                </p>
              </>
            ) : (
              <>
                <h3 className="mt-1 text-xl font-bold text-slate-900">
                  Holiday data unavailable
                </h3>
                <p className="text-sm text-slate-600 mt-3 leading-6">
                  Unable to load the next Sri Lankan public holiday right now.
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center p-6 rounded-xl transition-all duration-300 ease-out outline-none ${
                isActive
                  ? 'bg-[#0f55a7] text-white shadow-md scale-105 z-10'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-[#0f55a7] hover:bg-blue-50 hover:-translate-y-1 hover:shadow-lg'
              }`}
            >
              <tab.icon
                className="w-8 h-8 mb-3 transition-all duration-300"
                strokeWidth={1.7}
                style={{
                  color: isActive ? '#ffffff' : undefined,
                  stroke: isActive ? '#ffffff' : 'url(#tabIconGradient)',
                }}
              />
              <span className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-slate-800'}`}>
                {tab.label}
              </span>

              {isActive && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#0f55a7] rotate-45 z-0" />
              )}
            </button>
          );
        })}
      </div>

      {renderTabContent()}
    </PageShell>
  );
};

export default AnalyticsDashboard;