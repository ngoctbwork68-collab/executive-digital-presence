import { useEffect, useState } from 'react';
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Save, RotateCcw, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  useHomeSectionsOrder,
  useSaveHomeSectionsOrder,
  DEFAULT_HOME_SECTIONS,
  SECTION_LABELS,
  type HomeSectionId,
} from '@/hooks/useHomeSections';

function Item({ id, index }: { id: HomeSectionId; index: number }) {
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
      className="flex items-center gap-3 bg-card border border-border rounded-xl p-4 shadow-sm"
    >
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground">
        <GripVertical size={18} />
      </button>
      <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">{index + 1}</span>
      <span className="font-medium text-foreground">{SECTION_LABELS[id]}</span>
      <span className="ml-auto text-xs text-muted-foreground font-mono">{id}</span>
    </div>
  );
}

export default function SectionsOrderManager() {
  const { data } = useHomeSectionsOrder();
  const save = useSaveHomeSectionsOrder();
  const [order, setOrder] = useState<HomeSectionId[]>(DEFAULT_HOME_SECTIONS);

  useEffect(() => { if (data) setOrder(data); }, [data]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = order.indexOf(active.id as HomeSectionId);
    const newIndex = order.indexOf(over.id as HomeSectionId);
    setOrder(arrayMove(order, oldIndex, newIndex));
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow">
          <LayoutGrid size={20} className="text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-serif text-2xl font-bold">Sắp xếp Section trang chủ</h1>
          <p className="text-sm text-muted-foreground">Kéo thả để thay đổi thứ tự hiển thị các section trên trang Home.</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-5 space-y-3">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={order} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {order.map((id, i) => <Item key={id} id={id} index={i} />)}
              </div>
            </SortableContext>
          </DndContext>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button onClick={() => save.mutate(order)} disabled={save.isPending} className="gap-2">
          <Save size={16} /> Lưu thứ tự
        </Button>
        <Button variant="outline" onClick={() => setOrder(DEFAULT_HOME_SECTIONS)} className="gap-2">
          <RotateCcw size={16} /> Mặc định
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Mẹo: Section "Custom Sections" hiển thị các block bạn tạo trong mục <strong>Custom Sections</strong> với page = <code>home</code>.
      </p>
    </div>
  );
}
