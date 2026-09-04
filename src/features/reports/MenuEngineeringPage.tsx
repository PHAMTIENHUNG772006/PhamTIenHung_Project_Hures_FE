import React from 'react';
import { useReports } from '../../hooks/queries/useReports';
import { formatCurrency } from '../../utils/formatCurrency';
import { Star, Swords, HelpCircle, AlertOctagon, TrendingUp, Info } from 'lucide-react';

export const MenuEngineeringPage: React.FC = () => {
  const { menuEngineeringData, isLoadingMenuEngineering } = useReports();

  if (isLoadingMenuEngineering) {
    return <div style={{ color: '#fff' }}>Đang tải báo cáo phân tích thực đơn (Menu Engineering)...</div>;
  }

  // Filter items into quadrants
  const stars = menuEngineeringData.filter((i) => i.category === 'Star');
  const plowhorses = menuEngineeringData.filter((i) => i.category === 'Plowhorse');
  const puzzles = menuEngineeringData.filter((i) => i.category === 'Puzzle');
  const dogs = menuEngineeringData.filter((i) => i.category === 'Dog');

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>Ma Trận Thực Đơn (Menu Engineering)</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Phân tích độ phổ biến (lượng bán) và tỷ suất lợi nhuận biên để tối ưu hóa thiết kế thực đơn nhà hàng.
        </p>
      </div>

      {/* Main 4-Quadrant BCG Matrix Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* STARS: High profit, High popularity */}
        <div className="glass-card" style={{
          border: '1.5px solid rgba(76, 175, 80, 0.3)',
          background: 'rgba(76, 175, 80, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          minHeight: '260px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#81c784', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
              <Star size={18} fill="#81c784" />
              <span>STARS (Ngôi Sao)</span>
            </h3>
            <span style={{ fontSize: '0.7rem', background: 'rgba(76, 175, 80, 0.15)', color: '#81c784', padding: '0.2rem 0.6rem', borderRadius: '20px', fontWeight: 700 }}>
              Lợi Nhuận Cao + Bán Chạy
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            🔥 <strong>Chiến lược:</strong> Giữ vững chất lượng ổn định. Đặt ở vị trí nổi bật nhất trên thực đơn. Có thể tăng giá nhẹ để tối đa hóa doanh thu.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1, overflowY: 'auto' }}>
            {stars.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', background: 'rgba(255,255,255,0.02)', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>
                <span style={{ fontWeight: 600 }}>{item.name}</span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  Lượng bán: <strong>{item.salesVolume}</strong> | Biên: <strong style={{ color: '#81c784' }}>{formatCurrency(item.profitMargin)}</strong>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* PUZZLES: High profit, Low popularity */}
        <div className="glass-card" style={{
          border: '1.5px solid rgba(30, 144, 255, 0.3)',
          background: 'rgba(30, 144, 255, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          minHeight: '260px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
              <HelpCircle size={18} />
              <span>PUZZLES (Câu Đố)</span>
            </h3>
            <span style={{ fontSize: '0.7rem', background: 'rgba(30, 144, 255, 0.15)', color: 'var(--accent-color)', padding: '0.2rem 0.6rem', borderRadius: '20px', fontWeight: 700 }}>
              Lợi Nhuận Cao + Bán Chậm
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            💡 <strong>Chiến lược:</strong> Đẩy mạnh truyền thông, chạy quảng cáo. Đổi tên món ăn hấp dẫn hơn, đề xuất khách gọi kèm combo hoặc giảm giá nhẹ để tăng doanh số.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1, overflowY: 'auto' }}>
            {puzzles.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', background: 'rgba(255,255,255,0.02)', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>
                <span style={{ fontWeight: 600 }}>{item.name}</span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  Lượng bán: <strong>{item.salesVolume}</strong> | Biên: <strong style={{ color: 'var(--accent-color)' }}>{formatCurrency(item.profitMargin)}</strong>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* PLOWHORSES: Low profit, High popularity */}
        <div className="glass-card" style={{
          border: '1.5px solid rgba(255, 152, 0, 0.3)',
          background: 'rgba(255, 152, 0, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          minHeight: '260px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#ffb74d', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
              <Swords size={18} />
              <span>PLOWHORSES (Dã Tràng)</span>
            </h3>
            <span style={{ fontSize: '0.7rem', background: 'rgba(255, 152, 0, 0.15)', color: '#ffb74d', padding: '0.2rem 0.6rem', borderRadius: '20px', fontWeight: 700 }}>
              Lợi Nhuận Thấp + Bán Chạy
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            🐎 <strong>Chiến lược:</strong> Tìm cách giảm giá vốn BOM (thu hẹp khẩu phần, đổi nhà cung cấp nguyên vật liệu) hoặc thiết kế combo kết hợp với đồ uống có tỷ suất lợi nhuận cao.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1, overflowY: 'auto' }}>
            {plowhorses.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', background: 'rgba(255,255,255,0.02)', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>
                <span style={{ fontWeight: 600 }}>{item.name}</span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  Lượng bán: <strong>{item.salesVolume}</strong> | Biên: <strong style={{ color: '#ffb74d' }}>{formatCurrency(item.profitMargin)}</strong>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* DOGS: Low profit, Low popularity */}
        <div className="glass-card" style={{
          border: '1.5px solid rgba(244, 67, 54, 0.3)',
          background: 'rgba(244, 67, 54, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          minHeight: '260px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#e57373', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
              <AlertOctagon size={18} />
              <span>DOGS (Thú Cưng)</span>
            </h3>
            <span style={{ fontSize: '0.7rem', background: 'rgba(244, 67, 54, 0.15)', color: '#e57373', padding: '0.2rem 0.6rem', borderRadius: '20px', fontWeight: 700 }}>
              Lợi Nhuận Thấp + Bán Chậm
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            🐾 <strong>Chiến lược:</strong> Thay thế nguyên liệu giá rẻ hơn để tăng biên lợi nhuận, hoặc loại bỏ hoàn toàn khỏi thực đơn để nhường chỗ cho món mới.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1, overflowY: 'auto' }}>
            {dogs.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', background: 'rgba(255,255,255,0.02)', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>
                <span style={{ fontWeight: 600 }}>{item.name}</span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  Lượng bán: <strong>{item.salesVolume}</strong> | Biên: <strong style={{ color: '#e57373' }}>{formatCurrency(item.profitMargin)}</strong>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full details table lists */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Bảng Tổng Hợp Chi Tiết Thực Đơn</h3>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Món Ăn</th>
              <th>Đơn Giá Bán</th>
              <th>Lượng Bán Ra</th>
              <th>Doanh Số Ước Tính</th>
              <th>Lợi Nhuận / Đơn Vị</th>
              <th>Phân Loại Ma Trận</th>
            </tr>
          </thead>
          <tbody>
            {menuEngineeringData.map((item) => (
              <tr key={item.id}>
                <td>
                  <span style={{ fontWeight: 600, color: '#fff' }}>{item.name}</span>
                </td>
                <td>{formatCurrency(item.price)}</td>
                <td>{item.salesVolume} phần</td>
                <td>{formatCurrency(item.price * item.salesVolume)}</td>
                <td>
                  <span style={{ fontWeight: 600, color: 'var(--accent-color)' }}>{formatCurrency(item.profitMargin)}</span>
                </td>
                <td>
                  <span className={`badge ${
                    item.category === 'Star' ? 'badge-success' :
                    item.category === 'Puzzle' ? 'badge-info' :
                    item.category === 'Plowhorse' ? 'badge-warning' : 'badge-danger'
                  }`}>
                    {item.category === 'Star' ? 'Star (Ngôi Sao)' :
                     item.category === 'Puzzle' ? 'Puzzle (Câu Đố)' :
                     item.category === 'Plowhorse' ? 'Plowhorse (Dã Tràng)' : 'Dog (Thú Cưng)'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
