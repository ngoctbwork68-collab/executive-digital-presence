import { useEffect, useState } from 'react';
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Save, RotateCcw, LayoutGrid, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  useHomeSectionsOrder,
  useHomeSectionsVisibility,
  useSaveHomeSectionsOrder,
  DEFAULT_HOME_SECTIONS,
  DEFAULT_VISIBILITY,
  SECTION_LABELS,
  type HomeSectionId,
  type HomeSectionsVisibility,
} from '@/hooks/useHomeSections';

function Item({
  id,
  index,
  visible,
  onToggle,
}: {
  id: HomeSectionId;
  index: number;
  visible: boolean;
  onToggle: (v: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 bg-card border rounded-xl p-4 shadow-sm transition-colors ${
        visible ? 'border-border' : 'border-dashed border-muted-foreground/30 bg-muted/20'
      }`}
    >
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground">
        <GripVertical size={18} />
      </button>
      <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">{index + 1}</span>
      <div className="flex-1">
        <p className={`font-medium ${visible ? 'text-foreground' : 'text-muted-foreground line-through'}`}>{SECTION_LABELS[id]}</p>
        <p className="text-xs text-muted-foreground font-mono">{id}</p>
      </div>
      {visible ? <Eye size={16} className="text-emerald-500" /> : <EyeOff size={16} className="text-muted-foreground" />}
      <Switch checked={visible} onCheckedChange={onToggle} />
    </div>
  );
}

export default function SectionsOrderManager() {
  const { data: orderData } = useHomeSectionsOrder();
  const { data: visibilityData } = useHomeSectionsVisibility();
  const save = useSaveHomeSectionsOrder();
  const [order, setOrder] = useState<HomeSectionId[]>(DEFAULT_HOME_SECTIONS);
  const [visibility, setVisibility] = useState<HomeSectionsVisibility>(DEFAULT_VISIBILITY);

  useEffect(() => { if (orderData) setOrder(orderData); }, [orderData]);
  useEffect(() => { if (visibilityData) setVisibility(visibilityData); }, [visibilityData]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = order.indexOf(active.id as HomeSectionId);
    const newIndex = order.indexOf(over.id as HomeSectionId);
    setOrder(arrayMove(order, oldIndex, newIndex));
  };

  const visibleCount = Object.values(visibility).filter(Boolean).length;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow">
          <LayoutGrid size={20} className="text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-serif text-2xl font-bold">Sắp xếp & Hiển thị Section trang chủ</h1>
          <p className="text-sm text-muted-foreground">
            Kéo thả để sắp xếp thứ tự, dùng công tắc để bật/tắt từng section. {visibleCount}/{order.length} đang hiển thị.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-5 space-y-3">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={order} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {order.map((id, i) => (
                  <Item
                    key={id}
                    id={id}
                    index={i}
                    visible={visibility[id]}
                    onToggle={(v) => setVisibility({ ...visibility, [id]: v })}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => save.mutate({ order, visibility })} disabled={save.isPending} className="gap-2">
          <Save size={16} /> Lưu thay đổi
        </Button>
        <Button variant="outline" onClick={() => { setOrder(DEFAULT_HOME_SECTIONS); setVisibility(DEFAULT_VISIBILITY); }} className="gap-2">
          <RotateCcw size={16} /> Mặc định
        </Button>
        <Button
          variant="ghost"
          onClick={() => setVisibility(Object.fromEntries(order.map(id => [id, true])) as HomeSectionsVisibility)}
        >
          Bật tất cả
        </Button>
        <Button
          variant="ghost"
          onClick={() => setVisibility(Object.fromEntries(order.map(id => [id, false])) as HomeSectionsVisibility)}
        >
          Tắt tất cả
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Mẹo: Section "Custom Sections" hiển thị các block bạn tạo trong mục <strong>Custom Sections</strong> với page = <code>home</code>.
      </p>
    </div>
  );
}
