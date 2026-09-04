import React, { useState } from 'react';
import { useInventory } from '../../hooks/queries/useInventory';
import { formatCurrency } from '../../utils/formatCurrency';
import { ChefHat, Plus, Trash2, Save, FileEdit, Award } from 'lucide-react';

export const RecipeEditorPage: React.FC = () => {
  const { ingredients, recipes, updateRecipeBOM, isLoadingRecipes } = useInventory();
  
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  
  // Active BOM items editing states
  const [editingBOM, setEditingBOM] = useState<{ ingredientId: string; quantity: number }[]>([]);
  
  // Temporary state to add new ingredient to BOM
  const [newIngId, setNewIngId] = useState('');
  const [newIngQty, setNewIngQty] = useState(0.1);

  if (isLoadingRecipes) {
    return <div style={{ color: '#fff' }}>Đang tải công thức định lượng (BOM)...</div>;
  }

  const selectedRecipe = recipes.find((r) => r.id === selectedRecipeId);

  const handleSelectRecipe = (recipe: any) => {
    setSelectedRecipeId(recipe.id);
    const mapped = recipe.ingredients.map((i: any) => ({
      ingredientId: i.ingredientId,
      quantity: i.quantity
    }));
    setEditingBOM(mapped);
  };

  const handleAddIngredient = () => {
    if (!newIngId) return;
    const exists = editingBOM.some((item) => item.ingredientId === newIngId);
    if (exists) {
      alert('Nguyên liệu này đã có trong định lượng món ăn.');
      return;
    }

    setEditingBOM((prev) => [
      ...prev,
      { ingredientId: newIngId, quantity: Number(newIngQty) }
    ]);
    setNewIngId('');
    setNewIngQty(0.1);
  };

  const handleRemoveIngredient = (id: string) => {
    setEditingBOM((prev) => prev.filter((item) => item.ingredientId !== id));
  };

  const handleQtyChange = (id: string, qty: number) => {
    setEditingBOM((prev) =>
      prev.map((item) => (item.ingredientId === id ? { ...item, quantity: Number(qty) } : item))
    );
  };

  const handleSaveBOM = async () => {
    if (!selectedRecipeId) return;
    
    // Map details back to payload structure
    const payloadIngredients = editingBOM.map((item) => {
      const ing = ingredients.find((i) => i.id === item.ingredientId)!;
      return {
        ingredientId: item.ingredientId,
        name: ing.name,
        quantity: item.quantity,
        unit: ing.unit
      };
    });

    try {
      await updateRecipeBOM({ recipeId: selectedRecipeId, ingredients: payloadIngredients });
      alert('Cập nhật định lượng định mức nguyên liệu (BOM) món ăn thành công!');
    } catch (err) {
      alert('Lỗi cập nhật định lượng');
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>Định Lượng Nguyên Liệu (BOM)</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Khai báo tỷ lệ tiêu hao nguyên vật liệu cho từng món ăn phục vụ tự động trừ tồn kho.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '2rem' }}>
        {/* LEFT: Menu items list */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem' }}>
            Danh Sách Món Ăn
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {recipes.map((r) => (
              <button
                key={r.id}
                onClick={() => handleSelectRecipe(r)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '1rem',
                  background: selectedRecipeId === r.id ? 'rgba(30, 144, 255, 0.15)' : 'rgba(255,255,255,0.01)',
                  border: '1px solid',
                  borderColor: selectedRecipeId === r.id ? 'var(--accent-color)' : 'rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  color: '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Award size={16} style={{ color: selectedRecipeId === r.id ? 'var(--accent-color)' : 'rgba(255,255,255,0.4)' }} />
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.menuItemName}</span>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-color)', fontWeight: 600 }}>
                  {formatCurrency(r.menuItemPrice)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: BOM mapping editor */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {selectedRecipe ? (
            <>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                paddingBottom: '0.8rem'
              }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Cấu hình định mức: {selectedRecipe.menuItemName}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cập nhật lượng hao hụt tự động khi nấu</span>
                </div>
                <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={handleSaveBOM}>
                  <Save size={14} />
                  Lưu Định Mức
                </button>
              </div>

              {/* Add new component inside BOM */}
              <div style={{
                background: 'rgba(255,255,255,0.01)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '12px',
                padding: '1rem',
                display: 'grid',
                gridTemplateColumns: '2fr 1fr auto',
                gap: '0.5rem',
                alignItems: 'end'
              }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Thêm nguyên liệu thô</label>
                  <select
                    className="form-input"
                    value={newIngId}
                    onChange={(e) => setNewIngId(e.target.value)}
                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                  >
                    <option value="">Chọn nguyên liệu...</option>
                    {ingredients.map((ing) => (
                      <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Số lượng định mức</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    min={0.01}
                    value={newIngQty}
                    onChange={(e) => setNewIngQty(Number(e.target.value))}
                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                  />
                </div>
                <button type="button" className="btn-secondary" style={{ padding: '0.5rem 1rem', borderRadius: '8px' }} onClick={handleAddIngredient}>
                  Thêm vào
                </button>
              </div>

              {/* Editable BOM items table list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Danh mục nguyên liệu cấu thành:</h4>
                
                {editingBOM.length === 0 ? (
                  <div style={{ textTransform: 'uppercase', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                    Chưa thiết lập định lượng nguyên liệu nào.
                  </div>
                ) : (
                  editingBOM.map((item) => {
                    const ing = ingredients.find((i) => i.id === item.ingredientId);
                    if (!ing) return null;
                    return (
                      <div
                        key={item.ingredientId}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: 'rgba(255,255,255,0.02)',
                          padding: '0.75rem 1rem',
                          borderRadius: '10px',
                          border: '1px solid rgba(255,255,255,0.05)'
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>{ing.name}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mã SKU: {ing.sku}</span>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <input
                              type="number"
                              step="0.01"
                              className="form-input"
                              value={item.quantity}
                              onChange={(e) => handleQtyChange(item.ingredientId, Number(e.target.value))}
                              style={{ width: '80px', textAlign: 'center', padding: '0.4rem' }}
                            />
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{ing.unit}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveIngredient(item.ingredientId)}
                            style={{ background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '5rem 1rem',
              color: 'var(--text-muted)',
              gap: '0.5rem'
            }}>
              <ChefHat size={40} />
              <span>Vui lòng chọn một món ăn ở cột bên trái để thiết lập cấu hình định mức nguyên liệu (BOM).</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
