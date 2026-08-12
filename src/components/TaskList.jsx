import React from 'react';
import TaskCard from './TaskCard';
import EmptyState from './EmptyState';
import Loading from './Loading';

const TaskList = ({ tasks, loading, onToggleComplete, onEdit, onDelete, onAiBreakdown }) => {
  if (loading) {
    return <Loading />;
  }

  if (!tasks || tasks.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {tasks.map((task) => (
        <TaskCard
          key={task._id}
          task={task}
          onToggleComplete={onToggleComplete}
          onEdit={onEdit}
          onDelete={onDelete}
          onAiBreakdown={onAiBreakdown}
        />
      ))}
    </div>
  );
};

export default TaskList;
