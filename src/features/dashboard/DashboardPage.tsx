import React from 'react';
import { useReports } from '../../hooks/queries/useReports';
import { useOrders } from '../../hooks/queries/useOrders';
import { formatCurrency } from '../../utils/formatCurrency';
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  TrendingDown,
  PieChart as ChartIcon
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Cell,
  Pie
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { financialSummary, isLoadingFinancial } = useReports('month');
  const { tables, orders } = useOrders();

  if (isLoadingFinancial || !financialSummary) {
    return <div style={{ color: '#fff' }}>Đang tải dữ liệu báo cáo phân tích...</div>;
  }

  // Count active tables and active orders
  const activeTablesCount = tables.filter((t) => t.status === 'occupied').length;
  const totalTablesCount = tables.length;
  const newOrdersCount = orders.filter((o) => o.status === 'pending').length;

  const COLORS = ['#1e90ff', '#4caf50', '#ffeb3b', '#ff4d4d', '#9c27b0'];

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Welcome Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>Bảng Thống Kê Tổng Quan</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Theo dõi doanh thu, chi phí món ăn (BOM) và tình trạng vận hành trực tiếp.
          </p>
        </div>
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '0.5rem 1rem',
          borderRadius: '10px',
          border: '1px solid rgba(255,255,255,0.08)',
          fontSize: '0.85rem'
        }}>
          Cập nhật: <span style={{ color: 'var(--accent-color)', fontWeight: 600 }}>Hôm Nay</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.5rem'
      }}>
        {financialSummary.metrics.map((m, idx) => {
          const isRevenue = idx === 0;
          const isProfit = idx === 3;
          const iconColor = isRevenue ? '#1e90ff' : isProfit ? '#4caf50' : '#ff9800';

          return (
            <div key={m.label} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
                  {m.label}
                </span>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                  {formatCurrency(m.value)}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem' }}>
                  {m.trend === 'up' ? (
                    <ArrowUpRight size={14} style={{ color: '#4caf50' }} />
                  ) : (
                    <ArrowDownRight size={14} style={{ color: '#ff4d4d' }} />
                  )}
                  <span style={{ color: m.trend === 'up' ? '#4caf50' : '#ff4d4d', fontWeight: 600 }}>
                    {Math.abs(m.changePercent)}%
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>so với tháng trước</span>
                </div>
              </div>
              <div style={{
                background: `rgba(${iconColor === '#1e90ff' ? '30,144,255' : '76,175,80'}, 0.1)`,
                padding: '0.8rem',
                borderRadius: '12px',
                color: iconColor
              }}>
                {isRevenue ? <DollarSign size={24} /> : isProfit ? <TrendingUp size={24} /> : <ShoppingBag size={24} />}
              </div>
            </div>
          );
        })}

        {/* Live operational KPI */}
        <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
              Bàn Đang Phục Vụ
            </span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: '0.5rem', marginBottom: '0.5rem' }}>
              {activeTablesCount} / {totalTablesCount}
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Có <strong style={{ color: 'var(--accent-color)' }}>{newOrdersCount}</strong> đơn hàng đang chờ
            </span>
          </div>
          <div style={{
            background: 'rgba(255, 235, 59, 0.1)',
            padding: '0.8rem',
            borderRadius: '12px',
            color: '#ffeb3b'
          }}>
            <Users size={24} />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '1.5rem',
        minHeight: '350px'
      }}>
        {/* Revenue Trend Area Chart */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Xu Hướng Doanh Thu & Lợi Nhuận</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>6 Tháng Gần Nhất (VND)</span>
          </div>
          <div style={{ flex: 1, minHeight: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={financialSummary.chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-color)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--accent-color)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4caf50" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#4caf50" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickFormatter={(val) => `${val / 1000000}M`} />
                <Tooltip
                  contentStyle={{ background: '#121226', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="revenue" name="Doanh Thu" stroke="var(--accent-color)" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                <Area type="monotone" dataKey="profit" name="Lợi Nhuận Ròng" stroke="#4caf50" fillOpacity={1} fill="url(#colorProfit)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Operating Cost Breakdown Pie Chart */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Cơ Cấu Chi Phí Vận Hành</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tỷ trọng chi phí trên doanh thu</p>
          </div>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '180px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={financialSummary.operatingExpenses}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="amount"
                >
                  {financialSummary.operatingExpenses.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => formatCurrency(Number(value))}
                  contentStyle={{ background: '#121226', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {financialSummary.operatingExpenses.slice(0, 4).map((exp, idx) => (
              <div key={exp.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: COLORS[idx] }}></span>
                  <span style={{ color: 'var(--text-secondary)' }}>{exp.name}</span>
                </div>
                <span style={{ fontWeight: 600 }}>{exp.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
