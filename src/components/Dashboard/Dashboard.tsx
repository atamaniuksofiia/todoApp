import { useEffect, useState } from "react";
import {
  createTodoList,
  deleteTodoList,
  getTodoLists,
} from "../../services/todoService";
import { Link } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseApp";
import { useAuth } from "../../context/AuthContext";
import { TodoList } from "./Dashboard.types";

const Dashboard = () => {
  const { user } = useAuth();
  const [lists, setLists] = useState<TodoList[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const loadLists = async () => {
    if (!user) return;
    const data = await getTodoLists(user.uid, user.email || "");
    setLists(data as TodoList[]);
  };

  useEffect(() => {
    loadLists();
  }, []);

  const handleAddList = async () => {
    if (!newTitle.trim() || !user) return;
    await createTodoList(newTitle, user.uid);
    setNewTitle("");
    loadLists();
  };

  const handleDelete = async (id: string) => {
    await deleteTodoList(id);
    loadLists();
  };

  const handleUpdate = async (id: string) => {
    if (!editTitle.trim()) return;
    await updateDoc(doc(db, "todoLists", id), { title: editTitle });
    setEditingId(null);
    setEditTitle("");
    loadLists();
  };

  return (
    <div className="max-w-xl mx-auto mt-8 p-4 bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-4">📋 To-Do Lists</h1>

      <div className="flex mb-4">
        <input
          type="text"
          placeholder="Нова назва списку"
          className="flex-1 border px-3 py-2 rounded-l border-gray-300"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <button
          className="bg-purple-600 text-white px-4 py-2 rounded-r hover:bg-purple-700 transition"
          onClick={handleAddList}
        >
          Додати
        </button>
      </div>

      {lists.length === 0 && <p className="text-gray-500">Списки відсутні.</p>}

      <ul>
        {lists.map((list) => (
          <li
            key={list.id}
            className="flex justify-between items-center border-b py-2"
          >
            {editingId === list.id ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="border px-2 py-1 rounded w-full"
                />
                <button
                  onClick={() => handleUpdate(list.id)}
                  className="text-green-600 hover:underline text-sm"
                >
                  Зберегти
                </button>
                <button
                  onClick={() => {
                    setEditingId(null);
                    setEditTitle("");
                  }}
                  className="text-gray-500 hover:underline text-sm"
                >
                  Скасувати
                </button>
              </div>
            ) : (
              <>
                <Link
                  to={`/lists/${list.id}`}
                  className="text-gray-800 hover:text-purple-600 transition-colors flex-1"
                >
                  {list.title}
                </Link>
                <div className="flex gap-2">
                  <button
                    className="text-yellow-600 hover:underline text-sm"
                    onClick={() => {
                      setEditingId(list.id);
                      setEditTitle(list.title);
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    className="text-red-500 hover:underline text-sm"
                    onClick={() => handleDelete(list.id)}
                  >
                    🗑
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
