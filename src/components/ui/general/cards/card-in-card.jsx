"use client";
import React from "react";
import { Input, Button } from "@/components/ui/general/primitives";
import { useLanguage } from "@/context/language-context";

export default function CardInCard({
  resource,
  tasks = [],
  taskTitle = "",
  onTaskTitleChange,
  onToggleTask,
  onAskDeleteResource,
  onAskDeleteResourceItem,
  onAddResourceItem,
}) {
  const { t } = useLanguage();
  return (
    <div className="border border-gray-300 rounded-md p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-black font-semibold">{resource.name}</div>
          {resource.description ? (
            <div className="text-sm text-gray-700 mt-1">{resource.description}</div>
          ) : null}
        </div>
        <div className="flex gap-2">
          <Button variant="empty-red" onClick={() => onAskDeleteResource?.(resource)}>
            {t('common.delete')}
          </Button>
        </div>
      </div>

      {/* Tasks */}
      <div className="mt-4 border border-gray-300 p-4 rounded-lg">
        <div className="font-medium mb-2 text-black">{t('tasks.title', 'Tasks')}</div>
        <div className="grid gap-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between bg-stone-100  border border-gray-300 rounded px-3 py-2"
            >
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={task.status === 'done'}
                  onChange={() => onToggleTask?.(task)}
                />
                <span className={task.status === 'done' ? 'line-through text-stone-500' : 'text-gray-700'}>
                  {task.title}
                </span>
              </label>
              <Button variant="empty-red" onClick={() => onAskDeleteResourceItem?.(task)}>
                {t('common.delete')}
              </Button>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-3">
          <Input
            className="flex-1"
            placeholder="Titlu task"
            value={taskTitle}
            onChange={(e) => onTaskTitleChange?.(e.target.value)}
          />
          <Button type="button" onClick={onAddResourceItem} variant="empty-blue">
            {t('tasks.add', 'Add')}
          </Button>
        </div>
      </div>
    </div>
  );
}
