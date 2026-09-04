import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTables } from '../../hooks/queries/useTables';
import { useOrders } from '../../hooks/queries/useOrders';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useCartStore } from '../../stores/cartStore';
import { formatCurrency } from '../../utils/formatCurrency';
import { Table, Area, TableStatus } from '../../types/order.types';
import { Modal } from '../../components/common/Modal';
import {
  Grid,
  Layers,
  CheckCircle,
  TrendingUp,
  CreditCard,
  PlusCircle,
  UserCheck,
  Users,
  Plus,
  Edit2,
  Trash2,
  Settings,
  AlertCircle,
  LayoutGrid,
  Search,
  Check,
  Sparkles
} from 'lucide-react';

export const TableMapView: React.FC = () => {
  const navigate = useNavigate();

  // Custom table / area hooks
  const {
    areas,
    tables,
    refetchTables,
    refetchAreas,
    createArea,
    updateArea,
    deleteArea,
    createTable,
    updateTable,
    deleteTable,
    updateTableStatus
  } = useTables();

  const { orders, createOrder, checkoutOrder, refetchOrders } = useOrders();
  const loadCart = useCartStore((s) => s.loadCart);

  // States
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTableDetail, setActiveTableDetail] = useState<{ table: Table; order?: any } | null>(null);

  // Modals
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [tableNumberForm, setTableNumberForm] = useState('');
  const [tableAreaForm, setTableAreaForm] = useState<string | number>('');
  const [tableCapacityForm, setTableCapacityForm] = useState<number>(4);
  const [tableStatusForm, setTableStatusForm] = useState<TableStatus>('empty');
  const [tableFormError, setTableFormError] = useState('');
  const [tableSubmitting, setTableSubmitting] = useState(false);

  // Area Management Modal
  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
  const [newAreaName, setNewAreaName] = useState('');
  const [editingAreaId, setEditingAreaId] = useState<string | number | null>(null);
  const [editingAreaName, setEditingAreaName] = useState('');
  const [areaError, setAreaError] = useState('');
  const [areaSubmitting, setAreaSubmitting] = useState(false);

  // WebSocket Live Updates
  useWebSocket('/topic/kds-updates', () => {
    refetchTables();
    refetchOrders();
    refetchAreas();
  });

  // Filter tables by selected zone and search
  const filteredTables = tables.filter((t) => {
    const matchZone = selectedZone === 'ALL' || String(t.areaId) === selectedZone || t.zone === selectedZone || t.areaName === selectedZone;
    const matchSearch = searchTerm.trim() === '' ||
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.tableNumber && t.tableNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.areaName && t.areaName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      `${t.capacity} chỗ`.includes(searchTerm.toLowerCase());
    return matchZone && matchSearch;
  });

  const getTableOrder = (table: Table) => {
    if (!table.currentOrderId) return null;
    return orders.find((o) => o.id === table.currentOrderId && o.status !== 'completed');
  };

  const handleTableClick = (table: Table) => {
    const order = getTableOrder(table);
    setActiveTableDetail({ table, order });
  };

  // --- Handlers for Table Modal ---
  const openCreateTableModal = () => {
    setEditingTable(null);
    setTableNumberForm('');
    setTableAreaForm(areas[0]?.id || 1);
    setTableCapacityForm(4);
    setTableStatusForm('empty');
    setTableFormError('');
    setIsTableModalOpen(true);
  };

  const openEditTableModal = (table: Table, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingTable(table);
    setTableNumberForm(table.tableNumber || table.name);
    setTableAreaForm(table.areaId || areas[0]?.id || 1);
    setTableCapacityForm(table.capacity || 4);
    setTableStatusForm(table.status || 'empty');
    setTableFormError('');
    setIsTableModalOpen(true);
  };

  const handleSaveTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableNumberForm.trim()) {
      setTableFormError('Vui lòng nhập tên hoặc số hiệu bàn');
      return;
    }
    if (!tableCapacityForm || tableCapacityForm <= 0) {
      setTableFormError('Sức chứa chỗ ngồi phải lớn hơn 0');
      return;
    }

    setTableSubmitting(true);
    setTableFormError('');

    try {
      if (editingTable) {
        await updateTable({
          id: editingTable.id,
          tableNumber: tableNumberForm.trim(),
          capacity: Number(tableCapacityForm),
          areaId: tableAreaForm,
          status: tableStatusForm
        });
        if (activeTableDetail?.table.id === editingTable.id) {
          setActiveTableDetail((prev) => prev ? {
            ...prev,
            table: {
              ...prev.table,
              name: tableNumberForm.trim(),
              tableNumber: tableNumberForm.trim(),
              capacity: Number(tableCapacityForm),
              areaId: tableAreaForm,
              status: tableStatusForm
            }
          } : null);
        }
      } else {
        await createTable({
          tableNumber: tableNumberForm.trim(),
          capacity: Number(tableCapacityForm),
          areaId: tableAreaForm,
          status: tableStatusForm
        });
      }
      setIsTableModalOpen(false);
    } catch (err: any) {
      setTableFormError(err.message || 'Lỗi khi lưu bàn ăn');
    } finally {
      setTableSubmitting(false);
    }
  };

  const handleDeleteTable = async (table: Table, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm(`Bạn có chắc chắn muốn xóa "${table.name}" (${table.capacity} chỗ ngồi)?`)) {
      try {
        await deleteTable(table.id);
        if (activeTableDetail?.table.id === table.id) {
          setActiveTableDetail(null);
        }
      } catch (err: any) {
        alert(err.message || 'Lỗi khi xóa bàn');
      }
    }
  };

  // --- Handlers for Area Modal ---
  const handleCreateArea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAreaName.trim()) {
      setAreaError('Vui lòng nhập tên khu vực');
      return;
    }
    setAreaSubmitting(true);
    setAreaError('');
    try {
      await createArea(newAreaName.trim());
      setNewAreaName('');
    } catch (err: any) {
      setAreaError(err.message || 'Lỗi tạo khu vực');
    } finally {
      setAreaSubmitting(false);
    }
  };

  const handleUpdateAreaName = async (areaId: string | number) => {
    if (!editingAreaName.trim()) return;
    try {
      await updateArea({ id: areaId, name: editingAreaName.trim() });
      setEditingAreaId(null);
      setEditingAreaName('');
    } catch (err: any) {
      alert(err.message || 'Lỗi cập nhật khu vực');
    }
  };

  const handleDeleteArea = async (area: Area) => {
    const count = tables.filter((t) => String(t.areaId) === String(area.id) || t.zone === area.name).length;
    const msg = count > 0
      ? `Khu vực "${area.name}" hiện có ${count} bàn. Khi xóa khu vực, tất cả bàn trong khu sẽ bị xóa theo. Bạn có chắc muốn xóa?`
      : `Bạn có chắc muốn xóa khu vực "${area.name}"?`;

    if (confirm(msg)) {
      try {
        await deleteArea(area.id);
        if (selectedZone === String(area.id) || selectedZone === area.name) {
          setSelectedZone('ALL');
        }
      } catch (err: any) {
        alert(err.message || 'Lỗi khi xóa khu vực');
      }
    }
  };

  // Order actions
  const handleCreateNewOrder = async (table: Table) => {
    try {
      await createOrder({
        tableId: table.id,
        tableName: table.name,
        items: [],
        discount: 0,
        tax: 10
      });
      loadCart(table.id, table.name, [], 0, 10);
      navigate('/pos');
    } catch (err) {
      alert('Không thể tạo hóa đơn mới');
    }
  };

  const handleOpenPOS = (table: Table, order: any) => {
    loadCart(table.id, table.name, order.items, order.discount, 10);
    navigate('/pos');
  };

  const handlePayOrder = async (table: Table, order: any) => {
    if (confirm(`Xác nhận thanh toán cho ${table.name}?\nTổng tiền: ${formatCurrency(order.total)}`)) {
      try {
        await checkoutOrder(order.id);
        await updateTableStatus({ id: table.id, status: 'empty' });
        setActiveTableDetail(null);
        alert('Thanh toán thành công. Bàn đã được dọn trống.');
      } catch (err) {
        alert('Lỗi thanh toán');
      }
    }
  };

  // KPI Calculations
  const totalAreas = areas.length;
  const totalTables = tables.length;
  const totalSeats = tables.reduce((sum, t) => sum + (Number(t.capacity) || 0), 0);

  const emptyTables = tables.filter((t) => t.status === 'empty');
  const emptyCount = emptyTables.length;
  const emptySeats = emptyTables.reduce((sum, t) => sum + (Number(t.capacity) || 0), 0);

  const occupiedTables = tables.filter((t) => t.status === 'occupied');
  const occupiedCount = occupiedTables.length;
  const occupiedSeats = occupiedTables.reduce((sum, t) => sum + (Number(t.capacity) || 0), 0);

  const reservedTables = tables.filter((t) => t.status === 'reserved');
  const reservedCount = reservedTables.length;
  const reservedSeats = reservedTables.reduce((sum, t) => sum + (Number(t.capacity) || 0), 0);

  const capacityQuickOptions = [2, 4, 6, 8, 10, 12, 16];

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* 1. Header with Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <LayoutGrid size={32} style={{ color: 'var(--accent-color)' }} />
            Sơ Đồ Bàn & Quản Lý Khu Vực
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.35rem 0 0 0' }}>
            Theo dõi trạng thái phục vụ, thanh toán và quản lý số lượng bàn, sức chứa chỗ ngồi theo từng khu vực.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            className="btn-secondary"
            onClick={() => setIsAreaModalOpen(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.1rem' }}
            title="Quản lý các khu vực phòng/tầng"
          >
            <Layers size={17} />
            <span>Quản Lý Khu Vực ({areas.length})</span>
          </button>

          <button
            className="btn-primary"
            onClick={openCreateTableModal}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Plus size={18} />
            <span>Thêm Bàn Ăn Mới</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.25rem'
        }}
      >
        {/* Total Areas */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem' }}>
          <div style={{ background: 'rgba(30, 144, 255, 0.12)', padding: '0.8rem', borderRadius: '12px', color: 'var(--accent-color)' }}>
            <Layers size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
              Khu Vực Bàn
            </span>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0.15rem 0 0 0' }}>
              {totalAreas} khu
            </h3>
          </div>
        </div>

        {/* Total Tables */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem' }}>
          <div style={{ background: 'rgba(156, 39, 176, 0.12)', padding: '0.8rem', borderRadius: '12px', color: '#ab47bc' }}>
            <Grid size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
              Tổng Số Bàn
            </span>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0.15rem 0 0 0' }}>
              {totalTables} bàn
            </h3>
          </div>
        </div>

        {/* Total Seats / Capacity */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem' }}>
          <div style={{ background: 'rgba(0, 200, 83, 0.12)', padding: '0.8rem', borderRadius: '12px', color: '#00e676' }}>
            <Users size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
              Tổng Sức Chứa (Ghế)
            </span>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0.15rem 0 0 0', color: '#00e676' }}>
              {totalSeats} chỗ ngồi
            </h3>
          </div>
        </div>

        {/* Empty Tables & Seats */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--text-muted)' }} />
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
              Bàn Đang Trống
            </span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0.15rem 0 0 0' }}>
              {emptyCount} bàn <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>({emptySeats} chỗ)</span>
            </h3>
          </div>
        </div>

        {/* Occupied Tables & Seats */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', border: '1px solid rgba(30, 144, 255, 0.3)' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--accent-color)', boxShadow: '0 0 8px var(--accent-color)' }} />
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-color)', textTransform: 'uppercase', fontWeight: 700 }}>
              Đang Phục Vụ
            </span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0.15rem 0 0 0', color: 'var(--accent-color)' }}>
              {occupiedCount} bàn <span style={{ fontSize: '0.85rem', color: 'var(--accent-color)', fontWeight: 500 }}>({occupiedSeats} chỗ)</span>
            </h3>
          </div>
        </div>
      </div>

      {/* 3. Toolbar & Dynamic Zone Filter */}
      <div
        className="glass-card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '0.85rem 1.25rem'
        }}
      >
        {/* Dynamic Zone Switcher from Database */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={() => setSelectedZone('ALL')}
            style={{
              padding: '0.5rem 1.1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: selectedZone === 'ALL' ? 'none' : '1px solid var(--border-color)',
              background: selectedZone === 'ALL' ? 'linear-gradient(135deg, #1e90ff, #0073e6)' : 'var(--bg-secondary)',
              color: selectedZone === 'ALL' ? '#fff' : 'var(--text-primary)',
              boxShadow: selectedZone === 'ALL' ? '0 4px 12px rgba(30, 144, 255, 0.35)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            Tất cả khu vực ({tables.length})
          </button>

          {areas.map((area) => {
            const isSelected = selectedZone === String(area.id) || selectedZone === area.name;
            const areaTableCount = tables.filter((t) => String(t.areaId) === String(area.id) || t.zone === area.name).length;
            const areaSeatCount = tables
              .filter((t) => String(t.areaId) === String(area.id) || t.zone === area.name)
              .reduce((sum, t) => sum + (t.capacity || 0), 0);

            return (
              <button
                key={area.id}
                onClick={() => setSelectedZone(String(area.id))}
                style={{
                  padding: '0.5rem 1.1rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: isSelected ? 'none' : '1px solid var(--border-color)',
                  background: isSelected ? 'linear-gradient(135deg, #1e90ff, #0073e6)' : 'var(--bg-secondary)',
                  color: isSelected ? '#fff' : 'var(--text-primary)',
                  boxShadow: isSelected ? '0 4px 12px rgba(30, 144, 255, 0.35)' : 'none',
                  transition: 'all 0.2s',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <span>{area.name}</span>
                <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>
                  ({areaTableCount} bàn · {areaSeatCount} chỗ)
                </span>
              </button>
            );
          })}

          <button
            onClick={() => setIsAreaModalOpen(true)}
            style={{
              padding: '0.45rem 0.75rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              background: 'rgba(30, 144, 255, 0.1)',
              color: 'var(--accent-color)',
              border: '1px dashed rgba(30, 144, 255, 0.4)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontWeight: 600
            }}
            title="Thêm khu vực mới"
          >
            <Plus size={14} />
            <span>Thêm khu vực</span>
          </button>
        </div>

        {/* Search Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '220px' }}>
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Tìm bàn, số chỗ ngồi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              width: '100%',
              fontSize: '0.9rem'
            }}
          />
        </div>
      </div>

      {/* 4. Main Table Grid and Sidebar Detail */}
      <div style={{ display: 'grid', gridTemplateColumns: activeTableDetail ? '3fr 1.4fr' : '1fr', gap: '1.5rem', transition: 'all 0.3s ease' }}>
        {/* Tables Grid Layout */}
        <div
          className="glass-card"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
            gap: '1.25rem',
            padding: '1.5rem',
            minHeight: '400px',
            alignContent: 'start'
          }}
        >
          {filteredTables.map((table) => {
            const order = getTableOrder(table);
            const isOccupied = table.status === 'occupied';
            const isReserved = table.status === 'reserved';
            const isNeedsCleaning = table.status === 'needs_cleaning';

            // Card Colors
            const cardBg = isOccupied
              ? 'rgba(30, 144, 255, 0.08)'
              : isReserved
              ? 'rgba(255, 152, 0, 0.08)'
              : isNeedsCleaning
              ? 'rgba(255, 87, 34, 0.08)'
              : 'rgba(255, 255, 255, 0.02)';

            const borderCol = isOccupied
              ? 'var(--accent-color)'
              : isReserved
              ? '#ff9800'
              : isNeedsCleaning
              ? '#ff5722'
              : 'rgba(255, 255, 255, 0.08)';

            const glowShadow = isOccupied ? '0 0 15px rgba(30, 144, 255, 0.2)' : 'none';

            return (
              <div
                key={table.id}
                onClick={() => handleTableClick(table)}
                style={{
                  background: cardBg,
                  border: `1.5px solid ${borderCol}`,
                  boxShadow: glowShadow,
                  borderRadius: '16px',
                  padding: '1.25rem 1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  minHeight: '170px',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  if (!isOccupied && !isReserved) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = borderCol;
                }}
              >
                {/* Top Row: Zone Tag & Quick Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      background: 'rgba(255, 255, 255, 0.07)',
                      color: 'var(--text-secondary)',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      textTransform: 'uppercase'
                    }}
                  >
                    {table.areaName || table.zone || 'Khu vực'}
                  </span>

                  <div style={{ display: 'flex', gap: '0.25rem' }} onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => openEditTableModal(table, e)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '0.2rem',
                        borderRadius: '4px'
                      }}
                      title="Sửa bàn & số chỗ ngồi"
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-color)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      <Edit2 size={13} />
                    </button>

                    <button
                      onClick={(e) => handleDeleteTable(table, e)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '0.2rem',
                        borderRadius: '4px'
                      }}
                      title="Xóa bàn"
                      onMouseEnter={(e) => e.currentTarget.style.color = '#ff4d4d'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Table Name & Seats */}
                <div style={{ textAlign: 'center' }}>
                  <h3 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 800, color: '#fff' }}>
                    {table.name}
                  </h3>

                  {/* Seat Capacity Badge */}
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      background: 'rgba(0, 230, 118, 0.1)',
                      color: '#00e676',
                      border: '1px solid rgba(0, 230, 118, 0.25)',
                      padding: '0.15rem 0.6rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      marginTop: '0.4rem'
                    }}
                  >
                    <Users size={12} />
                    <span>{table.capacity} chỗ ngồi</span>
                  </div>
                </div>

                {/* Bottom Status / Order Info */}
                <div style={{ textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.5rem' }}>
                  {isOccupied && order ? (
                    <div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--accent-color)', fontWeight: 700 }}>
                        {formatCurrency(order.total)}
                      </span>
                      <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>
                        {order.items.reduce((sum: number, i: any) => sum + i.quantity, 0)} món ăn
                      </div>
                    </div>
                  ) : isReserved ? (
                    <span style={{ fontSize: '0.75rem', color: '#ff9800', fontWeight: 600 }}>
                      Đã Đặt Trước
                    </span>
                  ) : isNeedsCleaning ? (
                    <span style={{ fontSize: '0.75rem', color: '#ff5722', fontWeight: 600 }}>
                      Cần Dọn Dẹp
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Bàn Trống
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {filteredTables.length === 0 && (
            <div
              style={{
                gridColumn: '1 / -1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3rem 1rem',
                textAlign: 'center',
                gap: '0.75rem'
              }}
            >
              <LayoutGrid size={40} style={{ color: 'var(--text-muted)' }} />
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Chưa có bàn nào trong khu vực này</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, maxWidth: '400px' }}>
                Bấm vào nút "Thêm Bàn Ăn Mới" để tạo bàn và cấu hình số lượng chỗ ngồi.
              </p>
              <button className="btn-primary" onClick={openCreateTableModal} style={{ marginTop: '0.5rem' }}>
                <Plus size={16} />
                <span>Thêm Bàn Ngay</span>
              </button>
            </div>
          )}
        </div>

        {/* Sidebar Table Details & Order Actions */}
        {activeTableDetail && (
          <div
            className="glass-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              animation: 'fadeIn 0.2s ease-out',
              height: 'fit-content'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', margin: 0 }}>{activeTableDetail.table.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.3rem' }}>
                  <span className="badge badge-info">{activeTableDetail.table.areaName || activeTableDetail.table.zone}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    👥 Sức chứa: <strong>{activeTableDetail.table.capacity} khách</strong>
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  onClick={() => openEditTableModal(activeTableDetail.table)}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    borderRadius: '6px',
                    padding: '0.35rem 0.5rem',
                    cursor: 'pointer'
                  }}
                  title="Chỉnh sửa bàn"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => setActiveTableDetail(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '1.1rem'
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* If Occupied */}
            {activeTableDetail.table.status === 'occupied' && activeTableDetail.order ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '10px',
                  padding: '1rem',
                  border: '1px solid rgba(255,255,255,0.05)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Mã hóa đơn:</span>
                    <span style={{ fontWeight: 600 }}>{activeTableDetail.order.id}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Trạng thái bếp:</span>
                    <span className="badge badge-warning" style={{ textTransform: 'capitalize' }}>
                      {activeTableDetail.order.status}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Món đã gọi:</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '180px', overflowY: 'auto' }}>
                    {activeTableDetail.order.items.map((item: any) => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span>{item.name} <span style={{ color: 'var(--text-muted)' }}>x{item.quantity}</span></span>
                        <span>{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                    <span>Tạm tính:</span>
                    <span>{formatCurrency(activeTableDetail.order.subtotal)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                    <span>Thuế VAT:</span>
                    <span>{formatCurrency(activeTableDetail.order.tax)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 700, marginTop: '0.5rem', color: 'var(--accent-color)' }}>
                    <span>Tổng hóa đơn:</span>
                    <span>{formatCurrency(activeTableDetail.order.total)}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
                  <button
                    className="btn-secondary"
                    style={{ flex: 1, padding: '0.6rem', fontSize: '0.85rem' }}
                    onClick={() => handleOpenPOS(activeTableDetail.table, activeTableDetail.order)}
                  >
                    Thêm Món
                  </button>
                  <button
                    className="btn-primary"
                    style={{ flex: 1.5, padding: '0.6rem', fontSize: '0.85rem', justifyContent: 'center' }}
                    onClick={() => handlePayOrder(activeTableDetail.table, activeTableDetail.order)}
                  >
                    <CreditCard size={16} />
                    Thanh Toán
                  </button>
                </div>
              </div>
            ) : activeTableDetail.table.status === 'reserved' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ fontSize: '0.9rem' }}>Bàn này đang được giữ chỗ trước.</p>
                <button
                  className="btn-primary"
                  style={{ justifyContent: 'center' }}
                  onClick={() => handleCreateNewOrder(activeTableDetail.table)}
                >
                  <UserCheck size={16} />
                  Nhận Bàn Khách Vào
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Bàn đang trống và sẵn sàng phục vụ ({activeTableDetail.table.capacity} chỗ ngồi).</p>
                <button
                  className="btn-primary"
                  style={{ justifyContent: 'center' }}
                  onClick={() => handleCreateNewOrder(activeTableDetail.table)}
                >
                  <PlusCircle size={16} />
                  Mở Hóa Đơn POS
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. CREATE / EDIT TABLE MODAL */}
      <Modal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
        title={editingTable ? 'Chỉnh Sửa Bàn Ăn' : 'Thêm Bàn Ăn Mới'}
        subtitle="Cấu hình tên bàn, khu vực và số lượng chỗ ngồi (sức chứa)"
        icon={<Grid size={22} />}
        maxWidth="550px"
      >
        {tableFormError && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(255, 77, 77, 0.15)',
              border: '1px solid rgba(255, 77, 77, 0.3)',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              color: '#ff4d4d',
              fontSize: '0.85rem',
              marginBottom: '1rem'
            }}
          >
            <AlertCircle size={16} />
            <span>{tableFormError}</span>
          </div>
        )}

        <form onSubmit={handleSaveTable} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Table Name */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Tên / Số Hiệu Bàn *</label>
            <input
              type="text"
              className="form-input"
              placeholder="VD: Bàn A5, Bàn VIP 3, Bàn Sân Vườn 1..."
              value={tableNumberForm}
              onChange={(e) => setTableNumberForm(e.target.value)}
              required
            />
          </div>

          {/* Area Selection */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Thuộc Khu Vực *</label>
            <select
              className="form-input"
              value={tableAreaForm}
              onChange={(e) => setTableAreaForm(e.target.value)}
              required
            >
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Seat Capacity / Number of Seats */}
          <div className="form-group" style={{ margin: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label className="form-label" style={{ margin: 0 }}>Sức Chứa Chỗ Ngồi (Số Ghế) *</label>
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-color)', fontWeight: 700 }}>
                {tableCapacityForm} chỗ ngồi
              </span>
            </div>

            {/* Quick Capacity Chips */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
              {capacityQuickOptions.map((num) => (
                <button
                  type="button"
                  key={num}
                  onClick={() => setTableCapacityForm(num)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: tableCapacityForm === num ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
                    background: tableCapacityForm === num ? 'rgba(30, 144, 255, 0.2)' : 'var(--bg-secondary)',
                    color: tableCapacityForm === num ? 'var(--accent-color)' : 'var(--text-secondary)',
                    transition: 'all 0.15s'
                  }}
                >
                  {num} chỗ
                </button>
              ))}
            </div>

            <input
              type="number"
              min={1}
              max={100}
              className="form-input"
              placeholder="Nhập số lượng chỗ ngồi..."
              value={tableCapacityForm}
              onChange={(e) => setTableCapacityForm(Number(e.target.value))}
              required
            />
          </div>

          {/* Initial Status */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Trạng Thái Bàn</label>
            <select
              className="form-input"
              value={tableStatusForm}
              onChange={(e) => setTableStatusForm(e.target.value as TableStatus)}
            >
              <option value="empty">Trống (Sẵn sàng)</option>
              <option value="occupied">Đang có khách</option>
              <option value="reserved">Đã đặt trước</option>
              <option value="needs_cleaning">Cần dọn dẹp</option>
            </select>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsTableModalOpen(false)}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={tableSubmitting}
            >
              <Check size={16} />
              <span>{tableSubmitting ? 'Đang lưu...' : editingTable ? 'Lưu Thay Đổi' : 'Tạo Bàn Mới'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* 6. AREA MANAGEMENT MODAL */}
      <Modal
        isOpen={isAreaModalOpen}
        onClose={() => {
          setIsAreaModalOpen(false);
          setAreaError('');
        }}
        title="Quản Lý Khu Vực Nhà Hàng"
        subtitle="Thêm mới, đổi tên hoặc xóa các phân khu (Tầng, VIP, Sân vườn, Terrace...)"
        icon={<Layers size={22} />}
        maxWidth="600px"
      >
        {areaError && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(255, 77, 77, 0.15)',
              border: '1px solid rgba(255, 77, 77, 0.3)',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              color: '#ff4d4d',
              fontSize: '0.85rem',
              marginBottom: '1rem'
            }}
          >
            <AlertCircle size={16} />
            <span>{areaError}</span>
          </div>
        )}

        {/* Add new area form */}
        <form onSubmit={handleCreateArea} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Nhập tên khu vực mới (VD: Tầng 2, Phòng VIP 3, Khu Sân Vườn...)"
            value={newAreaName}
            onChange={(e) => setNewAreaName(e.target.value)}
            style={{ flex: 1 }}
          />
          <button
            type="submit"
            className="btn-primary"
            disabled={areaSubmitting || !newAreaName.trim()}
            style={{ whiteSpace: 'nowrap' }}
          >
            <Plus size={16} />
            <span>Thêm Khu</span>
          </button>
        </form>

        {/* Current Area List */}
        <div>
          <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
            Danh Sách Khu Vực Hiện Có ({areas.length})
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {areas.map((area) => {
              const count = tables.filter((t) => String(t.areaId) === String(area.id) || t.zone === area.name).length;
              const seats = tables
                .filter((t) => String(t.areaId) === String(area.id) || t.zone === area.name)
                .reduce((sum, t) => sum + (t.capacity || 0), 0);
              const isEditing = editingAreaId === area.id;

              return (
                <div
                  key={area.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-color)',
                    gap: '1rem'
                  }}
                >
                  {isEditing ? (
                    <div style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
                      <input
                        type="text"
                        className="form-input"
                        value={editingAreaName}
                        onChange={(e) => setEditingAreaName(e.target.value)}
                        autoFocus
                      />
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={() => handleUpdateAreaName(area.id)}
                        style={{ padding: '0.4rem 0.8rem' }}
                      >
                        Lưu
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setEditingAreaId(null)}
                        style={{ padding: '0.4rem 0.8rem' }}
                      >
                        Hủy
                      </button>
                    </div>
                  ) : (
                    <>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{area.name}</div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {count} bàn ăn · {seats} chỗ ngồi
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingAreaId(area.id);
                            setEditingAreaName(area.name);
                          }}
                          className="btn-secondary"
                          style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                          title="Đổi tên khu vực"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteArea(area)}
                          className="btn-secondary"
                          style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', color: '#ff4d4d', borderColor: 'rgba(255, 77, 77, 0.2)' }}
                          title="Xóa khu vực"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Modal>
    </div>
  );
};
