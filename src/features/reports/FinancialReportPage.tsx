import React from 'react';
import { useReports } from '../../hooks/queries/useReports';
import { formatCurrency } from '../../utils/formatCurrency';
import { TrendingUp, Award, Activity, Percent, ArrowUpRight } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export const FinancialReportPage: React.FC = () => {
  const { financialSummary, isLoadingFinancial } = useReports('month');

  if (isLoadingFinancial || !financialSummary) {
    return <div style={{ color: '#fff' }}>Đang tải báo cáo tài chính chi tiết...</div>;
  }

  // Find metrics values
  const revenue = financialSummary.metrics[0].value;
  const foodCost = financialSummary.metrics[1].value;
  const laborCost = financialSummary.metrics[2].value;
  const netProfit = financialSummary.metrics[3].value;
  const marginPercent = Math.round((netProfit / revenue) * 100);

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>Báo Cáo Tài Chính Chi Tiết</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Báo cáo kết quả hoạt động kinh doanh (P&L), phân tích doanh thu và kiểm soát tỷ lệ chi phí.
        </p>
      </div>

      {/* Metric details grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.5rem'
      }}>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(0,188,212,0.1)', padding: '0.8rem', borderRadius: '12px', color: 'var(--accent-color)' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Doanh Thu Thuần</span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>{formatCurrency(revenue)}</h3>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(255, 77, 77, 0.1)', padding: '0.8rem', borderRadius: '12px', color: '#ff4d4d' }}>
            <Activity size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Tổng Chi Phí (BOM + HRM)</span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>{formatCurrency(foodCost + laborCost)}</h3>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(76,175,80,0.1)', padding: '0.8rem', borderRadius: '12px', color: '#4caf50' }}>
            <Award size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Lợi Nhuận Ròng</span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: '#4caf50' }}>{formatCurrency(netProfit)}</h3>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(255, 235, 59, 0.1)', padding: '0.8rem', borderRadius: '12px', color: '#ffeb3b' }}>
            <Percent size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Tỷ Suất Lợi Nhuận Ròng</span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: '#ffeb3b' }}>{marginPercent}%</h3>
          </div>
        </div>
      </div>

      {/* Comparative chart & P&L Statement breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.2fr', gap: '2rem' }}>
        
        {/* Comparative Cost bar chart */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Doanh Thu vs Chi Phí Hàng Tháng</h3>
          <div style={{ flex: 1, minHeight: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialSummary.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickFormatter={(val) => `${val / 1000000}M`} />
                <Tooltip
                  formatter={(val: any) => formatCurrency(Number(val))}
                  contentStyle={{ background: '#121226', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <Bar dataKey="revenue" name="Doanh Thu" fill="var(--accent-color)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cost" name="Chi Phí Vận Hành" fill="#ff4d4d" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" name="Lợi Nhuận" fill="#4caf50" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* P&L Statement table */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Báo Cáo Thu Nhập (P&L)</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ fontWeight: 600 }}>Doanh thu hoạt động bán hàng:</span>
              <span style={{ fontWeight: 700, color: 'var(--accent-color)' }}>{formatCurrency(revenue)}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)', paddingLeft: '1rem' }}>- Chi phí giá vốn thực phẩm (BOM):</span>
              <span style={{ color: '#ff8a8a' }}>-{formatCurrency(foodCost)}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)', paddingLeft: '1rem' }}>- Chi phí nhân sự hoạt động (HRM):</span>
              <span style={{ color: '#ff8a8a' }}>-{formatCurrency(laborCost)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)', paddingLeft: '1rem' }}>- Chi phí thuê mặt bằng & tiện ích:</span>
              <span style={{ color: '#ff8a8a' }}>-{formatCurrency(revenue * 0.1)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)', paddingLeft: '1rem' }}>- Chi phí tiếp thị quảng cáo (Mkt):</span>
              <span style={{ color: '#ff8a8a' }}>-{formatCurrency(revenue * 0.05)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem 0', borderBottom: '2px solid var(--border-color)', marginTop: '0.5rem' }}>
              <span style={{ fontWeight: 700, textTransform: 'uppercase' }}>Lợi Nhuận Ròng Trước Thuế:</span>
              <span style={{ fontWeight: 700, color: '#4caf50', fontSize: '1.1rem' }}>{formatCurrency(netProfit)}</span>
            </div>
          </div>
          
          <div style={{
            background: 'rgba(0,188,212,0.05)',
            border: '1px solid rgba(0,188,212,0.15)',
            borderRadius: '12px',
            padding: '1rem',
            fontSize: '0.8rem',
            lineHeight: 1.5,
            color: 'var(--text-secondary)'
          }}>
            💡 <strong>Phân Tích:</strong> Tỷ suất lợi nhuận đạt {marginPercent}%. Kiểm soát chi phí nguyên liệu thực phẩm (BOM) ở ngưỡng dưới 35% đang giúp nhà hàng duy trì sức khỏe tài chính tốt. Khuyên dùng tối ưu hóa danh mục thực đơn để tăng lợi nhuận.
          </div>
        </div>
      </div>
    </div>
  );
};
