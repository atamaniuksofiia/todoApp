import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  addTask,
  deleteTask,
  getTasks,
  toggleTaskCompletion,
} from "../../services/todoService";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseApp";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Collaborator, Task } from "./TaskList.types";

const TaskList = () => {
  const { listId } = useParams();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState("");
  const [editTaskDesc, setEditTaskDesc] = useState("");
  const [collabEmail, setCollabEmail] = useState("");
  const [role, setRole] = useState<"admin" | "viewer" | null>(null);
  const navigate = useNavigate();

  const loadTasks = async () => {
    if (!listId) return;
    if (!user) return;
    const data = await getTasks(listId, user.uid);
    const tasksWithCompletion = (data as Task[]).map((task) => ({
      ...task,
      completed: task.completed ?? false,
    }));

    setTasks(tasksWithCompletion);
  };

  useEffect(() => {
    loadTasks();
  }, [listId]);

  useEffect(() => {
    const fetchRole = async () => {
      if (!listId || !user) return;
      const docRef = doc(db, "todoLists", listId);
      const snap = await getDoc(docRef);

      if (!snap.exists()) return;
      const data = snap.data();

      if (data.owner === user.uid) {
        setRole("admin");
        return;
      }

      const match = data.collaborators?.find(
        (c: Collaborator) => c.email === user.email
      );
      if (match) setRole(match.role);
    };

    fetchRole();
  }, [listId, user]);

  const handleAddTask = async () => {
    if (!listId || !title.trim()) return;
    if (!user) return;
    await addTask(listId, {
      title,
      description,
      createdBy: user.uid,
    });
    setTitle("");
    setDescription("");
    loadTasks();
  };

  const handleToggle = async (taskId: string, completed: boolean) => {
    console.log("Toggle requested", { taskId, current: completed });
    if (!listId) return;
    await toggleTaskCompletion(listId, taskId, !completed);
    console.log("Toggle done");
    loadTasks();
  };
  const handleDelete = async (taskId: string) => {
    if (!listId || role !== "admin") return;
    await deleteTask(listId, taskId);
    loadTasks();
  };

  const handleUpdateTask = async (taskId: string) => {
    if (!listId || !editTaskTitle.trim()) return;
    await updateDoc(doc(db, "todoLists", listId, "tasks", taskId), {
      title: editTaskTitle,
      description: editTaskDesc,
    });
    setEditingTaskId(null);
    loadTasks();
  };

  const addCollaborator = async () => {
    if (!listId || !collabEmail || role !== "admin") return;
    const listRef = doc(db, "todoLists", listId);
    const listSnap = await getDoc(listRef);
    if (!listSnap.exists()) return;

    const current = listSnap.data().collaborators || [];
    const newCollaborators = [
      ...current,
      { email: collabEmail, role: "viewer" },
    ];

    await updateDoc(listRef, { collaborators: newCollaborators });
    setCollabEmail("");
  };

  return (
    <div className="max-w-xl mx-auto mt-8 p-4 bg-white shadow rounded">
      <button
        className="bg-purple-600 text-white px-4 py-2 rounded-r hover:bg-purple-700 transition"
        onClick={() => navigate(-1)}
      >
        ← Повернутись назад
      </button>
      <h2 className="text-2xl font-bold mb-4">Завдання списку</h2>

      {role === "admin" && (
        <div className="mb-4">
          <input
            type="email"
            placeholder="Email співучасника"
            value={collabEmail}
            onChange={(e) => setCollabEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-2"
          />
          <button
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            onClick={addCollaborator}
          >
            Додати Viewer-а
          </button>
        </div>
      )}

      {role === "admin" && (
        <div className="mb-4">
          <input
            type="text"
            placeholder="Назва"
            className="w-full mb-2 p-2 border border-gray-300 rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            placeholder="Опис"
            className="w-full mb-2 p-2 border border-gray-300 rounded"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={handleAddTask}
          >
            Додати завдання
          </button>
        </div>
      )}

      <ul>
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex justify-between items-start border-b py-2"
          >
            {editingTaskId === task.id ? (
              <div className="flex-1">
                <input
                  className="w-full p-1 border mb-1"
                  value={editTaskTitle}
                  onChange={(e) => setEditTaskTitle(e.target.value)}
                />
                <textarea
                  className="w-full p-1 border mb-1"
                  value={editTaskDesc}
                  onChange={(e) => setEditTaskDesc(e.target.value)}
                />
                <button
                  className="text-green-600 hover:underline mr-2"
                  onClick={() => handleUpdateTask(task.id)}
                >
                  Зберегти
                </button>
                <button
                  className="text-gray-500 hover:underline"
                  onClick={() => setEditingTaskId(null)}
                >
                  Скасувати
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1">
                  <p
                    className={`font-semibold ${
                      task.completed ? "line-through text-gray-500" : ""
                    }`}
                  >
                    {task.title}
                  </p>
                  <p className="text-sm text-gray-500">{task.description}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggle(task.id, task.completed)}
                  />
                  {role === "admin" && (
                    <>
                      <button
                        className="text-yellow-600 hover:underline text-sm"
                        onClick={() => {
                          setEditingTaskId(task.id);
                          setEditTaskTitle(task.title);
                          setEditTaskDesc(task.description);
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        className="text-red-500 hover:underline text-sm"
                        onClick={() => handleDelete(task.id)}
                      >
                        🗑
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;
